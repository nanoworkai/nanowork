/**
 * Cloudflare Pages API Service
 * Manages custom domains for Cloudflare Pages deployments
 */

interface CloudflareCustomHostname {
  id: string;
  hostname: string;
  ssl: {
    status: string;
    method: string;
  };
  status: string;
  verification_errors?: string[];
}

interface CloudflareAPIResponse {
  success: boolean;
  errors: Array<{ message: string }>;
  result?: CloudflareCustomHostname;
}

/**
 * Add a custom hostname to a Cloudflare Pages project
 */
export async function addCustomDomain(
  projectName: string,
  customDomain: string
): Promise<{ success: boolean; hostname?: CloudflareCustomHostname; error?: string }> {
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    return { success: false, error: 'Cloudflare credentials not configured' };
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/domains`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: customDomain,
        }),
      }
    );

    const data = await response.json() as CloudflareAPIResponse;

    if (!data.success) {
      const errorMsg = data.errors?.[0]?.message || 'Unknown Cloudflare API error';
      return { success: false, error: errorMsg };
    }

    return { success: true, hostname: data.result };
  } catch (error) {
    console.error('Cloudflare API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add custom domain',
    };
  }
}

/**
 * Check the verification status of a custom domain
 */
export async function verifyCustomDomain(
  projectName: string,
  customDomain: string
): Promise<{ verified: boolean; status?: string; error?: string }> {
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    return { verified: false, error: 'Cloudflare credentials not configured' };
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/domains/${customDomain}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json() as CloudflareAPIResponse;

    if (!data.success) {
      return { verified: false, error: 'Domain not found' };
    }

    const status = data.result?.status;
    const verified = status === 'active';

    return { verified, status };
  } catch (error) {
    console.error('Cloudflare verification error:', error);
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Failed to verify domain',
    };
  }
}

/**
 * Remove a custom hostname from a Cloudflare Pages project
 */
export async function removeCustomDomain(
  projectName: string,
  customDomain: string
): Promise<{ success: boolean; error?: string }> {
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    return { success: false, error: 'Cloudflare credentials not configured' };
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/domains/${customDomain}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json() as CloudflareAPIResponse;

    if (!data.success) {
      const errorMsg = data.errors?.[0]?.message || 'Failed to remove domain';
      return { success: false, error: errorMsg };
    }

    return { success: true };
  } catch (error) {
    console.error('Cloudflare removal error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove custom domain',
    };
  }
}

/**
 * Get DNS instructions for a custom domain
 */
export function getDNSInstructions(customDomain: string, projectName: string): {
  type: string;
  name: string;
  value: string;
  ttl: number;
} {
  return {
    type: 'CNAME',
    name: customDomain,
    value: `${projectName}.pages.dev`,
    ttl: 3600,
  };
}
