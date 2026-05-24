import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import Table from 'cli-table3';

export interface AutoCommitConfig {
  enabled: boolean;
  watchPaths: string[];
  ignorePaths: string[];
  minChangeInterval: number;
  maxChangesPerCommit: number;
  commitMessagePrefix: string;
  dailyGoal: number;
  enableSmartSplit: boolean;
  autoStart: boolean;
  useAI: boolean;
  anthropicApiKey?: string;
}

const CONFIG_FILE = '.auto-commit.config.json';

export const DEFAULT_CONFIG: AutoCommitConfig = {
  enabled: true,
  watchPaths: ['apps/', 'src/', 'scripts/', 'docs/'],
  ignorePaths: [
    'node_modules/',
    'dist/',
    'build/',
    '.git/',
    '*.log',
    '.next/',
    '.cache/',
    'coverage/',
  ],
  minChangeInterval: 30,
  maxChangesPerCommit: 5,
  commitMessagePrefix: 'chore',
  dailyGoal: 700,
  enableSmartSplit: true,
  autoStart: false,
  useAI: true,
};

export class ConfigManager {
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
        console.error(chalk.yellow('⚠ Failed to load config, using defaults'));
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
      head: [chalk.cyan('Setting'), chalk.cyan('Value')],
      colWidths: [30, 50],
      style: {
        head: [],
        border: ['gray'],
      },
    });

    Object.entries(this.config).forEach(([key, value]) => {
      let displayValue: string;

      if (Array.isArray(value)) {
        displayValue = value.length > 0 ? value.join(', ') : chalk.gray('(none)');
      } else if (typeof value === 'boolean') {
        displayValue = value ? chalk.green('✓ enabled') : chalk.red('✗ disabled');
      } else if (key === 'anthropicApiKey' && value) {
        displayValue = chalk.gray('••••••••' + String(value).slice(-4));
      } else if (value === null || value === undefined) {
        displayValue = chalk.gray('(not set)');
      } else {
        displayValue = String(value);
      }

      table.push([chalk.white(key), displayValue]);
    });

    console.log(table.toString());
  }

  getConfigPath(): string {
    return this.configPath;
  }
}
