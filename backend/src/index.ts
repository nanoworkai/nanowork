import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';

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

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`ERROR: ${envVar} environment variable is not set`);
    process.exit(1);
  }
}

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Stripe webhook needs raw body, so register it before express.json()
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookRouter);

app.use(express.json());

// CORS configuration - allow all production and development URLs
const allowedOrigins = [
  'https://nanowork.ai',
  'https://www.nanowork.ai',
  'https://nanowork-5k9.pages.dev', // Cloudflare Pages production URL
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
];

// Add FRONTEND_URL from environment if set
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    tables: 15,
    timestamp: new Date().toISOString(),
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

// Serve static files from frontend build (production only)
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../apps/web/dist');
  app.use(express.static(frontendPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  // 404 handler for development
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
}

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);

  // Log warnings for missing optional env vars
  const optionalEnvVars = [
    'ANTHROPIC_API_KEY',
    'STRIPE_SECRET_KEY',
    'INTERNAL_TOKEN',
  ];

  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`⚠️  ${envVar} not configured - related features will be disabled`);
    }
  }
});
