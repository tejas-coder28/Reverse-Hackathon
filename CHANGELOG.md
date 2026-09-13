# Changelog

All notable changes to the **CooL.ledger AI Decision Evidence & Audit Platform** are documented in this file.

## [1.1.0] - 2026-09-14 - Final Audit & Remediation Polish Pass

### 1. Repository Attribution & Timeline Corrections
- Replaced stale repository clone references with canonical `https://github.com/aadi-learner77/Reverse-Hackathon.git`.
- Corrected root directory labels and clone scripts across `README.md`.
- Modernized roadmap targets from stale 2025 dates to forward-looking milestones (Q4 2026 – Q4 2027) reflecting September 2026 timeline.

### 2. Cryptographic Key Hardening & Management
- Removed fixed static key commitments: implemented dynamic key loading with priority for `VITE_ED25519_SECRET_HEX` and `VITE_MLDSA_SEED_HEX`.
- Added `scripts/generate-keys.ts` utility (`npm run keys:generate`) for generating fresh cryptographically secure Ed25519 and ML-DSA-65 keypairs via Web Crypto `crypto.getRandomValues`.
- Documented environment variable formats in `.env.example` with strict "never commit production keys" guidelines.
- Added explicit "Key Management (Demo vs Production)" architectural entry in `README.md` explaining reproducible offline grading vs. enterprise HSM/KMS requirements.
- Added comprehensive Vitest test (`Test 9`) verifying environment variable overrides work end-to-end for signature creation and receipt verification.

### 3. CooL SDK Origin & Architecture Alignment
- Formally documented the CooL evidence-layer SDK implementation in `README.md`, eliminating any ambiguous claims of external proprietary package dependencies.
- Clarified that CooL is our custom-built evidence-layer SDK (`src/evidence/`) running audited, battle-tested cryptographic primitives (`@noble/curves`, `@noble/post-quantum`, `@noble/hashes`) in a fail-closed architecture.
- Updated all internal descriptions and diagrams to maintain accurate terminology across `README.md`, `DEMO.md`, and code comments.

### 4. UI Transparency & Verification Distinctions
- Verified live rendering and legibility of `DisclaimerBanner.tsx` ("Integrity proven · Model fairness: out of scope").
- Enhanced `VerificationCheckList` UI to explicitly badge each cryptographic verification check:
  - `REAL SHA-256` for Commitment integrity
  - `REAL CRYPTO` for Ed25519 signatures
  - `REAL POST-QUANTUM` for ML-DSA-65 signatures
  - `SIMULATED / DEMO` (with distinguished amber badge styling) for TEE attestation
  - `REAL MERKLE LOG` for RFC 6962 transparency log inclusion proofs
- Updated Evidence Receipt tab attestation panel with explicit "SIMULATED / LOCAL DEMO" badge and explanation.
- Conducted full automated browser click-through covering decision generation, receipt inspection, offline verification, and Tamper Lab anomaly detection.

### 5. Verification & Test Suite
- Test suite expanded to 9 passing tests (`9 passed (9)`).
- Clean TypeScript and Vite production build with zero errors.

---

## [1.0.0] - 2026-09-13 - Initial Prototype Release
- Real classical Ed25519 digital signatures via `@noble/curves`.
- Real post-quantum ML-DSA-65 (FIPS 204) signatures via `@noble/post-quantum`.
- Real RFC 6962 Merkle tree transparency log with inclusion proof verification.
- Salted SHA-256 PII-safe state commitments via `@noble/hashes`.
- Interactive Web UI dashboard with Credit Decision Simulator, Evidence Explorer, and Tamper Lab.
