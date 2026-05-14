// TypeScript interfaces matching the Supabase schema

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

export type NewAgent = Omit<Agent, 'id' | 'created_at' | 'updated_at'>;

export interface Business {
  id: string;
  agent_id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  idea_prompt: string;
  status: 'planning' | 'building' | 'live' | 'archived';
  revenue_cents: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type NewBusiness = Omit<Business, 'id' | 'created_at' | 'updated_at'>;

export interface GeneratedApp {
  id: string;
  business_id: string;
  framework: string;
  tech_stack: string[];
  status: 'generating' | 'ready' | 'deployed' | 'failed';
  prompt: string;
  error_message: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type NewGeneratedApp = Omit<GeneratedApp, 'id' | 'created_at' | 'updated_at'>;

export interface AppFile {
  id: string;
  app_id: string;
  path: string;
  content: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export type NewAppFile = Omit<AppFile, 'id' | 'created_at' | 'updated_at'>;

export interface LandingPage {
  id: string;
  business_id: string;
  html: string | null;
  css: string | null;
  js: string | null;
  status: 'draft' | 'live' | 'archived';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type NewLandingPage = Omit<LandingPage, 'id' | 'created_at' | 'updated_at'>;

export interface Deployment {
  id: string;
  business_id: string;
  artifact_type: 'landing_page' | 'generated_app';
  artifact_id: string;
  platform: 'cloudflare_pages' | 'vercel' | 'netlify';
  deploy_url: string | null;
  status: 'pending' | 'deploying' | 'success' | 'failed';
  error_message: string | null;
  metadata: Record<string, any>;
  created_at: string;
  deployed_at: string | null;
  custom_domain?: string | null;
  domain_status?: 'pending_payment' | 'pending_configuration' | 'pending_dns' | 'active' | 'payment_failed' | null;
  domain_verified?: boolean;
  domain_subscription_id?: string | null;
  cloudflare_project_name?: string | null;
}

export type NewDeployment = Omit<Deployment, 'id' | 'created_at'>;

export interface AgentConversation {
  id: string;
  agent_id: string;
  business_id: string | null;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type NewAgentConversation = Omit<AgentConversation, 'id' | 'created_at' | 'updated_at'>;

export interface AgentEmail {
  id: string;
  agent_id: string;
  business_id: string | null;
  direction: 'inbound' | 'outbound';
  from_address: string;
  to_addresses: string[];
  subject: string;
  body_text: string | null;
  body_html: string | null;
  external_message_id: string | null;
  reply_to_email_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export type NewAgentEmail = Omit<AgentEmail, 'id' | 'created_at'>;

export interface AgentMemory {
  id: string;
  agent_id: string;
  business_id: string | null;
  content: string;
  memory_type: string;
  source: string;
  embedding: number[] | null;
  metadata: Record<string, any>;
  created_at: string;
}

export type NewAgentMemory = Omit<AgentMemory, 'id' | 'created_at'>;

export interface AgentTask {
  id: string;
  agent_id: string;
  business_id: string | null;
  task_type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  payload: Record<string, any>;
  result: Record<string, any> | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export type NewAgentTask = Omit<AgentTask, 'id' | 'created_at' | 'updated_at' | 'completed_at'>;

export interface Contact {
  id: string;
  agent_id: string;
  business_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: 'lead' | 'customer' | 'partner' | 'archived';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type NewContact = Omit<Contact, 'id' | 'created_at' | 'updated_at'>;

export interface ContactInteraction {
  id: string;
  contact_id: string;
  agent_id: string;
  interaction_type: string;
  notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export type NewContactInteraction = Omit<ContactInteraction, 'id' | 'created_at'>;

export interface PaymentLink {
  id: string;
  agent_id: string;
  business_id: string;
  stripe_payment_link_id: string;
  title: string;
  amount_cents: number;
  currency: string;
  url: string;
  status: 'active' | 'expired' | 'archived';
  metadata: Record<string, any>;
  created_at: string;
}

export type NewPaymentLink = Omit<PaymentLink, 'id' | 'created_at'>;

export interface Transaction {
  id: string;
  agent_id: string;
  business_id: string;
  payment_link_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  metadata: Record<string, any>;
  created_at: string;
}

export type NewTransaction = Omit<Transaction, 'id' | 'created_at'>;

export interface Document {
  id: string;
  agent_id: string;
  business_id: string | null;
  title: string;
  content: string;
  embedding: number[] | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type NewDocument = Omit<Document, 'id' | 'created_at' | 'updated_at'>;

// Request/Response types
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
  agent?: Agent;
}
