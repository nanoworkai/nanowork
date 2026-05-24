import { getSupabase } from './supabase';
import { Contact, AgentTask } from '../types';

/**
 * Batch operations service for efficient bulk updates
 */

export interface BatchUpdateResult {
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

/**
 * Batch update contacts
 */
export async function batchUpdateContacts(
  agentId: string,
  updates: Array<{ id: string; data: Partial<Contact> }>
): Promise<BatchUpdateResult> {
  const supabase = getSupabase();
  const result: BatchUpdateResult = {
    success: 0,
    failed: 0,
    errors: [],
  };

  // Process updates in parallel (Supabase can handle it)
  await Promise.all(
    updates.map(async ({ id, data }) => {
      try {
        // Verify ownership
        const { data: existing, error: fetchError } = await supabase
          .from('contacts')
          .select('id')
          .eq('id', id)
          .eq('agent_id', agentId)
          .single();

        if (fetchError || !existing) {
          result.failed++;
          result.errors.push({ id, error: 'Contact not found or access denied' });
          return;
        }

        const { error } = await supabase
          .from('contacts')
          .update(data)
          .eq('id', id);

        if (error) {
          result.failed++;
          result.errors.push({ id, error: error.message });
        } else {
          result.success++;
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          id,
          error: error instanceof Error ? error.message : 'unknown error',
        });
      }
    })
  );

  return result;
}

/**
 * Batch delete contacts (soft delete by archiving)
 */
export async function batchArchiveContacts(
  agentId: string,
  contactIds: string[]
): Promise<BatchUpdateResult> {
  return batchUpdateContacts(
    agentId,
    contactIds.map((id) => ({ id, data: { status: 'archived' as const } }))
  );
}

/**
 * Batch update tasks
 */
export async function batchUpdateTasks(
  agentId: string,
  updates: Array<{ id: string; data: Partial<AgentTask> }>
): Promise<BatchUpdateResult> {
  const supabase = getSupabase();
  const result: BatchUpdateResult = {
    success: 0,
    failed: 0,
    errors: [],
  };

  await Promise.all(
    updates.map(async ({ id, data }) => {
      try {
        // Verify ownership
        const { data: existing, error: fetchError } = await supabase
          .from('agent_tasks')
          .select('id')
          .eq('id', id)
          .eq('agent_id', agentId)
          .single();

        if (fetchError || !existing) {
          result.failed++;
          result.errors.push({ id, error: 'Task not found or access denied' });
          return;
        }

        const { error } = await supabase
          .from('agent_tasks')
          .update(data)
          .eq('id', id);

        if (error) {
          result.failed++;
          result.errors.push({ id, error: error.message });
        } else {
          result.success++;
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          id,
          error: error instanceof Error ? error.message : 'unknown error',
        });
      }
    })
  );

  return result;
}

/**
 * Batch import contacts from CSV data
 */
export async function batchImportContacts(
  agentId: string,
  businessId: string | null,
  contacts: Array<{
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    status?: 'lead' | 'customer' | 'partner';
  }>
): Promise<BatchUpdateResult> {
  const supabase = getSupabase();
  const result: BatchUpdateResult = {
    success: 0,
    failed: 0,
    errors: [],
  };

  // Prepare contacts for insertion
  const contactsToInsert = contacts.map((contact) => ({
    agent_id: agentId,
    business_id: businessId,
    name: contact.name,
    email: contact.email || null,
    phone: contact.phone || null,
    company: contact.company || null,
    status: contact.status || 'lead',
    metadata: {},
  }));

  try {
    // Use Supabase's batch insert with conflict handling
    const { data, error } = await supabase
      .from('contacts')
      .upsert(contactsToInsert, {
        onConflict: 'agent_id,email',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      throw error;
    }

    result.success = data?.length || 0;
  } catch (error) {
    // If batch fails, try one by one
    for (let i = 0; i < contactsToInsert.length; i++) {
      try {
        const { error } = await supabase.from('contacts').insert(contactsToInsert[i]);

        if (error) {
          result.failed++;
          result.errors.push({
            id: `row-${i}`,
            error: error.message,
          });
        } else {
          result.success++;
        }
      } catch (err) {
        result.failed++;
        result.errors.push({
          id: `row-${i}`,
          error: err instanceof Error ? err.message : 'unknown error',
        });
      }
    }
  }

  return result;
}

/**
 * Batch export contacts to CSV format
 */
export async function batchExportContacts(
  agentId: string,
  businessId?: string
): Promise<string> {
  const supabase = getSupabase();

  let query = supabase
    .from('contacts')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });

  if (businessId) {
    query = query.eq('business_id', businessId);
  }

  const { data: contacts, error } = await query;

  if (error) {
    throw new Error(`Failed to export contacts: ${error.message}`);
  }

  if (!contacts || contacts.length === 0) {
    return 'name,email,phone,company,status\n';
  }

  // Generate CSV
  const headers = ['name', 'email', 'phone', 'company', 'status'];
  const csv = [
    headers.join(','),
    ...contacts.map((contact) =>
      headers
        .map((header) => {
          const value = contact[header as keyof typeof contact];
          // Escape commas and quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        })
        .join(',')
    ),
  ].join('\n');

  return csv;
}
