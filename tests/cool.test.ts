import { describe, it, expect, beforeEach } from 'vitest';
import { cool } from '../src/cool/client';
import { verifyReceipt } from '../src/cool/verify';
import { coolAdapter } from '../src/cool/adapter';
import { evidenceService } from '../src/services/evidenceService';
import { PRESET_APPLICANTS, runCreditModel } from '../src/model/creditModel';

describe('CooL SDK & AI Decision Evidence Protocol Suite', () => {
  beforeEach(() => {
    evidenceService.clearLedger();
  });

  // TEST 1: CooL recording occurs for every consequential decision
  it('1. CooL recording occurs for every consequential decision', async () => {
    const applicant = PRESET_APPLICANTS[0];
    const { decisionResult, recordResult, receipt } = await evidenceService.evaluateAndRecord(applicant);

    expect(decisionResult.decision).toBe('APPROVED');
    expect(recordResult.success).toBe(true);
    expect(recordResult.isCryptographicallyProtected).toBe(true);
    expect(receipt).toBeDefined();
    expect(receipt?.decisionId).toContain('DEC-SyntheticApplicant#8842');
    expect(receipt?.privacyCommitment.combinedStateHash).toHaveLength(64);
    expect(receipt?.signatures.ed25519.algorithm).toBe('Ed25519');
    expect(receipt?.signatures.mldsa65.algorithm).toBe('ML-DSA-65 (FIPS 204)');
    expect(receipt?.transparencyLog.merkleRoot).toBeDefined();
    expect(receipt?.teeAttestation.enclaveProvider).toBe('Phala Network dstack');
  });

  // TEST 2: Receipt is persisted correctly
  it('2. Receipt is persisted correctly in evidence storage', async () => {
    const applicant = PRESET_APPLICANTS[0];
    const { receipt } = await evidenceService.evaluateAndRecord(applicant);

    expect(receipt).toBeDefined();
    const all = evidenceService.getAllReceipts();
    expect(all.length).toBe(1);

    const retrieved = evidenceService.getReceiptById(receipt!.decisionId);
    expect(retrieved).toBeDefined();
    expect(retrieved?.decisionId).toBe(receipt!.decisionId);
    expect(retrieved?.privacyCommitment.combinedStateHash).toBe(receipt!.privacyCommitment.combinedStateHash);
  });

  // TEST 3: Valid evidence verifies
  it('3. Valid evidence verifies (isUnforged: true)', async () => {
    const applicant = PRESET_APPLICANTS[0];
    const { receipt } = await evidenceService.evaluateAndRecord(applicant);

    const checkResult = await coolAdapter.verifyDecisionEvidence(receipt!);
    expect(checkResult.isUnforged).toBe(true);
    expect(checkResult.signatureValid).toBe(true);
    expect(checkResult.transparencyLogValid).toBe(true);
    expect(checkResult.hashCommitmentValid).toBe(true);
    expect(checkResult.teeAttestationValid).toBe(true);
    expect(checkResult.tamperErrors).toHaveLength(0);
  });

  // TEST 4: Modified evidence fails
  it('4. Modified evidence fails verification when decision outcome or parameters are tampered', async () => {
    const applicant = PRESET_APPLICANTS[0];
    const { receipt } = await evidenceService.evaluateAndRecord(applicant);

    // Scenario A: Flip decision outcome APPROVED -> REJECTED
    const tamperedReceipt = JSON.parse(JSON.stringify(receipt));
    tamperedReceipt.decision = 'REJECTED';

    const checkA = await coolAdapter.verifyDecisionEvidence(tamperedReceipt);
    expect(checkA.isUnforged).toBe(false);
    expect(checkA.tamperErrors.length).toBeGreaterThan(0);

    // Scenario B: Alter raw parameter (Annual income changed from 145000 to 15000)
    const alteredInput = { ...applicant, annualIncome: 15000 };
    const checkB = await coolAdapter.verifyDecisionEvidence(receipt!, alteredInput);
    expect(checkB.isUnforged).toBe(false);
    expect(checkB.hashCommitmentValid).toBe(false);
    expect(checkB.tamperErrors.some(e => e.includes('Hash Commitment Mismatch'))).toBe(true);
  });

  // TEST 5: Wrong evidence fails
  it('5. Wrong evidence fails when signatures or Merkle tree root are corrupted', async () => {
    const applicant = PRESET_APPLICANTS[0];
    const { receipt } = await evidenceService.evaluateAndRecord(applicant);

    // Scenario A: Corrupt Ed25519 signature string
    const wrongSigReceipt = JSON.parse(JSON.stringify(receipt));
    wrongSigReceipt.signatures.ed25519.signature = 'ed25519_sig_INVALID_FORGED_KEY_SIGNATURE';

    const checkA = await coolAdapter.verifyDecisionEvidence(wrongSigReceipt);
    expect(checkA.isUnforged).toBe(false);
    expect(checkA.signatureValid).toBe(false);

    // Scenario B: Mutate Merkle tree root hash
    const wrongMerkleReceipt = JSON.parse(JSON.stringify(receipt));
    wrongMerkleReceipt.transparencyLog.merkleRoot = '0xDEADBEEF00000000000000000000000000000000000000000000000000000000';

    const checkB = await coolAdapter.verifyDecisionEvidence(wrongMerkleReceipt);
    expect(checkB.isUnforged).toBe(false);
    expect(checkB.transparencyLogValid).toBe(false);
  });

  // TEST 6: CooL failure is handled safely
  it('6. CooL failure is handled safely (fail-closed security principle)', async () => {
    // Pass null/invalid input to adapter to trigger safe fail-closed handling
    const result = await coolAdapter.recordDecisionEvidence(null as any, null as any);

    expect(result.success).toBe(false);
    expect(result.isCryptographicallyProtected).toBe(false);
    expect(result.receipt).toBeUndefined();
    expect(result.statusMessage).toContain('evidence protection failed');
  });

  // TEST 7: Application does not silently claim evidence is verified when CooL verification fails
  it('7. Application does not silently claim evidence is verified when CooL verification fails', async () => {
    const applicant = PRESET_APPLICANTS[0];
    const { receipt } = await evidenceService.evaluateAndRecord(applicant);

    // Corrupt Merkle tree inclusion proof
    const tampered = JSON.parse(JSON.stringify(receipt));
    tampered.transparencyLog.inclusionProof = ['0xBADBADBADBADBADBADBADBADBADBADBADBADBADBADBADBADBADBADBADBADBAD'];

    const check = await coolAdapter.verifyDecisionEvidence(tampered);

    expect(check.isUnforged).toBe(false);
    // Ensure tamper errors are explicitly exposed to prevent silent false claims
    expect(check.tamperErrors.length).toBeGreaterThan(0);
    expect(check.tamperErrors[0]).toContain('Transparency Log Tamper Detected');
  });

  // TEST 8: Raw PII is not unnecessarily persisted in evidence records
  it('8. Raw PII is not unnecessarily persisted in evidence records', async () => {
    const applicant = PRESET_APPLICANTS[0];
    const { receipt } = await evidenceService.evaluateAndRecord(applicant);

    const cleanRecord = coolAdapter.sanitizeEvidenceRecord(receipt!);

    // Verify privacy commitment uses salted SHA-256 hashes instead of raw input string
    expect(cleanRecord.privacyCommitment.saltedInputHash).toHaveLength(64);
    expect(cleanRecord.privacyCommitment.saltedOutputHash).toHaveLength(64);
    expect(cleanRecord.privacyCommitment.salt).toBeDefined();

    // Verify privacy commitment object does NOT store unhashed sensitive applicant parameters
    const commitmentStr = JSON.stringify(cleanRecord.privacyCommitment);
    expect(commitmentStr).not.toContain('annualIncome');
    expect(commitmentStr).not.toContain('existingDebt');
    expect(commitmentStr).not.toContain('145000');
  });
});
