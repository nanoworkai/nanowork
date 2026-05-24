/**
 * Configuration for the auto-commit tool
 */
export interface AutoCommitConfig {
  enabled: boolean;
  interval: number;
  maxFilesPerCommit: number;
  ignorePatterns: string[];
  commitMessageTemplate: {
    type: 'conventional' | 'simple';
    maxLength: number;
    includeScope: boolean;
    allowedTypes?: string[];
  };
  autoStage: boolean;
  smartSplitting: boolean;
  debounceMs?: number;
  requireMinChanges?: number;
  stopWords?: string[];
}

/**
 * Options for the CLI commands
 */
export interface CLIOptions {
  watchPath?: string;
  interval?: number;
  ignore?: string;
  dryRun?: boolean;
  maxFiles?: number;
  verbose?: boolean;
}

/**
 * Represents a file change in the repository
 */
export interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  diff?: string;
}

/**
 * Represents a file change event from the watcher
 */
export interface WatcherFileChange {
  /** Type of change */
  type: 'add' | 'change' | 'unlink';

  /** Absolute path to the file */
  path: string;

  /** Relative path from base directory */
  relativePath: string;

  /** Timestamp of the change */
  timestamp: Date;

  /** File stats (if available) */
  stats?: any;
}

/**
 * Represents a commit to be created
 */
export interface CommitPlan {
  message: string;
  files: FileChange[];
  type?: string;
  scope?: string;
}

/**
 * Response from the AI service
 */
export interface AICommitMessage {
  message: string;
  type: string;
  scope?: string;
  confidence: number;
}

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
 * Represents a batch of related file changes
 */
export interface ChangeBatch {
  /** Array of file changes */
  changes: WatcherFileChange[];

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
  fileChange: (change: WatcherFileChange) => void;

  /** Emitted when the watcher is ready */
  ready: () => void;

  /** Emitted when an error occurs */
  error: (error: Error) => void;

  /** Emitted when the watcher is closed */
  closed: () => void;
}

/**
 * Status information for the watcher
 */
export interface WatcherStatus {
  /** Whether the watcher is currently active */
  isWatching: boolean;

  /** Whether shutdown is in progress */
  isShuttingDown: boolean;

  /** Number of changes currently queued */
  queuedChanges: number;

  /** Current watcher configuration */
  config: WatcherConfig;
}
