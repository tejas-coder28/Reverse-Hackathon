export type DecisionResult = 'APPROVED' | 'MANUAL_REVIEW' | 'REJECTED';

export interface ApplicantInput {
  applicantId: string;
  name: string;
  annualIncome: number;
  existingDebt: number;
  creditScore: number;
  loanAmountRequested: number;
  collateralValue: number;
  employmentYears: number;
}

export interface DecisionMetadata {
  creditScore: number;
  monthlyIncome: number;
  existingDebt: number;
  dtiRatio: number;
  loanAmount: number;
  confidenceScore: number;
  riskFactors: string[];
  recommendationReason: string;
}

export interface SaltedCommitment {
  salt: string;
  saltedInputHash: string;
  saltedOutputHash: string;
  combinedStateHash: string;
}

export interface HybridSignatures {
  ed25519: {
    publicKey: string;
    signature: string;
    algorithm: 'Ed25519';
  };
  mldsa65: {
    publicKey: string;
    signature: string;
    algorithm: 'ML-DSA-65 (FIPS 204)';
  };
}

export interface TEEAttestation {
  enabled: boolean;
  mode: 'local-demo' | 'remote-enclave';
  enclaveProvider: string;
  enclaveId: string;
  mrEnclave: string;
  mrSigner: string;
  quoteSignature: string;
  timestamp: string;
}

export interface TransparencyLogProof {
  logId: string;
  treeSize: number;
  leafIndex: number;
  leafHash: string;
  merkleRoot: string;
  inclusionProof: string[];
}

export interface CooLReceipt {
  version: '1.0.0';
  decisionId: string;
  timestamp: string;
  domain: string;
  modelId: string;
  modelVersion: string;
  applicantId: string;
  decision: DecisionResult;
  decisionMetadata: DecisionMetadata;
  privacyCommitment: SaltedCommitment;
  signatures: HybridSignatures;
  teeAttestation: TEEAttestation;
  transparencyLog: TransparencyLogProof;
}

export interface VerificationCheckResult {
  signatureValid: boolean;
  transparencyLogValid: boolean;
  hashCommitmentValid: boolean;
  teeAttestationValid: boolean;
  correctnessAndBiasCheck: 'OUT_OF_SCOPE';
  isUnforged: boolean;
  details: {
    signatureDetail: string;
    transparencyLogDetail: string;
    hashCommitmentDetail: string;
    teeAttestationDetail: string;
    disclaimer: string;
  };
  tamperErrors: string[];
}
