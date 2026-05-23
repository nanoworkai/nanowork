import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { getSupabase } from './services/supabase';

// Import routes
import provisionRouter from './routes/internal/provision';
import emailWebhookRouter from './routes/webhooks/email';
import stripeWebhookRouter from './routes/webhooks/stripe';
import agentsRouter from './routes/agents';
import businessesRouter from './routes/businesses';
import appsRouter from './routes/apps';
import landingPagesRouter from './routes/landing-pages';
import deploymentsRouter from './routes/deployments';
import conversationsRouter from './routes/conversations';
import tasksRouter from './routes/tasks';
import contactsRouter from './routes/contacts';
import paymentsRouter from './routes/payments';
import documentsRouter from './routes/documents';
import domainsRouter from './routes/domains';
import billingRouter from './routes/billing';
import walletRouter from './routes/wallet';
import buildsRouter from './routes/builds';

// Environment variables with fallback to empty strings
const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? '';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? '';
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN ?? '';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? '';
const AGENT_EMAIL_DOMAIN = process.env.AGENT_EMAIL_DOMAIN ?? '';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Stripe webhook needs raw body, so register it before express.json()
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookRouter);

app.use(express.json());

// CORS configuration - use environment variable or development defaults
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? '';
const NODE_ENV = process.env.NODE_ENV ?? 'development';

const allowedOrigins = CORS_ORIGIN
  ? CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
}));

// Health check endpoint - comprehensive service checks
app.get('/health', async (_req, res) => {
  const checks: Record<string, string> = {};

  // Check Supabase database connectivity
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('agents')
      .select('id')
      .limit(1)
      .single();

    // PGRST116 = no rows, which is fine (table exists but empty)
    checks.supabase = (!error || error.code === 'PGRST116') ? 'ok' : 'error';
  } catch {
    checks.supabase = 'error';
  }

  // Check Anthropic API key exists
  checks.anthropic = process.env.ANTHROPIC_API_KEY ? 'ok' : 'missing';

  // Check Stripe API key exists
  checks.stripe = process.env.STRIPE_SECRET_KEY ? 'ok' : 'missing';

  // Check Supabase credentials exist
  checks.supabase_config = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) ? 'ok' : 'missing';

  // Check internal token exists
  checks.internal_token = process.env.INTERNAL_TOKEN ? 'ok' : 'missing';

  const allOk = Object.values(checks).every(v => v === 'ok');

  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    services: checks
  });
});

// Internal routes (protected by internal token)
app.use('/internal', provisionRouter);

// Webhook routes (protected by signatures)
app.use('/webhooks/email', emailWebhookRouter);

// API routes (protected by user auth)
app.use('/api/agents', agentsRouter);
app.use('/api/businesses', businessesRouter);
app.use('/api/apps', appsRouter);
app.use('/api/landing-pages', landingPagesRouter);
app.use('/api/deployments', deploymentsRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/domains', domainsRouter);
app.use('/api/billing', billingRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/build', buildsRouter);

// Serve static frontend files (after all API routes)
const publicPath = path.join(__dirname, '..', 'public');
console.log('[static] publicPath:', publicPath, 'exists:', fs.existsSync(publicPath));
if (fs.existsSync(publicPath)) {
  // Log files in public directory for debugging
  try {
    const files = fs.readdirSync(publicPath);
    console.log('[static] Files in public:', files);
    if (files.includes('assets')) {
      const assetFiles = fs.readdirSync(path.join(publicPath, 'assets'));
      console.log('[static] Files in assets:', assetFiles.slice(0, 5));
    }
  } catch (e) {
    console.error('[static] Failed to read public dir:', e);
  }

  // Serve static assets with explicit MIME types
  app.use(express.static(publicPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
      if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));

  // SPA catchall - only for non-API routes
  // Don't exclude /assets/ - if express.static didn't find it, we want it to 404, not serve index.html
  app.use((req, res, next) => {
    // Let API, webhook, health, and internal routes pass through to 404/error
    if (req.path.startsWith('/api/') ||
        req.path.startsWith('/internal/') ||
        req.path.startsWith('/webhooks/') ||
        req.path === '/health') {
      return next();
    }
    // All other routes get the SPA (including /assets/* if the file wasn't found)
    // This is intentional - Vite generates hashed filenames, so missing assets = old deployment
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[500 ERROR]', err.message, err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? err.message : undefined,
    detail: err.message
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Environment: ${NODE_ENV}`);
});

// Graceful shutdown handler
function gracefulShutdown(signal: string) {
  console.log(`${signal} received, starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(() => {
    console.log('Server closed - all connections finished');
    process.exit(0);
  });

  // Force shutdown after timeout to prevent hanging
  setTimeout(() => {
    console.error('Forced shutdown after timeout - some connections may have been terminated');
    process.exit(1);
  }, 30000); // 30 second timeout
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
