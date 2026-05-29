import { Business, LandingPage } from '../types';

/**
 * Deploy a landing page to Cloudflare Pages
 * Uses the Cloudflare Pages Direct Upload API
 */
export async function deployToCloudflarePages(
  landingPage: LandingPage,
  business: Business
): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    console.warn('Cloudflare credentials not configured - returning mock deployment URL');
    return `https://${business.name.toLowerCase().replace(/\s+/g, '-')}-${landingPage.id.substring(0, 8)}.pages.dev`;
  }

  // Generate project name from business name (Cloudflare-safe naming)
  const projectName = `${business.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-${landingPage.id.substring(0, 8)}`;

  console.log('Deploying to Cloudflare Pages:', {
    businessId: business.id,
    landingPageId: landingPage.id,
    projectName,
  });

  try {
    // Step 1: Check if project exists, create if needed
    await ensureProject(accountId, apiToken, projectName);

    // Step 2: Create a deployment with the landing page files
    const deploymentUrl = await createDeployment(
      accountId,
      apiToken,
      projectName,
      landingPage
    );

    console.log('Successfully deployed to Cloudflare Pages:', deploymentUrl);
    return deploymentUrl;
  } catch (error) {
    console.error('Failed to deploy to Cloudflare Pages:', error);
    throw new Error(`Cloudflare Pages deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Ensure a Cloudflare Pages project exists
 */
async function ensureProject(
  accountId: string,
  apiToken: string,
  projectName: string
): Promise<void> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`;

  // Check if project exists
  const checkResponse = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (checkResponse.ok) {
    console.log(`Project ${projectName} already exists`);
    return;
  }

  // Create project if it doesn't exist
  console.log(`Creating new project: ${projectName}`);
  const createUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`;

  const createResponse = await fetch(createUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName,
      production_branch: 'main',
    }),
  });

  if (!createResponse.ok) {
    const errorData = await createResponse.json().catch(() => ({}));
    throw new Error(`Failed to create project: ${JSON.stringify(errorData)}`);
  }

  console.log(`Project ${projectName} created successfully`);
}

/**
 * Create a deployment using Cloudflare Pages Direct Upload API
 */
async function createDeployment(
  accountId: string,
  apiToken: string,
  projectName: string,
  landingPage: LandingPage
): Promise<string> {
  // Step 1: Create a direct upload session
  const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/deployments`;

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
    },
  });

  if (!uploadResponse.ok) {
    const errorData = await uploadResponse.json().catch(() => ({}));
    throw new Error(`Failed to create upload session: ${JSON.stringify(errorData)}`);
  }

  const uploadData = await uploadResponse.json() as any;
  const uploadId = uploadData.result.id;
  const uploadEndpoint = uploadData.result.upload_endpoint;

  // Step 2: Upload files
  const formData = new FormData();

  // Create index.html with all content bundled
  const htmlContent = buildIndexHtml(landingPage);
  const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
  formData.append('files[]', htmlBlob, 'index.html');

  const uploadFilesResponse = await fetch(uploadEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
    },
    body: formData,
  });

  if (!uploadFilesResponse.ok) {
    const errorData = await uploadFilesResponse.json().catch(() => ({}));
    throw new Error(`Failed to upload files: ${JSON.stringify(errorData)}`);
  }

  // Step 3: Finalize deployment
  const finalizeUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/deployments/${uploadId}`;

  const finalizeResponse = await fetch(finalizeUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (!finalizeResponse.ok) {
    const errorData = await finalizeResponse.json().catch(() => ({}));
    throw new Error(`Failed to finalize deployment: ${JSON.stringify(errorData)}`);
  }

  const finalizeData = await finalizeResponse.json() as any;
  return finalizeData.result.url || `https://${projectName}.pages.dev`;
}

/**
 * Build a complete HTML file with embedded CSS and JS
 */
function buildIndexHtml(landingPage: LandingPage): string {
  const html = landingPage.html || '<h1>Welcome</h1>';
  const css = landingPage.css || '';
  const js = landingPage.js || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landing Page</title>
  ${css ? `<style>${css}</style>` : ''}
</head>
<body>
  ${html}
  ${js ? `<script>${js}</script>` : ''}
</body>
</html>`;
}
