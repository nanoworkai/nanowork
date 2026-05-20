import { chromium } from 'playwright';

async function testNewBuild() {
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

  try {
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    console.log('\nWaiting 2 seconds for initial load...');
    await page.waitForTimeout(2000);

    // Check if we're on login page or dashboard
    const currentUrl = page.url();
    console.log('\nCurrent URL:', currentUrl);

    // Try to find and click the New Build button
    console.log('\nLooking for "New Build" button...');

    // Try multiple selectors
    const possibleSelectors = [
      'button:has-text("New Build")',
      'a:has-text("New Build")',
      '[data-testid="new-build"]',
      'button:has-text("Create Build")',
      'text=New Build'
    ];

    let buttonFound = false;
    for (const selector of possibleSelectors) {
      const button = await page.locator(selector).first();
      if (await button.count() > 0) {
        console.log(`Found button with selector: ${selector}`);
        console.log('\nClicking New Build button...');
        await button.click();
        buttonFound = true;
        break;
      }
    }

    if (!buttonFound) {
      console.log('New Build button not found. Taking screenshot of current page...');
      await page.screenshot({ path: '/tmp/page-screenshot.png', fullPage: true });
      console.log('Screenshot saved to /tmp/page-screenshot.png');

      // Log page content
      const bodyText = await page.locator('body').innerText();
      console.log('\nPage content:', bodyText.substring(0, 500));
    } else {
      console.log('\nWaiting 3 seconds to observe errors after clicking...');
      await page.waitForTimeout(3000);

      // Take screenshot after clicking
      await page.screenshot({ path: '/tmp/after-click-screenshot.png', fullPage: true });
      console.log('Screenshot saved to /tmp/after-click-screenshot.png');
    }

    // Summary
    console.log('\n==================== SUMMARY ====================');
    console.log(`\nConsole Logs: ${consoleLogs.length}`);
    if (consoleLogs.length > 0) {
      console.log('Recent console messages:');
      consoleLogs.slice(-10).forEach(log => {
        console.log(`  [${log.type}] ${log.text}`);
      });
    }

    console.log(`\nPage Errors: ${pageErrors.length}`);
    pageErrors.forEach(err => {
      console.log(`  ${err.message}`);
      if (err.stack) console.log(`  ${err.stack}`);
    });

    console.log(`\nFailed Requests: ${failedRequests.length}`);
    failedRequests.forEach(req => {
      console.log(`  ${req.method} ${req.url} - ${req.failure?.errorText || 'Unknown error'}`);
    });

    console.log(`\nError Responses (4xx/5xx): ${errorResponses.length}`);
    errorResponses.forEach(res => {
      console.log(`  [${res.status}] ${res.url}`);
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

testNewBuild();
