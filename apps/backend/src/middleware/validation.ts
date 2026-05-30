import { Request, Response, NextFunction } from 'express';

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Check for malicious patterns in input
 */
export function containsMaliciousPatterns(input: string): boolean {
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /expression\(/i,
    /(union|select|insert|update|delete|drop|create|alter)\s+(.*\s+)?from/i,
  ];

  return maliciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate text input with length limits
 */
export function validateText(
  value: any,
  fieldName: string,
  minLength: number = 0,
  maxLength: number = 10000
): { valid: boolean; error?: string; sanitized?: string } {
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  const sanitized = sanitizeInput(value);

  if (sanitized.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  if (sanitized.length > maxLength) {
    return { valid: false, error: `${fieldName} must be no more than ${maxLength} characters` };
  }

  if (containsMaliciousPatterns(sanitized)) {
    return { valid: false, error: `${fieldName} contains invalid content` };
  }

  return { valid: true, sanitized };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeInput(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeInput(url);

  try {
    const parsed = new URL(sanitized);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must use http or https protocol' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Middleware to validate build creation input
 */
export function validateBuildInput(req: Request, res: Response, next: NextFunction) {
  const { name, prompt } = req.body;

  // Validate name
  if (name) {
    const nameValidation = validateText(name, 'name', 1, 100);
    if (!nameValidation.valid) {
      res.status(400).json({ error: nameValidation.error });
      return;
    }
    req.body.name = nameValidation.sanitized;
  }

  // Validate prompt
  if (prompt) {
    const promptValidation = validateText(prompt, 'prompt', 1, 5000);
    if (!promptValidation.valid) {
      res.status(400).json({ error: promptValidation.error });
      return;
    }
    req.body.prompt = promptValidation.sanitized;
  }

  next();
}

/**
 * Middleware to validate conversation input
 */
export function validateConversationInput(req: Request, res: Response, next: NextFunction) {
  const { message } = req.body;

  if (!message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const messageValidation = validateText(message, 'message', 1, 10000);
  if (!messageValidation.valid) {
    res.status(400).json({ error: messageValidation.error });
    return;
  }

  req.body.message = messageValidation.sanitized;
  next();
}

/**
 * Middleware to validate business/app name input
 */
export function validateNameInput(req: Request, res: Response, next: NextFunction) {
  const { name } = req.body;

  if (name) {
    const nameValidation = validateText(name, 'name', 1, 100);
    if (!nameValidation.valid) {
      res.status(400).json({ error: nameValidation.error });
      return;
    }
    req.body.name = nameValidation.sanitized;
  }

  next();
}

/**
 * Middleware to validate description input
 */
export function validateDescriptionInput(req: Request, res: Response, next: NextFunction) {
  const { description } = req.body;

  if (description) {
    const descValidation = validateText(description, 'description', 0, 5000);
    if (!descValidation.valid) {
      res.status(400).json({ error: descValidation.error });
      return;
    }
    req.body.description = descValidation.sanitized;
  }

  next();
}
