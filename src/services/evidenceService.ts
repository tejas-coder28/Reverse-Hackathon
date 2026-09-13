/**
 * Institutional AI Decision Evidence Storage & Management Service
 * 
 * WHY CooL IS INTEGRATED HERE:
 * This service sits directly at the application's consequential decision boundary.
 * When the credit underwriting model (`runCreditModel`) completes execution, this service
 * immediately passes the applicant payload and model evaluation output into `coolAdapter.recordDecisionEvidence()`.
 * 
 * Evidence is committed at decision time so the institution can later demonstrate non-repudiation
 * of what was evaluated and decided, protecting the organization against retroactive log tampering
 * or claims of post-hoc decision manipulation.
 */

import type { ApplicantInput, CooLReceipt, VerificationCheckResult } from '../cool/types';
import { coolAdapter, type CooLRecordResult } from '../cool/adapter';
import { PRESET_APPLICANTS, runCreditModel, type CreditEvaluationResult } from '../model/creditModel';
import { resetTransparencyLog } from '../cool/phala/log';

const STORAGE_KEY = 'cool_evidence_ledger_v1';

export class EvidenceService {
  private receipts: CooLReceipt[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.receipts = JSON.parse(stored);
        }
      }
    } catch {
      this.receipts = [];
    }
  }

  private saveToStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.receipts));
      }
    } catch {
      // Memory fallback
    }
  }

  /**
   * Seeds demo receipts using real CooL SDK cryptographic recording if empty.
   */
  async seedDemoIfEmpty(): Promise<CooLReceipt> {
    if (this.receipts.length > 0) {
      return this.receipts[0];
    }

    const applicant8842 = PRESET_APPLICANTS[0];
    const modelResult = runCreditModel(applicant8842);
    
    // Consequential Decision Boundary: Commit evidence at decision time via CooL Adapter
    const recordRes = await coolAdapter.recordDecisionEvidence(applicant8842, modelResult, true);
    if (!recordRes.success || !recordRes.receipt) {
      throw new Error(`Failed to seed demo receipt for ${applicant8842.applicantId}: ${recordRes.error}`);
    }

    this.receipts.unshift(recordRes.receipt);

    // Seed remaining preset applicants for rich audit ledger
    for (let i = 1; i < PRESET_APPLICANTS.length; i++) {
      const app = PRESET_APPLICANTS[i];
      const res = runCreditModel(app);
      const rec = await coolAdapter.recordDecisionEvidence(app, res, true);
      if (rec.success && rec.receipt) {
        this.receipts.push(rec.receipt);
      }
    }

    this.saveToStorage();
    return recordRes.receipt;
  }

  /**
   * Evaluates synthetic applicant and records CooL evidence at the consequential decision boundary.
   */
  async evaluateAndRecord(applicantInput: ApplicantInput): Promise<{
    decisionResult: CreditEvaluationResult;
    recordResult: CooLRecordResult;
    receipt?: CooLReceipt;
  }> {
    // 1. AI DECISION: Execute model
    const decisionResult = runCreditModel(applicantInput);

    // 2. COOL RECORDING: Call adapter at the exact moment decision occurs
    const recordResult = await coolAdapter.recordDecisionEvidence(applicantInput, decisionResult, true);

    // 3. PERSISTENCE & CRYPTOGRAPHIC PROTECTION: If successful, persist clean evidence record
    if (recordResult.success && recordResult.receipt) {
      this.receipts.unshift(recordResult.receipt);
      this.saveToStorage();
      return { decisionResult, recordResult, receipt: recordResult.receipt };
    }

    // FAIL-CLOSED SECURITY PRINCIPLE:
    // If evidence creation fails, return failure status. Do NOT persist unverified or fake receipts.
    return { decisionResult, recordResult };
  }

  /**
   * Retrieves all persisted cryptographic evidence receipts.
   */
  getAllReceipts(): CooLReceipt[] {
    return [...this.receipts];
  }

  /**
   * Looks up receipt by unique decision ID.
   */
  getReceiptById(id: string): CooLReceipt | undefined {
    return this.receipts.find(r => r.decisionId === id);
  }

  /**
   * Runs offline CooL verification via adapter boundary.
   */
  async verifyOffline(receipt: CooLReceipt, applicantInput?: ApplicantInput): Promise<VerificationCheckResult> {
    return await coolAdapter.verifyDecisionEvidence(receipt, applicantInput);
  }

  /**
   * Clears ledger storage and resets Merkle transparency log store.
   */
  clearLedger() {
    this.receipts = [];
    resetTransparencyLog();
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

export const evidenceService = new EvidenceService();
