import { z } from 'zod';

/**
 * Validation schemas for API endpoints
 */

// Build schemas
export const createBuildSchema = z.object({
  company_name: z.string().min(1, 'Company name cannot be empty').max(100, 'Company name too long').optional(),
  prompt: z.string().min(1, 'Prompt is required').max(2000, 'Prompt too long'),
  tagline: z.string().max(200, 'Tagline too long').optional(),
});

export const updateBuildSchema = z.object({
  company_name: z.string().min(1, 'Company name cannot be empty').max(100, 'Company name too long').optional(),
  name: z.string().min(1, 'Name cannot be empty').max(100, 'Name too long').optional(),
  tagline: z.string().max(200, 'Tagline too long').optional(),
  status: z.enum(['generating', 'unlocked', 'failed']).optional(),
  build_data: z.record(z.string(), z.any()).optional(),
  last_activity_at: z.string().optional(),
});

export const generateNameSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(2000, 'Prompt too long'),
});

// Contact schemas - status values from Contact type: 'lead' | 'customer' | 'partner' | 'archived'
export const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  email: z.string().email('Invalid email format').max(255, 'Email too long').optional().or(z.literal('')),
  phone: z.string().max(50, 'Phone number too long').optional().or(z.literal('')),
  company: z.string().max(200, 'Company name too long').optional(),
  business_id: z.string().uuid('Invalid business ID').optional(),
  status: z.enum(['lead', 'customer', 'partner', 'archived']).optional(),
});

export const updateContactSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(200, 'Name too long').optional(),
  email: z.string().email('Invalid email format').max(255, 'Email too long').optional().or(z.literal('')),
  phone: z.string().max(50, 'Phone number too long').optional().or(z.literal('')),
  company: z.string().max(200, 'Company name too long').optional(),
  status: z.enum(['lead', 'customer', 'partner', 'archived']).optional(),
});

export const createInteractionSchema = z.object({
  interaction_type: z.string().min(1, 'Interaction type is required').max(50, 'Interaction type too long'),
  notes: z.string().max(2000, 'Notes too long').optional(),
});

// Stream query parameters schema
export const streamQuerySchema = z.object({
  buildId: z.string().min(1, 'Build ID is required'),
  prompt: z.string().min(1, 'Prompt is required').max(2000, 'Prompt too long'),
});
