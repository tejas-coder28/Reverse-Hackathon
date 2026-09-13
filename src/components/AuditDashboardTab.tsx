import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Search } from 'lucide-react';
import type { CooLReceipt, VerificationCheckResult } from '../evidence/types';
import { evidenceService } from '../services/evidenceService';
import { Button, Panel, StatusBadge, SectionHeader } from './ui/primitives';
import { DataTable, type DataTableColumn } from './ui/DataTable';
import { decisionTone, formatClock, shortHash } from './ui/format';

interface AuditDashboardTabProps {
  onInspectReceipt: (receipt: CooLReceipt) => void;
}

type LedgerRow = CooLReceipt & { id: string };

export const AuditDashboardTab: React.FC<AuditDashboardTabProps> = ({ onInspectReceipt }) => {
  const [receipts, setReceipts] = useState<LedgerRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDecision, setFilterDecision] = useState<string>('ALL');
  const [verificationMap, setVerificationMap] = useState<Record<string, VerificationCheckResult>>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const loadData = () => {
    const list = evidenceService.getAllReceipts();
    setReceipts(list.map((r) => ({ ...r, id: r.decisionId })));
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

  const verifiedCount = receipts.filter((r) => verificationMap[r.decisionId]?.isUnforged === true).length;
  const anomalyCount = receipts.filter(
    (r) => verificationMap[r.decisionId] && verificationMap[r.decisionId].isUnforged === false
  ).length;

  const columns: Array<DataTableColumn<LedgerRow>> = [
    {
      key: 'receipt',
      header: 'Receipt ID',
      render: (r) => (
        <div className="min-w-0">
          <div className="font-mono text-xs text-accent-300">{shortHash(r.decisionId, 12, 6)}</div>
          <div className="truncate font-mono text-[10px] text-ink-500">{r.applicantId}</div>
        </div>
      ),
    },
    { key: 'time', header: 'Time', render: (r) => <span className="font-mono text-ink-300">{formatClock(r.timestamp)}</span> },
    { key: 'model', header: 'Model', render: (r) => <span className="font-mono text-[11px] text-ink-200">{r.modelId} · {r.modelVersion}</span> },
    {
      key: 'decision',
      header: 'Decision',
      render: (r) => <StatusBadge tone={decisionTone(r.decision)}>{r.decision}</StatusBadge>,
    },
    {
      key: 'commitment',
      header: 'Commitment',
      render: (r) => (
        <span className="font-mono text-[11px] text-ink-300" title={r.privacyCommitment.combinedStateHash}>
          {shortHash(r.privacyCommitment.combinedStateHash, 8, 6)}
        </span>
      ),
    },
    {
      key: 'integrity',
      header: 'Integrity',
      render: (r) => {
        const verification = verificationMap[r.decisionId];
        if (verifyingId === r.decisionId) {
          return (
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-accent-300">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Verifying
            </span>
          );
        }
        if (!verification) {
          return <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">Pending</span>;
        }
        return verification.isUnforged ? (
          <StatusBadge tone="ok">Verified</StatusBadge>
        ) : (
          <StatusBadge tone="bad">Tampered</StatusBadge>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <div className="flex justify-end gap-1.5">
          <Button variant="ghost" onClick={() => handleVerifySingle(r)}>
            Verify
          </Button>
          <Button variant="ghost" onClick={() => onInspectReceipt(r)}>
            Open
          </Button>
          <Button variant="ghost" onClick={() => handleExportJSON()}>
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <SectionHeader
        eyebrow="Verification Console"
        title="Decision evidence ledger"
        description="Every consequential decision recorded in this session with its cryptographic evidence status. Verification recomputes all five checks offline."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="primary" onClick={handleExportJSON}>
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
          </div>
        }
      />

      {/* Summary strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Panel bodyClassName="p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-400">Receipts logged</span>
            <span className="font-mono text-2xl font-semibold text-ink-100">{receipts.length}</span>
          </div>
        </Panel>
        <Panel bodyClassName="p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-400">Verified authentic</span>
            <span className="font-mono text-2xl font-semibold text-ok-300">{verifiedCount}</span>
          </div>
        </Panel>
        <Panel bodyClassName="p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-400">Anomalies detected</span>
            <span className={`font-mono text-2xl font-semibold ${anomalyCount > 0 ? 'text-bad-300' : 'text-ink-100'}`}>
              {anomalyCount}
            </span>
          </div>
        </Panel>
        <Panel className="sm:col-span-3 border-line-700/60" bodyClassName="p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-500" />
              <input
                type="text"
                placeholder="Search applicant or receipt ID…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-400">Decision</span>
              <select
                value={filterDecision}
                onChange={(e) => setFilterDecision(e.target.value)}
                className="select w-44"
              >
                <option value="ALL">All decisions</option>
                <option value="APPROVED">Approved</option>
                <option value="MANUAL_REVIEW">Manual review</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Evidence ledger" meta={`${filteredReceipts.length} of ${receipts.length} receipts`} bodyClassName="p-0">
        <DataTable columns={columns} rows={filteredReceipts} emptyMessage="No receipts match the current search or filter." />
      </Panel>
    </div>
  );
};
