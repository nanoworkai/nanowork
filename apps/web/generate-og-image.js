import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateOgImage() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 }
  });

  // Load the HTML file
  const htmlPath = path.join(__dirname, 'public', 'og-image.html');
  await page.goto(`file://${htmlPath}`);

  // Wait a bit for animations
  await page.waitForTimeout(500);

  // Take screenshot
  const outputPath = path.join(__dirname, 'public', 'og-image.png');
  await page.screenshot({
    path: outputPath,
    fullPage: false
  });

  console.log(`✓ OpenGraph image generated at: ${outputPath}`);

  await browser.close();
}

generateOgImage().catch(console.error);
