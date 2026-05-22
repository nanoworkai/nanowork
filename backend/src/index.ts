import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
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

// Error handler - MUST be registered before static/SPA fallback
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[500 ERROR]', err.message, err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? err.message : undefined,
    detail: err.message
  });
});

// Serve frontend static files (React app built by Vite)
// Frontend is copied to backend/public during build
const frontendDist = path.join(__dirname, '..', 'public');
const fs = require('fs');

// Comprehensive path debugging
console.log('=== FRONTEND PATH DIAGNOSTICS ===');
console.log('process.cwd():', process.cwd());
console.log('__dirname:', __dirname);
console.log('Frontend dist path:', frontendDist);
console.log('index.html exists:', fs.existsSync(path.join(frontendDist, 'index.html')));
console.log('assets/ exists:', fs.existsSync(path.join(frontendDist, 'assets')));
if (fs.existsSync(path.join(frontendDist, 'assets'))) {
  console.log('assets/ contents:', fs.readdirSync(path.join(frontendDist, 'assets')).slice(0, 5));
}
console.log('=================================');

// Serve static files
app.use(express.static(frontendDist));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  const indexPath = path.join(frontendDist, 'index.html');
  console.log(`[spa-fallback] ${req.path} -> ${indexPath}`);

  if (!fs.existsSync(indexPath)) {
    console.error(`[spa-fallback] index.html not found at: ${indexPath}`);
    return res.status(503).json({
      error: 'Frontend not built',
      expected: indexPath,
      cwd: process.cwd(),
      dirname: __dirname
    });
  }

  res.sendFile(indexPath);
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
