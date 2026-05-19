import { Business, LandingPage } from '../types';

/**
 * Deploy a landing page
 * Returns a mock deployment URL - actual deployment should be handled separately
 */
export async function deployLandingPage(
  landingPage: LandingPage,
  business: Business
): Promise<string> {
  console.log('Generating deployment URL:', {
    businessId: business.id,
    landingPageId: landingPage.id,
  });

  // Generate a deployment URL slug based on business name
  const slug = business.name.toLowerCase().replace(/\s+/g, '-');
  return `https://${slug}-${landingPage.id.substring(0, 8)}.app`;
}
