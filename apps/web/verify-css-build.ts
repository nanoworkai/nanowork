#!/usr/bin/env bun

/**
 * CSS Build Verification Script
 *
 * This script verifies that the CSS build process correctly processes Tailwind CSS directives.
 * It runs the build and checks that:
 * 1. Build completes and produces output
 * 2. CSS file exists in dist/
 * 3. File size is > 10KB (processed CSS ~60KB, unprocessed ~1.5KB)
 * 4. No raw @tailwind directives remain
 * 5. No unprocessed @apply directives remain
 * 6. Contains actual Tailwind utility classes (.flex, .grid, etc.)
 * 7. Contains Tailwind base styles
 *
 * Usage:
 *   bun run verify-css-build.ts
 *   # or
 *   bun run verify-build
 *
 * Exit codes:
 *   0 = All tests passed
 *   1 = One or more tests failed
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { $ } from 'bun';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg: string) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}`),
};

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string;
}

const results: TestResult[] = [];

function addResult(name: string, passed: boolean, message: string, details?: string) {
  results.push({ name, passed, message, details });
  if (passed) {
    log.success(`${name}: ${message}`);
  } else {
    log.error(`${name}: ${message}`);
    if (details) {
      console.log(`  ${colors.yellow}${details}${colors.reset}`);
    }
  }
}

async function main() {
  log.section('CSS Build Verification Test');

  const distDir = join(import.meta.dir, 'dist');

  // Step 1: Run the build
  log.section('Step 1: Running build...');
  try {
    const result = await $`bun run build.ts`.nothrow().quiet();
    if (result.exitCode === 0) {
      log.success('Build completed');
    } else {
      // Build may have partial success - continue to check what was produced
      log.warn('Build completed with warnings/errors - checking output...');
    }
  } catch (error) {
    log.warn('Build encountered issues - checking output...');
  }

  // Step 2: Check if dist directory exists
  log.section('Step 2: Checking build output...');

  if (!existsSync(distDir)) {
    addResult('Dist Directory', false, 'dist/ directory does not exist');
    printSummary();
    process.exit(1);
  }
  addResult('Dist Directory', true, 'dist/ directory exists');

  // Step 3: Find CSS file (check all subdirectories)
  function findCssFile(dir: string, prefix = ''): { path: string; name: string } | null {
    const files = readdirSync(dir);

    for (const file of files) {
      const fullPath = join(dir, file);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        const found = findCssFile(fullPath, prefix ? `${prefix}/${file}` : file);
        if (found) return found;
      } else if (file.endsWith('.css') && (file.startsWith('main-') || file.startsWith('processed-'))) {
        return {
          path: fullPath,
          name: prefix ? `${prefix}/${file}` : file
        };
      }
    }
    return null;
  }

  const cssFileInfo = findCssFile(distDir);

  if (!cssFileInfo) {
    addResult('CSS File', false, 'No CSS file found matching pattern main-*.css or processed-*.css');
    printSummary();
    process.exit(1);
  }
  addResult('CSS File', true, `Found CSS file: ${cssFileInfo.name}`);

  const cssPath = cssFileInfo.path;

  // Step 4: Check file size
  log.section('Step 3: Checking file size...');
  const stats = statSync(cssPath);
  const fileSizeKB = Math.round(stats.size / 1024);

  if (stats.size < 10 * 1024) {
    addResult(
      'File Size',
      false,
      `CSS file is too small: ${fileSizeKB}KB (expected > 10KB)`,
      'This indicates Tailwind directives were not processed. Processed CSS should be ~60-80KB.'
    );
  } else {
    addResult('File Size', true, `CSS file size is ${fileSizeKB}KB (healthy size for processed CSS)`);
  }

  // Step 5: Read and analyze CSS content
  log.section('Step 4: Analyzing CSS content...');
  const cssContent = await Bun.file(cssPath).text();

  // Test 5a: Check for unprocessed @tailwind directives
  const tailwindDirectives = ['@tailwind base', '@tailwind components', '@tailwind utilities'];
  let hasRawDirectives = false;
  const foundDirectives: string[] = [];

  for (const directive of tailwindDirectives) {
    if (cssContent.includes(directive)) {
      hasRawDirectives = true;
      foundDirectives.push(directive);
    }
  }

  if (hasRawDirectives) {
    addResult(
      'Tailwind Directives',
      false,
      'Found unprocessed @tailwind directives',
      `Found: ${foundDirectives.join(', ')}\nThese should be expanded into actual CSS classes.`
    );
  } else {
    addResult('Tailwind Directives', true, 'No raw @tailwind directives found (correctly processed)');
  }

  // Test 5b: Check for unprocessed @apply directives
  const applyMatches = cssContent.match(/@apply\s+[^;]+;/g);
  if (applyMatches && applyMatches.length > 0) {
    addResult(
      '@apply Directives',
      false,
      'Found unprocessed @apply directives',
      `Found ${applyMatches.length} @apply directive(s). Example: ${applyMatches[0]}\nThese should be compiled to actual CSS properties.`
    );
  } else {
    addResult('@apply Directives', true, 'No unprocessed @apply directives found');
  }

  // Test 5c: Check for common Tailwind utility classes
  log.section('Step 5: Verifying Tailwind utilities...');

  const requiredClasses = [
    { patterns: ['.flex'], desc: 'Flexbox utilities' },
    { patterns: ['.grid'], desc: 'Grid utilities' },
    { patterns: ['.text-'], desc: 'Text utilities' },
    { patterns: ['.bg-'], desc: 'Background utilities' },
    { patterns: ['.p-', '.px-', '.py-', '.pt-', '.pb-', '.pl-', '.pr-'], desc: 'Padding utilities' },
    { patterns: ['.m-', '.mx-', '.my-', '.mt-', '.mb-', '.ml-', '.mr-'], desc: 'Margin utilities' },
    { patterns: ['.rounded'], desc: 'Border radius utilities' },
  ];

  let missingClasses: string[] = [];
  for (const { patterns, desc } of requiredClasses) {
    const found = patterns.some(pattern => cssContent.includes(pattern));
    if (!found) {
      missingClasses.push(`${patterns[0]} (${desc})`);
    }
  }

  if (missingClasses.length > 0) {
    addResult(
      'Tailwind Utilities',
      false,
      'Missing expected Tailwind utility classes',
      `Missing: ${missingClasses.join(', ')}\nProcessed Tailwind CSS should include these common utilities.`
    );
  } else {
    addResult('Tailwind Utilities', true, 'Found expected Tailwind utility classes');
  }

  // Test 5d: Check for Tailwind reset/base styles
  const baseStyleIndicators = [
    'box-sizing',
    'border-width: 0',
    'border-style: solid',
  ];

  let foundBaseStyles = baseStyleIndicators.some(indicator => cssContent.includes(indicator));

  if (!foundBaseStyles) {
    addResult(
      'Tailwind Base Styles',
      false,
      'Missing Tailwind base/reset styles',
      'Processed CSS should include base styles from @tailwind base'
    );
  } else {
    addResult('Tailwind Base Styles', true, 'Found Tailwind base styles');
  }

  // Print summary
  printSummary();

  // Exit with appropriate code
  const allPassed = results.every(r => r.passed);
  process.exit(allPassed ? 0 : 1);
}

function printSummary() {
  log.section('Test Summary');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`\nTotal: ${total} tests`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);

  if (failed === 0) {
    console.log(`\n${colors.bold}${colors.green}✓ All tests passed! CSS build is working correctly.${colors.reset}\n`);
  } else {
    console.log(`\n${colors.bold}${colors.red}✗ ${failed} test(s) failed. CSS build needs fixing.${colors.reset}\n`);

    log.section('Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`\n${colors.red}✗ ${r.name}${colors.reset}`);
      console.log(`  ${r.message}`);
      if (r.details) {
        console.log(`  ${colors.yellow}${r.details}${colors.reset}`);
      }
    });
  }
}

// Run the verification
main().catch(error => {
  log.error('Verification script failed');
  console.error(error);
  process.exit(1);
});
