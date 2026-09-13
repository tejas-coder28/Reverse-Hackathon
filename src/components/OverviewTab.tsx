import React, { useEffect, useState } from 'react';
import { ArrowRight, PlayCircle, ScanSearch, FlaskConical } from 'lucide-react';
import type { TabType } from './Header';
import { Button, Panel, StatusBadge, Field, KeyValueGrid, CopyableValue, EmptyState } from './ui/primitives';
import { DataTable, type DataTableColumn } from './ui/DataTable';
import type { CooLReceipt } from '../evidence/types';
import { evidenceService } from '../services/evidenceService';
import { decisionTone, formatClock, shortHash } from './ui/format';

interface OverviewTabProps {
  onStartDemo: () => void;
  setActiveTab: (tab: TabType) => void;
}

const SYSTEM_STATUS: Array<{ label: string; state: 'operational' | 'demo' }> = [
  { label: 'Evidence capture', state: 'operational' },
  { label: 'Offline verification', state: 'operational' },
  { label: 'TEE attestation', state: 'demo' },
  { label: 'Transparency log', state: 'operational' },
];

type LedgerRow = CooLReceipt & { id: string };

export const OverviewTab: React.FC<OverviewTabProps> = ({ onStartDemo, setActiveTab }) => {
  const [receipts, setReceipts] = useState<LedgerRow[]>([]);

  useEffect(() => {
    setReceipts(evidenceService.getAllReceipts().map((r) => ({ ...r, id: r.decisionId })));
  }, []);

  const latest = receipts[0];

  const columns: Array<DataTableColumn<LedgerRow>> = [
    {
      key: 'receipt',
      header: 'Receipt ID',
      render: (r) => (
        <button
          type="button"
          onClick={() => setActiveTab('receipt')}
          className="font-mono text-xs text-accent-300 hover:text-accent-200 hover:underline"
        >
          {shortHash(r.decisionId, 10, 6)}
        </button>
      ),
    },
    { key: 'time', header: 'Time', render: (r) => <span className="font-mono text-ink-300">{formatClock(r.timestamp)}</span> },
    { key: 'model', header: 'Model', render: (r) => <span className="font-mono text-ink-200">{r.modelId}</span> },
    {
      key: 'decision',
      header: 'Decision',
      render: (r) => <StatusBadge tone={decisionTone(r.decision)}>{r.decision}</StatusBadge>,
    },
    {
      key: 'integrity',
      header: 'Integrity',
      render: () => (
        <StatusBadge tone="neutral">
          <span className="text-ink-400">Run verify</span>
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: () => (
        <Button variant="ghost" onClick={() => setActiveTab('dashboard')}>
          Verify
          <ArrowRight className="h-3 w-3" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* ── Compact intro ─────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4 border-b border-line-700 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink-100 sm:text-4xl">
            Cryptographic evidence for consequential AI decisions.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-300">
            Capture decision state at the AI boundary — salted commitments, hybrid signatures, TEE attestation,
            transparency log — and verify its integrity offline, later.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={onStartDemo}>
            <PlayCircle className="h-4 w-4" />
            Run Decision
          </Button>
          <Button variant="secondary" onClick={() => setActiveTab('receipt')}>
            <ScanSearch className="h-4 w-4" />
            Inspect Evidence
          </Button>
          <Button variant="danger" onClick={() => setActiveTab('tamper')}>
            <FlaskConical className="h-4 w-4" />
            Test Tampering
          </Button>
        </div>
      </section>

      {/* ── Data-first summary row ────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Live decision summary */}
        <Panel
          className="lg:col-span-7"
          title="Latest decision"
          meta={latest ? latest.decisionId : 'no records'}
          actions={
            <Button variant="ghost" onClick={() => setActiveTab('receipt')}>
              Open receipt
              <ArrowRight className="h-3 w-3" />
            </Button>
          }
        >
          {latest ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge tone={decisionTone(latest.decision)}>{latest.decision}</StatusBadge>
                <span className="font-mono text-xs text-ink-300">
                  {latest.modelId} · {latest.modelVersion}
                </span>
                <span className="font-mono text-[10px] text-ink-500">{latest.timestamp}</span>
              </div>

              <KeyValueGrid className="sm:grid-cols-2">
                <Field label="Model">{latest.modelId}</Field>
                <Field label="Version">{latest.modelVersion}</Field>
                <Field label="Applicant">{latest.applicantId}</Field>
                <Field label="Domain">{latest.domain}</Field>
                <Field label="Receipt">{shortHash(latest.decisionId, 12, 8)}</Field>
                <Field label="Timestamp">{latest.timestamp}</Field>
              </KeyValueGrid>

              <div className="grid gap-3 border-t border-line-700/60 pt-4 sm:grid-cols-2">
                <CopyableValue
                  label="SHA-256 combined state commitment"
                  value={latest.privacyCommitment.combinedStateHash}
                  display={shortHash(latest.privacyCommitment.combinedStateHash, 24, 12)}
                />
                <CopyableValue
                  label="RFC 6962 Merkle root"
                  value={latest.transparencyLog.merkleRoot}
                  display={shortHash(latest.transparencyLog.merkleRoot, 24, 12)}
                />
              </div>
            </div>
          ) : (
            <EmptyState title="No decisions recorded yet" description="Run a decision in the console to capture evidence." />
          )}
        </Panel>

        {/* System status */}
        <Panel className="lg:col-span-5" title="System status">
          <ul className="divide-y divide-line-700/60">
            {SYSTEM_STATUS.map((item) => (
              <li key={item.label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <span className="text-[13px] text-ink-200">{item.label}</span>
                {item.state === 'operational' ? (
                  <StatusBadge tone="ok">Operational</StatusBadge>
                ) : (
                  <StatusBadge tone="accent">Local Demo</StatusBadge>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-line-700/60 pt-3 text-[11px] leading-relaxed text-ink-400">
            Evidence capture, offline verification, and the transparency log run fully in this session. TEE
            attestation quotes follow the Phala dstack client specification and run in local-demo mode in the browser.
          </p>
        </Panel>
      </div>

      {/* ── Evidence chain ────────────────────────────────────────────────── */}
      <Panel title="Evidence chain" meta="captured at the decision boundary">
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
          {[
            ['AI Decision', 'CreditRisk-v3 output'],
            ['SHA-256 Commitment', 'H(SALT : in || out)'],
            ['Ed25519 Signature', 'Classical non-repudiation'],
            ['ML-DSA-65 Signature', 'Post-quantum (FIPS 204)'],
            ['TEE Attestation', 'Phala dstack quote'],
            ['RFC 6962 Merkle Proof', 'Append-only log'],
            ['Verified Receipt', 'Offline-verifiable JSON'],
          ].map(([name, sub], i) => (
            <li key={name} className="relative rounded-md border border-line-700 bg-base-850 p-3">
              <span className="font-mono text-[10px] text-ink-500">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-1 text-[13px] font-medium leading-snug text-ink-100">{name}</p>
              <p className="mt-0.5 font-mono text-[10px] text-ink-400">{sub}</p>
            </li>
          ))}
        </ol>
      </Panel>

      {/* ── Decision ledger ───────────────────────────────────────────────── */}
      <Panel title="Decision ledger" meta={`${receipts.length} receipts in session`} bodyClassName="p-0">
        <DataTable columns={columns} rows={receipts} emptyMessage="No decisions recorded yet." />
      </Panel>
    </div>
  );
};
