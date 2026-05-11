import Stripe from 'stripe';

let stripe: Stripe | null = null;

function getStripe(): Stripe | null {
  if (stripe) return stripe;

  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey) {
    console.warn('STRIPE_SECRET_KEY not configured - Stripe functions will return mock data');
    return null;
  }

  stripe = new Stripe(apiKey, {
    apiVersion: '2023-10-16',
  });

  return stripe;
}

/**
 * Create a Stripe Connect Express account
 */
export async function createConnectAccount(email?: string): Promise<{ accountId: string }> {
  const client = getStripe();

  if (!client) {
    console.warn('Stripe not configured - returning mock account ID');
    return { accountId: 'acct_mock_' + Math.random().toString(36).substring(7) };
  }

  try {
    const account = await client.accounts.create({
      type: 'express',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    return { accountId: account.id };
  } catch (error) {
    console.error('Failed to create Stripe Connect account:', error);
    throw new Error(
      `Stripe account creation failed: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }
}

/**
 * Create an account link for onboarding
 */
export async function createAccountLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
): Promise<string> {
  const client = getStripe();

  if (!client) {
    console.warn('Stripe not configured - returning mock onboarding URL');
    return `https://connect.stripe.com/mock/${accountId}`;
  }

  try {
    const accountLink = await client.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink.url;
  } catch (error) {
    console.error('Failed to create account link:', error);
    throw new Error(
      `Account link creation failed: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }
}

/**
 * Create a payment link for a connected account
 */
export async function createPaymentLink(
  connectedAccountId: string,
  title: string,
  amountCents: number,
  currency: string = 'usd'
): Promise<{ id: string; url: string }> {
  const client = getStripe();

  if (!client) {
    const mockId = 'plink_mock_' + Math.random().toString(36).substring(7);
    console.warn('Stripe not configured - returning mock payment link');
    return {
      id: mockId,
      url: `https://buy.stripe.com/test/${mockId}`,
    };
  }

  try {
    // First create a product
    const product = await client.products.create(
      {
        name: title,
      },
      {
        stripeAccount: connectedAccountId,
      }
    );

    // Then create a price
    const price = await client.prices.create(
      {
        product: product.id,
        currency,
        unit_amount: amountCents,
      },
      {
        stripeAccount: connectedAccountId,
      }
    );

    // Finally create the payment link
    const paymentLink = await client.paymentLinks.create(
      {
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
      },
      {
        stripeAccount: connectedAccountId,
      }
    );

    return {
      id: paymentLink.id,
      url: paymentLink.url,
    };
  } catch (error) {
    console.error('Failed to create payment link:', error);
    throw new Error(
      `Payment link creation failed: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }
}
