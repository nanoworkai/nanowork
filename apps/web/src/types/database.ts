// Generated from Supabase Schema v2
// This file contains TypeScript types for all database tables

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          status: 'active' | 'suspended' | 'deleted'
          email_verified: boolean
          plan: 'free' | 'starter' | 'growth' | 'scale' | 'enterprise'
          stripe_customer_id: string | null
          subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused' | null
          subscription_id: string | null
          trial_ends_at: string | null
          subscription_ends_at: string | null
          credits_balance: number
          monthly_company_limit: number
          total_companies_created: number
          timezone: string
          notification_preferences: Json
          last_login_at: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          status?: 'active' | 'suspended' | 'deleted'
          email_verified?: boolean
          plan?: 'free' | 'starter' | 'growth' | 'scale' | 'enterprise'
          stripe_customer_id?: string | null
          subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused' | null
          subscription_id?: string | null
          trial_ends_at?: string | null
          subscription_ends_at?: string | null
          credits_balance?: number
          monthly_company_limit?: number
          total_companies_created?: number
          timezone?: string
          notification_preferences?: Json
          last_login_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          status?: 'active' | 'suspended' | 'deleted'
          email_verified?: boolean
          plan?: 'free' | 'starter' | 'growth' | 'scale' | 'enterprise'
          stripe_customer_id?: string | null
          subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused' | null
          subscription_id?: string | null
          trial_ends_at?: string | null
          subscription_ends_at?: string | null
          credits_balance?: number
          monthly_company_limit?: number
          total_companies_created?: number
          timezone?: string
          notification_preferences?: Json
          last_login_at?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string
          slug: string | null
          industry: string | null
          logo_url: string | null
          status: 'initializing' | 'active' | 'paused' | 'archived' | 'deleted'
          entity_type: string | null
          entity_state: string | null
          ein: string | null
          legal_entity_id: string | null
          brand_colors: Json | null
          brand_guidelines_url: string | null
          subdomain: string | null
          custom_domain_id: string | null
          website_url: string | null
          website_status: 'building' | 'live' | 'maintenance' | 'offline' | null
          total_revenue: number
          mrr: number
          total_spend: number
          settings: Json
          created_at: string
          updated_at: string
          launched_at: string | null
          archived_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description: string
          slug?: string | null
          industry?: string | null
          logo_url?: string | null
          status?: 'initializing' | 'active' | 'paused' | 'archived' | 'deleted'
          entity_type?: string | null
          entity_state?: string | null
          ein?: string | null
          legal_entity_id?: string | null
          brand_colors?: Json | null
          brand_guidelines_url?: string | null
          subdomain?: string | null
          custom_domain_id?: string | null
          website_url?: string | null
          website_status?: 'building' | 'live' | 'maintenance' | 'offline' | null
          total_revenue?: number
          mrr?: number
          total_spend?: number
          settings?: Json
          created_at?: string
          updated_at?: string
          launched_at?: string | null
          archived_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string
          slug?: string | null
          industry?: string | null
          logo_url?: string | null
          status?: 'initializing' | 'active' | 'paused' | 'archived' | 'deleted'
          entity_type?: string | null
          entity_state?: string | null
          ein?: string | null
          legal_entity_id?: string | null
          brand_colors?: Json | null
          brand_guidelines_url?: string | null
          subdomain?: string | null
          custom_domain_id?: string | null
          website_url?: string | null
          website_status?: 'building' | 'live' | 'maintenance' | 'offline' | null
          total_revenue?: number
          mrr?: number
          total_spend?: number
          settings?: Json
          created_at?: string
          updated_at?: string
          launched_at?: string | null
          archived_at?: string | null
          deleted_at?: string | null
        }
      }
      company_members: {
        Row: {
          id: string
          company_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'viewer'
          permissions: Json
          invited_by: string | null
          invitation_email: string | null
          invitation_token: string | null
          invitation_status: 'pending' | 'accepted' | 'declined' | 'expired'
          invitation_sent_at: string | null
          invitation_accepted_at: string | null
          invitation_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          permissions?: Json
          invited_by?: string | null
          invitation_email?: string | null
          invitation_token?: string | null
          invitation_status?: 'pending' | 'accepted' | 'declined' | 'expired'
          invitation_sent_at?: string | null
          invitation_accepted_at?: string | null
          invitation_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          permissions?: Json
          invited_by?: string | null
          invitation_email?: string | null
          invitation_token?: string | null
          invitation_status?: 'pending' | 'accepted' | 'declined' | 'expired'
          invitation_sent_at?: string | null
          invitation_accepted_at?: string | null
          invitation_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      custom_domains: {
        Row: {
          id: string
          company_id: string
          domain: string
          subdomain: string | null
          verification_status: 'pending' | 'verified' | 'failed'
          verification_token: string | null
          verification_method: 'dns_txt' | 'dns_cname' | 'html_meta' | null
          ssl_status: 'pending' | 'active' | 'failed' | 'expired'
          ssl_provider: string | null
          ssl_expires_at: string | null
          dns_records: Json | null
          is_primary: boolean
          status: 'pending' | 'active' | 'failed' | 'removed'
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          domain: string
          subdomain?: string | null
          verification_status?: 'pending' | 'verified' | 'failed'
          verification_token?: string | null
          verification_method?: 'dns_txt' | 'dns_cname' | 'html_meta' | null
          ssl_status?: 'pending' | 'active' | 'failed' | 'expired'
          ssl_provider?: string | null
          ssl_expires_at?: string | null
          dns_records?: Json | null
          is_primary?: boolean
          status?: 'pending' | 'active' | 'failed' | 'removed'
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          domain?: string
          subdomain?: string | null
          verification_status?: 'pending' | 'verified' | 'failed'
          verification_token?: string | null
          verification_method?: 'dns_txt' | 'dns_cname' | 'html_meta' | null
          ssl_status?: 'pending' | 'active' | 'failed' | 'expired'
          ssl_provider?: string | null
          ssl_expires_at?: string | null
          dns_records?: Json | null
          is_primary?: boolean
          status?: 'pending' | 'active' | 'failed' | 'removed'
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credits_transactions: {
        Row: {
          id: string
          user_id: string
          type: 'topup' | 'spend' | 'refund'
          amount: number
          balance_after: number
          company_id: string | null
          description: string
          stripe_payment_intent_id: string | null
          stripe_charge_id: string | null
          price_paid: number | null
          usage_type: 'company_creation' | 'agent_action' | 'email_sent' | 'api_call' | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'topup' | 'spend' | 'refund'
          amount: number
          balance_after: number
          company_id?: string | null
          description: string
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          price_paid?: number | null
          usage_type?: 'company_creation' | 'agent_action' | 'email_sent' | 'api_call' | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'topup' | 'spend' | 'refund'
          amount?: number
          balance_after?: number
          company_id?: string | null
          description?: string
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          price_paid?: number | null
          usage_type?: 'company_creation' | 'agent_action' | 'email_sent' | 'api_call' | null
          metadata?: Json | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          stripe_price_id: string
          plan: 'starter' | 'growth' | 'scale' | 'enterprise'
          status: 'incomplete' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused'
          billing_cycle: 'monthly' | 'yearly'
          amount: number
          currency: string
          current_period_start: string
          current_period_end: string
          trial_start: string | null
          trial_end: string | null
          canceled_at: string | null
          ended_at: string | null
          features: Json
          limits: Json
          cancel_at_period_end: boolean
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          stripe_price_id: string
          plan: 'starter' | 'growth' | 'scale' | 'enterprise'
          status: 'incomplete' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused'
          billing_cycle?: 'monthly' | 'yearly'
          amount: number
          currency?: string
          current_period_start: string
          current_period_end: string
          trial_start?: string | null
          trial_end?: string | null
          canceled_at?: string | null
          ended_at?: string | null
          features?: Json
          limits?: Json
          cancel_at_period_end?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string
          stripe_customer_id?: string
          stripe_price_id?: string
          plan?: 'starter' | 'growth' | 'scale' | 'enterprise'
          status?: 'incomplete' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused'
          billing_cycle?: 'monthly' | 'yearly'
          amount?: number
          currency?: string
          current_period_start?: string
          current_period_end?: string
          trial_start?: string | null
          trial_end?: string | null
          canceled_at?: string | null
          ended_at?: string | null
          features?: Json
          limits?: Json
          cancel_at_period_end?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          stripe_invoice_id: string
          stripe_customer_id: string
          invoice_number: string | null
          amount_due: number
          amount_paid: number
          currency: string
          status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
          payment_intent_id: string | null
          charge_id: string | null
          paid_at: string | null
          invoice_date: string
          due_date: string | null
          period_start: string | null
          period_end: string | null
          invoice_pdf_url: string | null
          hosted_invoice_url: string | null
          line_items: Json
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          stripe_invoice_id: string
          stripe_customer_id: string
          invoice_number?: string | null
          amount_due: number
          amount_paid?: number
          currency?: string
          status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
          payment_intent_id?: string | null
          charge_id?: string | null
          paid_at?: string | null
          invoice_date: string
          due_date?: string | null
          period_start?: string | null
          period_end?: string | null
          invoice_pdf_url?: string | null
          hosted_invoice_url?: string | null
          line_items?: Json
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          stripe_invoice_id?: string
          stripe_customer_id?: string
          invoice_number?: string | null
          amount_due?: number
          amount_paid?: number
          currency?: string
          status?: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
          payment_intent_id?: string | null
          charge_id?: string | null
          paid_at?: string | null
          invoice_date?: string
          due_date?: string | null
          period_start?: string | null
          period_end?: string | null
          invoice_pdf_url?: string | null
          hosted_invoice_url?: string | null
          line_items?: Json
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          user_id: string
          stripe_payment_method_id: string
          stripe_customer_id: string
          type: 'card' | 'bank_account' | 'sepa_debit' | 'us_bank_account'
          card_brand: string | null
          card_last4: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          card_fingerprint: string | null
          bank_name: string | null
          bank_last4: string | null
          is_default: boolean
          status: 'active' | 'expired' | 'removed'
          billing_details: Json | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_payment_method_id: string
          stripe_customer_id: string
          type: 'card' | 'bank_account' | 'sepa_debit' | 'us_bank_account'
          card_brand?: string | null
          card_last4?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_fingerprint?: string | null
          bank_name?: string | null
          bank_last4?: string | null
          is_default?: boolean
          status?: 'active' | 'expired' | 'removed'
          billing_details?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_payment_method_id?: string
          stripe_customer_id?: string
          type?: 'card' | 'bank_account' | 'sepa_debit' | 'us_bank_account'
          card_brand?: string | null
          card_last4?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_fingerprint?: string | null
          bank_name?: string | null
          bank_last4?: string | null
          is_default?: boolean
          status?: 'active' | 'expired' | 'removed'
          billing_details?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type CompanyMember = Database['public']['Tables']['company_members']['Row']
export type CustomDomain = Database['public']['Tables']['custom_domains']['Row']
export type CreditsTransaction = Database['public']['Tables']['credits_transactions']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row']
