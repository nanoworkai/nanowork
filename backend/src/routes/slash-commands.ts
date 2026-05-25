import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { getSlashCommandSDK } from '../services/slashCommandSDK';

const router = Router();

/**
 * GET /slash-commands
 * Get all available slash commands
 */
router.get('/', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sdk = getSlashCommandSDK();
    const commands = sdk.getAvailableCommands();

    res.json({
      commands: commands.map(cmd => ({
        name: cmd.name,
        namespace: cmd.namespace,
        description: cmd.metadata.description,
        argumentHint: cmd.metadata.argumentHint,
      })),
    });
  } catch (error) {
    console.error('Get commands error:', error);
    res.status(500).json({
      error: 'Failed to get commands',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * GET /slash-commands/init
 * Get system initialization message
 */
router.get('/init', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sdk = getSlashCommandSDK();
    const initMessage = sdk.getInitMessage();

    res.json(initMessage);
  } catch (error) {
    console.error('Get init message error:', error);
    res.status(500).json({
      error: 'Failed to get init message',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * GET /slash-commands/:name
 * Get details for a specific command
 */
router.get('/:name', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.params;
    const sdk = getSlashCommandSDK();
    const command = sdk.getCommand(name);

    if (!command) {
      res.status(404).json({ error: 'Command not found' });
      return;
    }

    res.json({
      name: command.name,
      namespace: command.namespace,
      content: command.content,
      metadata: command.metadata,
    });
  } catch (error) {
    console.error('Get command error:', error);
    res.status(500).json({
      error: 'Failed to get command',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * POST /slash-commands/execute
 * Execute a slash command
 */
router.post('/execute', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { command, args = [] } = req.body;

    if (!command) {
      res.status(400).json({ error: 'Command is required' });
      return;
    }

    const sdk = getSlashCommandSDK();

    // Check if it's a built-in command
    const builtinCommands = ['clear', 'compact', 'context'];
    let result;

    if (builtinCommands.includes(command)) {
      result = await sdk.executeBuiltinCommand(command);
    } else {
      result = await sdk.executeCommand(command, args);
    }

    res.json(result);
  } catch (error) {
    console.error('Execute command error:', error);
    res.status(500).json({
      error: 'Failed to execute command',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * POST /slash-commands/parse
 * Parse a slash command from user input
 */
router.post('/parse', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { input } = req.body;

    if (!input) {
      res.status(400).json({ error: 'Input is required' });
      return;
    }

    const sdk = getSlashCommandSDK();
    const parsed = sdk.parseSlashCommand(input);

    if (!parsed) {
      res.json({
        isSlashCommand: false,
        input,
      });
      return;
    }

    res.json({
      isSlashCommand: true,
      command: parsed.command,
      args: parsed.args,
      input,
    });
  } catch (error) {
    console.error('Parse command error:', error);
    res.status(500).json({
      error: 'Failed to parse command',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

export default router;
