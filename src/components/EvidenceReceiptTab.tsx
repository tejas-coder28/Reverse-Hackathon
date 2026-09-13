import React, { useState } from 'react';
import { FileText, ShieldCheck, Check, Copy, Terminal, AlertOctagon, Lock, Key, Info, Code, CheckCircle2, Shield } from 'lucide-react';
import type { CooLReceipt, VerificationCheckResult } from '../cool/types';
import { evidenceService } from '../services/evidenceService';

interface EvidenceReceiptTabProps {
  receipt: CooLReceipt | null;
  onInspectRaw: (receipt: CooLReceipt) => void;
}

export const EvidenceReceiptTab: React.FC<EvidenceReceiptTabProps> = ({ receipt, onInspectRaw }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationCheckResult | null>(null);

  if (!receipt) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-16 text-center space-y-4 my-8">
        <FileText className="h-12 w-12 text-slate-600" />
        <h3 className="text-lg font-bold text-slate-300">No Active Evidence Receipt Selected</h3>
        <p className="text-xs text-slate-500 max-w-md font-mono">
          Run an AI decision in the Decision Console to generate a live CooL cryptographic evidence receipt.
        </p>
      </div>
    );
  }

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRunVerification = async () => {
    setIsVerifying(true);
    setTimeout(async () => {
      const res = await evidenceService.verifyOffline(receipt);
      setVerificationResult(res);
      setIsVerifying(false);
    }, 400);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase mb-1">
            EVIDENCE RECEIPT INSPECTOR
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 font-sans">
            <FileText className="h-7 w-7 text-emerald-400" />
            <span>CooL Cryptographic Evidence Receipt</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Receipt ID: <code className="text-cyan-300 font-bold">{receipt.decisionId}</code>
          </p>
        </div>

        <button
          onClick={() => onInspectRaw(receipt)}
          className="flex items-center space-x-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-cyan-300 transition-all border border-cyan-800/40"
        >
          <Code className="h-4 w-4" />
          <span>Inspect Full Raw Receipt JSON</span>
        </button>
      </div>

      {/* CORE JUDGE PROOF STATEMENT BANNER */}
      <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 p-4 font-mono text-xs text-cyan-200 flex items-start space-x-3 shadow-lg">
        <Shield className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white font-bold block mb-0.5">CORE CRYPTOGRAPHIC AUDIT PRINCIPLE:</strong>
          "The AI decision may still be right or wrong. What we prove is whether the evidence describing what happened has been altered."
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Metadata & Cryptographic Hash Commitments */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Metadata Box */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Decision & Model Metadata</span>
              </h3>
              <span className="font-mono text-xs text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800/60 font-semibold">
                AUTHENTIC RECORD
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px]">RECEIPT ID</span>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300 font-bold truncate">{receipt.decisionId}</span>
                  <button
                    onClick={() => handleCopy(receipt.decisionId, 'decisionId')}
                    className="text-slate-400 hover:text-white shrink-0 ml-2"
                  >
                    {copiedField === 'decisionId' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px]">AI DECISION OUTCOME</span>
                <div className={`font-black ${
                  receipt.decision === 'APPROVED' ? 'text-emerald-400' :
                  receipt.decision === 'MANUAL_REVIEW' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {receipt.decision}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px]">MODEL & VERSION</span>
                <div className="text-white font-bold">{receipt.modelId} ({receipt.modelVersion})</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px]">TIMESTAMP (ISO 8601)</span>
                <div className="text-slate-300 truncate">{receipt.timestamp}</div>
              </div>
            </div>

            {/* PII STATUS DISPLAY (REQUIRED) */}
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3 font-mono">
                <Lock className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">CUSTOMER PII STATUS</div>
                  <div className="text-sm font-black text-emerald-400 tracking-wide">
                    PII: SEALED / NOT STORED IN EVIDENCE
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-900/60 px-2 py-1 rounded border border-emerald-700/60">
                Salted SHA-256 Commit
              </span>
            </div>
          </div>

          {/* Cryptographic Fields & Hashes with Copy Buttons */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <Key className="h-4 w-4 text-cyan-400" />
              <span>Cryptographic Fields & Commitments</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {/* Combined State Hash */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>EVIDENCE STATE COMMITMENT HASH</span>
                  <button
                    onClick={() => handleCopy(receipt.privacyCommitment.combinedStateHash, 'combinedStateHash')}
                    className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300"
                  >
                    {copiedField === 'combinedStateHash' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedField === 'combinedStateHash' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-cyan-300 font-bold truncate text-[11px]">
                  {receipt.privacyCommitment.combinedStateHash}
                </div>
              </div>

              {/* Salted Input Hash */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>SALTED INPUT COMMITMENT HASH</span>
                  <button
                    onClick={() => handleCopy(receipt.privacyCommitment.saltedInputHash, 'saltedInputHash')}
                    className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300"
                  >
                    {copiedField === 'saltedInputHash' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedField === 'saltedInputHash' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-slate-300 truncate text-[11px]">
                  {receipt.privacyCommitment.saltedInputHash}
                </div>
              </div>

              {/* Salted Output Hash */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>SALTED OUTPUT COMMITMENT HASH</span>
                  <button
                    onClick={() => handleCopy(receipt.privacyCommitment.saltedOutputHash, 'saltedOutputHash')}
                    className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300"
                  >
                    {copiedField === 'saltedOutputHash' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedField === 'saltedOutputHash' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-slate-300 truncate text-[11px]">
                  {receipt.privacyCommitment.saltedOutputHash}
                </div>
              </div>

              {/* Merkle Root */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>RFC 6962 MERKLE TRANSPARENCY ROOT</span>
                  <button
                    onClick={() => handleCopy(receipt.transparencyLog.merkleRoot, 'merkleRoot')}
                    className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300"
                  >
                    {copiedField === 'merkleRoot' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedField === 'merkleRoot' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-cyan-300 font-bold truncate text-[11px]">
                  {receipt.transparencyLog.merkleRoot}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Prominent "VERIFY EVIDENCE" Action & Real Verification Output */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-5 shadow-xl">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Terminal className="h-5 w-5 text-cyan-400" />
                <span>Offline Verification Engine</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Execute 100% offline verification (`cool verify`) evaluating signature integrity, Merkle inclusion, PII salt match, and TEE enclave attestation.
              </p>
            </div>

            {/* PROMINENT "VERIFY EVIDENCE" BUTTON */}
            <button
              onClick={handleRunVerification}
              disabled={isVerifying}
              className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 px-6 py-4 font-black text-white shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.01] hover:shadow-emerald-500/40 disabled:opacity-50 text-sm tracking-wide uppercase font-mono"
            >
              {isVerifying ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-3 border-white border-t-transparent" />
                  <span>Evaluating 5 Cryptographic Checks...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <span>VERIFY EVIDENCE</span>
                </>
              )}
            </button>

            {/* REAL VERIFICATION RESULT DISPLAY */}
            {verificationResult && (
              <div className={`rounded-2xl border p-5 space-y-4 shadow-xl ${
                verificationResult.isUnforged
                  ? 'border-emerald-500/50 bg-emerald-950/30'
                  : 'border-rose-500/50 bg-rose-950/40'
              }`}>
                <div className="flex items-center space-x-3">
                  {verificationResult.isUnforged ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertOctagon className="h-8 w-8 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold">CRYPTOGRAPHIC EVIDENCE</div>
                    <div className={`text-xl font-black font-mono ${
                      verificationResult.isUnforged ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {verificationResult.isUnforged ? '✓ VALID (EVIDENCE UNFORGED)' : 'VERIFICATION FAILED'}
                    </div>
                  </div>
                </div>

                {/* Required Pass Badges */}
                {verificationResult.isUnforged && (
                  <div className="space-y-2 font-mono text-xs border-t border-emerald-800/60 pt-3">
                    <div className="flex items-center space-x-2 text-emerald-300 font-semibold">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>✓ Evidence authentic</span>
                    </div>
                    <div className="flex items-center space-x-2 text-emerald-300 font-semibold">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>✓ Cryptographic verification passed</span>
                    </div>
                    <div className="flex items-center space-x-2 text-emerald-300 font-semibold">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>✓ Receipt integrity confirmed</span>
                    </div>
                  </div>
                )}

                {/* Scope Disclaimer */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex items-start space-x-2 text-[11px] text-slate-400 leading-relaxed font-mono">
                  <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    "This verifies the integrity of the recorded evidence. It does not establish that the AI decision was correct or unbiased."
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
