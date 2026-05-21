import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { getSupabase, getContacts, upsertContact, updateContact, createInteraction } from '../services/supabase';

const router = Router();

/**
 * GET /contacts
 * List contacts for the agent
 */
router.get('/', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { business_id, status } = req.query;

    const contacts = await getContacts(
      req.agent!.id,
      business_id as string | undefined,
      status as string | undefined
    );

    res.json(contacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      error: 'Failed to fetch contacts',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * POST /contacts
 * Create a new contact
 */
router.post('/', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, phone, company, business_id, status } = req.body;

    if (!name) {
      res.status(400).json({ error: 'name is required' });
      return;
    }

    const contact = await upsertContact({
      agent_id: req.agent!.id,
      business_id: business_id || null,
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      status: status || 'lead',
      metadata: {},
    });

    res.json(contact);
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({
      error: 'Failed to create contact',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * PATCH /contacts/:id
 * Update a contact
 */
router.patch('/:id', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Verify the contact belongs to this agent
    const { data: existing, error: fetchError } = await getSupabase()
      .from('contacts')
      .select('id, agent_id')
      .eq('id', req.params.id)
      .eq('agent_id', req.agent!.id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    const { name, email, phone, company, status } = req.body;

    const contact = await updateContact(req.params.id, {
      ...(name && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(company !== undefined && { company }),
      ...(status && { status }),
    });

    res.json(contact);
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      error: 'Failed to update contact',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * POST /contacts/:id/interactions
 * Log an interaction with a contact
 */
router.post('/:id/interactions', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { interaction_type, notes } = req.body;

    if (!interaction_type) {
      res.status(400).json({ error: 'interaction_type is required' });
      return;
    }

    const interaction = await createInteraction({
      contact_id: req.params.id,
      agent_id: req.agent!.id,
      interaction_type,
      notes: notes || null,
      metadata: {},
    });

    res.json(interaction);
  } catch (error) {
    console.error('Create interaction error:', error);
    res.status(500).json({
      error: 'Failed to create interaction',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

export default router;
