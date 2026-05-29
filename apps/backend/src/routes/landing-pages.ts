import { Router, Response } from 'express';
import { requireUserAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import {
  getBusiness,
  createLandingPage,
  updateLandingPage,
  getLandingPage,
  createDeployment,
} from '../services/supabase';
import { generateLandingPage } from '../services/anthropic';
import { deployToCloudflarePages } from '../services/deploy';

const router = Router();

/**
 * POST /landing-pages/generate
 * Generate a landing page for a business
 */
router.post('/generate', requireUserAuth, (async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { business_id } = req.body;

    if (!business_id) {
      res.status(400).json({ error: 'business_id is required' });
      return;
    }

    // Verify business ownership
    const business = await getBusiness(business_id);
    if (!business || business.agent_id !== req.agent!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Create landing page record
    const landingPage = await createLandingPage({
      business_id,
      html: null,
      css: null,
      js: null,
      status: 'draft',
      metadata: {},
    });

    // Generate landing page content
    try {
      const result = await generateLandingPage(
        business.name,
        business.tagline || '',
        business.description || '',
        'Get Started'
      );

      // Update with generated content
      const updated = await updateLandingPage(landingPage.id, {
        html: result.html,
        css: result.css,
        js: result.js,
      });

      res.json(updated);
    } catch (error) {
      console.error('Landing page generation failed:', error);
      throw error;
    }
  } catch (error) {
    console.error('Generate landing page error:', error);
    res.status(500).json({
      error: 'Failed to generate landing page',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
}) as any);

/**
 * GET /landing-pages/:id
 * Get a landing page
 */
router.get('/:id', requireUserAuth, (async (req: AuthenticatedRequest, res: Response) => {
  try {
    const landingPage = await getLandingPage(req.params.id);

    if (!landingPage) {
      res.status(404).json({ error: 'Landing page not found' });
      return;
    }

    // Verify ownership via business
    const business = await getBusiness(landingPage.business_id);
    if (!business || business.agent_id !== req.agent!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(landingPage);
  } catch (error) {
    console.error('Get landing page error:', error);
    res.status(500).json({
      error: 'Failed to fetch landing page',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
}) as any);

/**
 * POST /landing-pages/:id/deploy
 * Deploy a landing page to Cloudflare Pages
 */
router.post('/:id/deploy', requireUserAuth, (async (req: AuthenticatedRequest, res: Response) => {
  try {
    const landingPage = await getLandingPage(req.params.id);

    if (!landingPage) {
      res.status(404).json({ error: 'Landing page not found' });
      return;
    }

    // Verify ownership via business
    const business = await getBusiness(landingPage.business_id);
    if (!business || business.agent_id !== req.agent!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Deploy to Cloudflare Pages
    const deployUrl = await deployToCloudflarePages(landingPage, business);

    // Create deployment record
    const deployment = await createDeployment({
      business_id: business.id,
      artifact_type: 'landing_page',
      artifact_id: landingPage.id,
      platform: 'cloudflare_pages',
      deploy_url: deployUrl,
      status: 'success',
      error_message: null,
      metadata: {},
      deployed_at: new Date().toISOString(),
    });

    // Update landing page status
    await updateLandingPage(landingPage.id, { status: 'live' });

    res.json(deployment);
  } catch (error) {
    console.error('Deploy landing page error:', error);
    res.status(500).json({
      error: 'Failed to deploy landing page',
      message: error instanceof Error ? error.message : 'unknown error',
    });
  }
}) as any);

export default router;
