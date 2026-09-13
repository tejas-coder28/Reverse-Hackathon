import type { ApplicantInput, CooLReceipt, DecisionMetadata, DecisionResult } from './types';
import { createSaltedCommitment } from './hash';
import { createHybridSignatures } from './sign';
import { createTEEAttestation } from './phala/dstack';
import { appendToTransparencyLog } from './phala/log';

export interface RecordParams {
  applicant: ApplicantInput;
  decision: DecisionResult;
  modelId: string;
  modelVersion: string;
  domain?: string;
  metadata: DecisionMetadata;
  enableTEE?: boolean;
}

export class CooLClient {
  private domain: string;

  constructor(options: { domain?: string } = {}) {
    this.domain = options.domain || 'nbfc.credit_scoring';
  }

  async record(params: RecordParams): Promise<CooLReceipt> {
    const timestamp = new Date().toISOString();
    const decisionId = `DEC-${params.applicant.applicantId.replace(/\s+/g, '')}-${Date.now().toString(36).toUpperCase()}`;
    const domain = params.domain || this.domain;

    const privacyCommitment = await createSaltedCommitment(
      params.applicant,
      params.decision,
      params.metadata
    );

    const signatures = await createHybridSignatures(privacyCommitment.combinedStateHash);

    const teeAttestation = await createTEEAttestation(
      privacyCommitment.combinedStateHash,
      params.enableTEE !== false
    );

    const transparencyLog = await appendToTransparencyLog(privacyCommitment.combinedStateHash);

    return {
      version: '1.0.0',
      decisionId,
      timestamp,
      domain,
      modelId: params.modelId,
      modelVersion: params.modelVersion,
      applicantId: params.applicant.applicantId,
      decision: params.decision,
      decisionMetadata: params.metadata,
      privacyCommitment,
      signatures,
      teeAttestation,
      transparencyLog,
    };
  }
}

export const cool = new CooLClient();
