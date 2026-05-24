import chokidar, { type FSWatcher } from 'chokidar';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';

/**
 * Configuration options for the file watcher
 */
export interface WatcherConfig {
  /** Base directory to watch (defaults to project root) */
  baseDir: string;

  /** Glob patterns to watch */
  watchPatterns: string[];

  /** Glob patterns to ignore */
  ignorePatterns: string[];

  /** Debounce time in milliseconds (default: 30000) */
  debounceMs: number;

  /** Maximum number of changes to batch together (default: 100) */
  maxBatchSize: number;

  /** Enable verbose logging */
  verbose: boolean;
}

/**
 * Represents a file change event
 */
export interface FileChange {
  /** Type of change */
  type: 'add' | 'change' | 'unlink';

  /** Absolute path to the file */
  path: string;

  /** Relative path from base directory */
  relativePath: string;

  /** Timestamp of the change */
  timestamp: Date;

  /** File stats (if available) */
  stats?: fs.Stats;
}

/**
 * Represents a batch of related file changes
 */
export interface ChangeBatch {
  /** Array of file changes */
  changes: FileChange[];

  /** Timestamp when the batch was created */
  batchStartTime: Date;

  /** Timestamp when the batch was finalized */
  batchEndTime: Date;

  /** Number of unique files affected */
  uniqueFileCount: number;

  /** Categories of changes (by directory or file type) */
  categories: string[];
}

/**
 * Events emitted by the FileWatcher
 */
export interface FileWatcherEvents {
  /** Emitted when a batch of changes is ready to be committed */
  commitReady: (batch: ChangeBatch) => void;

  /** Emitted when a file change is detected (before batching) */
  fileChange: (change: FileChange) => void;

  /** Emitted when the watcher is ready */
  ready: () => void;

  /** Emitted when an error occurs */
  error: (error: Error) => void;

  /** Emitted when the watcher is closed */
  closed: () => void;
}

/**
 * File watcher with intelligent batching for auto-commit system
 */
export class FileWatcher extends EventEmitter {
  private config: WatcherConfig;
  private watcher: FSWatcher | null = null;
  private changeQueue: Map<string, FileChange> = new Map();
  private debounceTimer: NodeJS.Timeout | null = null;
  private isShuttingDown = false;
  private isWatching = false;

  constructor(config: Partial<WatcherConfig> = {}) {
    super();

    // Set default configuration
    this.config = {
      baseDir: config.baseDir || process.cwd(),
      watchPatterns: config.watchPatterns || [
        'apps/web/src/**/*',
        'backend/src/**/*',
        'apps/worker/src/**/*',
      ],
      ignorePatterns: config.ignorePatterns || [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**',
        '**/.cache/**',
        '**/*.log',
        '**/.DS_Store',
        '**/coverage/**',
        '**/.env*',
      ],
      debounceMs: config.debounceMs ?? 30000,
      maxBatchSize: config.maxBatchSize ?? 100,
      verbose: config.verbose ?? false,
    };

    this.log('FileWatcher initialized with config:', this.config);
  }

  /**
   * Start watching files
   */
  public start(): void {
    if (this.isWatching) {
      this.log('Watcher is already running');
      return;
    }

    this.log('Starting file watcher...');
    this.isShuttingDown = false;

    // Create watcher with optimized settings
    this.watcher = chokidar.watch(this.config.watchPatterns, {
      cwd: this.config.baseDir,
      ignored: this.config.ignorePatterns,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100,
      },
      // Performance optimizations
      usePolling: false,
      atomic: true,
    });

    // Register event handlers
    this.watcher
      .on('add', (filePath, stats) => this.handleChange('add', filePath, stats))
      .on('change', (filePath, stats) => this.handleChange('change', filePath, stats))
      .on('unlink', (filePath) => this.handleChange('unlink', filePath))
      .on('ready', () => this.handleReady())
      .on('error', (error) => this.handleError(error));

