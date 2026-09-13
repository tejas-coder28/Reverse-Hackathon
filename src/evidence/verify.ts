/**
 * CooL Offline Cryptographic Verifier Engine
 * 
 * CORE EVIDENCE PIPELINE STAGE: AUDIT & OFFLINE VERIFICATION
 * 
 * WHY CooL VERIFICATION IS USED HERE:
 * Traditional database logs require auditors or regulators to trust a central API or database admin.
 * `verifyReceipt()` operates 100% offline with ZERO external API calls, evaluating five independent
 * security criteria directly against cryptographic mathematics:
 * 
 * 1. Salted Hash Commitment Integrity: Verifies that applicant input parameters and decision metadata match state hash.
 * 2. Dual Hybrid Signatures: Validates Ed25519 (classical) & ML-DSA-65 (post-quantum FIPS 204) public key signatures.
 * 3. RFC 6962 Merkle Transparency Log: Recomputes leaf inclusion proof and verifies root match.
 * 4. Phala Network dstack TEE Hardware Quote: Validates non-self-edit enclave quote signature.
 * 5. Fail-Closed Verdict: If ANY single cryptographic check fails, `isUnforged` evaluates to false.
 */

import type { CooLReceipt, VerificationCheckResult } from './types';
import { createSaltedCommitment, sha256Hex } from './hash';
import { verifyHybridSignatures } from './sign';
import { verifyTEEAttestation } from './phala/dstack';
import { verifyTransparencyLog } from './phala/log';

export async function verifyReceipt(
  receipt: CooLReceipt,
  simulatedRawInput?: any
): Promise<VerificationCheckResult> {
  const tamperErrors: string[] = [];

  // FAIL-CLOSED CHECK: Invalid or empty receipt structure
  if (!receipt || !receipt.privacyCommitment) {
    return {
      signatureValid: false,
      transparencyLogValid: false,
      hashCommitmentValid: false,
      teeAttestationValid: false,
      correctnessAndBiasCheck: 'OUT_OF_SCOPE',
      isUnforged: false,
      details: {
        signatureDetail: 'Invalid receipt structure',
        transparencyLogDetail: 'Invalid receipt structure',
        hashCommitmentDetail: 'Invalid receipt structure',
        teeAttestationDetail: 'Invalid receipt structure',
        disclaimer: 'Out of scope (not claimed)',
      },
      tamperErrors: ['Receipt object is null, undefined, or missing privacy commitments.'],
    };
  }

  let hashCommitmentValid = true;
  let hashCommitmentDetail = '✓ Salted hash commitment matches sealed decision state';

  // 1. SALT HASH COMMITMENT VERIFICATION
  if (simulatedRawInput) {
    const recalculatedCommitment = await createSaltedCommitment(
      simulatedRawInput,
      receipt.decision,
      receipt.decisionMetadata,
      receipt.privacyCommitment.salt
    );

    if (recalculatedCommitment.combinedStateHash !== receipt.privacyCommitment.combinedStateHash) {
      hashCommitmentValid = false;
      hashCommitmentDetail = '✗ Salted hash commitment mismatch with provided applicant input parameters!';
      tamperErrors.push('Hash Commitment Mismatch: Raw applicant parameters do not match salted hash in receipt.');
    }
  } else {
    // Check output commitment integrity against decision and metadata
    const canonicalOutput = JSON.stringify({
      decision: receipt.decision,
      creditScore: receipt.decisionMetadata?.creditScore,
      dtiRatio: receipt.decisionMetadata?.dtiRatio,
      confidence: receipt.decisionMetadata?.confidenceScore,
    });
    const expectedOutputHash = await sha256Hex(`SALT:${receipt.privacyCommitment.salt}:${canonicalOutput}`);

    if (expectedOutputHash !== receipt.privacyCommitment.saltedOutputHash) {
      hashCommitmentValid = false;
      hashCommitmentDetail = '✗ Decision output tampered relative to salted output hash commitment!';
      tamperErrors.push('Hash Commitment Mismatch: Decision outcome or metadata has been altered after recording.');
    } else {
      const expectedCombined = await sha256Hex(`${receipt.privacyCommitment.saltedInputHash}:${expectedOutputHash}`);
      if (expectedCombined !== receipt.privacyCommitment.combinedStateHash) {
        hashCommitmentValid = false;
        hashCommitmentDetail = '✗ Combined state hash commitment mismatch!';
        tamperErrors.push('Hash Commitment Mismatch: Salted combined state hash commitment altered.');
      }
    }
  }

  // 2. HYBRID CRYPTOGRAPHIC SIGNATURE VERIFICATION (Ed25519 + ML-DSA-65)
  const sigCheck = await verifyHybridSignatures(
    receipt.privacyCommitment.combinedStateHash,
    receipt.signatures
  );
  let signatureValid = sigCheck.valid;
  let signatureDetail = sigCheck.valid
    ? '✓ Hybrid signatures valid (Ed25519 + ML-DSA-65 Post-Quantum)'
    : `✗ Signature Failure: ${sigCheck.reason}`;
  if (!sigCheck.valid) {
    tamperErrors.push(`Cryptographic Signature Violation: ${sigCheck.reason}`);
  }

  // 3. RFC 6962 MERKLE TRANSPARENCY LOG VERIFICATION
  const logCheck = await verifyTransparencyLog(
    receipt.transparencyLog,
    receipt.privacyCommitment.combinedStateHash
  );
  let transparencyLogValid = logCheck.valid;
  let transparencyLogDetail = logCheck.valid
    ? '✓ Transparency log inclusion proof valid (RFC 6962 Merkle Tree)'
    : `✗ Transparency Log Failure: ${logCheck.reason}`;
  if (!logCheck.valid) {
    tamperErrors.push(`Transparency Log Tamper Detected: ${logCheck.reason}`);
  }

  // 4. PHALA dstack TEE HARDWARE ENCLAVE QUOTE VERIFICATION
  const teeCheck = await verifyTEEAttestation(
    receipt.teeAttestation,
    receipt.privacyCommitment.combinedStateHash
  );
  let teeAttestationValid = teeCheck.valid;
  let teeAttestationDetail = teeCheck.valid
    ? receipt.teeAttestation.enabled
      ? '✓ TEE dstack enclave quote valid (Hardware-rooted non-self-edit proof)'
      : '— TEE attestation not requested for this domain'
    : `✗ TEE Attestation Failure: ${teeCheck.reason}`;
  if (!teeCheck.valid) {
    tamperErrors.push(`Hardware Enclave Attestation Mismatch: ${teeCheck.reason}`);
  }

  // FAIL-CLOSED COMBINED VERDICT: All four checks must pass
  const isUnforged = signatureValid && transparencyLogValid && hashCommitmentValid && teeAttestationValid;

  return {
    signatureValid,
    transparencyLogValid,
    hashCommitmentValid,
    teeAttestationValid,
    correctnessAndBiasCheck: 'OUT_OF_SCOPE',
    isUnforged,
    details: {
      signatureDetail,
      transparencyLogDetail,
      hashCommitmentDetail,
      teeAttestationDetail,
      disclaimer: '— Model correctness, fairness, and bias-free execution are OUT OF SCOPE (not claimed by ledger)',
    },
    tamperErrors,
  };
}
