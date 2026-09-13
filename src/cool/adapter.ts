/**
 * CooL Cryptographic Service Adapter
 * 
 * WHY CooL IS USED HERE:
 * Consequential autonomous AI decisions (such as credit underwriting, automated loan approvals,
 * and subprime risk evaluations) carry legal, regulatory, and institutional audit liabilities.
 * Without CooL, an organization relies on standard mutable database logs, which can be altered,
 * retroactively edited, backdated, or repudiated during litigation or regulatory examination.
 * 
 * By invoking CooL at the exact moment the consequential AI decision occurs, the application:
 * 1. Cryptographically binds applicant parameters to the decision output via salted SHA-256 state commitments (preventing PII leakage).
 * 2. Applies dual hybrid signing (Ed25519 classical + ML-DSA-65 post-quantum FIPS 204) to establish non-repudiation of origin.
 * 3. Binds a hardware-rooted Phala Network dstack TEE enclave attestation quote to prove non-self-edit execution environment integrity.
 * 4. Appends the state commitment to an RFC 6962 Merkle transparency log to prove historical ordering.
 * 5. Enables 100% offline verifiability (`cool verify`) without contacting external vendor APIs.
 * 
 * SECURITY POLICY (FAIL-CLOSED):
 * If CooL evidence creation fails, the adapter returns success = false and sets
 * isCryptographicallyProtected = false. The consuming application MUST NOT present the decision
 * as cryptographically protected or verified under any circumstances.
 */

import type { ApplicantInput, CooLReceipt, VerificationCheckResult } from './types';
import { cool, type RecordParams } from './client';
import { verifyReceipt } from './verify';
import type { CreditEvaluationResult } from '../model/creditModel';

export interface CooLRecordResult {
  success: boolean;
  receipt?: CooLReceipt;
  error?: string;
  isCryptographicallyProtected: boolean;
  statusMessage: string;
}

export interface CleanEvidenceRecord {
  decisionId: string;
  timestamp: string;
  domain: string;
  modelId: string;
  modelVersion: string;
  applicantId: string;
  decision: string;
  privacyCommitment: CooLReceipt['privacyCommitment'];
  signatures: CooLReceipt['signatures'];
  teeAttestation: CooLReceipt['teeAttestation'];
  transparencyLog: CooLReceipt['transparencyLog'];
  isCryptographicallyProtected: boolean;
}

export class CooLServiceAdapter {
  private domain: string;

  constructor(domain = 'nbfc.credit_scoring') {
    this.domain = domain;
  }

  /**
   * Records cryptographic evidence for a consequential AI decision.
   * Called at decision generation boundary.
   */
  async recordDecisionEvidence(
    applicant: ApplicantInput,
    decisionResult: CreditEvaluationResult,
    enableTEE = true
  ): Promise<CooLRecordResult> {
    try {
      // Validate inputs
      if (!applicant || !applicant.applicantId || !decisionResult || !decisionResult.decision) {
        return {
          success: false,
          isCryptographicallyProtected: false,
          error: 'Invalid decision parameters provided to CooL recording pipeline.',
          statusMessage: 'Decision completed — evidence protection failed (invalid input state)',
        };
      }

      const params: RecordParams = {
        applicant,
        decision: decisionResult.decision,
        modelId: decisionResult.modelId,
        modelVersion: decisionResult.modelVersion,
        domain: this.domain,
        metadata: decisionResult.metadata,
        enableTEE,
      };

      // Call CooL SDK core recording engine
      const receipt = await cool.record(params);

      // Verify that receipt output contains valid cryptographic commitments
      if (!receipt || !receipt.privacyCommitment || !receipt.signatures) {
        return {
          success: false,
          isCryptographicallyProtected: false,
          error: 'CooL SDK failed to generate cryptographic commitments.',
          statusMessage: 'Decision completed — evidence protection failed (crypto commitment failure)',
        };
      }

      return {
        success: true,
        receipt,
        isCryptographicallyProtected: true,
        statusMessage: 'DECISION RECORDED: Cryptographic protection active & receipt generated',
      };
    } catch (err: any) {
      // FAIL-CLOSED SECURITY PRINCIPLE:
      // If cryptographic evidence generation throws an exception, fail closed.
      // Do NOT simulate CooL output or falsely report protection active.
      console.error('[CooL Fail-Closed Boundary] Evidence recording failed:', err);
      return {
        success: false,
        isCryptographicallyProtected: false,
        error: err?.message || 'Unexpected CooL recording exception',
        statusMessage: 'Decision completed — evidence protection failed',
      };
    }
  }

  /**
   * Evaluates an evidence receipt using the offline 5-check CooL verifier protocol.
   */
  async verifyDecisionEvidence(
    receipt: CooLReceipt,
    simulatedRawInput?: ApplicantInput
  ): Promise<VerificationCheckResult> {
    if (!receipt) {
      return {
        signatureValid: false,
        transparencyLogValid: false,
        hashCommitmentValid: false,
        teeAttestationValid: false,
        correctnessAndBiasCheck: 'OUT_OF_SCOPE',
        isUnforged: false,
        details: {
          signatureDetail: 'Null or missing receipt',
          transparencyLogDetail: 'Null or missing receipt',
          hashCommitmentDetail: 'Null or missing receipt',
          teeAttestationDetail: 'Null or missing receipt',
          disclaimer: 'Out of scope',
        },
        tamperErrors: ['Cannot verify null or undefined receipt payload.'],
      };
    }

    return await verifyReceipt(receipt, simulatedRawInput);
  }

  /**
   * Produces a clean evidence object suitable for audit storage without unnecessary raw PII persistence.
   */
  sanitizeEvidenceRecord(receipt: CooLReceipt): CleanEvidenceRecord {
    return {
      decisionId: receipt.decisionId,
      timestamp: receipt.timestamp,
      domain: receipt.domain,
      modelId: receipt.modelId,
      modelVersion: receipt.modelVersion,
      applicantId: receipt.applicantId,
      decision: receipt.decision,
      privacyCommitment: receipt.privacyCommitment,
      signatures: receipt.signatures,
      teeAttestation: receipt.teeAttestation,
      transparencyLog: receipt.transparencyLog,
      isCryptographicallyProtected: true,
    };
  }
}

export const coolAdapter = new CooLServiceAdapter();
