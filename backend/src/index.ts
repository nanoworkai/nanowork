import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Import routes
import provisionRouter from './routes/internal/provision';
import emailWebhookRouter from './routes/webhooks/email';
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
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

// Webhook routes (protected by internal token)
app.use('/webhooks/email', emailWebhookRouter);

// API routes (protected by user auth)
app.use('/agents', agentsRouter);
app.use('/businesses', businessesRouter);
app.use('/apps', appsRouter);
app.use('/landing-pages', landingPagesRouter);
app.use('/deployments', deploymentsRouter);
app.use('/conversations', conversationsRouter);
app.use('/tasks', tasksRouter);
app.use('/contacts', contactsRouter);
app.use('/payments', paymentsRouter);
app.use('/documents', documentsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

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
