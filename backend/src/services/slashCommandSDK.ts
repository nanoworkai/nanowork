/**
 * Slash Command SDK for Claude Code
 *
 * Provides a way to discover, execute, and manage slash commands
 * similar to Claude Code's SDK implementation
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface SlashCommandMetadata {
  name: string;
  description?: string;
  allowedTools?: string[];
  model?: string;
  argumentHint?: string;
}

export interface SlashCommand {
  name: string;
  content: string;
  metadata: SlashCommandMetadata;
  filePath: string;
  namespace?: string;
}

export interface SystemInitMessage {
  type: 'system';
  subtype: 'init';
  slash_commands: string[];
  timestamp: string;
}

export interface CommandExecutionResult {
  type: 'result';
  subtype: 'success' | 'error';
  command: string;
  result?: any;
  error?: string;
  timestamp: string;
}

export class SlashCommandSDK {
  private commandsCache: Map<string, SlashCommand> = new Map();
  private commandDirectories: string[] = [];

  constructor() {
    // Default directories to search for commands
    this.commandDirectories = [
      path.join(process.cwd(), '.claude', 'commands'),
      path.join(process.cwd(), '.claude', 'skills'),
      path.join(process.env.HOME || '~', '.claude', 'commands'),
      path.join(process.env.HOME || '~', '.claude', 'skills'),
    ];
  }

  /**
   * Initialize and discover all available slash commands
   */
  async initialize(): Promise<void> {
    this.commandsCache.clear();

    for (const dir of this.commandDirectories) {
      if (fs.existsSync(dir)) {
        await this.discoverCommands(dir);
      }
    }
  }

  /**
   * Recursively discover commands in a directory
   */
  private async discoverCommands(directory: string, namespace?: string): Promise<void> {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        // Recurse into subdirectories with namespace
        const newNamespace = namespace ? `${namespace}:${entry.name}` : entry.name;
        await this.discoverCommands(fullPath, newNamespace);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Parse command file
        const commandName = entry.name.replace('.md', '');
        const command = await this.parseCommand(fullPath, commandName, namespace);

        if (command) {
          const key = namespace ? `${namespace}:${commandName}` : commandName;
          this.commandsCache.set(key, command);
        }
      }
    }
  }

  /**
   * Parse a command file with frontmatter
   */
  private async parseCommand(
    filePath: string,
    name: string,
    namespace?: string
  ): Promise<SlashCommand | null> {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);

      const metadata: SlashCommandMetadata = {
        name,
        description: data.description,
        allowedTools: data['allowed-tools']?.split(',').map((t: string) => t.trim()),
        model: data.model,
        argumentHint: data['argument-hint'],
      };

      return {
        name,
        content: content.trim(),
        metadata,
        filePath,
        namespace,
      };
    } catch (error) {
      console.error(`Failed to parse command at ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Get system initialization message with available commands
   */
  getInitMessage(): SystemInitMessage {
    return {
      type: 'system',
      subtype: 'init',
      slash_commands: Array.from(this.commandsCache.keys()),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get all available commands
   */
  getAvailableCommands(): SlashCommand[] {
    return Array.from(this.commandsCache.values());
  }

  /**
   * Get a specific command by name
   */
  getCommand(name: string): SlashCommand | undefined {
    return this.commandsCache.get(name);
  }

  /**
   * Check if a string is a slash command
   */
  isSlashCommand(input: string): boolean {
    return input.trim().startsWith('/');
  }

  /**
   * Parse a slash command from user input
   */
  parseSlashCommand(input: string): { command: string; args: string[] } | null {
    if (!this.isSlashCommand(input)) {
      return null;
    }

    const trimmed = input.trim().substring(1); // Remove leading /
    const parts = trimmed.split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);

    return { command, args };
  }

  /**
   * Execute a slash command
   * This is a simplified version - in production you'd integrate with Claude API
   */
  async executeCommand(
    commandName: string,
    args: string[] = []
  ): Promise<CommandExecutionResult> {
    const command = this.getCommand(commandName);

    if (!command) {
      return {
        type: 'result',
        subtype: 'error',
        command: commandName,
        error: `Command '/${commandName}' not found`,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      // Replace placeholders in command content
      let processedContent = command.content;

      // Replace $1, $2, etc. with args
      args.forEach((arg, index) => {
        processedContent = processedContent.replace(
          new RegExp(`\\$${index + 1}`, 'g'),
          arg
        );
      });

      // Replace $ARGUMENTS with all args joined
      processedContent = processedContent.replace(
        /\$ARGUMENTS/g,
        args.join(' ')
      );

      // TODO: Execute bash commands marked with !`command`
      // TODO: Include file references marked with @filename
      // TODO: Integrate with Claude API to process the command

      return {
        type: 'result',
        subtype: 'success',
        command: commandName,
        result: {
          command: commandName,
          content: processedContent,
          metadata: command.metadata,
          args,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        type: 'result',
        subtype: 'error',
        command: commandName,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Built-in commands
   */
  async executeBuiltinCommand(commandName: string): Promise<CommandExecutionResult> {
    switch (commandName) {
      case 'clear':
        return {
          type: 'result',
          subtype: 'success',
          command: 'clear',
          result: { message: 'Conversation context cleared' },
          timestamp: new Date().toISOString(),
        };

      case 'compact':
        return {
          type: 'result',
          subtype: 'success',
          command: 'compact',
          result: {
            message: 'Conversation history compacted',
            pre_tokens: 12000, // Mock data
            post_tokens: 4000,
          },
          timestamp: new Date().toISOString(),
        };

      case 'context':
        return {
          type: 'result',
          subtype: 'success',
          command: 'context',
          result: {
            current_tokens: 8500,
            max_tokens: 200000,
            commands_available: this.commandsCache.size,
          },
          timestamp: new Date().toISOString(),
        };

      default:
        return {
          type: 'result',
          subtype: 'error',
          command: commandName,
          error: `Unknown built-in command: ${commandName}`,
          timestamp: new Date().toISOString(),
        };
    }
  }
}

// Singleton instance
let sdkInstance: SlashCommandSDK | null = null;

export function getSlashCommandSDK(): SlashCommandSDK {
  if (!sdkInstance) {
    sdkInstance = new SlashCommandSDK();
  }
  return sdkInstance;
}

export async function initializeSlashCommandSDK(): Promise<SlashCommandSDK> {
  const sdk = getSlashCommandSDK();
  await sdk.initialize();
  return sdk;
}
