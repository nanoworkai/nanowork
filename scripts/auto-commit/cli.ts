#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import chokidar from 'chokidar';
import simpleGit, { SimpleGit } from 'simple-git';
import Table from 'cli-table3';
import boxen from 'boxen';
import prompts from 'prompts';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Types
interface AutoCommitConfig {
  enabled: boolean;
  watchPaths: string[];
  ignorePaths: string[];
  minChangeInterval: number; // seconds
  maxChangesPerCommit: number;
  commitMessagePrefix: string;
  dailyGoal: number;
  enableSmartSplit: boolean;
  autoStart: boolean;
}

interface CommitStats {
  totalCommits: number;
  todayCommits: number;
  lastCommitTime: string | null;
  startTime: string;
  averageInterval: number;
  filesChanged: number;
  dailyGoal: number;
}

interface WatcherState {
  running: boolean;
  pid: number | null;
  startTime: string | null;
  filesWatched: number;
}

// Constants
const CONFIG_FILE = '.auto-commit.config.json';
const STATE_FILE = '.auto-commit.state.json';
const LOCK_FILE = '.auto-commit.lock';

const DEFAULT_CONFIG: AutoCommitConfig = {
  enabled: true,
  watchPaths: ['apps/', 'src/', 'scripts/'],
  ignorePaths: ['node_modules/', 'dist/', 'build/', '.git/', '*.log'],
  minChangeInterval: 30,
  maxChangesPerCommit: 5,
  commitMessagePrefix: 'chore: auto-commit',
  dailyGoal: 700,
  enableSmartSplit: true,
  autoStart: false,
};

// Configuration Management
class ConfigManager {
  private configPath: string;
  private config: AutoCommitConfig;

  constructor(repoRoot: string) {
    this.configPath = path.join(repoRoot, CONFIG_FILE);
    this.config = this.load();
  }

  load(): AutoCommitConfig {
    if (fs.existsSync(this.configPath)) {
      try {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
      } catch (error) {
        console.error(chalk.yellow('Failed to load config, using defaults'));
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  }

  save(config?: Partial<AutoCommitConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  get(): AutoCommitConfig {
    return this.config;
  }

  set(key: string, value: any): void {
    (this.config as any)[key] = value;
    this.save();
  }

  display(): void {
    const table = new Table({
      head: ['Setting', 'Value'],
      colWidths: [30, 50],
    });

    Object.entries(this.config).forEach(([key, value]) => {
      const displayValue = Array.isArray(value)
        ? value.join(', ')
        : typeof value === 'boolean'
          ? (value ? chalk.green('✓') : chalk.red('✗'))
          : String(value);
      table.push([chalk.cyan(key), displayValue]);
    });

    console.log(table.toString());
  }
}

// Stats Tracker
class StatsTracker {
  private statePath: string;
  private stats: CommitStats;
  private repoRoot: string;

  constructor(repoRoot: string) {
    this.repoRoot = repoRoot;
    this.statePath = path.join(repoRoot, STATE_FILE);
    this.stats = this.load();
  }

  private load(): CommitStats {
    if (fs.existsSync(this.statePath)) {
      try {
        return JSON.parse(fs.readFileSync(this.statePath, 'utf-8'));
      } catch {
        return this.createDefaultStats();
      }
    }
    return this.createDefaultStats();
  }

  private createDefaultStats(): CommitStats {
    return {
      totalCommits: 0,
      todayCommits: 0,
      lastCommitTime: null,
      startTime: new Date().toISOString(),
      averageInterval: 0,
      filesChanged: 0,
      dailyGoal: 700,
    };
  }

  save(): void {
    fs.writeFileSync(this.statePath, JSON.stringify(this.stats, null, 2));
  }

  async refresh(): Promise<void> {
    const git: SimpleGit = simpleGit(this.repoRoot);

    // Get today's commits
    const today = new Date().toISOString().split('T')[0];
    const log = await git.log({
      '--since': `${today}T00:00:00`,
    });

    this.stats.todayCommits = log.total;

    if (log.latest) {
      this.stats.lastCommitTime = log.latest.date;
    }

    // Get total commits
    const allLog = await git.log();
    this.stats.totalCommits = allLog.total;

    this.save();
  }

  incrementCommit(): void {
    this.stats.totalCommits++;
    this.stats.todayCommits++;
    this.stats.lastCommitTime = new Date().toISOString();
    this.save();
  }

  resetDaily(): void {
    const lastCommit = this.stats.lastCommitTime ? new Date(this.stats.lastCommitTime) : null;
    const now = new Date();

    if (lastCommit && lastCommit.toDateString() !== now.toDateString()) {
      this.stats.todayCommits = 0;
      this.save();
    }
  }

  get(): CommitStats {
    this.resetDaily();
    return this.stats;
  }

  display(): void {
    const stats = this.get();
    const progress = (stats.todayCommits / stats.dailyGoal) * 100;
    const progressBar = this.createProgressBar(progress);

    const content = [
      chalk.bold.white('Commit Statistics'),
      '',
      `${chalk.cyan('Today:')} ${chalk.bold.green(stats.todayCommits)} / ${stats.dailyGoal} commits`,
      progressBar,
      `${chalk.cyan('Progress:')} ${chalk.yellow(progress.toFixed(1) + '%')}`,
      '',
      `${chalk.cyan('Total commits:')} ${chalk.white(stats.totalCommits)}`,
      `${chalk.cyan('Last commit:')} ${stats.lastCommitTime ? chalk.white(this.formatTime(stats.lastCommitTime)) : chalk.gray('Never')}`,
      `${chalk.cyan('Session start:')} ${chalk.white(this.formatTime(stats.startTime))}`,
    ].join('\n');

    console.log(boxen(content, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
    }));
  }

  private createProgressBar(percent: number, width: number = 40): string {
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  }

  private formatTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString();
  }
}

// Watcher Manager
class WatcherManager {
  private repoRoot: string;
  private config: AutoCommitConfig;
  private watcher: chokidar.FSWatcher | null = null;
  private git: SimpleGit;
  private stats: StatsTracker;
  private pendingChanges: Set<string> = new Set();
  private commitTimer: NodeJS.Timeout | null = null;

