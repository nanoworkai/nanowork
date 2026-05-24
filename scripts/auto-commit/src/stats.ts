import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import boxen from 'boxen';
import simpleGit, { SimpleGit } from 'simple-git';

export interface CommitStats {
  totalCommits: number;
  todayCommits: number;
  lastCommitTime: string | null;
  startTime: string;
  averageInterval: number;
  filesChanged: number;
  dailyGoal: number;
  commitsByHour: Record<number, number>;
  commitsByDay: Record<string, number>;
}

const STATE_FILE = '.auto-commit.state.json';

export class StatsTracker {
  private statePath: string;
  private stats: CommitStats;
  private repoRoot: string;
  private git: SimpleGit;

  constructor(repoRoot: string) {
    this.repoRoot = repoRoot;
    this.statePath = path.join(repoRoot, STATE_FILE);
    this.git = simpleGit(repoRoot);
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
      commitsByHour: {},
      commitsByDay: {},
    };
  }

  save(): void {
    fs.writeFileSync(this.statePath, JSON.stringify(this.stats, null, 2));
  }

  async refresh(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const log = await this.git.log({
        '--since': `${today}T00:00:00`,
      });

      this.stats.todayCommits = log.total;

      if (log.latest) {
        this.stats.lastCommitTime = log.latest.date;
      }

      const allLog = await this.git.log();
      this.stats.totalCommits = allLog.total;

      this.save();
    } catch (error) {
      console.error(chalk.yellow('⚠ Failed to refresh stats from git'));
    }
  }

  incrementCommit(): void {
    this.stats.totalCommits++;
    this.stats.todayCommits++;
    this.stats.lastCommitTime = new Date().toISOString();

    const now = new Date();
    const hour = now.getHours();
    const day = now.toISOString().split('T')[0];

    this.stats.commitsByHour[hour] = (this.stats.commitsByHour[hour] || 0) + 1;
    this.stats.commitsByDay[day] = (this.stats.commitsByDay[day] || 0) + 1;

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

    const timeStats = this.getTimeStats();

    const content = [
      chalk.bold.white('📊 Commit Statistics'),
      '',
      `${chalk.cyan('Today:')} ${chalk.bold.green(stats.todayCommits)} / ${stats.dailyGoal} commits`,
      progressBar,
      `${chalk.cyan('Progress:')} ${chalk.yellow(progress.toFixed(1) + '%')}`,
      '',
      `${chalk.cyan('Total commits:')} ${chalk.white(stats.totalCommits)}`,
      `${chalk.cyan('Last commit:')} ${stats.lastCommitTime ? chalk.white(this.formatTime(stats.lastCommitTime)) : chalk.gray('Never')}`,
      `${chalk.cyan('Session start:')} ${chalk.white(this.formatTime(stats.startTime))}`,
      '',
      timeStats,
    ].join('\n');

    console.log(boxen(content, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan',
    }));
  }

  private getTimeStats(): string {
    const stats = this.get();

    if (!stats.lastCommitTime) {
      return chalk.gray('No commits yet');
    }

    const lastCommit = new Date(stats.lastCommitTime);
    const now = new Date();
    const timeSinceLastCommit = now.getTime() - lastCommit.getTime();
    const minutesSince = Math.floor(timeSinceLastCommit / 60000);

    let timeStr = '';
    if (minutesSince < 1) {
      timeStr = 'just now';
    } else if (minutesSince < 60) {
      timeStr = `${minutesSince}m ago`;
    } else {
      const hours = Math.floor(minutesSince / 60);
      timeStr = `${hours}h ago`;
    }

    return `${chalk.cyan('Time since last:')} ${chalk.white(timeStr)}`;
  }

  private createProgressBar(percent: number, width: number = 40): string {
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    const bar = chalk.green('█'.repeat(Math.min(filled, width))) + chalk.gray('░'.repeat(Math.max(empty, 0)));
    return bar;
  }

  private formatTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString();
    }

    return date.toLocaleString();
  }

  getStatePath(): string {
    return this.statePath;
  }
}
