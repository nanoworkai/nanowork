/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  INTERVAL: 300,
  MAX_FILES_PER_COMMIT: 5,
  DEBOUNCE_MS: 2000,
  MIN_CHANGES: 1,
  MAX_MESSAGE_LENGTH: 72,
} as const;

/**
 * Conventional commit types
 */
export const COMMIT_TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
] as const;

/**
 * Default ignore patterns
 */
export const DEFAULT_IGNORE_PATTERNS = [
  'node_modules/**',
  'dist/**',
  'build/**',
  '*.log',
  '.env*',
  '*.lock',
  '*.min.js',
  '*.map',
  '.git/**',
  '.DS_Store',
] as const;

/**
 * AI model configuration
 */
export const AI_CONFIG = {
  MODEL: 'claude-3-5-sonnet-20241022',
  MAX_TOKENS: 1024,
  TEMPERATURE: 0.7,
} as const;
