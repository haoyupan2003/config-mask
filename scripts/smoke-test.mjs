#!/usr/bin/env node
/**
 * Mask / restore smoke test for release verification.
 * Usage: npm test
 */
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PORT = 8766;
const BASE = `http://127.0.0.1:${PORT}/index.html`;
const SAMPLE = readFileSync(join(ROOT, 'examples/env-file.env'), 'utf8').slice(0, 500);

function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {
      cwd: ROOT,
      stdio: 'ignore',
    });
    proc.on('error', reject);
    setTimeout(() => resolve(proc), 800);
  });
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const server = await startServer();
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addInitScript(() => localStorage.clear());
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });

  const persistOff = await page.locator('#toggle-persist.active').count();
  const secretsOff = await page.locator('#toggle-restore-secrets.active').count();
  assert(persistOff === 0, 'persistence should be off by default');
  assert(secretsOff === 0, 'restore secrets should be off by default');

  await page.locator('#input').fill(SAMPLE);
  await page.click('#btn-desensitize');
  await page.waitForTimeout(400);

  const output = await page.locator('#output').inputValue();
  assert(output.includes('['), 'masked output should contain placeholders');
  assert(!output.includes('MyS3cret#Pass_2026'), 'password should be masked');

  await page.click('#btn-restore');
  await page.waitForTimeout(400);
  const restored = await page.locator('#input').inputValue();
  assert(restored.includes('MyS3cret#Pass_2026'), 'restore should recover reversible values');

  console.log('Smoke test passed (defaults off, mask + restore OK)');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
