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
      header: 'Exhibit ref',
      render: (r) => (
        <div className="min-w-0">
          <div className="text-xs text-ink-700">{shortHash(r.decisionId, 12, 6)}</div>
          <div className="truncate text-[10px] text-ink-500">{r.applicantId}</div>
        </div>
      ),
    },
    { key: 'time', header: 'Filed at', render: (r) => <span className="text-ink-600">{formatClock(r.timestamp)}</span> },
    { key: 'model', header: 'Model', render: (r) => <span className="text-[11px] text-ink-900">{r.modelId} · {r.modelVersion}</span> },
    {
      key: 'decision',
      header: 'Decision',
      render: (r) => <StatusBadge tone={decisionTone(r.decision)}>{r.decision}</StatusBadge>,
    },
    {
      key: 'commitment',
      header: 'Fingerprint',
      render: (r) => (
        <span className="text-[11px] text-ink-600" title={r.privacyCommitment.combinedStateHash}>
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
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase text-ink-700">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Examining
            </span>
          );
        }
        if (!verification) {
          return <span className="text-[10px] uppercase text-ink-500">Not examined</span>;
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
          <Button variant="ghost" onClick={() => handleExportJSON()} aria-label="Export session receipts as JSON">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <SectionHeader
        eyebrow="Docket · Session ledger"
        title="Exhibits and their integrity status"
        description="Every consequential decision recorded in this session with its cryptographic evidence status. The examiner recomputes all five checks offline."
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
            <span className="text-[10px] uppercase text-ink-500">Receipts logged</span>
            <span className="font-serif text-2xl font-bold text-ink-900">{receipts.length}</span>
          </div>
        </Panel>
        <Panel bodyClassName="p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] uppercase text-ink-500">Verified authentic</span>
            <span className="font-serif text-2xl font-bold text-notary-600">{verifiedCount}</span>
          </div>
        </Panel>
        <Panel bodyClassName="p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] uppercase text-ink-500">Anomalies detected</span>
            <span className={`font-serif text-2xl font-bold ${anomalyCount > 0 ? 'text-stamp-600' : 'text-ink-900'}`}>
              {anomalyCount}
            </span>
          </div>
        </Panel>
        <Panel className="sm:col-span-3" bodyClassName="p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-500" />
              <input
                type="text"
                placeholder="Search applicant or exhibit ref…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="docket-decision-filter" className="text-[10px] uppercase text-ink-500">
                Decision
              </label>
              <select
                id="docket-decision-filter"
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

      <Panel title="Session docket" meta={`${filteredReceipts.length} of ${receipts.length} receipts`} bodyClassName="p-0">
        <DataTable columns={columns} rows={filteredReceipts} emptyMessage="No receipts match the current search or filter." />
      </Panel>
    </div>
  );
};
