import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { storeDocument, getDocuments, updateDocumentEmbedding } from '../services/supabase';
import { getEmbedding } from '../services/anthropic';

const router = Router();

/**
 * POST /documents
 * Upload/create a new document
 */
router.post('/', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, business_id } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'title and content are required' });
      return;
    }

    // Create document
    const document = await storeDocument({
      agent_id: req.agent!.id,
      business_id: business_id || null,
      title,
      content,
      embedding: null,
      metadata: {},
    });

    // Fire-and-forget: generate embedding
    setImmediate(() => {
      getEmbedding(content)
        .then((embedding) => {
          if (embedding.length > 0) {
            return updateDocumentEmbedding(document.id, embedding);
          }
        })
        .catch((err) => console.error('Failed to generate document embedding:', err));
    });

    res.json(document);
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({
      error: 'Failed to create document',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

/**
 * GET /documents
 * List documents for the agent
 */
router.get('/', requireUserAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { business_id } = req.query;

    const documents = await getDocuments(
      req.agent!.id,
      business_id as string | undefined
    );

    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      error: 'Failed to fetch documents',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

export default router;