  constructor(repoRoot: string, config: AutoCommitConfig, stats: StatsTracker) {
    this.repoRoot = repoRoot;
    this.config = config;
    this.git = simpleGit(repoRoot);
    this.stats = stats;
  }

  async start(): Promise<void> {
    if (this.watcher) {
      throw new Error('Watcher is already running');
    }

    const spinner = ora('Starting file watcher...').start();

    // Check if already running
    const lockPath = path.join(this.repoRoot, LOCK_FILE);
    if (fs.existsSync(lockPath)) {
      spinner.fail('Watcher is already running (lock file exists)');
      throw new Error('Watcher already running');
    }

    // Create lock file
    fs.writeFileSync(lockPath, JSON.stringify({
      pid: process.pid,
      startTime: new Date().toISOString(),
    }));

    const watchPaths = this.config.watchPaths.map(p => path.join(this.repoRoot, p));

    this.watcher = chokidar.watch(watchPaths, {
      ignored: this.config.ignorePaths.map(p => new RegExp(p)),
      persistent: true,
      ignoreInitial: true,
    });

    this.watcher
      .on('change', (filePath) => this.handleChange(filePath))
      .on('add', (filePath) => this.handleChange(filePath))
      .on('unlink', (filePath) => this.handleChange(filePath));

    spinner.succeed('File watcher started successfully');
    console.log(chalk.green(`\nWatching paths: ${this.config.watchPaths.join(', ')}`));
    console.log(chalk.gray('Press Ctrl+C to stop\n'));

    // Handle graceful shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  private handleChange(filePath: string): void {
    this.pendingChanges.add(filePath);
    console.log(chalk.gray(`Detected change: ${path.relative(this.repoRoot, filePath)}`));

    // Reset timer
    if (this.commitTimer) {
      clearTimeout(this.commitTimer);
    }

    // Schedule commit
    this.commitTimer = setTimeout(
      () => this.commitChanges(),
      this.config.minChangeInterval * 1000
    );
  }

  private async commitChanges(): Promise<void> {
    if (this.pendingChanges.size === 0) return;

    const spinner = ora('Creating commit...').start();

    try {
      // Get status
      const status = await this.git.status();

      if (status.files.length === 0) {
        spinner.info('No changes to commit');
        this.pendingChanges.clear();
        return;
      }

      // Stage changes (limit to maxChangesPerCommit)
      const filesToCommit = status.files.slice(0, this.config.maxChangesPerCommit);
      await this.git.add(filesToCommit.map(f => f.path));

      // Generate commit message
      const message = this.generateCommitMessage(filesToCommit.map(f => f.path));

      // Commit
      await this.git.commit(message);

      this.stats.incrementCommit();
      this.pendingChanges.clear();

      spinner.succeed(chalk.green(`Committed ${filesToCommit.length} file(s)`));
      console.log(chalk.gray(`Message: ${message}\n`));

    } catch (error) {
      spinner.fail('Failed to commit changes');
      console.error(chalk.red((error as Error).message));
    }
  }

