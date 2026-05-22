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

// Health check endpoint - tests database connectivity
app.get('/health', async (req, res) => {
  try {
    // Test database connectivity with a simple query
    const supabase = getSupabase();
    const { error } = await supabase
      .from('agents')
      .select('id')
      .limit(1)
      .single();

    // If query fails (but not because of "no rows"), database is unreachable
    if (error && error.code !== 'PGRST116') {
      console.error('Health check database error:', error);
      res.status(503).json({
        ok: false,
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
      });
      return;
    }

    // Database is healthy
    res.status(200).json({
      ok: true,
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      ok: false,
      database: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    });
  }
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

// Serve frontend static files (React app built by Vite)
const frontendPath = path.join(__dirname, '../../apps/web/dist');
app.use(express.static(frontendPath));

// All non-API routes return index.html (React Router support)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? err.message : undefined,
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
