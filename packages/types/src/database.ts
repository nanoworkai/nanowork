/**
 * Database schema types matching Supabase
 */

export interface Agent {
  id: string;
  user_id: string;
  slug: string;
  email: string;
  name: string;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  system_prompt: string | null;
  status: 'active' | 'paused' | 'archived';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface GeneratedApp {
  id: string;
  agent_id: string;
  name: string;
  prompt: string;
  status: 'generating' | 'ready' | 'deployed' | 'failed';
  framework: string;
  tech_stack: string[];
  metadata: Record<string, any>;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface Build extends GeneratedApp {
  // Alias for GeneratedApp
}
