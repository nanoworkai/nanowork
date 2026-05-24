#!/usr/bin/env bash

# File System Monitor Hook for Auto-Commit System
# Integrates with git's fsmonitor feature to detect file changes

set -euo pipefail

# This script can be used as a git fsmonitor hook or as a standalone file watcher
# See: https://git-scm.com/docs/git-fsmonitor--daemon

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
CONFIG_DIR="$PROJECT_ROOT/.claude/auto-commit"
CONFIG_FILE="$CONFIG_DIR/config.json"
LOG_DIR="$CONFIG_DIR/logs"
LOG_FILE="$LOG_DIR/fsmonitor.log"
STATE_DIR="$CONFIG_DIR/state"
PID_FILE="$CONFIG_DIR/fsmonitor.pid"

# Ensure directories exist
mkdir -p "$LOG_DIR" "$STATE_DIR"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log_fs() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    echo "[$timestamp] [fsmonitor] [$level] $message" >> "$LOG_FILE"
}

log_console() {
    local level=$1
    local color=$2
    shift 2
    local message="$@"
    echo -e "${color}[fsmonitor:${level}]${NC} $message"
}

# Check if fsmonitor is enabled
is_fsmonitor_enabled() {
    if [ ! -f "$CONFIG_FILE" ]; then
        return 1
    fi

    local enabled=$(jq -r '.fsmonitorEnabled // false' "$CONFIG_FILE" 2>/dev/null)
    if [ "$enabled" = "true" ]; then
        return 0
    fi

    return 1
}

# Git fsmonitor integration (version 2)
# This is called by git with specific arguments
git_fsmonitor_v2() {
    local version=$1
    local token=$2

    if [ "$version" != "2" ]; then
        log_fs "ERROR" "Unsupported fsmonitor version: $version"
        return 1
    fi

    # Read last token
    local token_file="$STATE_DIR/fsmonitor-token"
    local last_token=""

    if [ -f "$token_file" ]; then
        last_token=$(cat "$token_file")
    fi

    # Store new token
    echo "$token" > "$token_file"

    # Output changed files since last token
    # This is a simplified implementation
    # In a real implementation, you'd track file changes between tokens

    if [ -z "$last_token" ] || [ "$last_token" = "$token" ]; then
        # First run or same token - return all tracked files as potentially changed
        git ls-files -z | tr '\0' '\n'
    else
        # Return files that changed since last token
        # This requires tracking file modifications in a persistent store
        git status --porcelain=v1 | awk '{print $2}'
    fi
}

# Watch for file changes using fswatch (if available)
watch_with_fswatch() {
    if ! command -v fswatch &> /dev/null; then
        log_console "ERROR" "$RED" "fswatch not installed. Install with: brew install fswatch"
        return 1
    fi

    log_console "INFO" "$BLUE" "Starting fswatch monitor on $PROJECT_ROOT"
    log_fs "INFO" "Starting fswatch monitor"

    # Exclude patterns
    local exclude_patterns=(
        "node_modules"
        ".git"
        "dist"
        "build"
        ".cache"
        "*.log"
        ".DS_Store"
    )

    local exclude_args=()
    for pattern in "${exclude_patterns[@]}"; do
        exclude_args+=(--exclude "$pattern")
    done

    # Watch for changes and trigger callback
    fswatch -0 "${exclude_args[@]}" "$PROJECT_ROOT" | while read -d "" event; do
        handle_file_change "$event"
    done
}

# Watch for file changes using inotifywait (Linux)
watch_with_inotifywait() {
    if ! command -v inotifywait &> /dev/null; then
        log_console "ERROR" "$RED" "inotifywait not installed. Install with: apt-get install inotify-tools"
        return 1
    fi

    log_console "INFO" "$BLUE" "Starting inotifywait monitor on $PROJECT_ROOT"
    log_fs "INFO" "Starting inotifywait monitor"

    # Watch for changes
    inotifywait -m -r \
        --exclude '(node_modules|\.git|dist|build|\.cache|\.log|\.DS_Store)' \
        -e modify,create,delete,move \
        --format '%w%f' \
        "$PROJECT_ROOT" | while read -r event; do
        handle_file_change "$event"
    done
}

# Fallback: polling-based file watching
watch_with_polling() {
    log_console "INFO" "$YELLOW" "Using polling-based file watching (less efficient)"
    log_fs "INFO" "Starting polling-based monitor"

    local state_file="$STATE_DIR/file-checksums"
    local poll_interval=2  # seconds

    while true; do
        # Get current state of git-tracked files
        local current_state=$(git ls-files | xargs -I {} sh -c 'echo "{}:$(stat -f %m "{}" 2>/dev/null || echo 0)"' | sort)

        if [ -f "$state_file" ]; then
            local previous_state=$(cat "$state_file")

            # Compare states and find changes
            local changed_files=$(comm -13 \
                <(echo "$previous_state") \
                <(echo "$current_state") | cut -d: -f1)

            if [ -n "$changed_files" ]; then
                echo "$changed_files" | while read -r file; do
                    [ -n "$file" ] && handle_file_change "$PROJECT_ROOT/$file"
                done
            fi
        fi

        # Save current state
        echo "$current_state" > "$state_file"

        sleep "$poll_interval"
    done
}

