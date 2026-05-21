/**
 * Error types and utilities for comprehensive error diagnostics
 */

export interface ApiErrorDetails {
  endpoint: string;
  method: string;
  requestPayload?: any;
  responseStatus?: number;
  responseBody?: any;
  errorMessage: string;
  timestamp: string;
  context?: string;
}

export class ApiError extends Error {
  public details: ApiErrorDetails;

  constructor(details: ApiErrorDetails) {
    super(details.errorMessage);
    this.name = 'ApiError';
    this.details = details;
  }

  /**
   * Create a user-friendly error message
   */
  public getUserMessage(): string {
    if (this.details.responseStatus === 401) {
      return 'Authentication failed. Please log in again.';
    }
    if (this.details.responseStatus === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (this.details.responseStatus === 404) {
      return 'The requested resource was not found.';
    }
    if (this.details.responseStatus === 429) {
      return 'Too many requests. Please try again later.';
    }
    if (this.details.responseStatus && this.details.responseStatus >= 500) {
      return 'Server error. Our team has been notified.';
    }
    return this.details.errorMessage || 'An unexpected error occurred.';
  }

  /**
   * Get a debug-friendly error message with full details
   */
  public getDebugMessage(): string {
    const parts = [
      `Error: ${this.details.errorMessage}`,
      `Endpoint: ${this.details.method} ${this.details.endpoint}`,
    ];

    if (this.details.responseStatus) {
      parts.push(`Status: ${this.details.responseStatus}`);
    }

    if (this.details.context) {
      parts.push(`Context: ${this.details.context}`);
    }

    return parts.join('\n');
  }
}

/**
 * Helper to create an ApiError from a fetch response
 */
export async function createApiError(
  endpoint: string,
  method: string,
  response: Response,
  requestPayload?: any,
  context?: string
): Promise<ApiError> {
  let responseBody: any;
  let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      responseBody = await response.json();
      errorMessage = responseBody.detail || responseBody.message || responseBody.error || errorMessage;
    } else {
      responseBody = await response.text();
      if (responseBody) {
        errorMessage = responseBody;
      }
    }
  } catch (err) {
    // If we can't parse the response, use the status text
    console.error('Failed to parse error response:', err);
  }

  return new ApiError({
    endpoint,
    method,
    requestPayload,
    responseStatus: response.status,
    responseBody,
    errorMessage,
    timestamp: new Date().toISOString(),
    context,
  });
}

/**
 * Helper to create an ApiError from a network error
 */
export function createNetworkError(
  endpoint: string,
  method: string,
  error: Error,
  requestPayload?: any,
  context?: string
): ApiError {
  return new ApiError({
    endpoint,
    method,
    requestPayload,
    errorMessage: error.message || 'Network error occurred',
    timestamp: new Date().toISOString(),
    context,
  });
}

/**
 * Format error details for display
 */
export function formatErrorForDisplay(error: ApiError): {
  title: string;
  message: string;
  details: Array<{ label: string; value: string }>;
} {
  return {
    title: 'Request Failed',
    message: error.getUserMessage(),
    details: [
      {
        label: 'Endpoint',
        value: `${error.details.method} ${error.details.endpoint}`,
      },
      ...(error.details.responseStatus
        ? [{ label: 'Status', value: `${error.details.responseStatus}` }]
        : []),
      {
        label: 'Time',
        value: new Date(error.details.timestamp).toLocaleString(),
      },
      ...(error.details.context
        ? [{ label: 'Context', value: error.details.context }]
        : []),
    ],
  };
}
