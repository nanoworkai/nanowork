import { chromium } from 'playwright';

async function testDashboardBuild() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect console messages
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
    console.log(`[CONSOLE ${msg.type().toUpperCase()}]:`, msg.text());
  });

  // Collect page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack
    });
    console.log('[PAGE ERROR]:', error.message);
    console.log('[STACK]:', error.stack);
  });

  // Collect network failures
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      method: request.method(),
      failure: request.failure()
    });
    console.log('[REQUEST FAILED]:', request.url(), request.failure());
  });

  // Monitor all responses for errors
  const errorResponses = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      errorResponses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
      console.log(`[HTTP ${response.status()}]:`, response.url());
    }
  });

  // Monitor specific API calls
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/build') || url.includes('/stream')) {
      console.log(`[REQUEST] ${request.method()} ${url}`);
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/build') || url.includes('/stream')) {
      console.log(`[RESPONSE] ${response.status()} ${url}`);
      try {
        const body = await response.text();
        console.log(`[RESPONSE BODY]:`, body.substring(0, 500));
      } catch (e) {
        console.log('[RESPONSE BODY]: Unable to read');
      }
    }
  });

  try {
    console.log('Navigating to http://localhost:5173/dashboard...');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });

    console.log('\nWaiting 3 seconds for initial load...');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log('\nCurrent URL:', currentUrl);

    // Take screenshot of dashboard
    await page.screenshot({ path: '/tmp/dashboard-screenshot.png', fullPage: true });
    console.log('Dashboard screenshot saved to /tmp/dashboard-screenshot.png');

    // Try to find and click the New Build button
    console.log('\nLooking for "New Build" button...');

    const possibleSelectors = [
      'button:has-text("New Build")',
      'button:has-text("Create Build")',
      'button:has-text("Start Build")',
      'a:has-text("New Build")',
      '[data-testid="new-build"]',
      'text=New Build',
      'button[class*="new-build"]',
      'button[class*="create-build"]'
    ];

    let buttonFound = false;
    let clickedSelector = null;

    for (const selector of possibleSelectors) {
      try {
        const button = page.locator(selector).first();
        const count = await button.count();
        if (count > 0) {
          console.log(`Found button with selector: ${selector}`);
          clickedSelector = selector;
          console.log('\nClicking New Build button...');
          await button.click();
          buttonFound = true;
          break;
        }
      } catch (e) {
        // Selector might not be valid, continue
      }
    }

    if (!buttonFound) {
      console.log('New Build button not found with any selector.');
      console.log('\nSearching page for any buttons...');

      const buttons = await page.locator('button').all();
      console.log(`Found ${buttons.length} buttons on the page`);

      for (let i = 0; i < Math.min(buttons.length, 20); i++) {
        try {
          const text = await buttons[i].innerText();
          const classes = await buttons[i].getAttribute('class');
          console.log(`  Button ${i}: "${text}" (classes: ${classes})`);
        } catch (e) {
          // Button might not be accessible
        }
      }

      // Log page content
      const bodyText = await page.locator('body').innerText();
      console.log('\nPage content (first 1000 chars):', bodyText.substring(0, 1000));
    } else {
      console.log('\nWaiting 5 seconds to observe network activity after clicking...');
      await page.waitForTimeout(5000);

      // Take screenshot after clicking
      await page.screenshot({ path: '/tmp/after-click-dashboard.png', fullPage: true });
      console.log('Screenshot saved to /tmp/after-click-dashboard.png');
    }

    // Summary
    console.log('\n==================== SUMMARY ====================');
    console.log(`\nConsole Logs: ${consoleLogs.length}`);
    if (consoleLogs.length > 0) {
      console.log('All console messages:');
      consoleLogs.forEach(log => {
        console.log(`  [${log.type}] ${log.text}`);
      });
    }

    console.log(`\nPage Errors: ${pageErrors.length}`);
    pageErrors.forEach(err => {
      console.log(`  ${err.message}`);
      if (err.stack) console.log(`  Stack: ${err.stack}`);
    });

    console.log(`\nFailed Requests: ${failedRequests.length}`);
    failedRequests.forEach(req => {
      console.log(`  ${req.method} ${req.url}`);
      console.log(`    Failure: ${req.failure?.errorText || 'Unknown error'}`);
    });

    console.log(`\nError Responses (4xx/5xx): ${errorResponses.length}`);
    errorResponses.forEach(res => {
      console.log(`  [${res.status} ${res.statusText}] ${res.url}`);
    });

    console.log('\n================================================');

    // Keep browser open for manual inspection
    console.log('\nBrowser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('Test error:', error);
    await page.screenshot({ path: '/tmp/error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testDashboardBuild();
