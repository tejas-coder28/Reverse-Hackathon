import React, { useState, useEffect } from 'react';
import { AlertOctagon, RefreshCcw, CheckCircle2, Terminal, AlertTriangle, FileCode2, Edit3 } from 'lucide-react';
import type { CooLReceipt, VerificationCheckResult } from '../cool/types';
import { evidenceService } from '../services/evidenceService';

export const TamperLabTab: React.FC = () => {
  const [originalReceipt, setOriginalReceipt] = useState<CooLReceipt | null>(null);
  const [editedReceipt, setEditedReceipt] = useState<CooLReceipt | null>(null);
  const [simulatedIncome, setSimulatedIncome] = useState<number>(145000);
  const [verificationResult, setVerificationResult] = useState<VerificationCheckResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTamperMode, setActiveTamperMode] = useState<string>('NONE');

  useEffect(() => {
    const init = async () => {
      const demo = await evidenceService.seedDemoIfEmpty();
      setOriginalReceipt(demo);
      setEditedReceipt(JSON.parse(JSON.stringify(demo)));
      setSimulatedIncome(145000);
      const res = await evidenceService.verifyOffline(demo);
      setVerificationResult(res);
      setActiveTamperMode('NONE');
    };
    init();
  }, []);

  const handleRunVerify = async () => {
    if (!editedReceipt) return;
    setIsVerifying(true);
    setTimeout(async () => {
      const simulatedInput = activeTamperMode === 'INCOME_ALTERED'
        ? {
            applicantId: editedReceipt.applicantId,
            name: editedReceipt.applicantId,
            annualIncome: simulatedIncome,
            existingDebt: 12000,
            creditScore: 785,
            loanAmountRequested: 35000,
            collateralValue: 85000,
            employmentYears: 6.5,
          }
        : undefined;

      // Execute actual CooL verification protocol
      const res = await evidenceService.verifyOffline(editedReceipt, simulatedInput);
      setVerificationResult(res);
      setIsVerifying(false);
    }, 400);
  };

  const handleResetToAuthentic = async () => {
    if (!originalReceipt) return;
    const reset = JSON.parse(JSON.stringify(originalReceipt));
    setEditedReceipt(reset);
    setSimulatedIncome(145000);
    setActiveTamperMode('NONE');
    const res = await evidenceService.verifyOffline(reset);
    setVerificationResult(res);
  };

  const applyTamperDecision = () => {
    if (!editedReceipt) return;
    const tampered = JSON.parse(JSON.stringify(editedReceipt));
    tampered.decision = tampered.decision === 'APPROVED' ? 'REJECTED' : 'APPROVED';
    setEditedReceipt(tampered);
    setActiveTamperMode('DECISION_FLIPPED');
  };

  const applyTamperIncome = () => {
    if (!editedReceipt) return;
    setSimulatedIncome(15000);
    setActiveTamperMode('INCOME_ALTERED');
  };

  const applyTamperSignature = () => {
    if (!editedReceipt) return;
    const tampered = JSON.parse(JSON.stringify(editedReceipt));
    tampered.signatures.ed25519.signature = 'ed25519_sig_BAD_FORGED_SIGNATURE_99999999';
    setEditedReceipt(tampered);
    setActiveTamperMode('SIGNATURE_FORGED');
  };

  const applyTamperMerkleRoot = () => {
    if (!editedReceipt) return;
    const tampered = JSON.parse(JSON.stringify(editedReceipt));
    tampered.transparencyLog.merkleRoot = '0xBAD000000000000000000000000000000000000000000000000000000000DEAD';
    setEditedReceipt(tampered);
    setActiveTamperMode('MERKLE_ROOT_ALTERED');
  };

  if (!editedReceipt || !verificationResult) return null;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold tracking-wider text-rose-400 uppercase mb-1">
            FLOW 3 — TAMPER & CRYPTOGRAPHIC VERIFICATION
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertOctagon className="h-6 w-6 text-rose-400" />
            <span>Interactive Tamper & Cryptographic Verification Lab</span>
          </h2>
          <p className="text-xs text-slate-400">
            Target Record: <code className="font-mono text-cyan-300">Synthetic Applicant #8842 (Sarah Chen)</code> | Model: <code className="font-mono text-slate-300">CreditRisk-v3</code>
          </p>
        </div>

        <button
          onClick={handleResetToAuthentic}
          className="flex items-center space-x-2 rounded-xl border border-emerald-500/50 bg-emerald-950/40 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 transition-all"
        >
          <RefreshCcw className="h-4 w-4" />
          <span>Reset to Authentic Original Receipt</span>
        </button>
      </div>

      {/* Attack Scenario Selectors */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
          <Edit3 className="h-4 w-4 text-amber-400" />
          <span>Select Attack / Tamper Scenario to Test Offline Verifier Engine:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <button
            onClick={applyTamperDecision}
            className={`p-3 rounded-xl border text-left font-mono transition-all ${
              activeTamperMode === 'DECISION_FLIPPED'
                ? 'border-rose-500 bg-rose-950/50 text-white shadow-lg shadow-rose-950/40'
                : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-rose-400 mb-1">1. Flip Decision Outcome</div>
            <div className="text-[11px] text-slate-400">Change outcome from APPROVED to REJECTED</div>
          </button>

          <button
            onClick={applyTamperIncome}
            className={`p-3 rounded-xl border text-left font-mono transition-all ${
              activeTamperMode === 'INCOME_ALTERED'
                ? 'border-rose-500 bg-rose-950/50 text-white shadow-lg shadow-rose-950/40'
                : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-rose-400 mb-1">2. Alter Input Parameters</div>
            <div className="text-[11px] text-slate-400">Change Annual Income ($145k → $15k)</div>
          </button>

          <button
            onClick={applyTamperSignature}
            className={`p-3 rounded-xl border text-left font-mono transition-all ${
              activeTamperMode === 'SIGNATURE_FORGED'
                ? 'border-rose-500 bg-rose-950/50 text-white shadow-lg shadow-rose-950/40'
                : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-rose-400 mb-1">3. Corrupt Ed25519 Sig</div>
            <div className="text-[11px] text-slate-400">Forge institutional key signature string</div>
          </button>

          <button
            onClick={applyTamperMerkleRoot}
            className={`p-3 rounded-xl border text-left font-mono transition-all ${
              activeTamperMode === 'MERKLE_ROOT_ALTERED'
                ? 'border-rose-500 bg-rose-950/50 text-white shadow-lg shadow-rose-950/40'
                : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-rose-400 mb-1">4. Alter Merkle Tree Root</div>
            <div className="text-[11px] text-slate-400">Mutate RFC 6962 tree root hash</div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Editable Receipt Payload */}
        <div className="lg:col-span-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
              <FileCode2 className="h-4 w-4 text-cyan-400" />
              <span>Evidence Receipt Payload State</span>
            </h3>
            {activeTamperMode !== 'NONE' ? (
              <span className="font-mono text-xs text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                MUTATED ({activeTamperMode})
              </span>
            ) : (
              <span className="font-mono text-xs text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                AUTHENTIC ORIGINAL RECEIPT
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Decision Outcome</label>
              <select
                value={editedReceipt.decision}
                onChange={(e) => {
                  setEditedReceipt({ ...editedReceipt, decision: e.target.value as any });
                  setActiveTamperMode('MANUAL_EDIT');
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
              >
                <option value="APPROVED">APPROVED</option>
                <option value="MANUAL_REVIEW">MANUAL_REVIEW</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            {activeTamperMode === 'INCOME_ALTERED' && (
              <div>
                <label className="block text-rose-400 mb-1">Simulated Applicant Income ($)</label>
                <input
                  type="number"
                  value={simulatedIncome}
                  onChange={(e) => setSimulatedIncome(Number(e.target.value))}
                  className="w-full rounded-lg border border-rose-700 bg-rose-950/60 px-3 py-2 text-rose-200 font-mono focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-400 mb-1">Salted State Commitment Hash</label>
              <input
                type="text"
                value={editedReceipt.privacyCommitment.combinedStateHash}
                onChange={(e) => {
                  setEditedReceipt({
                    ...editedReceipt,
                    privacyCommitment: { ...editedReceipt.privacyCommitment, combinedStateHash: e.target.value },
                  });
                  setActiveTamperMode('MANUAL_EDIT');
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-cyan-300 font-mono text-[11px] focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Ed25519 Signature String</label>
              <input
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
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-300 font-mono text-[11px] focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">RFC 6962 Merkle Root</label>
              <input
                type="text"
                value={editedReceipt.transparencyLog.merkleRoot}
                onChange={(e) => {
                  setEditedReceipt({
                    ...editedReceipt,
                    transparencyLog: { ...editedReceipt.transparencyLog, merkleRoot: e.target.value },
                  });
                  setActiveTamperMode('MANUAL_EDIT');
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-cyan-300 font-mono text-[11px] focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleRunVerify}
            disabled={isVerifying}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Running cool verify offline protocol...</span>
              </>
            ) : (
              <>
                <Terminal className="h-4 w-4" />
                <span>Run Offline Verifier (cool verify receipt.json)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Verification Results & FLOW 3 Badges */}
        <div className="lg:col-span-6 space-y-6">
          {/* FLOW 3 REQUIREMENT: Show ORIGINAL ✓ VERIFIED vs TAMPERED ✗ VERIFICATION FAILED */}
          <div className={`rounded-2xl border p-6 space-y-4 shadow-2xl ${
            verificationResult.isUnforged
              ? 'border-emerald-500/40 bg-emerald-950/20'
              : 'border-rose-500/40 bg-rose-950/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {verificationResult.isUnforged ? (
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 shrink-0" />
                ) : (
                  <AlertOctagon className="h-10 w-10 text-rose-400 shrink-0" />
                )}
                <div>
                  <div className="text-xs uppercase font-mono tracking-wider text-slate-400">
                    {activeTamperMode === 'NONE' ? 'ORIGINAL RECEIPT VERDICT' : 'TAMPERED RECEIPT VERDICT'}
                  </div>
                  <div className={`text-2xl font-black font-mono tracking-tight ${
                    verificationResult.isUnforged ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {verificationResult.isUnforged ? 'ORIGINAL: ✓ VERIFIED' : 'TAMPERED: ✗ VERIFICATION FAILED'}
                  </div>
                </div>
              </div>

              <div className="text-right font-mono text-xs">
                <span className="text-slate-400">API Calls:</span> <span className="text-cyan-300 font-bold">0</span>
                <br />
                <span className="text-slate-400">PII Exposed:</span> <span className="text-cyan-300 font-bold">0</span>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-4 font-mono text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Cryptographic Signatures:</span>
                <span className={verificationResult.signatureValid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {verificationResult.details.signatureDetail}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">RFC 6962 Merkle Tree Log:</span>
                <span className={verificationResult.transparencyLogValid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {verificationResult.details.transparencyLogDetail}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Salted Hash Commitment:</span>
                <span className={verificationResult.hashCommitmentValid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {verificationResult.details.hashCommitmentDetail}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">TEE dstack Enclave Quote:</span>
                <span className={verificationResult.teeAttestationValid ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                  {verificationResult.details.teeAttestationDetail}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 text-slate-500">
                <span>Model Correctness / Bias:</span>
                <span className="text-slate-400 font-bold">OUT OF SCOPE (not claimed)</span>
              </div>
            </div>
          </div>

          {/* Verification Trace Errors */}
          {verificationResult.tamperErrors.length > 0 && (
            <div className="rounded-2xl border border-rose-500/40 bg-slate-950 p-5 space-y-3">
              <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs font-bold">
                <AlertTriangle className="h-4 w-4" />
                <span>Real Verification Failure Origin Trace:</span>
              </div>
              <ul className="space-y-2 font-mono text-xs text-rose-300/90 leading-relaxed">
                {verificationResult.tamperErrors.map((err, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/50">
                    <span className="text-rose-400 font-bold">[{idx + 1}]</span>
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
