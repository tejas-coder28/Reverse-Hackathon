# 🎬 CooL.ledger — Shortest Winning Demo Script (Round 2 Judges)

> **PRIMARY MESSAGE:**  
> *"AI decisions can be disputed later. CooL creates cryptographically verifiable evidence at decision time."*

---

## The 6-Step Winning Presentation Script

### STEP 1: Make AI Decision
- Click **Decision Console** tab.
- Select `Synthetic Applicant #8842`.
- Click **RUN AI DECISION**.

### STEP 2: Show Decision & Evidence Recording
- Observe Autonomous AI Decision: `APPROVED`.
- Observe CooL Evidence Banner: `COOL EVIDENCE: RECORDED ✓`.
- Watch real-time visual pipeline animation (`AI DECISION` ↓ `COOL` ↓ `EVIDENCE COMMITTED` ↓ `SIGNED RECEIPT`).

### STEP 3: Open Receipt & Verify Evidence
- Click **Open & Verify Evidence Receipt View**.
- Inspect sealed PII status (`PII: SEALED / NOT STORED IN EVIDENCE`).
- Click **VERIFY EVIDENCE**.
- Display: `CRYPTOGRAPHIC EVIDENCE: ✓ VALID` (`✓ Evidence authentic`, `✓ Receipt integrity confirmed`).

### STEP 4: Tamper with Receipt
- Click **Tamper Lab** tab.
- Click **TAMPER WITH EVIDENCE** (flips outcome or mutates annual income).
- Display: `EVIDENCE TAMPERED` & `✗ VERIFICATION FAILED` (`✗ Commitment mismatch / signature mismatch`, `✗ Receipt cannot be trusted`).

### STEP 5: State Core Cryptographic Proof Principle
- Explain to judges:
  > *"The AI decision may still be right or wrong. What we prove is whether the evidence describing what happened has been altered."*

### STEP 6: Restore Receipt & Re-verify
- Click **Restore Original**.
- Display: `ORIGINAL: ✓ VERIFIED` (Receipt restored and verified successfully).

---

## 30-Second Hero Narrative

1. **1. AI MAKES DECISION:** Autonomous credit underwriting model (`CreditRisk-v3`) evaluates synthetic applicant parameters.
2. **2. COOL CREATES EVIDENCE:** At decision time, CooL commits salted PII hashes, Ed25519 + ML-DSA-65 post-quantum signatures, Phala dstack TEE enclave quotes, and RFC 6962 transparency logs.
3. **3. AUDITOR VERIFIES IT LATER:** Regulators run `cool verify` 100% offline with zero API calls to prove decision integrity or detect post-hoc tampering.

---

## Local & Deployment Commands

```bash
# Local Development
npm run dev

# Run Vitest Suite (9/9 tests pass)
npx vitest run

# Production Build
npm run build

# Vercel Deployment
npx vercel
```
