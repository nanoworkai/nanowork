/**
 * API Client for Nanowork
 *
 * In development: proxied through Vite to http://127.0.0.1:8000
 * In production: served from same origin (FastAPI serves frontend)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface HealthResponse {
  status: string;
  environment: string;
  supabase_configured: boolean;
  anthropic_configured: boolean;
  stripe_configured: boolean;
}

export interface BuildRequest {
  prompt: string;
}

export interface BuildResponse {
  id: string;
  status: string;
  result?: any;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Merge with any headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: `HTTP ${response.status}: ${response.statusText}`
      }));
      throw new Error(error.detail || error.message || `Request failed`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text() as any;
  }

  // Health check
  async health(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  // Build endpoints
  async createBuild(prompt: string): Promise<BuildResponse> {
    return this.request<BuildResponse>('/api/build', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  async getBuild(id: string): Promise<BuildResponse> {
    return this.request<BuildResponse>(`/api/builds/${id}`);
  }

  // Payments
  async createCheckoutSession(data: {
    price_id: string;
    success_url: string;
    cancel_url: string;
  }) {
    return this.request('/api/payments/checkout-session', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Customers
  async getCurrentCustomer() {
    return this.request('/api/customers/me');
  }

  // Analytics
  async getAnalytics(params?: { start_date?: string; end_date?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/analytics${query ? '?' + query : ''}`);
  }
}

export const apiClient = new ApiClient();
