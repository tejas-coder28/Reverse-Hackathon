import React, { useState } from 'react';
import { ScanSearch, Lock } from 'lucide-react';
import type { CooLReceipt, VerificationCheckResult } from '../evidence/types';
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
  Stamp,
} from './ui/primitives';
import { VerificationCheckList, VerdictStamp, checksFromResult } from './ui/verification';
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
        description="Run a decision in the Decision Console to open the next case file."
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
        eyebrow="Exhibit A · Evidence Receipt"
        title={`Receipt ${receipt.decisionId}`}
        description="Cryptographic evidence captured at the decision boundary. Hashes and identifiers below are the sealed evidence values — copy them for independent offline verification."
        actions={
          <div className="flex items-center gap-3">
            <Stamp
              size="sm"
              angle={-3}
              tone={verificationResult ? (verificationResult.isUnforged ? 'green' : 'red') : 'gray'}
            >
              {verificationResult ? (verificationResult.isUnforged ? 'Unforged' : 'Tampered') : 'Unverified'}
            </Stamp>
            <Button variant="secondary" onClick={() => onInspectRaw(receipt)}>
              <ScanSearch className="h-4 w-4" />
              Raw JSON
            </Button>
            <Button variant="primary" onClick={handleRunVerification} disabled={isVerifying}>
              {isVerifying ? 'Examining…' : 'Verify Evidence'}
            </Button>
          </div>
        }
      />

      {/* ── Receipt document fields ───────────────────────────────────────── */}
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
              <span className="text-[11px] uppercase text-ink-500">Run verification</span>
            )}
          </Field>
          <Field label="Applicant ref">{receipt.applicantId}</Field>
          <Field label="Decision domain">{receipt.domain}</Field>
          <Field label="Sealed at (UTC)" className="col-span-2">
            {formatDateTime(receipt.timestamp)}
          </Field>
          <Field label="Receipt format">{`v${receipt.version}`}</Field>
          <Field label="Public log">{receipt.transparencyLog.logId}</Field>
        </KeyValueGrid>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-12">
        {/* ── The exhibit body — cryptographic evidence ──────────────────── */}
        <div className="space-y-4 xl:col-span-7">
          <Panel title="Sealed state" meta="what the model saw and ruled, fingerprinted">
            <div className="space-y-3">
              <div className="border border-rule-400 bg-paper-50 p-3" style={{ borderRadius: 2 }}>
                <CopyableValue
                  label="Complete decision fingerprint (SHA-256)"
                  value={receipt.privacyCommitment.combinedStateHash}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="border border-rule-400 bg-paper-50 p-3" style={{ borderRadius: 2 }}>
                  <CopyableValue
                    label="Inputs fingerprint (salted)"
                    value={receipt.privacyCommitment.saltedInputHash}
                  />
                </div>
                <div className="border border-rule-400 bg-paper-50 p-3" style={{ borderRadius: 2 }}>
                  <CopyableValue
                    label="Outputs fingerprint (salted)"
                    value={receipt.privacyCommitment.saltedOutputHash}
                  />
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-ink-600">
                Raw applicant PII is never written into evidence. Inputs and outputs are sealed behind a per-receipt
                random salt; the salt is retained for offline recomputation by the institution.
              </p>
            </div>
          </Panel>

          <Panel title="Signatures" meta="hybrid classical + post-quantum">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border border-rule-400 bg-paper-50 p-3" style={{ borderRadius: 2 }}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-ink-900">Ed25519</span>
                  <StatusBadge tone="ok">Valid</StatusBadge>
                </div>
                <CopyableValue label="Public key" value={receipt.signatures.ed25519.publicKey} />
                <div className="mt-2">
                  <CopyableValue label="Signature" value={receipt.signatures.ed25519.signature} />
                </div>
              </div>
              <div className="border border-rule-400 bg-paper-50 p-3" style={{ borderRadius: 2 }}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-ink-900">ML-DSA-65 · FIPS 204</span>
                  <StatusBadge tone="ok">Valid</StatusBadge>
                </div>
                <CopyableValue label="Public key" value={receipt.signatures.mldsa65.publicKey} />
                <div className="mt-2">
                  <CopyableValue label="Signature" value={receipt.signatures.mldsa65.signature} />
                </div>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-ink-600">
              Validity shown reflects receipt construction. Run verification to re-evaluate signatures against the
              stored commitment.
            </p>
            {receipt.privacyCommitment.salt && (
              <div className="mt-3 border-t border-rule-400 pt-3">
                <CopyableValue label="Commitment salt (held by the institution)" value={receipt.privacyCommitment.salt} />
              </div>
            )}
          </Panel>

          <div className="grid gap-4 sm:grid-cols-2">
            <Panel title="Enclave witness" meta="Phala dstack">
              <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-rule-400 pb-2">
                <span
                  className="border border-annotation-500 bg-annotation-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-annotation-500"
                  style={{ borderRadius: 2 }}
                >
                  Simulated / local demo
                </span>
                <span className="text-[10px] text-ink-500">Browser mock of TEE quote</span>
              </div>
              <KeyValueGrid className="grid-cols-1">
                <Field label="Provider">{receipt.teeAttestation.enclaveProvider}</Field>
                <Field label="Enclave">{receipt.teeAttestation.enclaveId}</Field>
              </KeyValueGrid>
              <div className="mt-3 space-y-2">
                <CopyableValue label="mrEnclave" value={receipt.teeAttestation.mrEnclave} />
                <CopyableValue label="Quote signature" value={receipt.teeAttestation.quoteSignature} />
              </div>
              <div className="mt-3">
                <StatusBadge tone={receipt.teeAttestation.enabled ? 'accent' : 'neutral'}>
                  {receipt.teeAttestation.enabled ? 'Quote bound to this receipt (simulated)' : 'Not requested'}
                </StatusBadge>
              </div>
            </Panel>

            <Panel title="Public log entry" meta="RFC 6962 append-only tree">
              <KeyValueGrid className="grid-cols-3">
                <Field label="Log ID">{receipt.transparencyLog.logId}</Field>
                <Field label="Tree size">{receipt.transparencyLog.treeSize}</Field>
                <Field label="Leaf index">{receipt.transparencyLog.leafIndex}</Field>
              </KeyValueGrid>
              <div className="mt-3 space-y-2">
                <CopyableValue label="Leaf hash" value={receipt.transparencyLog.leafHash} />
                <CopyableValue label="Published tree root" value={receipt.transparencyLog.merkleRoot} />
              </div>
              <p className="mt-3 text-[10px] text-ink-500">
                Inclusion proof: {receipt.transparencyLog.inclusionProof.length} sibling hashes
              </p>
            </Panel>
          </div>
        </div>

        {/* ── The lab report — offline verification ──────────────────────── */}
        <div className="space-y-4 xl:col-span-5">
          <Panel title="The examination" meta="zero vendor API calls">
            <p className="mb-3 text-xs leading-relaxed text-ink-600">
              Five independent checks must pass for this evidence to be considered authentic. The examination
              recomputes fingerprints, signatures, enclave quote, and log inclusion entirely offline.
            </p>
            <Button variant="primary" className="w-full py-2.5" onClick={handleRunVerification} disabled={isVerifying}>
              {isVerifying ? 'Examining…' : 'Verify Evidence'}
            </Button>
          </Panel>

          {isVerifying && <VerdictStamp verdict="pending" note="recomputing cryptographic checks" />}

          {verificationResult && !isVerifying && (
            <>
              <VerdictStamp
                verdict={verificationResult.isUnforged ? 'authentic' : 'tampered'}
                receiptId={receipt.decisionId}
              />
              <Panel title="Laboratory report" meta={`${verificationResult.tamperErrors.length} anomalies found`}>
                <VerificationCheckList items={checksFromResult(verificationResult)} />
                {verificationResult.tamperErrors.length > 0 && (
                  <div className="mt-3 space-y-1.5 border border-stamp-500 bg-stamp-50 p-3" style={{ borderRadius: 2 }}>
                    {verificationResult.tamperErrors.map((err, i) => (
                      <p key={i} className="break-words text-[11px] leading-relaxed text-stamp-600">
                        [{i + 1}] {err}
                      </p>
                    ))}
                  </div>
                )}
              </Panel>
              <Panel title="Scope" meta="what this proves">
                <p className="text-xs leading-relaxed text-ink-700">
                  The AI decision may still be right or wrong. What is proven here is whether the evidence describing
                  what happened has been altered since it was sealed.
                </p>
              </Panel>
            </>
          )}

          {!verificationResult && !isVerifying && (
            <Panel title="Privacy" meta="what happens to PII">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-notary-600" />
                <p className="text-xs leading-relaxed text-ink-700">
                  <span className="font-bold text-notary-600">Sealed — no raw PII stored.</span> Applicant details
                  exist only as salted SHA-256 fingerprints within this receipt.
                </p>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
};
