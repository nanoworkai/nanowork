/**
 * Enhanced API utilities with comprehensive error handling
 */

import { createApiError, createNetworkError, ApiError } from '../types/errors';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

interface FetchOptions extends RequestInit {
  context?: string;
}

/**
 * Enhanced fetch wrapper that returns ApiError on failure
 */
export async function fetchWithErrors<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { context, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;
  const method = fetchOptions.method || 'GET';

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const requestPayload = fetchOptions.body
        ? (() => {
            try {
              return JSON.parse(fetchOptions.body as string);
            } catch {
              return fetchOptions.body;
            }
          })()
        : undefined;

      throw await createApiError(endpoint, method, response, requestPayload, context);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }

    return response.text() as any;
  } catch (error) {
    // If it's already an ApiError, rethrow it
    if (error instanceof ApiError) {
      throw error;
    }

    // Otherwise, wrap it in an ApiError
    const requestPayload = fetchOptions.body
      ? (() => {
          try {
            return JSON.parse(fetchOptions.body as string);
          } catch {
            return fetchOptions.body;
          }
        })()
      : undefined;

    throw createNetworkError(endpoint, method, error as Error, requestPayload, context);
  }
}

/**
 * Build API with error handling
 */
export const buildApi = {
  /**
   * List all builds
   */
  async list(token: string): Promise<{ builds: any[] }> {
    return fetchWithErrors('/api/build', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      context: 'Loading builds',
    });
  },

  /**
   * Create a new build
   */
  async create(token: string, prompt: string): Promise<{ build: any }> {
    return fetchWithErrors('/api/build', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
      context: 'Creating new build',
    });
  },

  /**
   * Update a build
   */
  async update(
    token: string,
    buildId: string,
    updates: { name?: string; prompt?: string; last_activity_at?: string }
  ): Promise<void> {
    return fetchWithErrors(`/api/build/${buildId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
      context: 'Updating build',
    });
  },

  /**
   * Delete a build
   */
  async delete(token: string, buildId: string): Promise<void> {
    return fetchWithErrors(`/api/build/${buildId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      context: 'Deleting build',
    });
  },

  /**
   * Generate AI name for build
   */
  async generateName(token: string, prompt: string): Promise<{ name: string }> {
    return fetchWithErrors('/api/build/generate-name', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
      context: 'Generating build name',
    });
  },
};
