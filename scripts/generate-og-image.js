#!/usr/bin/env node

/**
 * Generate OpenGraph image from HTML template
 * Usage: node scripts/generate-og-image.js
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function generateOGImage() {
  console.log('🎨 Generating OpenGraph image...');

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2, // For retina quality
  });

  const htmlPath = path.join(__dirname, '../apps/web/public/og-image.html');
  const outputPath = path.join(__dirname, '../apps/web/public/og-image.png');

  // Load the HTML file
  await page.goto(`file://${htmlPath}`);

  // Wait a bit to ensure fonts are loaded
  await page.waitForTimeout(500);

  // Take screenshot
  await page.screenshot({
    path: outputPath,
    type: 'png',
  });

  await browser.close();

  const stats = fs.statSync(outputPath);
  const fileSizeInKB = (stats.size / 1024).toFixed(2);

  console.log('✅ OpenGraph image generated successfully!');
  console.log(`📍 Location: ${outputPath}`);
  console.log(`📦 Size: ${fileSizeInKB} KB`);
}

generateOGImage().catch((error) => {
  console.error('❌ Failed to generate OG image:', error);
  process.exit(1);
});
