/**
 * Example usage of the FileWatcher
 *
 * This demonstrates how to integrate the file watcher with a commit service
 */

import { FileWatcher, setupShutdownHandlers, type ChangeBatch } from './watcher.js';

/**
 * Example: Basic usage with default configuration
 */
function basicExample() {
  const watcher = new FileWatcher({
    verbose: true,
    debounceMs: 30000, // 30 seconds
  });

  // Listen for commit-ready events
  watcher.on('commitReady', async (batch: ChangeBatch) => {
    console.log('\n=== Commit Ready ===');
    console.log(`Files changed: ${batch.uniqueFileCount}`);
    console.log(`Total changes: ${batch.changes.length}`);
    console.log(`Categories: ${batch.categories.join(', ')}`);
    console.log(`Duration: ${batch.batchEndTime.getTime() - batch.batchStartTime.getTime()}ms`);

    // Here you would call your commit service
    // await commitService.createCommit(batch);
  });

  // Listen for individual file changes
  watcher.on('fileChange', (change) => {
    console.log(`[${change.type}] ${change.relativePath}`);
  });

  // Listen for errors
  watcher.on('error', (error) => {
    console.error('Watcher error:', error);
  });

  // Listen for ready event
  watcher.on('ready', () => {
    console.log('Watcher is ready and monitoring for changes...');
  });

  // Start watching
  watcher.start();

  // Setup graceful shutdown
  setupShutdownHandlers(watcher);
}

/**
 * Example: Custom configuration for specific directories
 */
function customConfigExample() {
  const watcher = new FileWatcher({
    baseDir: '/Users/jordan/Dev/nanowork-web',
    watchPatterns: [
      'apps/web/src/**/*.{ts,tsx,js,jsx}',
      'backend/src/**/*.ts',
      '*.config.js',
    ],
    ignorePatterns: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.test.ts',
      '**/*.spec.ts',
    ],
    debounceMs: 60000, // 1 minute
    maxBatchSize: 50,
    verbose: true,
  });

  watcher.on('commitReady', async (batch) => {
    console.log(`Batch ready with ${batch.uniqueFileCount} files`);

    // Example: Filter changes by type
    const additions = batch.changes.filter(c => c.type === 'add');
    const modifications = batch.changes.filter(c => c.type === 'change');
    const deletions = batch.changes.filter(c => c.type === 'unlink');

    console.log(`  Additions: ${additions.length}`);
    console.log(`  Modifications: ${modifications.length}`);
    console.log(`  Deletions: ${deletions.length}`);
  });

  watcher.start();
  setupShutdownHandlers(watcher);
}

/**
 * Example: Integration with a mock commit service
 */
class MockCommitService {
  async createCommit(batch: ChangeBatch): Promise<void> {
    console.log('\n=== Creating Commit ===');

    // Generate commit message based on categories
    const message = this.generateCommitMessage(batch);
    console.log(`Message: ${message}`);

    // List affected files
    console.log('\nAffected files:');
    batch.changes.forEach(change => {
      console.log(`  ${change.type.padEnd(8)} ${change.relativePath}`);
    });

    // Simulate git operations
    await this.simulateGitOperations();

    console.log('\n✓ Commit created successfully');
  }

  private generateCommitMessage(batch: ChangeBatch): string {
    const { categories, uniqueFileCount } = batch;

    // Determine commit type
    let type = 'chore';
    if (categories.includes('typescript') || categories.includes('javascript')) {
      type = 'feat';
    }
    if (categories.includes('styles')) {
      type = 'style';
    }
    if (categories.includes('config')) {
      type = 'chore';
    }
    if (categories.includes('docs')) {
      type = 'docs';
    }

    // Generate scope
    const scope = categories[0] || 'general';

    // Generate description
    const description = `update ${uniqueFileCount} file${uniqueFileCount === 1 ? '' : 's'}`;

    return `${type}(${scope}): ${description}`;
  }

  private async simulateGitOperations(): Promise<void> {
    // Simulate async git operations
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/**
 * Example: Complete integration
 */
function completeIntegrationExample() {
  const commitService = new MockCommitService();

  const watcher = new FileWatcher({
    verbose: true,
    debounceMs: 30000,
  });

  watcher.on('commitReady', async (batch) => {
    try {
      await commitService.createCommit(batch);
    } catch (error) {
      console.error('Failed to create commit:', error);
    }
  });

  watcher.on('ready', () => {
    console.log('\n🔍 File watcher is active');
    console.log('   Monitoring: apps/web/src, backend/src, apps/worker/src');
    console.log('   Debounce: 30 seconds');
    console.log('   Press Ctrl+C to stop\n');
  });

  watcher.start();
  setupShutdownHandlers(watcher);
}

// Run the complete integration example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  completeIntegrationExample();
}

export {
  basicExample,
  customConfigExample,
  completeIntegrationExample,
  MockCommitService,
};
