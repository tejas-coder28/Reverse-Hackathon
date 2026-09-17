/**
 * One-off UI screenshot capture for README docs.
 * Usage: start `npm run dev`, then `node scripts/capture-screenshots.mjs`
 */
import { chromium } from 'playwright';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'docs', 'screenshots');
const BASE = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:5173';

async function waitForServer(url, attempts = 90) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Dev server not ready at ${url}`);
}

async function assertScreenshot(filePath, minBytes = 50_000) {
  const st = await stat(filePath);
  if (st.size < minBytes) {
    throw new Error(`${filePath} too small (${st.size} bytes) — likely blank or failed capture`);
  }
  console.log(`  ✓ ${path.basename(filePath)} (${(st.size / 1024).toFixed(1)} KB)`);
}

async function seedReady(page) {
  await page.goto(`${BASE}/?tab=simulator`, { waitUntil: 'networkidle' });
  const nav = page.getByRole('navigation', { name: 'Primary' });
  await nav.getByRole('button', { name: /^Docket/ }).waitFor({ state: 'visible', timeout: 60_000 });
  await nav.getByRole('button', { name: /^Docket\s+3/ }).waitFor({ timeout: 120_000 });
}

async function goTab(page, tab) {
  const nav = page.getByRole('navigation', { name: 'Primary' });
  const patterns = {
    overview: /^Case Overview$/,
    simulator: /^Decision Console$/,
    receipt: /^Evidence$/,
    dashboard: /^Docket/,
    tamper: /^Tamper Lab$/,
  };
  await nav.getByRole('button', { name: patterns[tab] }).click();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Waiting for dev server at ${BASE}…`);
  await waitForServer(BASE);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  try {
    console.log('Seeding demo ledger…');
    await seedReady(page);

    // 1 — Overview (remount tab so ledger table is populated)
    console.log('Capturing overview…');
    await goTab(page, 'overview');
    await page.getByText(/3 receipts in this session/).waitFor({ timeout: 30_000 });
    await page.getByText('CASE FILE NO. 001').waitFor();
    await page.screenshot({ path: path.join(OUT_DIR, 'overview.png') });
    await assertScreenshot(path.join(OUT_DIR, 'overview.png'));

    // 2 — Decision Console with completed pipeline for #8842
    console.log('Capturing decision console…');
    await goTab(page, 'simulator');
    await page.getByRole('button', { name: '#8842' }).click();
    await page.getByRole('button', { name: 'Run Decision' }).click();
    await page.getByText('Evidence sealed').waitFor({ timeout: 30_000 });
    await page.getByText('APPROVED').first().waitFor();
    await page.getByText('step 5 of 5').waitFor();
    await page.screenshot({ path: path.join(OUT_DIR, 'decision_console.png') });
    await assertScreenshot(path.join(OUT_DIR, 'decision_console.png'));

    // 3 — Evidence Receipt (full page for TEE + Merkle)
    console.log('Capturing evidence receipt…');
    await goTab(page, 'receipt');
    await page.getByText('Exhibit A · Evidence Receipt').waitFor({ timeout: 30_000 });
    await page.getByText('Commitment salt (held by the institution)').waitFor();
    await page.getByText('Public log entry').scrollIntoViewIfNeeded();
    await page.getByText('Inclusion proof:').waitFor();
    await page.screenshot({
      path: path.join(OUT_DIR, 'evidence_receipt.png'),
      fullPage: true,
    });
    await assertScreenshot(path.join(OUT_DIR, 'evidence_receipt.png'));

    // 4 — Verification Dashboard with verified rows
    console.log('Capturing verification dashboard…');
    await goTab(page, 'dashboard');
    await page.getByText('Exhibits and their integrity status').waitFor();
    await page.locator('text=/\\d+ of \\d+ receipts/').waitFor({ timeout: 30_000 });
    await page.getByRole('table').locator('tbody tr').nth(2).waitFor({ timeout: 30_000 });
    await page.getByText('Verified', { exact: true }).first().waitFor({ timeout: 60_000 });
    await page.screenshot({ path: path.join(OUT_DIR, 'verification_dashboard.png') });
    await assertScreenshot(path.join(OUT_DIR, 'verification_dashboard.png'));

    // 5 — Tamper Lab before tampering
    console.log('Capturing tamper lab (original)…');
    await goTab(page, 'tamper');
    await page.getByText('Try to alter sealed evidence').waitFor();
    await page.getByText('Sealed original').waitFor({ timeout: 30_000 });
    await page.getByText('Unforged').first().waitFor();
    await page.screenshot({ path: path.join(OUT_DIR, 'tamper_lab.png') });
    await assertScreenshot(path.join(OUT_DIR, 'tamper_lab.png'));

    // 6 — Tamper detected
    console.log('Capturing tamper detected…');
    await page.getByRole('button', { name: 'Flip the decision' }).click();
    await page.getByText('Evidence tampered', { exact: true }).first().waitFor({ timeout: 30_000 });
    await page.getByText('Mismatch').first().waitFor();
    await page.getByText('Examiner\'s findings').waitFor();
    await page.screenshot({ path: path.join(OUT_DIR, 'tamper_detected.png') });
    await assertScreenshot(path.join(OUT_DIR, 'tamper_detected.png'));

    console.log('\nAll screenshots captured successfully.');
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
