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
