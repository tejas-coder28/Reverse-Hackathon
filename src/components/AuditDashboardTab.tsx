import React, { useState, useEffect } from 'react';
import { Database, Search, Filter, Download, Code, CheckCircle2, AlertOctagon, RefreshCw, Check, X } from 'lucide-react';
import type { CooLReceipt, VerificationCheckResult } from '../cool/types';
import { evidenceService } from '../services/evidenceService';

interface AuditDashboardTabProps {
  onInspectReceipt: (receipt: CooLReceipt) => void;
}

export const AuditDashboardTab: React.FC<AuditDashboardTabProps> = ({ onInspectReceipt }) => {
  const [receipts, setReceipts] = useState<CooLReceipt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDecision, setFilterDecision] = useState<string>('ALL');
  const [verificationMap, setVerificationMap] = useState<Record<string, VerificationCheckResult>>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const loadData = () => {
    const list = evidenceService.getAllReceipts();
    setReceipts(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const runAllVerifications = async () => {
      const map: Record<string, VerificationCheckResult> = {};
      for (const r of receipts) {
        map[r.decisionId] = await evidenceService.verifyOffline(r);
      }
      setVerificationMap(map);
    };
    if (receipts.length > 0) {
      runAllVerifications();
    }
  }, [receipts]);

  const handleVerifySingle = async (receipt: CooLReceipt) => {
    setVerifyingId(receipt.decisionId);
    setTimeout(async () => {
      const res = await evidenceService.verifyOffline(receipt);
      setVerificationMap((prev) => ({ ...prev, [receipt.decisionId]: res }));
      setVerifyingId(null);
    }, 300);
  };

  const filteredReceipts = receipts.filter((r) => {
    const matchesSearch =
      r.applicantId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.decisionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterDecision === 'ALL' || r.decision === filterDecision;
    return matchesSearch && matchesFilter;
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(receipts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cool_decision_ledger_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase mb-1">
            FLOW 2 — AUDIT
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="h-6 w-6 text-cyan-400" />
            <span>Institutional AI Decision Audit Ledger</span>
          </h2>
          <p className="text-xs text-slate-400">
            Immutable RFC 6962 Transparency Log & Offline Verification Ledger ({receipts.length} Decisions Logged)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:scale-[1.02] transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Export Evidence Ledger (JSON)</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search Applicant or Decision ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400">Filter Decision:</span>
          <select
            value={filterDecision}
            onChange={(e) => setFilterDecision(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
          >
            <option value="ALL">ALL DECISIONS</option>
            <option value="APPROVED">APPROVED</option>
            <option value="MANUAL_REVIEW">MANUAL_REVIEW</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950 font-mono text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3.5">Decision ID & Applicant</th>
                <th className="px-4 py-3.5">AI Decision</th>
                <th className="px-4 py-3.5">Salted PII Commitment</th>
                <th className="px-4 py-3.5">Individual Verification Checks</th>
                <th className="px-4 py-3.5">Overall Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredReceipts.length > 0 ? (
                filteredReceipts.map((r) => {
                  const verification = verificationMap[r.decisionId];
                  const isVerifying = verifyingId === r.decisionId;

                  return (
                    <tr key={r.decisionId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-4 space-y-0.5">
                        <div className="font-bold text-white text-xs">{r.applicantId}</div>
                        <div className="text-[11px] text-cyan-400">{r.decisionId}</div>
                        <div className="text-[10px] text-slate-500">{new Date(r.timestamp).toLocaleString()}</div>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          r.decision === 'APPROVED' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' :
                          r.decision === 'MANUAL_REVIEW' ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60' :
                          'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                        }`}>
                          {r.decision}
                        </span>
                      </td>

                      <td className="px-4 py-4 max-w-[180px]">
                        <div className="text-[11px] text-cyan-300 truncate">
                          {r.privacyCommitment.combinedStateHash}
                        </div>
                        <div className="text-[10px] text-slate-500">Salt: {r.privacyCommitment.salt.substring(0, 10)}...</div>
                      </td>

                      {/* Individual Verification Checks Breakdown */}
                      <td className="px-4 py-4 space-y-1 text-[10px]">
                        {verification ? (
                          <>
                            <div className="flex items-center space-x-1">
                              {verification.signatureValid ? <Check className="h-3 w-3 text-emerald-400" /> : <X className="h-3 w-3 text-rose-400" />}
                              <span className={verification.signatureValid ? 'text-slate-300' : 'text-rose-400 font-bold'}>
                                Hybrid Sigs (Ed25519/ML-DSA-65)
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {verification.transparencyLogValid ? <Check className="h-3 w-3 text-emerald-400" /> : <X className="h-3 w-3 text-rose-400" />}
                              <span className={verification.transparencyLogValid ? 'text-slate-300' : 'text-rose-400 font-bold'}>
                                Merkle Log (RFC 6962)
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {verification.teeAttestationValid ? <Check className="h-3 w-3 text-emerald-400" /> : <X className="h-3 w-3 text-rose-400" />}
                              <span className={verification.teeAttestationValid ? 'text-slate-300' : 'text-rose-400 font-bold'}>
                                TEE dstack Quote
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-500">Evaluating checks...</span>
                        )}
                      </td>

                      {/* Overall Status */}
                      <td className="px-4 py-4">
                        {isVerifying ? (
                          <div className="flex items-center space-x-1.5 text-cyan-400">
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                            <span>Verifying...</span>
                          </div>
                        ) : verification ? (
                          verification.isUnforged ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" /> UNFORGED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-rose-950/80 border border-rose-800/60 px-2 py-0.5 text-[11px] font-semibold text-rose-400">
                              <AlertOctagon className="h-3.5 w-3.5" /> TAMPERED
                            </span>
                          )
                        ) : (
                          <span className="text-slate-500">Pending</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleVerifySingle(r)}
                          className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 border border-slate-700"
                        >
                          cool verify
                        </button>
                        <button
                          onClick={() => onInspectReceipt(r)}
                          className="rounded-lg bg-cyan-950 hover:bg-cyan-900 px-2.5 py-1 text-[11px] font-semibold text-cyan-400 border border-cyan-800/60"
                        >
                          <Code className="h-3.5 w-3.5 inline mr-1" /> Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-sans">
                    No decision receipts match search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
