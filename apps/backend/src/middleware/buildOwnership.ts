import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { getSupabase } from '../services/supabase';

/**
 * Middleware to verify that the authenticated user owns a build
 * Use this on any endpoint that accesses build data
 *
 * Usage:
 * router.get('/builds/:buildId/data', requireUserAuth, verifyBuildOwnership, handler);
 */
export async function verifyBuildOwnership(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const buildId = req.params.buildId || req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!buildId) {
      res.status(400).json({ error: 'Build ID is required' });
      return;
    }

    // Use the database function for ownership verification
    const { data, error } = await getSupabase().rpc('verify_build_ownership', {
      p_user_id: userId,
      p_build_id: buildId,
    });

    if (error) {
      console.error('Build ownership verification error:', error);
      res.status(500).json({ error: 'Failed to verify build ownership' });
      return;
    }

    if (!data) {
      // Log security event
      await logSecurityEvent({
        event_type: 'unauthorized_build_access',
        user_id: userId,
        resource_type: 'build',
        resource_id: buildId,
        action: 'api_access_attempt',
      });

      res.status(403).json({ error: 'You do not have permission to access this build' });
      return;
    }

    // Build ownership verified, continue
    next();
  } catch (error) {
    console.error('Build ownership middleware error:', error);
    res.status(500).json({ error: 'Failed to verify build access' });
  }
}

/**
 * Middleware to verify that the authenticated user owns a company
 * Use this on any endpoint that accesses company data
 *
 * Usage:
 * router.get('/companies/:companyId/data', requireUserAuth, verifyCompanyOwnership, handler);
 */
export async function verifyCompanyOwnership(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const companyId = req.params.companyId || req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!companyId) {
      res.status(400).json({ error: 'Company ID is required' });
      return;
    }

    const { data, error } = await getSupabase()
      .from('companies')
      .select('id')
      .eq('id', companyId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Log security event
      await logSecurityEvent({
        event_type: 'unauthorized_company_access',
        user_id: userId,
        resource_type: 'company',
        resource_id: companyId,
        action: 'api_access_attempt',
      });

      res.status(403).json({ error: 'You do not have permission to access this company' });
      return;
    }

    next();
  } catch (error) {
    console.error('Company ownership middleware error:', error);
    res.status(500).json({ error: 'Failed to verify company access' });
  }
}

/**
 * Middleware to verify that the authenticated user owns a document
 */
export async function verifyDocumentOwnership(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const documentId = req.params.documentId || req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!documentId) {
      res.status(400).json({ error: 'Document ID is required' });
      return;
    }

    // Check if document belongs to user's company
    const { data, error } = await getSupabase()
      .from('documents')
      .select('company_id, companies!inner(user_id)')
      .eq('id', documentId)
      .single();

    if (error || !data || (data as any).companies?.user_id !== userId) {
      await logSecurityEvent({
        event_type: 'unauthorized_document_access',
        user_id: userId,
        resource_type: 'document',
        resource_id: documentId,
        action: 'api_access_attempt',
      });

      res.status(403).json({ error: 'You do not have permission to access this document' });
      return;
    }

    next();
  } catch (error) {
    console.error('Document ownership middleware error:', error);
    res.status(500).json({ error: 'Failed to verify document access' });
  }
}

/**
 * Log security events to audit log
 */
async function logSecurityEvent(event: {
  event_type: string;
  user_id: string;
  resource_type: string;
  resource_id: string;
  action: string;
}): Promise<void> {
  try {
    await getSupabase()
      .from('security_audit_log')
      .insert({
        ...event,
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}