    this.isWatching = true;
  }

  /**
   * Stop watching files and clean up
   */
  public async stop(): Promise<void> {
    if (this.isShuttingDown) {
      this.log('Shutdown already in progress');
      return;
    }

    this.log('Stopping file watcher...');
    this.isShuttingDown = true;

    // Process any pending changes before shutting down
    if (this.changeQueue.size > 0) {
      this.log(`Processing ${this.changeQueue.size} pending changes before shutdown`);
      this.processPendingChanges();
    }

    // Clear debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Close the watcher
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }

    this.isWatching = false;
    this.emit('closed');
    this.log('File watcher stopped');
  }

  /**
   * Get current watcher status
   */
  public getStatus(): {
    isWatching: boolean;
    isShuttingDown: boolean;
    queuedChanges: number;
    config: WatcherConfig;
  } {
    return {
      isWatching: this.isWatching,
      isShuttingDown: this.isShuttingDown,
      queuedChanges: this.changeQueue.size,
      config: this.config,
    };
  }

  /**
   * Handle file change events
   */
  private handleChange(
    type: 'add' | 'change' | 'unlink',
    filePath: string,
    stats?: fs.Stats
  ): void {
    if (this.isShuttingDown) {
      return;
    }

    const absolutePath = path.resolve(this.config.baseDir, filePath);
    const relativePath = path.relative(this.config.baseDir, absolutePath);

    const change: FileChange = {
      type,
      path: absolutePath,
      relativePath,
      timestamp: new Date(),
      stats,
    };

    // Add to queue (overwriting previous changes to the same file)
    this.changeQueue.set(absolutePath, change);

    this.emit('fileChange', change);
    this.log(`File ${type}: ${relativePath}`);

    // Reset debounce timer
    this.resetDebounceTimer();

    // Check if we've hit the max batch size
    if (this.changeQueue.size >= this.config.maxBatchSize) {
      this.log(`Max batch size (${this.config.maxBatchSize}) reached, processing immediately`);
      this.processPendingChanges();
    }
  }

  /**
   * Handle watcher ready event
   */
  private handleReady(): void {
    this.log('File watcher is ready and monitoring for changes');
    this.emit('ready');
  }

  /**
   * Handle watcher errors
   */
  private handleError(error: Error): void {
    this.log('Watcher error:', error.message);
    this.emit('error', error);
  }

  /**
   * Reset the debounce timer
   */
  private resetDebounceTimer(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.processPendingChanges();
    }, this.config.debounceMs);
  }

  /**
   * Process all pending changes and emit a commit batch
   */
  private processPendingChanges(): void {
    if (this.changeQueue.size === 0) {
      return;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    const changes = Array.from(this.changeQueue.values());
    const batchEndTime = new Date();
    const batchStartTime = new Date(
      Math.min(...changes.map((c) => c.timestamp.getTime()))
    );

    // Calculate unique files
    const uniquePaths = new Set(changes.map((c) => c.path));

    // Categorize changes by directory and file type
    const categories = this.categorizeChanges(changes);

    const batch: ChangeBatch = {
      changes,
      batchStartTime,
      batchEndTime,
      uniqueFileCount: uniquePaths.size,
      categories,
    };

    this.log(
      `Processing batch: ${changes.length} changes to ${uniquePaths.size} files`
    );
    this.log(`Categories: ${categories.join(', ')}`);

    // Clear the queue
    this.changeQueue.clear();

    // Emit the commit-ready event
    this.emit('commitReady', batch);
  }

  /**
   * Categorize changes for better commit messages
   */
  private categorizeChanges(changes: FileChange[]): string[] {
    const categorySet = new Set<string>();

    for (const change of changes) {
      const relativePath = change.relativePath;

      // Categorize by top-level directory
      const parts = relativePath.split(path.sep);
      if (parts.length > 0) {
        // First part is the main category (apps, backend, etc.)
        if (parts[0] === 'apps' && parts.length > 1) {
          categorySet.add(`apps/${parts[1]}`);
        } else {
          categorySet.add(parts[0]);
        }
      }

      // Add file type categories
      const ext = path.extname(relativePath);
      if (ext) {
        const typeMap: Record<string, string> = {
          '.ts': 'typescript',
          '.tsx': 'typescript-react',
          '.js': 'javascript',
          '.jsx': 'javascript-react',
          '.css': 'styles',
          '.scss': 'styles',
          '.json': 'config',
          '.md': 'docs',
          '.html': 'markup',
          '.yaml': 'config',
          '.yml': 'config',
        };

        const category = typeMap[ext];
        if (category) {
          categorySet.add(category);
        }
      }
    }

    return Array.from(categorySet).sort();
  }

  /**
   * Log message if verbose mode is enabled
   */
  private log(...args: any[]): void {
    if (this.config.verbose) {
      const timestamp = new Date().toISOString();
      console.log(`[FileWatcher ${timestamp}]`, ...args);
    }
  }
}

/**
 * Create and start a file watcher with default configuration
 */
export function createWatcher(config?: Partial<WatcherConfig>): FileWatcher {
  const watcher = new FileWatcher(config);
  return watcher;
}

/**
 * Setup graceful shutdown handlers for the watcher
 */
export function setupShutdownHandlers(watcher: FileWatcher): void {
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down gracefully...`);

    try {
      await watcher.stop();
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Handle uncaught errors
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    shutdown('UNCAUGHT_EXCEPTION');
  });
}

// Export types for external use
export type {
  WatcherConfig,
  FileChange,
  ChangeBatch,
  FileWatcherEvents,
};
