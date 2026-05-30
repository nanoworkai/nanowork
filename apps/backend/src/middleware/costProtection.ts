import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { getSupabase } from '../services/supabase';

/**
 * Cost protection middleware
 * Checks user credit balance before allowing expensive AI operations
 */

// Cost estimates in credits (1 credit = $0.01)
export const OPERATION_COSTS = {
  build_creation: 10, // $0.10
  agent_orchestrator: 50, // $0.50 - runs multiple agents
  conversation_message: 2, // $0.02
  ai_generation: 1, // $0.01
  landing_page_generation: 5, // $0.05
};

// Maximum tokens per request to prevent runaway costs
export const MAX_TOKENS = {
  build_creation: 8000,
  agent_orchestrator: 8000,
  conversation: 4096,
  generation: 1000,
};

// Timeout limits (milliseconds) for AI operations
export const TIMEOUTS = {
  build_creation: 120000, // 2 minutes
  agent_orchestrator: 300000, // 5 minutes
  conversation: 60000, // 1 minute
  generation: 30000, // 30 seconds
};

/**
 * Check if user has sufficient credits for an operation
 */
async function checkUserCredits(
  userId: string,
  requiredCredits: number
): Promise<{ allowed: boolean; balance: number; error?: string }> {
  const supabase = getSupabase();

  // Get user's current credit balance
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return {
      allowed: false,
      balance: 0,
      error: 'Failed to fetch user credits',
    };
  }

  const currentCredits = profile.credits || 0;

  if (currentCredits < requiredCredits) {
    return {
      allowed: false,
      balance: currentCredits,
      error: `Insufficient credits. Required: ${requiredCredits}, Available: ${currentCredits}`,
    };
  }

  return {
    allowed: true,
    balance: currentCredits,
  };
}

/**
 * Deduct credits from user account
 */
async function deductCredits(
  userId: string,
  credits: number,
  operationType: string,
  metadata?: any
): Promise<void> {
  const supabase = getSupabase();

  // Deduct credits atomically
  await supabase.rpc('deduct_credits', {
    user_id: userId,
    amount: credits,
  });

  // Log the transaction
  await supabase.from('credit_transactions').insert({
    user_id: userId,
    amount: -credits,
    operation_type: operationType,
    metadata: metadata || {},
    created_at: new Date().toISOString(),
  });
}

/**
 * Middleware to check credits before build creation
 */
export async function checkBuildCreationCredits(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user?.id) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const requiredCredits = OPERATION_COSTS.build_creation;
  const result = await checkUserCredits(req.user.id, requiredCredits);

  if (!result.allowed) {
    res.status(402).json({
      error: 'Insufficient credits',
      message: result.error,
      required: requiredCredits,
      available: result.balance,
    });
    return;
  }

  // Store required credits in request for later deduction
  (req as any).requiredCredits = requiredCredits;
  (req as any).operationType = 'build_creation';

  next();
}

/**
 * Middleware to check credits before agent orchestrator
 */
export async function checkAgentOrchestratorCredits(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user?.id) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const requiredCredits = OPERATION_COSTS.agent_orchestrator;
  const result = await checkUserCredits(req.user.id, requiredCredits);

  if (!result.allowed) {
    res.status(402).json({
      error: 'Insufficient credits',
      message: result.error,
      required: requiredCredits,
      available: result.balance,
    });
    return;
  }

  (req as any).requiredCredits = requiredCredits;
  (req as any).operationType = 'agent_orchestrator';

  next();
}

/**
 * Middleware to check credits before conversation
 */
export async function checkConversationCredits(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user?.id) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const requiredCredits = OPERATION_COSTS.conversation_message;
  const result = await checkUserCredits(req.user.id, requiredCredits);

  if (!result.allowed) {
    res.status(402).json({
      error: 'Insufficient credits',
      message: result.error,
      required: requiredCredits,
      available: result.balance,
    });
    return;
  }

  (req as any).requiredCredits = requiredCredits;
  (req as any).operationType = 'conversation';

  next();
}

/**
 * Middleware to deduct credits after successful operation
 * Call this AFTER the operation completes successfully
 */
export async function deductOperationCredits(
  userId: string,
  requiredCredits: number,
  operationType: string,
  metadata?: any
): Promise<void> {
  await deductCredits(userId, requiredCredits, operationType, metadata);
}

/**
 * Helper to log AI operation for monitoring
 */
export async function logAIOperation(
  userId: string,
  operationType: string,
  inputTokens: number,
  outputTokens: number,
  costInCents: number,
  metadata?: any
): Promise<void> {
  const supabase = getSupabase();

  await supabase.from('ai_operation_logs').insert({
    user_id: userId,
    operation_type: operationType,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_cents: costInCents,
    metadata: metadata || {},
    created_at: new Date().toISOString(),
  });
}
