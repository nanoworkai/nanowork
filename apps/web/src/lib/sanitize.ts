import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes dangerous tags and attributes while preserving safe formatting
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
      'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'span', 'div', 'pre', 'code'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });
}

/**
 * Strip all HTML tags and return plain text
 */
export function stripHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
}

/**
 * Sanitize user input for safe display
 */
export function sanitizeUserInput(input: string): string {
  // Remove control characters and normalize whitespace
  return input
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Validate and sanitize email addresses
 */
export function sanitizeEmail(email: string): string | null {
  const sanitized = sanitizeUserInput(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    return null;
  }

  return sanitized.toLowerCase();
}

/**
 * Validate and sanitize URLs
 */
export function sanitizeUrl(url: string): string | null {
  const sanitized = sanitizeUserInput(url);

  try {
    const parsed = new URL(sanitized);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize text content with length limits
 */
export function sanitizeText(text: string, maxLength: number): string {
  const sanitized = sanitizeUserInput(text);
  return sanitized.slice(0, maxLength);
}

/**
 * Check for common attack patterns
 */
export function containsMaliciousPatterns(input: string): boolean {
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /data:text\/html/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /expression\(/i,
    /(union|select|insert|update|delete|drop|create|alter).*from/i, // SQL injection
  ];

  return maliciousPatterns.some(pattern => pattern.test(input));
}
