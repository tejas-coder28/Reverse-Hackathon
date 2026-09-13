import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import type { ApplicantInput, DecisionMetadata, SaltedCommitment } from './types';

export async function sha256Hex(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  return bytesToHex(sha256(data));
}

export function generateSalt(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return bytesToHex(bytes);
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function createSaltedCommitment(
  input: ApplicantInput,
  decision: string,
  metadata: DecisionMetadata,
  existingSalt?: string
): Promise<SaltedCommitment> {
  const salt = existingSalt || generateSalt();

  const canonicalInput = JSON.stringify({
    applicantId: input.applicantId,
    income: input.annualIncome,
    debt: input.existingDebt,
    creditScore: input.creditScore,
    loanRequested: input.loanAmountRequested,
  });

  const canonicalOutput = JSON.stringify({
    decision,
    creditScore: metadata.creditScore,
    dtiRatio: metadata.dtiRatio,
    confidence: metadata.confidenceScore,
  });

  const saltedInputHash = await sha256Hex(`SALT:${salt}:${canonicalInput}`);
  const saltedOutputHash = await sha256Hex(`SALT:${salt}:${canonicalOutput}`);
  const combinedStateHash = await sha256Hex(`${saltedInputHash}:${saltedOutputHash}`);

  return {
    salt,
    saltedInputHash,
    saltedOutputHash,
    combinedStateHash,
  };
}
