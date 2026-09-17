/**
 * Comprehensive screenshot capture script for CooL.ledger documentation.
 * Captures all interface states, workflows, tamper scenarios, inspector modals, and responsive views.
 */
import { chromium } from 'playwright';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'docs', 'screenshots');
const BASE = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:5173';

async function waitForServer(url, attempts = 60) {
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

async function assertScreenshot(filePath, minBytes = 40_000) {
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

async function run() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Checking dev server at ${BASE}…`);
  await waitForServer(BASE);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  try {
    // -------------------------------------------------------------
    // 1. DESKTOP CAPTURES (1440x900)
    // -------------------------------------------------------------
    console.log('\n--- Capturing Desktop Screenshots ---');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1.25,
    });
    const page = await desktopContext.newPage();

    console.log('Seeding demo data…');
    await seedReady(page);

    // 1. Case Overview
    console.log('1. Capturing Overview Dashboard…');
    await goTab(page, 'overview');
    await page.getByText(/3 receipts in this session/).waitFor({ timeout: 30_000 });
    await page.getByText('CASE FILE NO. 001').waitFor();
    await page.waitForTimeout(600);
    const overviewPath = path.join(OUT_DIR, '01_case_overview.png');
    await page.screenshot({ path: overviewPath });
    await assertScreenshot(overviewPath);
    // Also copy to legacy overview.png
    await page.screenshot({ path: path.join(OUT_DIR, 'overview.png') });

    // 2. Decision Console - Approved Loan Application (#8842)
    console.log('2. Capturing Decision Console (Approved flow)…');
    await goTab(page, 'simulator');
    await page.getByRole('button', { name: '#8842' }).click();
    await page.getByRole('button', { name: 'Run Decision' }).click();
    await page.getByText('Evidence sealed').waitFor({ timeout: 30_000 });
    await page.getByText('APPROVED').first().waitFor();
    await page.getByText('step 5 of 5').waitFor();
    await page.waitForTimeout(600);
    const approvedPath = path.join(OUT_DIR, '02_decision_console_approved.png');
    await page.screenshot({ path: approvedPath });
    await assertScreenshot(approvedPath);
    await page.screenshot({ path: path.join(OUT_DIR, 'decision_console.png') });

    // 3. Decision Console - Adverse Action / Denied Loan Application (#8844)
    console.log('3. Capturing Decision Console (Adverse action / Denied flow)…');
    await page.getByRole('button', { name: '#8844' }).click();
    await page.getByRole('button', { name: 'Run Decision' }).click();
    await page.getByText('Evidence sealed').waitFor({ timeout: 30_000 });
    await page.getByText('REJECTED').first().waitFor();
    await page.waitForTimeout(600);
    const deniedPath = path.join(OUT_DIR, '03_decision_console_denied.png');
    await page.screenshot({ path: deniedPath });
    await assertScreenshot(deniedPath);

    // 4. Evidence Receipt - Privacy & Dual Signatures (Upper Exhibit)
    console.log('4. Capturing Evidence Receipt (Signatures & Commitments)…');
    await goTab(page, 'receipt');
    await page.getByText('Exhibit A · Evidence Receipt').waitFor({ timeout: 30_000 });
    await page.getByText('Commitment salt (held by the institution)').waitFor();
    await page.waitForTimeout(600);
    const receiptSigPath = path.join(OUT_DIR, '04_evidence_receipt_signatures.png');
    await page.screenshot({ path: receiptSigPath });
    await assertScreenshot(receiptSigPath);

    // 5. Evidence Receipt - Hardware TEE Attestation & RFC 6962 Merkle Proof
    console.log('5. Capturing Evidence Receipt (Hardware TEE & Merkle Proof)…');
    await page.getByText('Public log entry').scrollIntoViewIfNeeded();
    await page.getByText('Inclusion proof:').waitFor();
    await page.waitForTimeout(600);
    const receiptTeePath = path.join(OUT_DIR, '05_evidence_receipt_tee_merkle.png');
    await page.screenshot({ path: receiptTeePath });
    await assertScreenshot(receiptTeePath);
    // Full page receipt
    await page.screenshot({ path: path.join(OUT_DIR, 'evidence_receipt.png'), fullPage: true });

    // 6. Raw Canonical JSON Inspector Modal
    console.log('6. Capturing Raw JSON Inspector Modal…');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole('button', { name: 'Raw JSON' }).click();
    await page.getByText('The exhibit, as filed').waitFor({ timeout: 15_000 });
    await page.getByText('canonical JSON · v1.0').waitFor();
    await page.waitForTimeout(600);
    const inspectorPath = path.join(OUT_DIR, '06_raw_json_inspector.png');
    await page.screenshot({ path: inspectorPath });
    await assertScreenshot(inspectorPath);
    // Close modal
    await page.getByRole('button', { name: 'Close inspector' }).click();
    await page.waitForTimeout(400);

    // 7. Audit Docket / Ledger Dashboard
    console.log('7. Capturing Audit Docket Ledger…');
    await goTab(page, 'dashboard');
    await page.getByText('Exhibits and their integrity status').waitFor();
    await page.locator('text=/\\d+ of \\d+ receipts/').waitFor({ timeout: 30_000 });
    await page.getByRole('table').locator('tbody tr').nth(2).waitFor({ timeout: 30_000 });
    await page.getByText('Verified', { exact: true }).first().waitFor({ timeout: 60_000 });
    await page.waitForTimeout(600);
    const docketPath = path.join(OUT_DIR, '07_audit_docket_ledger.png');
    await page.screenshot({ path: docketPath });
    await assertScreenshot(docketPath);
    await page.screenshot({ path: path.join(OUT_DIR, 'verification_dashboard.png') });

    // 8. Tamper Lab - Pristine Baseline State
    console.log('8. Capturing Tamper Lab (Original Baseline)…');
    await goTab(page, 'tamper');
    await page.getByText('Try to alter sealed evidence').waitFor();
    await page.getByText('Sealed original').waitFor({ timeout: 30_000 });
    await page.getByText('Unforged').first().waitFor();
    await page.waitForTimeout(600);
    const tamperCleanPath = path.join(OUT_DIR, '08_tamper_lab_pristine.png');
    await page.screenshot({ path: tamperCleanPath });
    await assertScreenshot(tamperCleanPath);
    await page.screenshot({ path: path.join(OUT_DIR, 'tamper_lab.png') });

    // 9. Tamper Lab - Decision Flipping Attack Caught
    console.log('9. Capturing Tamper Lab (Decision Flipped Attack)…');
    await page.getByRole('button', { name: 'Flip the decision' }).click();
    await page.getByText('Contaminated', { exact: true }).waitFor({ timeout: 15_000 });
    await page.getByText('Mismatch').first().waitFor({ timeout: 15_000 });
    await page.waitForTimeout(600);
    const tamperFlippedPath = path.join(OUT_DIR, '09_tamper_lab_decision_flipped.png');
    await page.screenshot({ path: tamperFlippedPath });
    await assertScreenshot(tamperFlippedPath);
    await page.screenshot({ path: path.join(OUT_DIR, 'tamper_detected.png') });

    // 10. Tamper Lab - Signature Forgery Attack Caught
    console.log('10. Capturing Tamper Lab (Signature Forgery Attack)…');
    await page.getByRole('button', { name: 'Restore Original' }).click();
    await page.getByText('Sealed original').waitFor({ timeout: 15_000 });
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: "Forge the institution's signature" }).click();
    await page.getByText('Contaminated', { exact: true }).waitFor({ timeout: 15_000 });
    await page.waitForTimeout(600);
    const tamperSigPath = path.join(OUT_DIR, '10_tamper_lab_signature_forged.png');
    await page.screenshot({ path: tamperSigPath });
    await assertScreenshot(tamperSigPath);

    // 11. Tamper Lab - Merkle Root Alteration Attack Caught
    console.log('11. Capturing Tamper Lab (Merkle Log Tampering Attack)…');
    await page.getByRole('button', { name: 'Restore Original' }).click();
    await page.getByText('Sealed original').waitFor({ timeout: 15_000 });
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Rewrite the public log' }).click();
    await page.getByText('Contaminated', { exact: true }).waitFor({ timeout: 15_000 });
    await page.waitForTimeout(600);
    const tamperMerklePath = path.join(OUT_DIR, '11_tamper_lab_merkle_altered.png');
    await page.screenshot({ path: tamperMerklePath });
    await assertScreenshot(tamperMerklePath);

    await desktopContext.close();

    // -------------------------------------------------------------
    // 2. MOBILE RESPONSIVE CAPTURES (390x844 - iPhone 14 / modern mobile)
    // -------------------------------------------------------------
    console.log('\n--- Capturing Mobile Responsive Screenshots ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();

    // Mobile Overview
    console.log('12. Capturing Mobile Overview…');
    await mobilePage.goto(`${BASE}/?tab=overview`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(800);
    const mobileOverviewPath = path.join(OUT_DIR, '12_mobile_case_overview.png');
    await mobilePage.screenshot({ path: mobileOverviewPath });
    await assertScreenshot(mobileOverviewPath);

    // Mobile Decision Console
    console.log('13. Capturing Mobile Decision Console…');
    await mobilePage.goto(`${BASE}/?tab=simulator`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(600);
    await mobilePage.getByRole('button', { name: 'Run Decision' }).click();
    await mobilePage.getByText('Evidence sealed').waitFor({ timeout: 30_000 });
    await mobilePage.waitForTimeout(600);
    const mobileSimPath = path.join(OUT_DIR, '13_mobile_decision_console.png');
    await mobilePage.screenshot({ path: mobileSimPath });
    await assertScreenshot(mobileSimPath);

    // Mobile Evidence Receipt
    console.log('14. Capturing Mobile Evidence Receipt…');
    await mobilePage.goto(`${BASE}/?tab=receipt`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(800);
    const mobileReceiptPath = path.join(OUT_DIR, '14_mobile_evidence_receipt.png');
    await mobilePage.screenshot({ path: mobileReceiptPath });
    await assertScreenshot(mobileReceiptPath);

    await mobileContext.close();

    console.log('\n🎉 All 14 screenshot types captured successfully!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
