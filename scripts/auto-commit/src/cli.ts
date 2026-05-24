#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import * as fs from 'fs';
import * as path from 'path';
import simpleGit from 'simple-git';

import { ConfigManager } from './config.js';
import { StatsTracker } from './stats.js';
import { WatcherManager } from './watcher.js';
import { CommitSplitter } from './splitter.js';

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
    .description('Auto-commit CLI tool and orchestrator for nanowork-web')
    .version('1.0.0');

  // Start command
  program
    .command('start')
    .description('Start watching and auto-committing')
    .option('-d, --daemon', 'Run in background as daemon')
    .action(async (options) => {
      try {
        const config = configManager.get();
        const watcher = new WatcherManager(repoRoot, config, statsTracker);

        console.log(boxen(
          chalk.bold.green('Auto-Commit Started') + '\n\n' +
          `Goal: ${config.dailyGoal} commits/day\n` +
          `Interval: ${config.minChangeInterval}s\n` +
          `Watching: ${config.watchPaths.join(', ')}`,
          { padding: 1, borderColor: 'green', borderStyle: 'round' }
        ));

        await watcher.start(options.daemon);
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
      const lockPath = path.join(repoRoot, '.auto-commit.lock');

      if (!fs.existsSync(lockPath)) {
        console.log(chalk.yellow('Watcher is not running'));
        return;
      }

      try {
        const lockData = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
        process.kill(lockData.pid, 'SIGTERM');
        fs.unlinkSync(lockPath);
        console.log(chalk.green('✓ Watcher stopped successfully'));
      } catch (error) {
        console.error(chalk.red('Failed to stop watcher'));
        if (fs.existsSync(lockPath)) {
          fs.unlinkSync(lockPath);
        }
      }
    });

  // Status command
  program
    .command('status')
    .description('Show stats, commits today, rate, etc.')
    .action(async () => {
      const spinner = ora('Refreshing statistics...').start();

      try {
        await statsTracker.refresh();
        spinner.stop();

        const lockPath = path.join(repoRoot, '.auto-commit.lock');
        const isRunning = fs.existsSync(lockPath);

        console.log(boxen(
          `Watcher: ${isRunning ? chalk.green('● Running') : chalk.gray('○ Stopped')}`,
          { padding: 0, borderColor: isRunning ? 'green' : 'gray', margin: 1 }
        ));

        statsTracker.display();

        const config = configManager.get();
        const stats = statsTracker.get();
        const remaining = config.dailyGoal - stats.todayCommits;

        if (remaining > 0) {
          console.log(chalk.cyan(`\n📊 ${remaining} commits remaining to reach today's goal of ${config.dailyGoal}\n`));
        } else {
          console.log(chalk.green.bold('\n🎉 Daily goal achieved!\n'));
        }
      } catch (error) {
        spinner.fail('Failed to get status');
        console.error(chalk.red((error as Error).message));
        process.exit(1);
      }
    });

  // Split command
  program
    .command('split [target]')
    .description('Split current changes into atomic commits')
    .option('-i, --interactive', 'Interactively review each commit')
    .action(async (target?: string, options?: { interactive?: boolean }) => {
      const splitter = new CommitSplitter(repoRoot, statsTracker);

      try {
        if (target && target !== 'auto') {
          const count = parseInt(target, 10);
          if (isNaN(count) || count < 1) {
            console.error(chalk.red('Invalid target count'));
            process.exit(1);
          }
          await splitter.splitIntoCommits(count, options?.interactive);
        } else {
          const intelligentCount = await splitter.intelligentSplit();
          console.log(chalk.cyan(`🤖 Smart split: creating ${intelligentCount} commits\n`));
          await splitter.splitIntoCommits(intelligentCount, options?.interactive);
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
    .option('-l, --list', 'List all configuration')
    .option('-e, --edit', 'Edit configuration file')
    .action((key?: string, value?: string, options?: { list?: boolean; edit?: boolean }) => {
      if (options?.list || !key) {
        console.log(chalk.bold.cyan('\n⚙️  Current Configuration:\n'));
        configManager.display();
        console.log(chalk.gray(`\nConfig file: ${path.join(repoRoot, '.auto-commit.config.json')}\n`));
        return;
      }

      if (options?.edit) {
        const configPath = path.join(repoRoot, '.auto-commit.config.json');
        const editor = process.env.EDITOR || 'nano';
        const { spawn } = require('child_process');
        const proc = spawn(editor, [configPath], { stdio: 'inherit' });
        proc.on('exit', () => {
          console.log(chalk.green('✓ Configuration updated'));
        });
        return;
      }

      if (!value) {
        const config = configManager.get();
        const val = (config as any)[key];
        if (val === undefined) {
          console.error(chalk.red(`Unknown config key: ${key}`));
          process.exit(1);
        }
        console.log(chalk.cyan(`${key}:`), JSON.stringify(val, null, 2));
        return;
      }

      try {
        let parsedValue: any = value;

        if (value.startsWith('[') || value.startsWith('{')) {
          parsedValue = JSON.parse(value);
        } else if (value === 'true' || value === 'false') {
          parsedValue = value === 'true';
        } else if (!isNaN(Number(value))) {
          parsedValue = Number(value);
        }

        configManager.set(key, parsedValue);
        console.log(chalk.green(`✓ Set ${key} = ${JSON.stringify(parsedValue)}`));
      } catch (error) {
        console.error(chalk.red('Failed to set config:'), (error as Error).message);
        process.exit(1);
      }
    });

  // Init command
  program
    .command('init')
    .description('Initialize auto-commit configuration')
    .option('-f, --force', 'Overwrite existing configuration')
    .action((options) => {
      const configPath = path.join(repoRoot, '.auto-commit.config.json');

      if (fs.existsSync(configPath) && !options.force) {
        console.log(chalk.yellow('Configuration already exists. Use --force to overwrite.'));
        return;
      }

      configManager.save();
      console.log(chalk.green('✓ Created .auto-commit.config.json'));
      console.log(chalk.gray('  Edit this file to customize your settings\n'));

      configManager.display();
    });

  // Dashboard command
  program
    .command('dashboard')
    .alias('dash')
    .description('Show live dashboard with stats and activity')
    .action(async () => {
      console.clear();

      const updateDashboard = async () => {
        console.clear();

        const lockPath = path.join(repoRoot, '.auto-commit.lock');
        const isRunning = fs.existsSync(lockPath);

        console.log(boxen(
          chalk.bold.white('Auto-Commit Dashboard') + '\n' +
          `Status: ${isRunning ? chalk.green('● Running') : chalk.gray('○ Stopped')}`,
          { padding: 1, borderColor: 'cyan', borderStyle: 'double', margin: 1 }
        ));

        await statsTracker.refresh();
        statsTracker.display();

        console.log(chalk.gray('\nPress Ctrl+C to exit'));
      };

      await updateDashboard();

      const interval = setInterval(updateDashboard, 5000);

      process.on('SIGINT', () => {
        clearInterval(interval);
        console.log(chalk.yellow('\n\nDashboard closed'));
        process.exit(0);
      });
    });

  // Reset command
  program
    .command('reset')
    .description('Reset statistics (keeps configuration)')
    .option('-a, --all', 'Reset configuration as well')
    .action((options) => {
      const statePath = path.join(repoRoot, '.auto-commit.state.json');

      if (fs.existsSync(statePath)) {
        fs.unlinkSync(statePath);
        console.log(chalk.green('✓ Statistics reset'));
      }

      if (options.all) {
        const configPath = path.join(repoRoot, '.auto-commit.config.json');
        if (fs.existsSync(configPath)) {
          fs.unlinkSync(configPath);
          console.log(chalk.green('✓ Configuration reset'));
        }
      }

      console.log(chalk.gray('Run "auto-commit init" to recreate defaults'));
    });

  program.parse();
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
