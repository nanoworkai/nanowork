import { Hono } from 'hono';
import type { Env } from '../index';
import { createClient } from '@supabase/supabase-js';

const app = new Hono<{ Bindings: Env }>();

/**
 * DELETE /api/user
 * Deletes the authenticated user's account and all associated data
 * Requires Authorization header with user's JWT
 */
app.delete('/', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the user's token and get their ID
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const userId = user.id;

    // Delete user's related data in order (respecting foreign key constraints)
    // 1. Delete companies owned by user
    await supabaseAdmin
      .from('companies')
      .delete()
      .eq('user_id', userId);

    // 2. Delete company memberships
    await supabaseAdmin
      .from('company_members')
      .delete()
      .eq('user_id', userId);

    // 3. Delete builds
    await supabaseAdmin
      .from('builds')
      .delete()
      .eq('user_id', userId);

    // 4. Delete credits transactions
    await supabaseAdmin
      .from('credits_transactions')
      .delete()
      .eq('user_id', userId);

    // 5. Delete profile
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    // 6. Finally, delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Failed to delete auth user:', deleteError);
      return c.json({ error: 'Failed to delete user account: ' + deleteError.message }, 500);
    }

    return c.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return c.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;
