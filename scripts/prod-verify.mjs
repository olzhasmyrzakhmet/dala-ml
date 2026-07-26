#!/usr/bin/env node
/**
 * Production verification script for Dala ML
 * Checks all requirements from SPEC §9
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Configuration - update this after first deploy (Phase 0.4)
// TODO: Update with actual production domain after Vercel deployment
const BASE = process.env.VERCEL_URL || 'https://dala-ml.vercel.app';

const checks = [];
let exitCode = 0;

function log(status, message) {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏭️';
  console.log(`${icon} ${message}`);
  checks.push({ status, message });
}

async function fetchCheck(url, description, validator) {
  try {
    const response = await fetch(`${BASE}${url}`);
    if (!response.ok) {
      log('fail', `${description}: HTTP ${response.status}`);
      exitCode = 1;
      return null;
    }
    const text = await response.text();
    if (validator) {
      const valid = validator(text);
      if (!valid) {
        log('fail', `${description}: validation failed`);
        exitCode = 1;
        return null;
      }
    }
    log('pass', description);
    return text;
  } catch (error) {
    log('fail', `${description}: ${error.message}`);
    exitCode = 1;
    return null;
  }
}

async function main() {
  console.log(`\n🌿 Dala ML Production Verification`);
  console.log(`Base URL: ${BASE}\n`);
  console.log('=' .repeat(50));

  // Check 1: Home page loads with Kazakh text
  await fetchCheck('/', 'Home page loads', (text) => {
    return text.includes('Дала') && !text.includes('Lorem') && !text.includes('TODO');
  });

  // Check 2: Course map exists
  await fetchCheck('/kurs', 'Course map page', (text) => {
    return text.includes('модуль') || text.includes('Module') || text.includes('курс');
  });

  // Check 3: Sample lessons from modules 1-3
  // These will be added as content is created
  log('skip', 'Module lessons (content not ready yet)');

  // Check 4: Dictionary
  await fetchCheck('/sozdik', 'Dictionary page', (text) => {
    return text.includes('сөздік') || text.includes('термин');
  });

  // Check 5: PWA files
  await fetchCheck('/manifest.webmanifest', 'PWA manifest', (text) => {
    try {
      const json = JSON.parse(text);
      return json.name && json.icons;
    } catch {
      return false;
    }
  });

  log('skip', 'Service Worker (manual verification needed)');

  // Check 6: Bundle size
  log('skip', 'Bundle size < 200KB (static export mode)');

  // Check 7: No 404 links
  log('skip', 'No 404 links (full link crawler)');

  // Check 8: Kazakh glyphs
  await fetchCheck('/', 'Kazakh glyphs (ә ғ қ ң ө ұ ү і)', (text) => {
    const kazakhGlyphs = ['ә', 'ғ', 'қ', 'ң', 'ө', 'ұ', 'ү', 'һ', 'і'];
    return kazakhGlyphs.every(glyph => text.includes(glyph));
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  const passed = checks.filter(c => c.status === 'pass').length;
  const failed = checks.filter(c => c.status === 'fail').length;
  const skipped = checks.filter(c => c.status === 'skip').length;
  
  console.log(`\nResults: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  
  if (failed > 0) {
    console.log('\n❌ VERIFICATION FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ VERIFICATION PASSED (with skipped checks)');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
