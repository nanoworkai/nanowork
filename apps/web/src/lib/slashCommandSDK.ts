/**
 * Slash Command SDK Client
 *
 * Client-side SDK for interacting with Claude slash commands
 * Mirrors the Claude Agent SDK interface from the documentation
 */

import React from 'react';
import { apiClient } from './api';

export interface SystemMessage {
  type: 'system';
  subtype: 'init' | 'compact_boundary';
  slash_commands?: string[];
  compact_metadata?: {
    pre_tokens: number;
    trigger: string;
  };
  timestamp: string;
}

export interface ResultMessage {
  type: 'result';
  subtype: 'success' | 'error';
  command: string;
  result?: any;
  error?: string;
  timestamp: string;
}

export interface AssistantMessage {
  type: 'assistant';
  message: string;
  content?: any[];
}

export type Message = SystemMessage | ResultMessage | AssistantMessage;

export interface QueryOptions {
  maxTurns?: number;
  model?: 'sonnet' | 'opus' | 'haiku';
  sessionId?: string;
}

export interface SlashCommand {
  name: string;
  namespace?: string;
  description?: string;
  argumentHint?: string;
}

/**
 * Query the slash command system
 * Simplified version of Claude Agent SDK query function
 */
export async function* query(options: {
  prompt: string;
  options?: QueryOptions;
}): AsyncGenerator<Message, void, unknown> {
  const { prompt, options: queryOptions = {} } = options;

  // Check if it's a slash command
  if (prompt.trim().startsWith('/')) {
    const parsed = await parseSlashCommand(prompt);

    if (parsed.isSlashCommand) {
      // Execute the command
      const result = await executeCommand(parsed.command, parsed.args);
      yield result;
    }
  } else {
    // Regular prompt - would integrate with Claude API
    yield {
      type: 'assistant',
      message: 'Regular prompt processing not yet implemented',
    };
  }
}

/**
 * Get available slash commands
 */
export async function getAvailableCommands(): Promise<SlashCommand[]> {
  try {
    const response = await fetch('/api/slash-commands', {
      headers: {
        'Authorization': `Bearer ${apiClient.getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch commands');
    }

    const data = await response.json();
    return data.commands;
  } catch (error) {
    console.error('Error fetching commands:', error);
    return [];
  }
}

/**
 * Get system initialization message
 */
export async function getInitMessage(): Promise<SystemMessage> {
  try {
    const response = await fetch('/api/slash-commands/init', {
      headers: {
        'Authorization': `Bearer ${apiClient.getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch init message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching init message:', error);
    return {
      type: 'system',
      subtype: 'init',
      slash_commands: [],
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get details for a specific command
 */
export async function getCommand(name: string): Promise<SlashCommand | null> {
  try {
    const response = await fetch(`/api/slash-commands/${name}`, {
      headers: {
        'Authorization': `Bearer ${apiClient.getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch command');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching command:', error);
    return null;
  }
}

/**
 * Parse a slash command from user input
 */
export async function parseSlashCommand(input: string): Promise<{
  isSlashCommand: boolean;
  command?: string;
  args?: string[];
  input: string;
}> {
  try {
    const response = await fetch('/api/slash-commands/parse', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiClient.getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      throw new Error('Failed to parse command');
    }

    return await response.json();
  } catch (error) {
    console.error('Error parsing command:', error);
    return {
      isSlashCommand: false,
      input,
    };
  }
}

/**
 * Execute a slash command
 */
export async function executeCommand(
  command: string,
  args: string[] = []
): Promise<ResultMessage> {
  try {
    const response = await fetch('/api/slash-commands/execute', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiClient.getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command, args }),
    });

    if (!response.ok) {
      throw new Error('Failed to execute command');
    }

    return await response.json();
  } catch (error) {
    console.error('Error executing command:', error);
    return {
      type: 'result',
      subtype: 'error',
      command,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Hook for React components to use slash commands
 */
export function useSlashCommands() {
  const [commands, setCommands] = React.useState<SlashCommand[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadCommands() {
      setLoading(true);
      const availableCommands = await getAvailableCommands();
      setCommands(availableCommands);
      setLoading(false);
    }

    loadCommands();
  }, []);

  const execute = React.useCallback(
    async (command: string, args: string[] = []) => {
      return await executeCommand(command, args);
    },
    []
  );

  const parse = React.useCallback(async (input: string) => {
    return await parseSlashCommand(input);
  }, []);

  return {
    commands,
    loading,
    execute,
    parse,
  };
}

// Export for global use
export const slashCommandSDK = {
  query,
  getAvailableCommands,
  getInitMessage,
  getCommand,
  parseSlashCommand,
  executeCommand,
};
