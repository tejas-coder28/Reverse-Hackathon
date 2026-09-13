# 🎬 CooL.ledger — Hackathon Judge Demo Guide

> **PRIMARY MESSAGE:**  
> *"AI decisions can be disputed later. CooL creates cryptographically verifiable evidence at decision time."*

---

## 30-Second Understanding Narrative

1. **AI MAKES DECISION:** Autonomous credit underwriting model (`CreditRisk-v3`) evaluates synthetic applicant parameters.
2. **COOL CREATES EVIDENCE:** At decision time, CooL commits salted PII hashes, Ed25519 + ML-DSA-65 post-quantum signatures, Phala dstack TEE enclave quotes, and RFC 6962 transparency logs.
3. **AUDITOR VERIFIES IT LATER:** Regulators run `cool verify` 100% offline with zero API calls to prove decision integrity or detect post-hoc tampering.

---

## 2-Minute Judge Walkthrough Script

| Step | Judge Action | What App Displays | What It Proves |
|---|---|---|---|
| **1. Run AI Decision** | Click **Decision Console** → Click **RUN AI DECISION**. | Displays `Synthetic Applicant #8842`, `CreditRisk-v3`, decision `APPROVED`, and real-time pipeline animation. | Proves decision generation triggers CooL evidence recording. |
| **2. View Evidence Status** | View **FLOW 1 — CREATE EVIDENCE** card. | Displays `DECISION RECORDED`, `✓ Evidence created`, `✓ Cryptographic protection active`, `✓ Receipt generated`. | Confirms evidence creation and cryptographic commitment binding. |
| **3. Inspect Receipt** | Click **Open & Verify Evidence Receipt View**. | Displays Receipt ID, sealed PII status (`PII: SEALED / NOT STORED IN EVIDENCE`), and monospace hash copy buttons. | Demonstrates zero PII exposure and clean audit payload structure. |
| **4. Verify Evidence** | Click **VERIFY EVIDENCE**. | Runs real `coolAdapter.verifyDecisionEvidence()`. Displays `✓ Evidence authentic`, `✓ Cryptographic verification passed`. | Proves 100% offline verification with 0 external API calls. |
| **5. Tamper Evidence** | Click **Tamper Lab** → Click **TAMPER WITH EVIDENCE**. | Mutates decision or income payload. Re-runs real verifier. Displays `EVIDENCE TAMPERED`, `✗ Verification failed`. | Demonstrates real cryptographic tamper detection. |
| **6. Restore Original** | Click **Restore Original**. | Restores genuine receipt. Re-runs verifier. Displays `ORIGINAL: ✓ VERIFIED`. | Confirms original evidence remains intact and verifiable. |

---

## Judge Test Checklist

- [x] **1. Generate Decision:** Click "RUN AI DECISION" in Decision Console.
- [x] **2. See CooL Evidence Creation:** Observe visual pipeline animation (`AI DECISION` ↓ `COOL` ↓ `COMMITTED`).
- [x] **3. Open Receipt:** View dedicated Evidence Receipt inspector with copy buttons and sealed PII status.
- [x] **4. Verify Receipt:** Click "VERIFY EVIDENCE" and verify `✓ Evidence authentic` status.
- [x] **5. Tamper Evidence:** Click "TAMPER WITH EVIDENCE" in Tamper Lab.
- [x] **6. See Verification Failure:** Verify `EVIDENCE TAMPERED` & `✗ Verification failed` error traces.
- [x] **7. Restore Original:** Click "Restore Original".
- [x] **8. Verify Again:** Confirm status returns to `ORIGINAL: ✓ VERIFIED`.

---

## Local & Deployment Commands

```bash
# Local Development
npm run dev

# Run Vitest Suite
npx vitest run

# Production Build
npm run build

# Vercel Deployment
npx vercel
```
