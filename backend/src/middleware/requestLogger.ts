import { Request, Response, NextFunction } from 'express';

/**
 * Request logging middleware
 * Logs all incoming requests with timing and response status
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  // Log request
  console.log(`[${requestId}] ${req.method} ${req.path}`, {
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    body: req.body && Object.keys(req.body).length > 0 ? '...' : undefined,
    user: (req as any).user?.id || 'anonymous',
    ip: req.ip || req.socket.remoteAddress,
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] ${res.statusCode} ${req.method} ${req.path} - ${duration}ms`);

    // Log errors
    if (res.statusCode >= 400) {
      console.error(`[${requestId}] Error response:`, {
        status: res.statusCode,
        path: req.path,
        method: req.method,
        duration: `${duration}ms`,
      });
    }

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Audit log middleware - logs important actions to database
 * This is a placeholder for future implementation with database logging
 */
export function auditLogger(action: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    const agent = (req as any).agent;

    // Log to console for now
    console.log('[AUDIT]', {
      action,
      userId: user?.id,
      agentId: agent?.id,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });

    // TODO: Store in database audit_logs table
    // This would be useful for compliance and security monitoring

    next();
  };
}
