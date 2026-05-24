#!/usr/bin/env tsx

import Anthropic from '@anthropic-ai/sdk';
import { execSync, spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';

const sleep = promisify(setTimeout);

// ============================================================================
// Types
// ============================================================================

export interface ChangedFile {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions?: number;
  deletions?: number;
  oldPath?: string; // for renamed files
}

export interface FileGroup {
  files: ChangedFile[];
  category: string;
  description: string;
  priority: number; // 1 = highest priority
}

export interface CommitMessage {
  type: 'feat' | 'fix' | 'refactor' | 'docs' | 'test' | 'chore' | 'style' | 'perf' | 'ci' | 'build';
  scope?: string;
  subject: string;
  body?: string;
  breaking?: boolean;
}

export interface CommitResult {
  success: boolean;
  hash?: string;
  message?: string;
  files: ChangedFile[];
  error?: string;
}

export interface CommitStats {
  totalCommits: number;
  successfulCommits: number;
  failedCommits: number;
  filesCommitted: number;
  apiCalls: number;
  errors: string[];
}

export interface CommitServiceConfig {
  dryRun?: boolean;
  maxFilesPerCommit?: number;
  apiKey?: string;
  repoPath?: string;
  rateLimitDelay?: number; // ms between API calls
  verbose?: boolean;
}

// ============================================================================
// Commit Service Class
// ============================================================================

export class CommitService {
  private anthropic: Anthropic;
  private config: Required<CommitServiceConfig>;
  private stats: CommitStats;
  private lastApiCall: number = 0;

  constructor(config: CommitServiceConfig = {}) {
    // Load API key from backend/.env if not provided
    const apiKey = config.apiKey || this.loadApiKey();

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not found. Please set it in backend/.env or pass it in config.');
    }

    this.anthropic = new Anthropic({ apiKey });

    this.config = {
      dryRun: config.dryRun ?? false,
      maxFilesPerCommit: config.maxFilesPerCommit ?? 10,
      apiKey,
      repoPath: config.repoPath ?? process.cwd(),
      rateLimitDelay: config.rateLimitDelay ?? 1000,
      verbose: config.verbose ?? false,
    };

    this.stats = {
      totalCommits: 0,
      successfulCommits: 0,
      failedCommits: 0,
      filesCommitted: 0,
      apiCalls: 0,
      errors: [],
    };
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Main entry point: analyze changes and create intelligent commits
   */
  async createCommits(files: ChangedFile[]): Promise<CommitResult[]> {
    this.log(`Starting commit process for ${files.length} files`);

    if (files.length === 0) {
      this.log('No files to commit');
      return [];
    }

    try {
      // Group related files together
      const groups = await this.groupFiles(files);
      this.log(`Grouped files into ${groups.length} logical commits`);

      // Create commits for each group
      const results: CommitResult[] = [];
      for (const group of groups) {
        const result = await this.createCommitForGroup(group);
        results.push(result);

        if (result.success) {
          this.stats.successfulCommits++;
          this.stats.filesCommitted += group.files.length;
        } else {
          this.stats.failedCommits++;
          this.stats.errors.push(result.error || 'Unknown error');
        }
        this.stats.totalCommits++;
      }

      return results;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.log(`Error in createCommits: ${errorMsg}`, 'error');
      throw error;
    }
  }

  /**
   * Get current statistics
   */
  getStats(): CommitStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalCommits: 0,
      successfulCommits: 0,
      failedCommits: 0,
      filesCommitted: 0,
      apiCalls: 0,
      errors: [],
    };
  }

  // ============================================================================
  // File Grouping Logic
  // ============================================================================

  /**
   * Group files into logical commits based on:
   * - Directory structure
   * - File type relationships (component + test + style)
   * - Conventional patterns (docs, config, tests)
   * - Size constraints
   */
  private async groupFiles(files: ChangedFile[]): Promise<FileGroup[]> {
    const groups: FileGroup[] = [];

    // Separate by category first
    const categorized = this.categorizeFiles(files);

    // Process each category
    for (const [category, categoryFiles] of Object.entries(categorized)) {
      if (categoryFiles.length === 0) continue;

      if (category === 'config' || category === 'docs') {
        // Keep config and docs separate per file (unless very related)
        const subGroups = this.groupByDirectory(categoryFiles, 1);
        groups.push(...subGroups.map(sg => ({
          files: sg,
          category,
          description: this.getGroupDescription(sg, category),
          priority: category === 'config' ? 1 : 3,
        })));
      } else if (category === 'test') {
        // Group tests by directory/feature
        const subGroups = this.groupByDirectory(categoryFiles, 2);
        groups.push(...subGroups.map(sg => ({
          files: sg,
          category,
          description: this.getGroupDescription(sg, category),
          priority: 4,
        })));
      } else {
        // Group related source files (component + test + style)
        const relatedGroups = this.groupRelatedFiles(categoryFiles);
        groups.push(...relatedGroups.map(sg => ({
          files: sg,
          category,
          description: this.getGroupDescription(sg, category),
          priority: 2,
        })));
      }
    }

    // Sort by priority (lower number = higher priority)
    groups.sort((a, b) => a.priority - b.priority);

    // Split groups that exceed maxFilesPerCommit
    const finalGroups: FileGroup[] = [];
    for (const group of groups) {
      if (group.files.length > this.config.maxFilesPerCommit) {
        const chunks = this.chunkArray(group.files, this.config.maxFilesPerCommit);
        finalGroups.push(...chunks.map((chunk, i) => ({
          ...group,
          files: chunk,
          description: `${group.description} (part ${i + 1}/${chunks.length})`,
        })));
      } else {
        finalGroups.push(group);
      }
    }

    return finalGroups;
  }

  /**
   * Categorize files by type
   */
  private categorizeFiles(files: ChangedFile[]): Record<string, ChangedFile[]> {
    const categories: Record<string, ChangedFile[]> = {
      docs: [],
      config: [],
      test: [],
      style: [],
      source: [],
      build: [],
      ci: [],
    };

    for (const file of files) {
      const ext = path.extname(file.path);
      const basename = path.basename(file.path);
      const dirname = path.dirname(file.path);

      if (basename.match(/\.(md|txt|pdf)$/i) || dirname.includes('docs')) {
        categories.docs.push(file);
      } else if (basename.match(/^(\.|)(.+)(rc|config)\.(json|js|ts|yaml|yml|toml)$/i) ||
                 basename.match(/^(package\.json|tsconfig\.json|\.gitignore|\.env)/i)) {
        categories.config.push(file);
      } else if (file.path.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/i) || dirname.includes('__tests__')) {
        categories.test.push(file);
      } else if (ext.match(/\.(css|scss|sass|less|styl)$/i)) {
        categories.style.push(file);
      } else if (dirname.includes('.github') || basename.match(/^(\.github|\.gitlab-ci|jenkinsfile)/i)) {
        categories.ci.push(file);
      } else if (basename.match(/^(dockerfile|docker-compose|makefile|rakefile)/i) || dirname.includes('build')) {
        categories.build.push(file);
      } else {
        categories.source.push(file);
      }
    }

    return categories;
  }

  /**
   * Group files by directory proximity
   */
  private groupByDirectory(files: ChangedFile[], maxDepth: number = 2): ChangedFile[][] {
    const groups = new Map<string, ChangedFile[]>();

    for (const file of files) {
      const parts = file.path.split('/');
      const groupKey = parts.slice(0, Math.min(maxDepth, parts.length - 1)).join('/');

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(file);
    }

    return Array.from(groups.values());
  }

  /**
   * Group related files (e.g., Component.tsx + Component.test.tsx + Component.css)
   */
  private groupRelatedFiles(files: ChangedFile[]): ChangedFile[][] {
    const groups: ChangedFile[][] = [];
    const processed = new Set<string>();

    for (const file of files) {
      if (processed.has(file.path)) continue;

      const related = this.findRelatedFiles(file, files);
      groups.push(related);
      related.forEach(f => processed.add(f.path));
    }

    return groups;
  }

  /**
   * Find files related to a given file
   */
  private findRelatedFiles(file: ChangedFile, allFiles: ChangedFile[]): ChangedFile[] {
    const related = [file];
    const baseName = this.getBaseName(file.path);
    const dir = path.dirname(file.path);

    for (const other of allFiles) {
      if (other.path === file.path) continue;

      const otherBaseName = this.getBaseName(other.path);
      const otherDir = path.dirname(other.path);

      // Same directory and similar base name
      if (dir === otherDir && baseName === otherBaseName) {
        related.push(other);
      }
    }

    return related;
  }

  /**
   * Get base name without extension and test/spec suffix
   */
  private getBaseName(filePath: string): string {
    const basename = path.basename(filePath);
    return basename
      .replace(/\.(test|spec)/, '')
      .replace(/\.(tsx?|jsx?|css|scss|sass|less)$/, '');
  }

  /**
   * Get a human-readable description for a group
   */
  private getGroupDescription(files: ChangedFile[], category: string): string {
    if (files.length === 1) {
      return path.basename(files[0].path);
    }

    const commonDir = this.getCommonDirectory(files.map(f => f.path));
    const fileTypes = [...new Set(files.map(f => path.extname(f.path)))].join(', ');

    if (commonDir) {
      return `${category} in ${commonDir}`;
    }

    return `${files.length} ${category} files`;
  }

  /**
   * Get common directory for a set of file paths
   */
  private getCommonDirectory(paths: string[]): string | null {
    if (paths.length === 0) return null;
    if (paths.length === 1) return path.dirname(paths[0]);

    const parts = paths.map(p => p.split('/'));
    const minLength = Math.min(...parts.map(p => p.length));

    let commonParts: string[] = [];
    for (let i = 0; i < minLength - 1; i++) {
      const part = parts[0][i];
      if (parts.every(p => p[i] === part)) {
        commonParts.push(part);
      } else {
        break;
      }
    }

    return commonParts.length > 0 ? commonParts.join('/') : null;
  }

  // ============================================================================
  // Commit Creation
  // ============================================================================

  /**
   * Create a single commit for a group of files
   */
  private async createCommitForGroup(group: FileGroup): Promise<CommitResult> {
    try {
      this.log(`Creating commit for: ${group.description}`);

      // Get detailed diff for the files
      const diff = await this.getFileDiff(group.files);

      // Generate commit message using Claude
      const commitMsg = await this.generateCommitMessage(group, diff);

      // Format the commit message
      const formattedMsg = this.formatCommitMessage(commitMsg);

      this.log(`Generated message: ${formattedMsg.split('\n')[0]}`);

      if (this.config.dryRun) {
        this.log('[DRY RUN] Would commit with message:', 'info');
        this.log(formattedMsg, 'info');
        return {
          success: true,
          message: formattedMsg,
          files: group.files,
        };
      }

      // Execute git add and git commit
      const hash = await this.executeCommit(group.files, formattedMsg);

      return {
        success: true,
        hash,
        message: formattedMsg,
        files: group.files,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.log(`Failed to create commit: ${errorMsg}`, 'error');

      return {
        success: false,
        files: group.files,
        error: errorMsg,
      };
    }
  }

  /**
   * Get git diff for specific files
   */
  private async getFileDiff(files: ChangedFile[]): Promise<string> {
    try {
      const filePaths = files.map(f => f.path).join(' ');

      // Get diff with context
      const diff = execSync(
        `git diff --cached --unified=3 -- ${filePaths} || git diff --unified=3 -- ${filePaths}`,
        {
          cwd: this.config.repoPath,
          encoding: 'utf-8',
          maxBuffer: 10 * 1024 * 1024, // 10MB
        }
      );

      // Limit diff size for API (max ~8000 lines)
      const lines = diff.split('\n');
      if (lines.length > 8000) {
        return lines.slice(0, 8000).join('\n') + '\n\n[... diff truncated ...]';
      }

      return diff;
    } catch (error) {
      this.log(`Error getting diff: ${error}`, 'error');
      return '';
    }
  }

  /**
   * Generate commit message using Claude AI
   */
  private async generateCommitMessage(
    group: FileGroup,
    diff: string
  ): Promise<CommitMessage> {
    // Rate limiting
    await this.enforceRateLimit();

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: this.buildCommitPrompt(group, diff),
          },
        ],
      });

      this.stats.apiCalls++;

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return this.parseCommitMessage(content.text, group);
    } catch (error) {
      this.log(`API error: ${error}`, 'error');

      // Fallback to template-based message
      return this.generateFallbackMessage(group);
    }
  }

  /**
   * Build prompt for Claude to generate commit message
   */
  private buildCommitPrompt(group: FileGroup, diff: string): string {
    const fileList = group.files.map(f => `  - ${f.path} (${f.status})`).join('\n');

    return `You are a senior developer creating a git commit message. Analyze these changes and generate a commit message following the Conventional Commits format.

Files changed:
${fileList}

Category: ${group.category}

Git diff:
\`\`\`diff
${diff}
\`\`\`

Generate a commit message with:
1. Type: feat, fix, refactor, docs, test, chore, style, perf, ci, or build
2. Scope (optional): affected component/module
3. Subject: concise description (max 72 chars)
4. Body (optional): detailed explanation of WHY (not what)
5. Breaking change indicator if applicable

Format your response as JSON:
{
  "type": "feat|fix|refactor|docs|test|chore|style|perf|ci|build",
  "scope": "optional-scope",
  "subject": "imperative mood description",
  "body": "optional detailed explanation",
  "breaking": false
}

Rules:
- Use imperative mood ("add" not "added" or "adds")
- Be specific but concise
- Focus on the "why" in the body, not the "what"
- Only mark as breaking if it actually breaks the API
- Choose the most appropriate type based on the actual changes

Respond with ONLY the JSON, no other text.`;
  }

  /**
   * Parse Claude's response into a CommitMessage
   */
  private parseCommitMessage(response: string, group: FileGroup): CommitMessage {
    try {
      // Extract JSON from response (in case Claude adds markdown formatting)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        type: parsed.type || this.inferCommitType(group),
        scope: parsed.scope || undefined,
        subject: parsed.subject || group.description,
        body: parsed.body || undefined,
        breaking: parsed.breaking || false,
      };
    } catch (error) {
      this.log(`Failed to parse commit message: ${error}`, 'error');
      return this.generateFallbackMessage(group);
    }
  }

  /**
   * Generate fallback commit message without API
   */
  private generateFallbackMessage(group: FileGroup): CommitMessage {
    const type = this.inferCommitType(group);
    const scope = this.inferScope(group);

    return {
      type,
      scope,
      subject: group.description,
      breaking: false,
    };
  }

  /**
   * Infer commit type from file group
   */
  private inferCommitType(group: FileGroup): CommitMessage['type'] {
    const category = group.category.toLowerCase();

    if (category === 'docs') return 'docs';
    if (category === 'test') return 'test';
    if (category === 'config' || category === 'build') return 'chore';
    if (category === 'ci') return 'ci';
    if (category === 'style') return 'style';

    // Check file status for source files
    const hasNew = group.files.some(f => f.status === 'added');
    const hasDeleted = group.files.some(f => f.status === 'deleted');

    if (hasNew && !hasDeleted) return 'feat';
    if (hasDeleted && !hasNew) return 'chore';

    return 'refactor';
  }

  /**
   * Infer scope from file group
   */
  private inferScope(group: FileGroup): string | undefined {
    const commonDir = this.getCommonDirectory(group.files.map(f => f.path));
    if (!commonDir) return undefined;

    const parts = commonDir.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Format commit message according to Conventional Commits
   */
  private formatCommitMessage(msg: CommitMessage): string {
    let formatted = msg.type;

    if (msg.scope) {
      formatted += `(${msg.scope})`;
    }

    if (msg.breaking) {
      formatted += '!';
    }

    formatted += `: ${msg.subject}`;

    if (msg.body) {
      formatted += `\n\n${msg.body}`;
    }

    if (msg.breaking) {
      formatted += '\n\nBREAKING CHANGE: This commit contains breaking changes.';
    }

    return formatted;
  }

  /**
   * Execute git add and git commit
   */
  private async executeCommit(files: ChangedFile[], message: string): Promise<string> {
    try {
      // Stage files
      for (const file of files) {
        if (file.status === 'deleted') {
          execSync(`git rm "${file.path}"`, {
            cwd: this.config.repoPath,
            encoding: 'utf-8',
          });
        } else {
          execSync(`git add "${file.path}"`, {
            cwd: this.config.repoPath,
            encoding: 'utf-8',
          });
        }
      }

      // Create commit
      const result = execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
        cwd: this.config.repoPath,
        encoding: 'utf-8',
      });

      // Get the commit hash
      const hash = execSync('git rev-parse HEAD', {
        cwd: this.config.repoPath,
        encoding: 'utf-8',
      }).trim();

      return hash;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Git command failed: ${errorMsg}`);
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Enforce rate limiting between API calls
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCall;

    if (timeSinceLastCall < this.config.rateLimitDelay) {
      const waitTime = this.config.rateLimitDelay - timeSinceLastCall;
      this.log(`Rate limiting: waiting ${waitTime}ms`, 'debug');
      await sleep(waitTime);
    }

    this.lastApiCall = Date.now();
  }

  /**
   * Load API key from backend/.env
   */
  private loadApiKey(): string | undefined {
    try {
      const envPath = path.join(this.config.repoPath || process.cwd(), 'backend', '.env');
      const envContent = require('fs').readFileSync(envPath, 'utf-8');

      const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/);
      return match ? match[1].trim() : undefined;
    } catch (error) {
      this.log(`Could not load API key from backend/.env: ${error}`, 'debug');
      return undefined;
    }
  }

  /**
   * Split array into chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Logging utility
   */
  private log(message: string, level: 'info' | 'error' | 'debug' = 'info'): void {
    if (!this.config.verbose && level === 'debug') return;

    const prefix = this.config.dryRun ? '[DRY RUN] ' : '';
    const timestamp = new Date().toISOString();

    switch (level) {
      case 'error':
        console.error(`${prefix}[${timestamp}] ERROR: ${message}`);
        break;
      case 'debug':
        console.debug(`${prefix}[${timestamp}] DEBUG: ${message}`);
        break;
      default:
        console.log(`${prefix}[${timestamp}] ${message}`);
    }
  }
}

// ============================================================================
// CLI Interface
// ============================================================================

/**
 * Parse changed files from git status
 */
export async function getChangedFiles(repoPath: string = process.cwd()): Promise<ChangedFile[]> {
  try {
    const status = execSync('git status --porcelain', {
      cwd: repoPath,
      encoding: 'utf-8',
    });

    const files: ChangedFile[] = [];

    for (const line of status.split('\n')) {
      if (!line.trim()) continue;

      const statusCode = line.substring(0, 2);
      const filePath = line.substring(3).trim();

      let status: ChangedFile['status'] = 'modified';
      if (statusCode.includes('A')) status = 'added';
      else if (statusCode.includes('D')) status = 'deleted';
      else if (statusCode.includes('R')) status = 'renamed';

      files.push({ path: filePath, status });
    }

    return files;
  } catch (error) {
    console.error('Error getting changed files:', error);
    return [];
  }
}

/**
 * Main CLI function
 */
export async function main() {
  const args = process.argv.slice(2);
  const config: CommitServiceConfig = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    repoPath: process.cwd(),
  };

  console.log('🤖 Auto-Commit Service\n');

  const service = new CommitService(config);
  const files = await getChangedFiles(config.repoPath);

  if (files.length === 0) {
    console.log('No changed files found.');
    return;
  }

  console.log(`Found ${files.length} changed file(s):\n`);
  files.forEach(f => console.log(`  ${f.status.padEnd(8)} ${f.path}`));
  console.log();

  const results = await service.createCommits(files);
  const stats = service.getStats();

  console.log('\n📊 Commit Summary:');
  console.log(`  Total commits: ${stats.totalCommits}`);
  console.log(`  Successful: ${stats.successfulCommits}`);
  console.log(`  Failed: ${stats.failedCommits}`);
  console.log(`  Files committed: ${stats.filesCommitted}`);
  console.log(`  API calls made: ${stats.apiCalls}`);

  if (stats.errors.length > 0) {
    console.log('\n❌ Errors:');
    stats.errors.forEach(err => console.log(`  - ${err}`));
  }

  if (config.dryRun) {
    console.log('\n💡 This was a dry run. No commits were actually created.');
    console.log('   Remove --dry-run to create real commits.');
  }
}

// Run CLI if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