  private generateCommitMessage(files: string[]): string {
    const fileNames = files.map(f => path.basename(f)).join(', ');
    return `${this.config.commitMessagePrefix}: update ${fileNames}`;
  }

  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }

    if (this.commitTimer) {
      clearTimeout(this.commitTimer);
    }

    const lockPath = path.join(this.repoRoot, LOCK_FILE);
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
    }

    console.log(chalk.yellow('\nWatcher stopped'));
    process.exit(0);
  }

  isRunning(): boolean {
    const lockPath = path.join(this.repoRoot, LOCK_FILE);
    return fs.existsSync(lockPath);
  }
}

// Split Commits Service
class CommitSplitter {
  private git: SimpleGit;
  private repoRoot: string;
  private stats: StatsTracker;

  constructor(repoRoot: string, stats: StatsTracker) {
    this.repoRoot = repoRoot;
    this.git = simpleGit(repoRoot);
    this.stats = stats;
  }

  async analyzeChanges(): Promise<{ files: string[]; totalChanges: number }> {
    const status = await this.git.status();
    const files = [...status.modified, ...status.not_added, ...status.created];

    return {
      files,
      totalChanges: files.length,
    };
  }

  async splitIntoCommits(targetCount?: number): Promise<void> {
    const spinner = ora('Analyzing changes...').start();

    const { files, totalChanges } = await this.analyzeChanges();

    if (totalChanges === 0) {
      spinner.info('No changes to commit');
      return;
    }

    // Determine number of commits
    const numCommits = targetCount || Math.min(totalChanges, 10);
    const filesPerCommit = Math.ceil(totalChanges / numCommits);

    spinner.text = `Splitting ${totalChanges} changes into ${numCommits} commits...`;

    // Group files by directory for smarter commits
    const groupedFiles = this.groupFilesByDirectory(files);

    let commitCount = 0;
    let fileIndex = 0;

    for (const [dir, dirFiles] of Object.entries(groupedFiles)) {
      if (fileIndex >= totalChanges) break;

      for (let i = 0; i < dirFiles.length; i += filesPerCommit) {
        if (commitCount >= numCommits) break;

        const batch = dirFiles.slice(i, i + filesPerCommit);

        try {
          await this.git.add(batch);
          const message = this.generateSmartCommitMessage(dir, batch);
          await this.git.commit(message);

          commitCount++;
          this.stats.incrementCommit();

          spinner.text = `Created ${commitCount}/${numCommits} commits...`;
        } catch (error) {
          spinner.fail(`Failed to create commit ${commitCount + 1}`);
          throw error;
        }

        fileIndex += batch.length;
      }
    }

    spinner.succeed(chalk.green(`Successfully created ${commitCount} atomic commits!`));

    // Show summary
    this.stats.display();
  }

  private groupFilesByDirectory(files: string[]): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};

    files.forEach(file => {
      const dir = path.dirname(file);
      if (!grouped[dir]) {
        grouped[dir] = [];
      }
      grouped[dir].push(file);
    });

    return grouped;
  }

  private generateSmartCommitMessage(dir: string, files: string[]): string {
    const dirName = path.basename(dir);
    const fileTypes = new Set(files.map(f => path.extname(f)));

    if (files.length === 1) {
      return `chore: update ${path.basename(files[0])}`;
    }

    if (fileTypes.size === 1 && fileTypes.has('.ts')) {
      return `refactor(${dirName}): update TypeScript files`;
    }

    if (fileTypes.has('.css') || fileTypes.has('.scss')) {
      return `style(${dirName}): update styles`;
    }

    return `chore(${dirName}): update ${files.length} files`;
  }

  async intelligentSplit(): Promise<number> {
    const { files, totalChanges } = await this.analyzeChanges();

    if (totalChanges <= 5) return totalChanges;
    if (totalChanges <= 20) return Math.ceil(totalChanges / 2);

    return Math.min(totalChanges, 15);
  }
}

