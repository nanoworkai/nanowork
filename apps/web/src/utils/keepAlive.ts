/**
 * Keep-alive utility to prevent Render free tier from spinning down
 * Pings the health endpoint every 14 minutes
 */

const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes in milliseconds
const HEALTH_ENDPOINT = '/health';

export function startKeepAlive(): () => void {
  // Render spin-down prevention — same-origin /health in production only.
  // Dev uses Vite proxy; pinging before the API is up spams proxy errors.
  if (!import.meta.env.PROD) {
    return () => {};
  }

  // Ping immediately on start
  pingHealth();

  // Set up interval to ping every 14 minutes
  const intervalId = setInterval(() => {
    pingHealth();
  }, PING_INTERVAL);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
}

async function pingHealth() {
  try {
    await fetch(HEALTH_ENDPOINT, {
      method: 'GET',
      cache: 'no-cache',
    });
    // Silently succeed - no logging needed in production
  } catch (error) {
    // Silently fail - this is a background keep-alive, not critical
    // Only log in development for debugging
    if (import.meta.env.DEV) {
      console.debug('Keep-alive ping failed:', error);
    }
  }
}
