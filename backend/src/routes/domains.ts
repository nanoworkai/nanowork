import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();

/**
 * Custom domain management endpoints
 *
 * NOTE: This functionality has been removed as it was dependent on Cloudflare Pages.
 * If custom domains are needed in the future, implement using the hosting provider's API
 * (Render, Vercel, Netlify, etc.)
 *
 * Previous endpoints:
 * - POST /domains/subscribe - Create domain subscription
 * - POST /domains/configure - Configure custom domain
 * - GET /domains/verify/:deploymentId - Verify DNS
 * - DELETE /domains/cancel/:deploymentId - Cancel domain subscription
 */

export default router;
