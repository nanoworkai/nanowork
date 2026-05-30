import { Request, Response, NextFunction } from 'express';

/**
 * Security headers middleware
 * Adds HTTP security headers to prevent common attacks
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Content Security Policy - prevents XSS by controlling resource loading
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.stripe.com https://*.supabase.co",
      "frame-src 'self' https://js.stripe.com",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable browser XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(self)'
  );

  // HSTS - Force HTTPS (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
}

/**
 * CORS security check
 * Validates origin is from an allowed list
 */
export function validateCorsOrigin(origin: string | undefined): boolean {
  const allowedOrigins = [
    'https://nanowork.ai',
    'https://www.nanowork.ai',
    'https://nanowork-5k9.pages.dev',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
  ];

  // Add environment-specific origins
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  // Allow requests with no origin (mobile apps, Postman, etc.) in development
  if (!origin && process.env.NODE_ENV !== 'production') {
    return true;
  }

  if (!origin) {
    return false;
  }

  return allowedOrigins.includes(origin);
}