# Handle file change event
handle_file_change() {
    local file_path=$1

    # Make path relative to project root
    local rel_path="${file_path#$PROJECT_ROOT/}"

    log_fs "DEBUG" "File changed: $rel_path"

    # Skip if not in git repository
    if ! git ls-files --error-unmatch "$file_path" &>/dev/null; then
        return 0
    fi

    # Check if file should be ignored
    if should_ignore_file "$rel_path"; then
        return 0
    fi

    # Record change
    record_file_change "$rel_path"

    # Notify commit service
    notify_commit_service "$rel_path"
}

# Check if file should be ignored
should_ignore_file() {
    local file_path=$1

    # Common patterns to ignore
    local ignore_patterns=(
        "*.log"
        "*.tmp"
        "*~"
        ".DS_Store"
        "node_modules/"
        ".git/"
        "dist/"
        "build/"
    )

    for pattern in "${ignore_patterns[@]}"; do
        if [[ "$file_path" == $pattern ]]; then
            return 0
        fi
    done

    return 1
}

# Record file change in state
record_file_change() {
    local file_path=$1
    local changes_file="$STATE_DIR/recent-changes.jsonl"

    local entry=$(cat <<EOF
{"timestamp":"$(date -u +"%Y-%m-%dT%H:%M:%SZ")","file":"$file_path"}
EOF
)

    echo "$entry" >> "$changes_file"

    # Keep only last 1000 entries
    if [ -f "$changes_file" ]; then
        local line_count=$(wc -l < "$changes_file")
        if [ "$line_count" -gt 1000 ]; then
            tail -1000 "$changes_file" > "$changes_file.tmp"
            mv "$changes_file.tmp" "$changes_file"
        fi
    fi
}

# Notify commit service of changes
notify_commit_service() {
    local file_path=$1

    # Check if commit service is running
    local commit_service_socket="$CONFIG_DIR/commit-service.sock"

    if [ -S "$commit_service_socket" ]; then
        # Send notification via socket
        echo "FILE_CHANGED:$file_path" | nc -U "$commit_service_socket" 2>/dev/null || true
    fi
}

# Start monitoring
start_monitor() {
    if [ -f "$PID_FILE" ]; then
        local old_pid=$(cat "$PID_FILE")
        if kill -0 "$old_pid" 2>/dev/null; then
            log_console "ERROR" "$RED" "FSMonitor already running (PID: $old_pid)"
            return 1
        else
            rm "$PID_FILE"
        fi
    fi

    echo $$ > "$PID_FILE"

    log_console "INFO" "$GREEN" "Starting FSMonitor (PID: $$)"

    # Choose appropriate watching method
    if command -v fswatch &> /dev/null; then
        watch_with_fswatch
    elif command -v inotifywait &> /dev/null; then
        watch_with_inotifywait
    else
        watch_with_polling
    fi
}

# Stop monitoring
stop_monitor() {
    if [ ! -f "$PID_FILE" ]; then
        log_console "ERROR" "$RED" "FSMonitor is not running"
        return 1
    fi

    local pid=$(cat "$PID_FILE")

    if kill -0 "$pid" 2>/dev/null; then
        kill "$pid"
        rm "$PID_FILE"
        log_console "INFO" "$GREEN" "Stopped FSMonitor (PID: $pid)"
    else
        rm "$PID_FILE"
        log_console "WARN" "$YELLOW" "FSMonitor was not running, cleaned up stale PID file"
    fi
}

# Show status
show_status() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            log_console "INFO" "$GREEN" "FSMonitor is running (PID: $pid)"

            # Show recent changes
            local changes_file="$STATE_DIR/recent-changes.jsonl"
            if [ -f "$changes_file" ]; then
                local change_count=$(wc -l < "$changes_file")
                echo "Recent changes tracked: $change_count"
            fi

            return 0
        else
            log_console "WARN" "$YELLOW" "FSMonitor PID file exists but process is not running"
            return 1
        fi
    else
        log_console "INFO" "$BLUE" "FSMonitor is not running"
        return 1
    fi
}

# Usage information
show_usage() {
    cat <<EOF
FSMonitor - File System Monitor for Auto-Commit System

Usage: $0 <command>

Commands:
    start       Start the file system monitor
    stop        Stop the file system monitor
    status      Show monitor status
    test        Test file change detection
    help        Show this help message

Git FSMonitor Integration:
    To use as a git fsmonitor hook:
    git config core.fsmonitor "$SCRIPT_DIR/fsmonitor.sh"

Dependencies (optional):
    - fswatch (macOS): brew install fswatch
    - inotifywait (Linux): apt-get install inotify-tools

Note: Without external dependencies, the script falls back to polling.

EOF
}

# Main execution
main() {
    local command=${1:-help}

    case "$command" in
        2)
            # Git fsmonitor v2 interface
            git_fsmonitor_v2 "$@"
            ;;
        start)
            if ! is_fsmonitor_enabled; then
                log_console "WARN" "$YELLOW" "FSMonitor is disabled in config. Enable with:"
                echo "  jq '.fsmonitorEnabled = true' $CONFIG_FILE > /tmp/config.json && mv /tmp/config.json $CONFIG_FILE"
                exit 1
            fi
            start_monitor
            ;;
        stop)
            stop_monitor
            ;;
        status)
            show_status
            ;;
        test)
            log_console "INFO" "$BLUE" "Testing file change detection..."
            handle_file_change "$PROJECT_ROOT/test-file.txt"
            log_console "INFO" "$GREEN" "Test complete. Check $LOG_FILE for details."
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            log_console "ERROR" "$RED" "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Run main
main "$@"
