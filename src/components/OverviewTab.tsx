import React from 'react';
import { ShieldCheck, Cpu, ArrowRight, Lock, CheckCircle2, XCircle, Terminal, Key, ShieldAlert, Database, Scale, FileText } from 'lucide-react';
import type { TabType } from './Header';

interface OverviewTabProps {
  onStartDemo: () => void;
  setActiveTab: (tab: TabType) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ setActiveTab }) => {
  return (
    <div className="space-y-10 pb-16">
      {/* HERO SECTION — PRIMARY MESSAGE */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center space-x-2 rounded-full bg-cyan-950/90 px-3.5 py-1.5 font-mono text-xs font-bold text-cyan-300 border border-cyan-700/60 shadow-inner">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span>AI GOVERNANCE + DIGITAL FORENSICS + CRYPTOGRAPHIC AUDIT</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight font-sans">
            AI decisions can be disputed later.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent block mt-1">
              CooL creates cryptographically verifiable evidence at decision time.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl font-normal">
            Designed for banks, NBFCs, insurers, regulators, and enterprise AI teams requiring non-repudiable audit trails under EU AI Act Art. 12 and DPDP standards.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => setActiveTab('simulator')}
              className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 font-bold text-white shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02] hover:shadow-cyan-500/40 text-sm"
            >
              <Cpu className="h-5 w-5" />
              <span>RUN AI DECISION (Console)</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setActiveTab('receipt')}
              className="flex items-center space-x-2 rounded-2xl border border-cyan-500/40 bg-slate-900/80 px-6 py-3.5 font-bold text-cyan-300 transition-all hover:bg-slate-800 hover:border-cyan-400 text-sm"
            >
              <FileText className="h-5 w-5 text-emerald-400" />
              <span>Inspect Evidence Receipt</span>
            </button>

            <button
              onClick={() => setActiveTab('tamper')}
              className="flex items-center space-x-2 rounded-2xl border border-rose-500/40 bg-rose-950/30 px-6 py-3.5 font-bold text-rose-300 transition-all hover:bg-rose-900/50 hover:border-rose-400 text-sm"
            >
              <ShieldAlert className="h-5 w-5 text-rose-400" />
              <span>Test Tamper Lab</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-STEP HERO NARRATIVE (30-SECOND JUDGE UNDERSTANDING) */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="h-7 w-1 bg-cyan-400 rounded-full" />
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            How CooL Works in 30 Seconds
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* STEP 1 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-3 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800/60">
                STEP 1
              </span>
              <Cpu className="h-6 w-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white">AI MAKES DECISION</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Autonomous credit model evaluates synthetic applicant data and generates underwriting decision output (`APPROVED`, `REJECTED`, or `MANUAL_REVIEW`).
            </p>
          </div>

          {/* STEP 2 */}
          <div className="rounded-2xl border border-cyan-500/40 bg-slate-900/90 p-6 space-y-3 relative overflow-hidden group shadow-lg shadow-cyan-950/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800/60">
                STEP 2 (COOL BOUNDARY)
              </span>
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">COOL CREATES EVIDENCE</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              CooL commits salted PII hashes, attaches Ed25519 & ML-DSA-65 post-quantum signatures, Phala dstack TEE enclave quote, and RFC 6962 transparency log.
            </p>
          </div>

          {/* STEP 3 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-3 relative overflow-hidden group hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950 px-2.5 py-1 rounded border border-blue-800/60">
                STEP 3
              </span>
              <Terminal className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white">AUDITOR VERIFIES IT LATER</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Regulators or court auditors run `cool verify` 100% offline with zero API calls. Any post-hoc parameter or decision tampering is instantly detected.
            </p>
          </div>
        </div>
      </div>

      {/* WHY COOL? / WHY NOT NORMAL LOGS? COMPARATIVE MATRIX */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="h-7 w-1 bg-amber-400 rounded-full" />
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Why CooL? (Why Not Normal Logs?)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Normal Logs */}
          <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <XCircle className="h-6 w-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Standard Application Database Logs</h3>
            </div>
            <ul className="space-y-3 text-xs text-slate-300 font-mono">
              <li className="flex items-start gap-2 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/40">
                <span className="text-rose-400 font-bold">✗ EDITABLE:</span>
                <span>Database administrators or malicious actors can alter historical records retroactively.</span>
              </li>
              <li className="flex items-start gap-2 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/40">
                <span className="text-rose-400 font-bold">✗ CENTRALIZED:</span>
                <span>Relies entirely on operator infrastructure trust. Logs can be backdated or purged.</span>
              </li>
              <li className="flex items-start gap-2 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/40">
                <span className="text-rose-400 font-bold">✗ HARD TO PROVE:</span>
                <span>Courts and regulators cannot independently verify if logs reflect decision-time reality.</span>
              </li>
              <li className="flex items-start gap-2 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/40">
                <span className="text-rose-400 font-bold">✗ PII RISKS:</span>
                <span>Raw customer inputs stored in database logs risk GDPR and DPDP compliance violations.</span>
              </li>
            </ul>
          </div>

          {/* CooL Protected Evidence */}
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 space-y-4 shadow-xl shadow-emerald-950/20">
            <div className="flex items-center space-x-3 text-emerald-400">
              <CheckCircle2 className="h-6 w-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">CooL-Protected Cryptographic Evidence</h3>
            </div>
            <ul className="space-y-3 text-xs text-slate-300 font-mono">
              <li className="flex items-start gap-2 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/40">
                <span className="text-emerald-400 font-bold">✓ CRYPTOGRAPHICALLY VERIFIABLE:</span>
                <span>100% offline verifier protocol (`cool verify`) requiring 0 vendor API calls.</span>
              </li>
              <li className="flex items-start gap-2 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/40">
                <span className="text-emerald-400 font-bold">✓ TAMPER EVIDENT:</span>
                <span>Any change to decision or parameters invalidates hybrid signatures and Merkle root proofs.</span>
              </li>
              <li className="flex items-start gap-2 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/40">
                <span className="text-emerald-400 font-bold">✓ CREATED AT DECISION TIME:</span>
                <span>Sealed at the exact moment of execution inside Phala Network dstack TEE hardware enclave.</span>
              </li>
              <li className="flex items-start gap-2 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/40">
                <span className="text-emerald-400 font-bold">✓ SEALED PII COMMITMENT:</span>
                <span>Salted SHA-256 state commitments prove content without exposing raw customer PII.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* COOL TECHNICAL PRIMITIVES */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="h-7 w-1 bg-blue-500 rounded-full" />
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Supported Cryptographic Primitives
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <Lock className="h-4 w-4" />
              <span>Salted PII Commitments</span>
            </div>
            <p className="text-slate-400 text-[11px] font-sans">Salted SHA-256 hashes sealing inputs and outputs offline.</p>
            <div className="text-[10px] text-slate-500">src/cool/hash.ts</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <Key className="h-4 w-4" />
              <span>Hybrid Classical & PQ Sigs</span>
            </div>
            <p className="text-slate-400 text-[11px] font-sans">Dual Ed25519 & ML-DSA-65 (Dilithium FIPS 204) signatures.</p>
            <div className="text-[10px] text-slate-500">src/cool/sign.ts</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>Phala dstack TEE Enclave</span>
            </div>
            <p className="text-slate-400 text-[11px] font-sans">Hardware-rooted execution quote attestation.</p>
            <div className="text-[10px] text-slate-500">src/cool/phala/dstack.ts</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <Database className="h-4 w-4" />
              <span>RFC 6962 Transparency Log</span>
            </div>
            <p className="text-slate-400 text-[11px] font-sans">Append-only Merkle tree inclusion proofs.</p>
            <div className="text-[10px] text-slate-500">src/cool/phala/log.ts</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <Terminal className="h-4 w-4" />
              <span>100% Offline Verifier</span>
            </div>
            <p className="text-slate-400 text-[11px] font-sans">Fail-closed evaluation requiring 0 vendor API calls.</p>
            <div className="text-[10px] text-cyan-400">src/cool/verify.ts</div>
          </div>

          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-5 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <Scale className="h-4 w-4" />
              <span>Regulatory Compliance</span>
            </div>
            <p className="text-slate-300 text-[11px] font-sans">Satisfies EU AI Act Art. 12 & DPDP non-repudiation.</p>
            <div className="text-[10px] text-cyan-300">docs/LEGAL_DISCLAIMER.md</div>
          </div>
        </div>
      </div>
    </div>
  );
};
