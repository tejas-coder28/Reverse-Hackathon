# CooL AI Decision Evidence & Non-Repudiation Architecture

This document describes the design and integration specification for the **CooL SDK** within consequential autonomous AI workflows (demonstrated in NBFC credit decisioning).

---

## 1. Regulatory Context

Under recent legal frameworks:
- **EU AI Act Art. 12 (Enforceable Aug 2026)**: Requires mandatory, tamper-evident record-keeping throughout the lifecycle of high-risk AI systems. Penalties up to €35M or 7% of global annual turnover.
- **California AB 316**: Barred the "AI Acted Alone" legal defense. Operators must prove the exact decision inputs, model version, and tamper-free audit log at execution time.
- **RBI FREE-AI Assurance Pillar (India)**: Mandates independent AI audit trails across banks and Non-Banking Financial Companies (NBFCs).

---

## 2. Core Value: Non-Repudiation

| Aspect | Without CooL (Standard Database Logs) | With CooL Decision Ledger |
|---|---|---|
| **Data Integrity** | Plain-text database logs can be edited, backdated, or deleted by DBAs. | Cryptographically sealed salted hash commitments locked at decision time. |
| **Privacy Protection** | Storing customer financial records raw risks severe PII leaks & regulatory fines. | Salted SHA-256 commitments ensure raw PII never leaves local memory. |
| **Log Immutability** | Log lines can be deleted without trace. | RFC 6962 append-only Merkle tree guarantees unbroken inclusion proofs. |
| **Verification** | Requires contacting company API (trust vendor, subject to uptime & edits). | 100% offline verifier (`cool verify`) requiring 0 API calls. |
| **Hardware Proof** | Software logs can be self-edited by cloud operators. | Phala Network `dstack` TEE enclave quotes provide hardware-rooted proof. |

---

## 3. Dedicated Adapter Architecture & SDK Component (Exhibit 04 Specification)

1. **`CooLServiceAdapter` (`src/cool/adapter.ts`)**
   Dedicated boundary encapsulating all CooL SDK interactions and enforcing fail-closed security.

2. **`cool.record()` (`src/cool/client.ts`)**
   Wraps consequential AI decisions at the call site:
   ```ts
   const decision = runCreditModel(applicant);
   const evidence = await coolAdapter.recordDecisionEvidence(applicant, decision);
   ```

3. **`hash()` (`src/cool/hash.ts`)**
   Computes salted SHA-256 commitments for input parameters and decision outputs:
   - `saltedInputHash = SHA256(SALT || rawInput)`
   - `saltedOutputHash = SHA256(SALT || decisionOutput)`
   - `combinedStateHash = SHA256(saltedInputHash || saltedOutputHash)`

4. **`sign()` (`src/cool/sign.ts`)**
   Dual hybrid signature engine:
   - Classical signature: **Ed25519**
   - Post-Quantum signature: **ML-DSA-65 (Dilithium FIPS 204)**

5. **`attest()` (`src/cool/phala/dstack.ts`)**
   Hardware-enclave quote generation via Phala Network `dstack` TEE nodes, proving the operator did not tamper with model execution environment.

6. **`append()` (`src/cool/phala/log.ts`)**
   RFC 6962 compliant Merkle transparency log appending leaf hash `0x00 || combinedStateHash` and returning audit inclusion paths.

7. **`cool verify` (`src/cool/verify.ts`)**
   Fail-closed offline verifier evaluating 5 independent security criteria:
   - `signatureValid`: Ed25519 & ML-DSA-65 check
   - `transparencyLogValid`: RFC 6962 inclusion proof recalculation
   - `hashCommitmentValid`: Salted hash matching against sealed input
   - `teeAttestationValid`: Hardware enclave quote signature
   - `correctnessAndBiasCheck`: Explicitly marked `OUT_OF_SCOPE`

---

## 4. Verification & Non-Repudiation Flow

```
[ Receipt JSON ] ──> [ cool verify ]
                           │
      ┌────────────────────┼────────────────────┐
      ▼                    ▼                    ▼
[ Ed25519 / ML-DSA ] [ RFC 6962 Merkle ] [ Salted Hash Commit ]
      │                    │                    │
      ▼                    ▼                    ▼
 (Signature Valid)  (Root Recalculated)  (Matches Input Data)
      └────────────────────┬────────────────────┘
                           ▼
                 VERDICT: UNFORGED (0 API Calls)
```
