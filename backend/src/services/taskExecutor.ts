import { spendCredits, getTaskCost, InsufficientCreditsError } from './creditService';
import { updateTask } from './supabase';

/**
 * Execute a task with credit gating
 * This wraps any task execution and ensures credits are deducted before proceeding
 */
export async function executeTaskWithCredits(
  userId: string,
  taskId: string,
  taskType: string,
  executionFn: () => Promise<any>
): Promise<{ success: boolean; result?: any; error?: string; insufficientCredits?: boolean }> {
  const cost = getTaskCost(taskType);
  const description = `Agent task: ${taskType}`;

  try {
    // First, deduct the credits - this will throw if insufficient
    await spendCredits(userId, cost, description, taskId);

    // Mark task as in progress
    await updateTask(taskId, 'in_progress');

    // Execute the task
    const result = await executionFn();

    // Mark as completed
    await updateTask(taskId, 'completed', result);

    return { success: true, result };
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      // Mark task as failed due to insufficient credits
      await updateTask(
        taskId,
        'failed',
        undefined,
        'Your agent is out of credits. Top up your balance to continue.'
      );

      return {
        success: false,
        error: error.message,
        insufficientCredits: true,
      };
    }

    // Other errors - mark as failed
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await updateTask(taskId, 'failed', undefined, errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Check if user has sufficient credits for a task
 */
export async function canExecuteTask(userId: string, taskType: string): Promise<boolean> {
  const { getBalance } = await import('./creditService');
  const cost = getTaskCost(taskType);
  const balance = await getBalance(userId);
  return balance >= cost;
}