// Main CLI
async function main() {
  const program = new Command();

  // Find git repo root
  const git = simpleGit();
  let repoRoot: string;

  try {
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.error(chalk.red('Error: Not a git repository'));
      process.exit(1);
    }
    repoRoot = await git.revparse(['--show-toplevel']);
    repoRoot = repoRoot.trim();
  } catch (error) {
    console.error(chalk.red('Error: Could not determine git repository root'));
    process.exit(1);
  }

  const configManager = new ConfigManager(repoRoot);
  const statsTracker = new StatsTracker(repoRoot);

  program
    .name('auto-commit')
    .description('Auto-commit CLI tool and orchestrator')
    .version('1.0.0');

  // Start command
  program
    .command('start')
    .description('Start watching and auto-committing')
    .action(async () => {
      try {
        const config = configManager.get();
        const watcher = new WatcherManager(repoRoot, config, statsTracker);

        console.log(boxen(
          chalk.bold.green('Auto-Commit Started') + '\n\n' +
          `Goal: ${config.dailyGoal} commits/day\n` +
          `Interval: ${config.minChangeInterval}s`,
          { padding: 1, borderColor: 'green', borderStyle: 'round' }
        ));

        await watcher.start();
      } catch (error) {
        console.error(chalk.red((error as Error).message));
        process.exit(1);
      }
    });

  // Stop command
  program
    .command('stop')
    .description('Stop the watcher')
    .action(() => {
      const lockPath = path.join(repoRoot, LOCK_FILE);

      if (!fs.existsSync(lockPath)) {
        console.log(chalk.yellow('Watcher is not running'));
        return;
      }

      try {
        const lockData = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
        process.kill(lockData.pid, 'SIGTERM');
        fs.unlinkSync(lockPath);
        console.log(chalk.green('Watcher stopped successfully'));
      } catch (error) {
        console.error(chalk.red('Failed to stop watcher'));
        fs.unlinkSync(lockPath);
      }
    });

  // Status command
  program
    .command('status')
    .description('Show stats, commits today, rate, etc.')
    .action(async () => {
      await statsTracker.refresh();

      const lockPath = path.join(repoRoot, LOCK_FILE);
      const isRunning = fs.existsSync(lockPath);

      console.log(boxen(
        `Watcher: ${isRunning ? chalk.green('Running') : chalk.gray('Stopped')}`,
        { padding: 0, borderColor: isRunning ? 'green' : 'gray' }
      ));

      statsTracker.display();

      const config = configManager.get();
      const stats = statsTracker.get();
      const remaining = config.dailyGoal - stats.todayCommits;

      if (remaining > 0) {
        console.log(chalk.cyan(`\n${remaining} commits remaining to reach today's goal\n`));
      } else {
        console.log(chalk.green.bold('\nDaily goal achieved! 🎉\n'));
      }
    });

  // Split command
  program
    .command('split [target]')
    .description('Split current changes into atomic commits')
    .action(async (target?: string) => {
      const splitter = new CommitSplitter(repoRoot, statsTracker);

      try {
        if (target && target !== 'auto') {
          const count = parseInt(target, 10);
          if (isNaN(count) || count < 1) {
            console.error(chalk.red('Invalid target count'));
            process.exit(1);
          }
          await splitter.splitIntoCommits(count);
        } else {
          const intelligentCount = await splitter.intelligentSplit();
          console.log(chalk.cyan(`Smart split: creating ${intelligentCount} commits\n`));
          await splitter.splitIntoCommits(intelligentCount);
        }
      } catch (error) {
        console.error(chalk.red('Failed to split commits:'), (error as Error).message);
        process.exit(1);
      }
    });

  // Config command
  program
    .command('config [key] [value]')
    .description('Configure settings')
    .action((key?: string, value?: string) => {
      if (!key) {
        // Display all config
        console.log(chalk.bold.cyan('\nCurrent Configuration:\n'));
        configManager.display();
        return;
      }

      if (!value) {
        // Display specific key
        const config = configManager.get();
        const val = (config as any)[key];
        if (val === undefined) {
          console.error(chalk.red(`Unknown config key: ${key}`));
          process.exit(1);
        }
        console.log(chalk.cyan(`${key}:`), val);
        return;
      }

      // Set value
      try {
        let parsedValue: any = value;

        // Try to parse as JSON for arrays/objects
        if (value.startsWith('[') || value.startsWith('{')) {
          parsedValue = JSON.parse(value);
        } else if (value === 'true' || value === 'false') {
          parsedValue = value === 'true';
        } else if (!isNaN(Number(value))) {
          parsedValue = Number(value);
        }

        configManager.set(key, parsedValue);
        console.log(chalk.green(`✓ Set ${key} = ${parsedValue}`));
      } catch (error) {
        console.error(chalk.red('Failed to set config:'), (error as Error).message);
        process.exit(1);
      }
    });

  // Init command (create default config)
  program
    .command('init')
    .description('Initialize auto-commit configuration')
    .action(() => {
      configManager.save(DEFAULT_CONFIG);
      console.log(chalk.green('✓ Created .auto-commit.config.json'));
      console.log(chalk.gray('Edit this file to customize your settings'));
    });

  program.parse();
}

// Run
main().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
