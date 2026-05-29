import { getSupabase } from './supabase';

// Credit cost configuration
export const CREDIT_COSTS = {
  default: 1,
  email_send: 2,
  email_received: 1,
  web_search: 1,
  document_generation: 3,
  app_generation: 5,
  landing_page_generation: 3,
  deployment: 2,
} as const;

export class InsufficientCreditsError extends Error {
  constructor(message: string = 'Insufficient credits') {
    super(message);
    this.name = 'InsufficientCreditsError';
  }
}

/**
 * Get the current credit balance for a user
 */
export async function getBalance(userId: string): Promise<number> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new Error(`Failed to get balance: ${error?.message || 'user not found'}`);
  }

  return data.credits || 0;
}

/**
 * Spend credits atomically - throws InsufficientCreditsError if balance is too low
 */
export async function spendCredits(
  userId: string,
  amount: number,
  description: string,
  taskId?: string
): Promise<number> {
  const supabase = getSupabase();

  // Call the atomic Postgres function to deduct credits
  const { data, error } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: amount,
  });

  if (error) {
    if (error.message?.includes('insufficient_credits')) {
      throw new InsufficientCreditsError('Your agent is out of credits. Top up your balance to continue.');
    }
    throw new Error(`Failed to spend credits: ${error.message}`);
  }

  const newBalance = data as number;

  // Log the transaction
  await supabase.from('credit_transactions').insert({
    user_id: userId,
    amount: -amount,
    balance_after: newBalance,
    type: 'spend',
    description,
    task_id: taskId || null,
  });

  return newBalance;
}

/**
 * Add credits to a user's balance (only called from Stripe webhook)
 */
export async function addCredits(
  userId: string,
  amount: number,
  stripePaymentIntentId: string
): Promise<number> {
  const supabase = getSupabase();

  // Atomically increment credits
  const { data, error } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new Error(`Failed to get user profile: ${error?.message || 'user not found'}`);
  }

  const currentBalance = data.credits || 0;
  const newBalance = currentBalance + amount;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ credits: newBalance })
    .eq('id', userId);

  if (updateError) {
    throw new Error(`Failed to add credits: ${updateError.message}`);
  }

  // Log the transaction
  await supabase.from('credit_transactions').insert({
    user_id: userId,
    amount,
    balance_after: newBalance,
    type: 'topup',
    description: 'Credit top-up via Stripe',
    stripe_payment_intent_id: stripePaymentIntentId,
  });

  return newBalance;
}

/**
 * Get transaction history for a user
 */
export async function getTransactionHistory(
  userId: string,
  limit: number = 50
): Promise<any[]> {
  const { data, error } = await getSupabase()
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get transaction history: ${error.message}`);
  }

  return data || [];
}

/**
 * Get the cost for a specific task type
 */
export function getTaskCost(taskType: string): number {
  return CREDIT_COSTS[taskType as keyof typeof CREDIT_COSTS] || CREDIT_COSTS.default;
}
