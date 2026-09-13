import React, { useState, useEffect } from 'react';
import { FileDiff, RotateCcw, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import type { CooLReceipt, VerificationCheckResult } from '../cool/types';
import { evidenceService } from '../services/evidenceService';
import { seedDemoOnce } from './ui/demoSeed';
import { Button, Panel, StatusBadge, SectionHeader } from './ui/primitives';
import { VerificationCheckList, VerdictBanner, checksFromResult } from './ui/verification';
import { shortHash } from './ui/format';

export const TamperLabTab: React.FC = () => {
  const [originalReceipt, setOriginalReceipt] = useState<CooLReceipt | null>(null);
  const [editedReceipt, setEditedReceipt] = useState<CooLReceipt | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationCheckResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTamperMode, setActiveTamperMode] = useState<string>('NONE');

  useEffect(() => {
    const init = async () => {
      const demo = await seedDemoOnce();
      setOriginalReceipt(demo);
      setEditedReceipt(JSON.parse(JSON.stringify(demo)));
      const res = await evidenceService.verifyOffline(demo);
      setVerificationResult(res);
      setActiveTamperMode('NONE');
    };
    init();
  }, []);

  const handleRestoreOriginal = async () => {
    if (!originalReceipt) return;
    const reset = JSON.parse(JSON.stringify(originalReceipt));
    setEditedReceipt(reset);
    setActiveTamperMode('NONE');
    setIsVerifying(true);
    setTimeout(async () => {
      const res = await evidenceService.verifyOffline(reset);
      setVerificationResult(res);
      setIsVerifying(false);
    }, 300);
  };

  const applyTamper = (mode: string) => {
    if (!editedReceipt) return;
    const tampered = JSON.parse(JSON.stringify(editedReceipt));

    if (mode === 'DECISION_FLIPPED') {
      tampered.decision = tampered.decision === 'APPROVED' ? 'REJECTED' : 'APPROVED';
    } else if (mode === 'SIGNATURE_FORGED') {
      tampered.signatures.ed25519.signature = 'ed25519_sig_BAD_FORGED_SIGNATURE_99999999';
    } else if (mode === 'MERKLE_ROOT_ALTERED') {
      tampered.transparencyLog.merkleRoot = '0xBAD000000000000000000000000000000000000000000000000000000000DEAD';
    }

    setEditedReceipt(tampered);
    setActiveTamperMode(mode);

    // Immediately trigger real verification to demonstrate live tamper detection
    setIsVerifying(true);
    setTimeout(async () => {
      const simulatedInput =
        mode === 'INCOME_ALTERED'
          ? {
              applicantId: tampered.applicantId,
              name: tampered.applicantId,
              annualIncome: 15000, // Altered from 145000
              existingDebt: 12000,
              creditScore: 785,
              loanAmountRequested: 35000,
              collateralValue: 85000,
              employmentYears: 6.5,
            }
          : undefined;

      const res = await evidenceService.verifyOffline(tampered, simulatedInput);
      setVerificationResult(res);
      setIsVerifying(false);
    }, 350);
  };

  if (!editedReceipt || !verificationResult) {
    return (
      <Panel title="Tamper Lab">
        <p className="py-8 text-center font-mono text-xs text-ink-400">Loading evidence record…</p>
      </Panel>
    );
  }

  const tampered = activeTamperMode !== 'NONE';

  /* Before/after comparison rows */
  const comparisonRows: Array<{ label: string; original: string; modified: string }> = [
    {
      label: 'Decision',
      original: originalReceipt?.decision ?? editedReceipt.decision,
      modified: editedReceipt.decision,
    },
    {
      label: 'SHA-256 commitment',
      original: originalReceipt?.privacyCommitment.combinedStateHash ?? '',
      modified: editedReceipt.privacyCommitment.combinedStateHash,
    },
    {
      label: 'Ed25519 signature',
      original: originalReceipt?.signatures.ed25519.signature ?? '',
      modified: editedReceipt.signatures.ed25519.signature,
    },
    {
      label: 'Merkle root (RFC 6962)',
      original: originalReceipt?.transparencyLog.merkleRoot ?? '',
      modified: editedReceipt.transparencyLog.merkleRoot,
    },
  ];

  const tamperScenarios: Array<{ id: string; title: string; description: string }> = [
    { id: 'DECISION_FLIPPED', title: 'Flip decision outcome', description: 'APPROVED → REJECTED after the fact' },
    { id: 'INCOME_ALTERED', title: 'Alter input parameters', description: 'Income $145,000 → $15,000 vs sealed commitment' },
    { id: 'SIGNATURE_FORGED', title: 'Forge Ed25519 signature', description: 'Substitute institutional key signature' },
    { id: 'MERKLE_ROOT_ALTERED', title: 'Mutate Merkle root', description: 'Rewrite RFC 6962 tree root hash' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <SectionHeader
        eyebrow="Tamper Lab"
        title="Controlled tamper demonstration"
        description="Modify a copy of a sealed receipt and watch the offline verifier fail closed. Nothing here touches the stored ledger — the original receipt is preserved and can be restored at any time."
        actions={
          <Button variant="success" onClick={handleRestoreOriginal} disabled={isVerifying}>
            <RotateCcw className="h-4 w-4" />
            Restore Original
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-12">
        {/* ── Attack selection + payload editor ──────────────────────────── */}
        <div className="space-y-4 xl:col-span-5">
          <Panel title="Tamper scenario" meta="select a modification vector">
            <ul className="space-y-1.5">
              {tamperScenarios.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => applyTamper(s.id)}
                    disabled={isVerifying}
                    className={`flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${
                      activeTamperMode === s.id
                        ? 'border-bad-500/70 bg-bad-950/60'
                        : 'border-line-700 bg-base-850 hover:border-line-600'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className={`block text-[13px] font-medium ${activeTamperMode === s.id ? 'text-bad-200' : 'text-ink-100'}`}>
                        {s.title}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] text-ink-400">{s.description}</span>
                    </span>
                    {activeTamperMode === s.id && <StatusBadge tone="bad">Active</StatusBadge>}
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Payload editor" meta={tampered ? `modified · ${activeTamperMode}` : 'original · unmodified'}>
            <div className="space-y-3">
              <div>
                <label className="label" htmlFor="tl-decision">
                  Decision outcome
                </label>
                <select
                  id="tl-decision"
                  value={editedReceipt.decision}
                  onChange={(e) => {
                    setEditedReceipt({ ...editedReceipt, decision: e.target.value as CooLReceipt['decision'] });
                    setActiveTamperMode('MANUAL_EDIT');
                  }}
                  className="select font-mono"
                >
                  <option value="APPROVED">APPROVED</option>
                  <option value="MANUAL_REVIEW">MANUAL_REVIEW</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="tl-hash">
                  Salted state commitment hash
                </label>
                <input
                  id="tl-hash"
                  type="text"
                  value={editedReceipt.privacyCommitment.combinedStateHash}
                  onChange={(e) => {
                    setEditedReceipt({
                      ...editedReceipt,
                      privacyCommitment: { ...editedReceipt.privacyCommitment, combinedStateHash: e.target.value },
                    });
                    setActiveTamperMode('MANUAL_EDIT');
                  }}
                  className="input font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="label" htmlFor="tl-sig">
                  Ed25519 signature string
                </label>
                <input
                  id="tl-sig"
                  type="text"
                  value={editedReceipt.signatures.ed25519.signature}
                  onChange={(e) => {
                    setEditedReceipt({
                      ...editedReceipt,
                      signatures: {
                        ...editedReceipt.signatures,
                        ed25519: { ...editedReceipt.signatures.ed25519, signature: e.target.value },
                      },
                    });
                    setActiveTamperMode('MANUAL_EDIT');
                  }}
                  className="input font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="label" htmlFor="tl-merkle">
                  RFC 6962 Merkle root
                </label>
                <input
                  id="tl-merkle"
                  type="text"
                  value={editedReceipt.transparencyLog.merkleRoot}
                  onChange={(e) => {
                    setEditedReceipt({
                      ...editedReceipt,
                      transparencyLog: { ...editedReceipt.transparencyLog, merkleRoot: e.target.value },
                    });
                    setActiveTamperMode('MANUAL_EDIT');
                  }}
                  className="input font-mono text-[11px]"
                />
              </div>
            </div>
            <Button
              variant="danger"
              className="mt-4 w-full py-2.5"
              onClick={() => applyTamper(activeTamperMode === 'NONE' ? 'DECISION_FLIPPED' : activeTamperMode)}
              disabled={isVerifying}
            >
              <ShieldAlert className="h-4 w-4" />
              {isVerifying ? 'Verifying…' : 'Tamper & Run Verification'}
            </Button>
          </Panel>
        </div>

        {/* ── Before/after + verification verdict ────────────────────────── */}
        <div className="space-y-4 xl:col-span-7">
          <Panel
            title="Before / after comparison"
            meta={<FileDiff className="h-4 w-4 text-ink-400" />}
            actions={
              tampered ? (
                <StatusBadge tone="bad">Modified</StatusBadge>
              ) : (
                <StatusBadge tone="ok">Original</StatusBadge>
              )
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-line-700">
                    <th className="pb-2 pr-3 font-mono text-[10px] font-medium uppercase tracking-wider text-ink-400">Field</th>
                    <th className="pb-2 pr-3 font-mono text-[10px] font-medium uppercase tracking-wider text-ink-400">Original</th>
                    <th className="pb-2 font-mono text-[10px] font-medium uppercase tracking-wider text-ink-400">Modified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-700/60">
                  {comparisonRows.map((row) => {
                    const changed = row.original !== row.modified;
                    return (
                      <tr key={row.label}>
                        <td className="py-2.5 pr-3 align-top font-mono text-[11px] text-ink-300">{row.label}</td>
                        <td
                          className={`max-w-[220px] py-2.5 pr-3 align-top font-mono text-[11px] ${
                            changed ? 'text-ok-300' : 'text-ink-400'
                          }`}
                        >
                          {shortHash(row.original, 14, 8)}
                        </td>
                        <td
                          className={`max-w-[220px] py-2.5 align-top font-mono text-[11px] ${
                            changed ? 'font-semibold text-bad-300' : 'text-ink-400'
                          }`}
                        >
                          {shortHash(row.modified, 14, 8)}
                          {changed && <span className="ml-1.5 text-[10px] uppercase tracking-wider">altered</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          {isVerifying ? (
            <VerdictBanner verdict="pending" note="recomputing cryptographic checks offline" />
          ) : (
            <VerdictBanner
              verdict={verificationResult.isUnforged ? 'authentic' : 'tampered'}
              receiptId={editedReceipt.decisionId}
              note="verified with 0 vendor API calls"
            />
          )}

          {!isVerifying && (
            <Panel
              title="Verification result"
              meta={`${verificationResult.tamperErrors.length} anomalies detected`}
            >
              <VerificationCheckList items={checksFromResult(verificationResult)} />

              {verificationResult.isUnforged ? (
                <div className="mt-3 flex items-start gap-2 rounded-md border border-ok-900 bg-ok-950/50 p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok-400" />
                  <p className="text-xs leading-relaxed text-ok-200/90">
                    All cryptographic checks pass — this receipt matches its sealed commitments. Restore an unmodified
                    record or apply a tamper scenario above to see detection in action.
                  </p>
                </div>
              ) : (
                <div className="mt-3 flex items-start gap-2 rounded-md border border-bad-900 bg-bad-950/50 p-3">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-bad-400" />
                  <p className="text-xs leading-relaxed text-bad-200/90">
                    Fail-closed: at least one check failed, so the receipt cannot be trusted. The verdict is{' '}
                    <span className="font-mono font-semibold">EVIDENCE TAMPERED</span>.
                  </p>
                </div>
              )}

              {verificationResult.tamperErrors.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-line-700/60 pt-3">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
                    Verifier error trace
                  </p>
                  {verificationResult.tamperErrors.map((err, idx) => (
                    <p key={idx} className="break-words rounded border border-bad-900/70 bg-bad-950/40 p-2 font-mono text-[11px] leading-relaxed text-bad-300">
                      [{idx + 1}] {err}
                    </p>
                  ))}
                </div>
              )}
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
};
