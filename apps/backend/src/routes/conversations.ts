import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import {
  getConversations,
  getConversation,
  createConversation,
  updateConversationMessages,
} from '../services/supabase';
import { chat } from '../services/anthropic';
import { storeMemory } from '../services/memory';
import { validateConversationInput } from '../middleware/validation';
import { rateLimitConversations } from '../middleware/rateLimiting';
import { checkConversationCredits, deductOperationCredits } from '../middleware/costProtection';

const router = Router();

/**
 * GET /conversations
 * List conversations for the agent
 */
router.get('/', requireUserAuth, (async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { business_id } = req.query;

    const conversations = await getConversations(
      req.agent!.id,
      business_id as string | undefined
    );

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      error: 'Failed to fetch conversations',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
}) as any);

/**
 * POST /conversations
 * Create or continue a conversation
 */
router.post('/', requireUserAuth, rateLimitConversations, checkConversationCredits, validateConversationInput, (async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message, conversation_id, business_id } = req.body;

    if (!message) {
      res.status(400).json({ error: 'message is required' });
      return;
    }

    let conversation;
    let messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Load or create conversation
    if (conversation_id) {
      const existing = await getConversation(conversation_id);
      if (!existing || existing.agent_id !== req.agent!.id) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }
      conversation = existing;
      messages = existing.messages;
    } else {
      // Create new conversation
      conversation = await createConversation({
        agent_id: req.agent!.id,
        business_id: business_id || null,
        messages: [],
        metadata: {},
      });
    }

    // Append user message
    messages.push({ role: 'user', content: message });

    // TODO: Optionally search memories for context
    // const relevantMemories = await searchMemories({
    //   agentId: req.agent!.id,
    //   query: message,
    //   matchCount: 5
    // });

    // Get agent response
    const systemPrompt =
      req.agent!.system_prompt ||
      'You are a helpful AI assistant managing an autonomous business.';

    const reply = await chat(messages, systemPrompt);

    // Append assistant reply
    messages.push({ role: 'assistant', content: reply });

    // Save conversation
    await updateConversationMessages(conversation.id, messages);

    // Fire-and-forget: store memory
    setImmediate(() => {
      storeMemory({
        agentId: req.agent!.id,
        businessId: business_id || undefined,
        content: `User: ${message}\nAssistant: ${reply}`,
        memoryType: 'conversation',
        source: 'chat',
        metadata: { conversation_id: conversation.id },
      }).catch((err) => console.error('Failed to store memory:', err));
    });

    // Deduct credits after successful conversation
    if (req.user?.id && (req as any).requiredCredits) {
      await deductOperationCredits(
        req.user.id,
        (req as any).requiredCredits,
        'conversation',
        { conversation_id: conversation.id }
      ).catch(err => console.error('Failed to deduct credits:', err));
    }

    res.json({ reply, conversation_id: conversation.id });
  } catch (error) {
    console.error('Conversation error:', error);
    res.status(500).json({
      error: 'Failed to process conversation',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
}) as any);

export default router;
