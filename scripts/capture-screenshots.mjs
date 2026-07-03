#!/usr/bin/env node
/**
 * Capture docs screenshots for zh / en UI.
 * Usage: node scripts/capture-screenshots.mjs
 * Requires: npx playwright install chromium
 */
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PORT = 8765;
const BASE = `http://127.0.0.1:${PORT}/index.html`;

const NGINX_SAMPLE = readFileSync(join(ROOT, 'examples/baota-nginx.conf'), 'utf8').slice(0, 2200);
const ENV_SAMPLE = `DB_HOST=10.0.0.5
DB_PASSWORD=MyS3cret#Pass_2026
ALIYUN_ACCESS_KEY_ID=LTAI4GxYJkqVXmNp2sT3uHw
GITHUB_TOKEN=ghp_abcdef1234567890abcdefghijklmnopqrstuvwxyz
PAYMENT_SERVICE_URL=http://payment.internal:8081
API_BASE_URL=https://api.trading.example.com`;

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

async function captureLang(browser, lang) {
  const outDir = join(ROOT, 'docs/screenshots', lang);
  mkdirSync(outDir, { recursive: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  await context.addInitScript((l) => {
    localStorage.clear();
    localStorage.setItem('config-mask-lang', l);
  }, lang);

  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const shot = (name) => page.screenshot({ path: join(outDir, name), fullPage: false });

  await shot('01-initial.png');

  await page.locator('#input').fill(NGINX_SAMPLE);
  await shot('02-input.png');

  await page.click('#btn-desensitize');
  await page.waitForTimeout(500);
  await shot('03-desensitized.png');

  await page.click('#btn-manage');
  await page.waitForSelector('#modal-manage.show');
  await page.waitForTimeout(300);
  await shot('04-mapping-panel.png');
  await page.click('#modal-close');
  await page.waitForTimeout(200);

  await page.click('#toggle-persist');
  await page.waitForTimeout(300);
  await shot('05-persist-enabled.png');

  await page.click('#toggle-restore-secrets');
  await page.waitForSelector('#modal-secrets-warn.show');
  await page.waitForTimeout(300);
  await shot('08-restore-secrets-warn.png');
  await page.click('#btn-secrets-cancel');
  await page.waitForTimeout(300);

  await page.click('#btn-restore');
  await page.waitForTimeout(500);
  await shot('07-restored.png');

  await page.click('#btn-clear');
  await page.waitForTimeout(300);
  await page.locator('#input').fill(ENV_SAMPLE);
  await page.click('#btn-desensitize');
  await page.waitForTimeout(500);
  await shot('06-env-desensitized.png');

  await context.close();
  console.log(`Done: ${lang}`);
}

const server = await startServer();
let browser;
try {
  browser = await chromium.launch({ headless: true });
  await captureLang(browser, 'en');
  await captureLang(browser, 'zh');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
