import React, { useState, useEffect } from 'react';
import { AlertOctagon, RefreshCcw, CheckCircle2, AlertTriangle, FileCode2, Edit3, XCircle, Shield } from 'lucide-react';
import type { CooLReceipt, VerificationCheckResult } from '../cool/types';
import { evidenceService } from '../services/evidenceService';

export const TamperLabTab: React.FC = () => {
  const [originalReceipt, setOriginalReceipt] = useState<CooLReceipt | null>(null);
  const [editedReceipt, setEditedReceipt] = useState<CooLReceipt | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationCheckResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTamperMode, setActiveTamperMode] = useState<string>('NONE');

  useEffect(() => {
    const init = async () => {
      const demo = await evidenceService.seedDemoIfEmpty();
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
      const simulatedInput = mode === 'INCOME_ALTERED'
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

  if (!editedReceipt || !verificationResult) return null;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold tracking-wider text-rose-400 uppercase mb-1">
            DIGITAL FORENSICS LAB
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 font-sans">
            <AlertOctagon className="h-7 w-7 text-rose-400" />
            <span>Interactive Tamper & Cryptographic Verification Lab</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Target Record: <code className="text-cyan-300">Synthetic Applicant #8842 (Sarah Chen)</code> | Model: <code className="text-slate-300">CreditRisk-v3</code>
          </p>
        </div>

        {/* RESTORE ORIGINAL BUTTON */}
        <button
          onClick={handleRestoreOriginal}
          className="flex items-center space-x-2 rounded-2xl border border-emerald-500/50 bg-emerald-950/60 px-5 py-3 text-xs font-black text-emerald-300 hover:bg-emerald-900/80 transition-all shadow-lg shadow-emerald-950/40 uppercase font-mono"
        >
          <RefreshCcw className="h-4 w-4" />
          <span>Restore Original</span>
        </button>
      </div>

      {/* CORE JUDGE PROOF STATEMENT BANNER */}
      <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-slate-950 via-amber-950/30 to-slate-950 p-4 font-mono text-xs text-amber-200 flex items-start space-x-3 shadow-lg">
        <Shield className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white font-bold block mb-0.5">CORE CRYPTOGRAPHIC AUDIT PRINCIPLE:</strong>
          "The AI decision may still be right or wrong. What we prove is whether the evidence describing what happened has been altered."
        </div>
      </div>

      {/* Attack Scenario Selection Bar */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
          <Edit3 className="h-4 w-4 text-amber-400" />
          <span>Select Attack Scenario to Trigger "TAMPER WITH EVIDENCE":</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <button
            onClick={() => applyTamper('DECISION_FLIPPED')}
            className={`p-4 rounded-2xl border text-left font-mono transition-all ${
              activeTamperMode === 'DECISION_FLIPPED'
                ? 'border-rose-500 bg-rose-950/70 text-white shadow-lg shadow-rose-950/50 ring-1 ring-rose-500'
                : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-rose-400 mb-1">1. Flip Decision Outcome</div>
            <div className="text-[11px] text-slate-400">Change outcome APPROVED → REJECTED</div>
          </button>

          <button
            onClick={() => applyTamper('INCOME_ALTERED')}
            className={`p-4 rounded-2xl border text-left font-mono transition-all ${
              activeTamperMode === 'INCOME_ALTERED'
                ? 'border-rose-500 bg-rose-950/70 text-white shadow-lg shadow-rose-950/50 ring-1 ring-rose-500'
                : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-rose-400 mb-1">2. Alter Input Parameters</div>
            <div className="text-[11px] text-slate-400">Mutate income ($145k → $15k)</div>
          </button>

          <button
            onClick={() => applyTamper('SIGNATURE_FORGED')}
            className={`p-4 rounded-2xl border text-left font-mono transition-all ${
              activeTamperMode === 'SIGNATURE_FORGED'
                ? 'border-rose-500 bg-rose-950/70 text-white shadow-lg shadow-rose-950/50 ring-1 ring-rose-500'
                : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-rose-400 mb-1">3. Corrupt Ed25519 Sig</div>
            <div className="text-[11px] text-slate-400">Forge institutional key signature</div>
          </button>

          <button
            onClick={() => applyTamper('MERKLE_ROOT_ALTERED')}
            className={`p-4 rounded-2xl border text-left font-mono transition-all ${
              activeTamperMode === 'MERKLE_ROOT_ALTERED'
                ? 'border-rose-500 bg-rose-950/70 text-white shadow-lg shadow-rose-950/50 ring-1 ring-rose-500'
                : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-rose-400 mb-1">4. Mutate Merkle Root</div>
            <div className="text-[11px] text-slate-400">Alter RFC 6962 tree root hash</div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Payload State & Manual Controls */}
        <div className="lg:col-span-6 space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm">
              <FileCode2 className="h-4 w-4 text-cyan-400" />
              <span>Evidence Receipt Payload State</span>
            </h3>
            {activeTamperMode !== 'NONE' ? (
              <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950 px-3 py-1 rounded-full border border-rose-800">
                TAMPERED ({activeTamperMode})
              </span>
            ) : (
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                AUTHENTIC ORIGINAL RECEIPT
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">DECISION OUTCOME</label>
              <select
                value={editedReceipt.decision}
                onChange={(e) => {
                  setEditedReceipt({ ...editedReceipt, decision: e.target.value as any });
                  setActiveTamperMode('MANUAL_EDIT');
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
              >
                <option value="APPROVED">APPROVED</option>
                <option value="MANUAL_REVIEW">MANUAL_REVIEW</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">SALTED STATE COMMITMENT HASH</label>
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
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-cyan-300 font-mono text-[11px] focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">ED25519 SIGNATURE STRING</label>
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
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-300 font-mono text-[11px] focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">RFC 6962 MERKLE ROOT</label>
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
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-cyan-300 font-mono text-[11px] focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* TAMPER WITH EVIDENCE ACTION BUTTON */}
          <button
            onClick={() => applyTamper(activeTamperMode === 'NONE' ? 'DECISION_FLIPPED' : activeTamperMode)}
            disabled={isVerifying}
            className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 px-6 py-4 font-black text-white shadow-xl shadow-rose-950/40 transition-all hover:scale-[1.01] uppercase font-mono text-sm tracking-wide"
          >
            <AlertOctagon className="h-5 w-5 shrink-0 text-white" />
            <span>TAMPER WITH EVIDENCE & RUN VERIFICATION</span>
          </button>
        </div>

        {/* Right Column: Real Verification Failure / Success Output */}
        <div className="lg:col-span-6 space-y-6">
          <div className={`rounded-3xl border p-6 space-y-5 shadow-2xl ${
            verificationResult.isUnforged
              ? 'border-emerald-500/50 bg-emerald-950/30'
              : 'border-rose-500/60 bg-rose-950/40'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {verificationResult.isUnforged ? (
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="h-10 w-10 text-rose-400 shrink-0" />
                )}
                <div>
                  <div className="text-xs uppercase font-mono tracking-wider text-slate-400">
                    {verificationResult.isUnforged ? 'ORIGINAL RECEIPT' : 'EVIDENCE TAMPERED'}
                  </div>
                  <div className={`text-2xl font-black font-mono tracking-tight ${
                    verificationResult.isUnforged ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {verificationResult.isUnforged ? 'ORIGINAL: ✓ VERIFIED' : 'EVIDENCE TAMPERED'}
                  </div>
                </div>
              </div>

              <div className="text-right font-mono text-xs">
                <span className="text-slate-400">API Calls:</span> <span className="text-cyan-300 font-bold">0</span>
              </div>
            </div>

            {/* TAMPER FAILURE BADGES REQUIRED BY SPEC */}
            {!verificationResult.isUnforged && (
              <div className="space-y-2 border-t border-rose-900/60 pt-4 font-mono text-xs">
                <div className="flex items-center space-x-2 text-rose-400 font-bold">
                  <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>✗ Verification failed</span>
                </div>
                <div className="flex items-center space-x-2 text-rose-400 font-bold">
                  <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>✗ Commitment mismatch / signature mismatch</span>
                </div>
                <div className="flex items-center space-x-2 text-rose-400 font-bold">
                  <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>✗ Receipt cannot be trusted</span>
                </div>
              </div>
            )}

            {/* Individual Checks Breakdown */}
            <div className="space-y-2 border-t border-slate-800/80 pt-3 font-mono text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Hybrid Key Signatures:</span>
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
            </div>
          </div>

          {/* Verification Trace Log */}
          {verificationResult.tamperErrors.length > 0 && (
            <div className="rounded-3xl border border-rose-500/40 bg-slate-950 p-5 space-y-3">
              <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs font-bold">
                <AlertTriangle className="h-4 w-4" />
                <span>Real Verification Error Trace Origin:</span>
              </div>
              <ul className="space-y-2 font-mono text-xs text-rose-300/90 leading-relaxed">
                {verificationResult.tamperErrors.map((err, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-rose-950/50 p-3 rounded-xl border border-rose-900/50">
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
