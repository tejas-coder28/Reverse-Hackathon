import React, { useState } from 'react';
import { ScanSearch, Lock } from 'lucide-react';
import type { CooLReceipt, VerificationCheckResult } from '../cool/types';
import { evidenceService } from '../services/evidenceService';
import {
  Button,
  Panel,
  StatusBadge,
  Field,
  KeyValueGrid,
  CopyableValue,
  SectionHeader,
  EmptyState,
} from './ui/primitives';
import { VerificationCheckList, VerdictBanner, checksFromResult } from './ui/verification';
import { decisionTone, formatDateTime } from './ui/format';

interface EvidenceReceiptTabProps {
  receipt: CooLReceipt | null;
  onInspectRaw: (receipt: CooLReceipt) => void;
}

export const EvidenceReceiptTab: React.FC<EvidenceReceiptTabProps> = ({ receipt, onInspectRaw }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationCheckResult | null>(null);

  if (!receipt) {
    return (
      <EmptyState
        title="No active evidence receipt"
        description="Run a decision in the Decision Console to generate a CooL cryptographic evidence receipt."
      />
    );
  }

  const handleRunVerification = async () => {
    setIsVerifying(true);
    setTimeout(async () => {
      const res = await evidenceService.verifyOffline(receipt);
      setVerificationResult(res);
      setIsVerifying(false);
    }, 400);
  };

  return (
    <div className="space-y-6 pb-12">
      <SectionHeader
        eyebrow="Evidence Receipt"
        title={`Receipt ${receipt.decisionId}`}
        description="Cryptographic evidence captured at the decision boundary. Hashes and identifiers below are the sealed evidence values — copy them for independent offline verification."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onInspectRaw(receipt)}>
              <ScanSearch className="h-4 w-4" />
              Raw JSON
            </Button>
            <Button variant="primary" onClick={handleRunVerification} disabled={isVerifying}>
              {isVerifying ? 'Verifying…' : 'Verify Evidence'}
            </Button>
          </div>
        }
      />

      {/* ── Receipt header fields ─────────────────────────────────────────── */}
      <Panel title="Receipt" meta={`captured ${formatDateTime(receipt.timestamp)}`}>
        <KeyValueGrid className="grid-cols-2 lg:grid-cols-6">
          <Field label="Receipt ID" className="col-span-2">
            {receipt.decisionId}
          </Field>
          <Field label="Decision">
            <StatusBadge tone={decisionTone(receipt.decision)}>{receipt.decision}</StatusBadge>
          </Field>
          <Field label="Model">{receipt.modelId}</Field>
          <Field label="Version">{receipt.modelVersion}</Field>
          <Field label="Integrity">
            {verificationResult ? (
              <StatusBadge tone={verificationResult.isUnforged ? 'ok' : 'bad'}>
                {verificationResult.isUnforged ? 'Verified' : 'Tampered'}
              </StatusBadge>
            ) : (
              <span className="font-mono text-[11px] text-ink-500">Run verification</span>
            )}
          </Field>
          <Field label="Applicant">{receipt.applicantId}</Field>
          <Field label="Domain">{receipt.domain}</Field>
          <Field label="Timestamp (UTC)" className="col-span-2">
            {formatDateTime(receipt.timestamp)}
          </Field>
          <Field label="Receipt spec">{`v${receipt.version}`}</Field>
          <Field label="Log">{receipt.transparencyLog.logId}</Field>
        </KeyValueGrid>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-12">
        {/* ── Cryptographic evidence column ──────────────────────────────── */}
        <div className="space-y-4 xl:col-span-7">
          <Panel title="Commitment" meta="salted SHA-256">
            <div className="space-y-3">
              <div className="rounded-md border border-line-700 bg-base-950 p-3">
                <CopyableValue
                  label="Combined state hash — H(SALT : input || output)"
                  value={receipt.privacyCommitment.combinedStateHash}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-line-700 bg-base-950 p-3">
                  <CopyableValue
                    label="Salted input commitment"
                    value={receipt.privacyCommitment.saltedInputHash}
                  />
                </div>
                <div className="rounded-md border border-line-700 bg-base-950 p-3">
                  <CopyableValue
                    label="Salted output commitment"
                    value={receipt.privacyCommitment.saltedOutputHash}
                  />
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-ink-400">
                Raw applicant PII is never written into evidence. Inputs and outputs are sealed behind a per-receipt
                random salt; the salt is retained for offline recomputation by the institution.
              </p>
            </div>
          </Panel>

          <Panel title="Signatures" meta="hybrid classical + post-quantum">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-line-700 bg-base-950 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-medium text-ink-200">Ed25519</span>
                  <StatusBadge tone="ok">Valid</StatusBadge>
                </div>
                <CopyableValue label="Public key" value={receipt.signatures.ed25519.publicKey} />
                <div className="mt-2">
                  <CopyableValue label="Signature" value={receipt.signatures.ed25519.signature} />
                </div>
              </div>
              <div className="rounded-md border border-line-700 bg-base-950 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-medium text-ink-200">ML-DSA-65 · FIPS 204</span>
                  <StatusBadge tone="ok">Valid</StatusBadge>
                </div>
                <CopyableValue label="Public key" value={receipt.signatures.mldsa65.publicKey} />
                <div className="mt-2">
                  <CopyableValue label="Signature" value={receipt.signatures.mldsa65.signature} />
                </div>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-ink-400">
              Validity shown reflects receipt construction. Run verification to re-evaluate signatures against the
              stored commitment.
            </p>
            {receipt.privacyCommitment.salt && (
              <div className="mt-3 border-t border-line-700/60 pt-3">
                <CopyableValue label="Commitment salt (institution-held)" value={receipt.privacyCommitment.salt} />
              </div>
            )}
          </Panel>

          <div className="grid gap-4 sm:grid-cols-2">
            <Panel title="Attestation" meta="Phala dstack">
              <KeyValueGrid className="grid-cols-1">
                <Field label="Provider">{receipt.teeAttestation.enclaveProvider}</Field>
                <Field label="Enclave">{receipt.teeAttestation.enclaveId}</Field>
              </KeyValueGrid>
              <div className="mt-3 space-y-2">
                <CopyableValue label="mrEnclave" value={receipt.teeAttestation.mrEnclave} />
                <CopyableValue label="Quote signature" value={receipt.teeAttestation.quoteSignature} />
              </div>
              <div className="mt-3">
                <StatusBadge tone={receipt.teeAttestation.enabled ? 'ok' : 'neutral'}>
                  {receipt.teeAttestation.enabled ? 'Simulated · valid' : 'Not requested'}
                </StatusBadge>
              </div>
            </Panel>

            <Panel title="Transparency log" meta="RFC 6962">
              <KeyValueGrid className="grid-cols-3">
                <Field label="Log ID">{receipt.transparencyLog.logId}</Field>
                <Field label="Tree size">{receipt.transparencyLog.treeSize}</Field>
                <Field label="Leaf index">{receipt.transparencyLog.leafIndex}</Field>
              </KeyValueGrid>
              <div className="mt-3 space-y-2">
                <CopyableValue label="Leaf hash" value={receipt.transparencyLog.leafHash} />
                <CopyableValue label="Merkle root" value={receipt.transparencyLog.merkleRoot} />
              </div>
              <p className="mt-3 font-mono text-[10px] text-ink-500">
                Inclusion proof: {receipt.transparencyLog.inclusionProof.length} sibling hashes
              </p>
            </Panel>
          </div>
        </div>

        {/* ── Verification column ────────────────────────────────────────── */}
        <div className="space-y-4 xl:col-span-5">
          <Panel title="Offline verification" meta="0 vendor API calls">
            <p className="mb-3 text-xs leading-relaxed text-ink-300">
              Five independent checks must pass for this evidence to be considered authentic. Verification recomputes
              commitments, signatures, enclave quote, and the Merkle inclusion proof entirely offline.
            </p>
            <Button variant="primary" className="w-full py-2.5" onClick={handleRunVerification} disabled={isVerifying}>
              {isVerifying ? 'Evaluating 5 checks…' : 'Verify Evidence'}
            </Button>
          </Panel>

          {isVerifying && <VerdictBanner verdict="pending" note="recomputing cryptographic checks" />}

          {verificationResult && !isVerifying && (
            <>
              <VerdictBanner
                verdict={verificationResult.isUnforged ? 'authentic' : 'tampered'}
                receiptId={receipt.decisionId}
              />
              <Panel title="Verification checks" meta={`${verificationResult.tamperErrors.length} anomalies`}>
                <VerificationCheckList items={checksFromResult(verificationResult)} />
                {verificationResult.tamperErrors.length > 0 && (
                  <div className="mt-3 space-y-1.5 rounded-md border border-bad-900 bg-bad-950/50 p-3">
                    {verificationResult.tamperErrors.map((err, i) => (
                      <p key={i} className="break-words font-mono text-[11px] leading-relaxed text-bad-300">
                        [{i + 1}] {err}
                      </p>
                    ))}
                  </div>
                )}
              </Panel>
              <Panel title="Scope" meta="what this proves">
                <p className="text-xs leading-relaxed text-ink-300">
                  The AI decision may still be right or wrong. What is proven here is whether the evidence describing
                  what happened has been altered since it was sealed.
                </p>
              </Panel>
            </>
          )}

          {!verificationResult && !isVerifying && (
            <Panel title="PII status" meta="privacy commitment">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-ok-400" />
                <p className="text-xs leading-relaxed text-ink-300">
                  <span className="font-mono text-[11px] text-ok-300">PII sealed — not stored in evidence.</span> Raw
                  applicant parameters exist only as salted SHA-256 commitments within this receipt.
                </p>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
};
