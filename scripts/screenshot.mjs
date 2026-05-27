// Drives the built app in a real browser: verifies behaviour and captures
// screenshots of every major state into review/screenshots/.
//
// Maintainer-only QA tool — Playwright is NOT a project dependency (so end users
// don't download a browser on `npm install`). To run:
//   npm run build && npm run preview &     # serve the built app
//   npm i -D playwright                    # one-off
//   BASE_URL=http://localhost:4173 node scripts/screenshot.mjs
// CHROME may point at an existing Chromium; otherwise `npx playwright install`.
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'review', 'screenshots');
const BASE = process.env.BASE_URL || 'http://localhost:4173';
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

let failures = 0;
const check = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
  if (!cond) failures++;
};

const run = async () => {
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(BASE, { waitUntil: 'networkidle' });

  // 1. Empty state (dark).
  await page.waitForSelector('.empty-state');
  check('empty state shows CTA', await page.locator('.empty-state .btn.primary').isVisible());
  await page.screenshot({ path: path.join(OUT, '01-empty-dark.png') });

  // Exact-label report head locator (avoids loose substring matches).
  const reportHead = (label) =>
    page.locator('.report-head').filter({ has: page.getByText(label, { exact: true }) });

  // 2. Load sample → analysis runs, reports render, echoes auto-open & highlighted.
  await page.locator('.empty-state .btn.primary').click();
  // Wait for the real (non-empty) analysis to land — the empty result also has
  // 10 reports, so key off the populated word count instead.
  await page.waitForFunction(() => {
    const el = document.querySelector('.stat .v');
    return el && parseInt(el.textContent.replace(/,/g, ''), 10) > 200;
  }, { timeout: 8000 });
  const wordCount = await page.locator('.stat .v').first().innerText();
  check('word count populated', parseInt(wordCount.replace(/,/g, ''), 10) > 200);
  const reportCount = await page.locator('.report').count();
  check('all 10 reports rendered', reportCount === 10);
  await page.waitForSelector('.editor-backdrop mark');
  const marks = await page.locator('.editor-backdrop mark').count();
  check('echoes highlighted in text', marks > 0);
  await page.screenshot({ path: path.join(OUT, '02-sample-echoes-dark.png') });

  // 3. Open the crutch/filler report and step through findings.
  await reportHead('Crutch & filler words').click();
  await page.waitForSelector('.findings-nav');
  check('crutch report has findings', (await page.locator('.finding-msg').count()) > 0);
  await page.locator('.mini-btn').last().click(); // next finding
  await page.waitForTimeout(400);
  const selMarks = await page.locator('.editor-backdrop mark.sel').count();
  check('selected finding is emphasised', selMarks === 1);
  await page.screenshot({ path: path.join(OUT, '03-crutch-report-dark.png') });

  // 4. Dialogue tags report (shows said-bookisms).
  await reportHead('Dialogue tags').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, '04-dialogue-tags-dark.png') });

  // 5. Light theme.
  await page.locator('.icon-btn[aria-label="Toggle colour theme"]').click();
  await page.waitForTimeout(300);
  check('theme switched to light', (await page.getAttribute('html', 'data-theme')) === 'light');
  await reportHead('Echoes').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, '05-sample-echoes-light.png') });

  // 6. .docx import (real Word file) — back to dark first.
  await page.locator('.icon-btn[aria-label="Toggle colour theme"]').click();
  await page.waitForTimeout(200);
  await page.setInputFiles('input[type=file]', path.join(ROOT, 'review', 'fixtures', 'sample.docx'));
  await page.waitForFunction(
    () => document.querySelector('.editor-scroll')?.value?.includes('Chapter One'),
    { timeout: 8000 },
  );
  check('.docx text imported', (await page.locator('.editor-scroll').inputValue()).includes('Chapter One'));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, '06-docx-import-dark.png') });

  // 7. Clear → empty; then export from sample.
  await page.locator('.btn', { hasText: 'Clear' }).click();
  await page.waitForSelector('.empty-state');
  check('clear returns to empty state', await page.locator('.empty-state').isVisible());

  // 7b. Drag-and-drop overlay (synthetic dragenter carrying a file).
  await page.locator('.empty-state .btn.primary').click();
  await page.waitForFunction(() => {
    const el = document.querySelector('.stat .v');
    return el && parseInt(el.textContent.replace(/,/g, ''), 10) > 200;
  }, { timeout: 8000 });
  await page.evaluate(() => {
    const dt = new DataTransfer();
    dt.items.add(new File(['hello'], 'dropped.txt', { type: 'text/plain' }));
    document.querySelector('.app').dispatchEvent(
      new DragEvent('dragenter', { dataTransfer: dt, bubbles: true }),
    );
  });
  await page.waitForSelector('.drop-overlay', { timeout: 3000 });
  check('drag-and-drop overlay appears', await page.locator('.drop-overlay').isVisible());
  await page.screenshot({ path: path.join(OUT, '08-drag-overlay-dark.png') });
  await page.evaluate(() => {
    document.querySelector('.app').dispatchEvent(new DragEvent('dragleave', { bubbles: true }));
  });

  // 8. Responsive / mobile (sample already loaded from step 7b).
  await page.waitForSelector('.report');
  await page.setViewportSize({ width: 460, height: 880 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, '07-mobile-dark.png'), fullPage: true });

  check('no console/page errors', errors.length === 0);
  if (errors.length) console.log('  errors:', errors.slice(0, 5));

  await browser.close();
  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
};

run().catch((e) => {
  console.error('SCRIPT ERROR', e);
  process.exit(1);
});
