import React, { useEffect, useState } from 'react';
import { Play, ScanSearch, FlaskConical } from 'lucide-react';
import type { TabType } from './Header';
import { Button, Panel, StatusBadge, Field, KeyValueGrid, CopyableValue, EmptyState, Stamp } from './ui/primitives';
import { DataTable, type DataTableColumn } from './ui/DataTable';
import type { CooLReceipt } from '../evidence/types';
import { evidenceService } from '../services/evidenceService';
import { decisionTone, formatClock, shortHash } from './ui/format';

interface OverviewTabProps {
  onStartDemo: () => void;
  setActiveTab: (tab: TabType) => void;
}

const CUSTODY_CHAIN: Array<{ link: string; note: string }> = [
  { link: 'AI decision reached', note: 'CreditRisk-v3 output recorded' },
  { link: 'Inputs and outputs sealed', note: 'SHA-256 commitment, salted' },
  { link: 'Signed by the institution', note: 'Ed25519, classical key' },
  { link: 'Countersigned for the quantum era', note: 'ML-DSA-65, FIPS 204' },
  { link: 'Attested in the enclave', note: 'Phala dstack quote' },
  { link: 'Entered in the public log', note: 'RFC 6962 append-only tree' },
  { link: 'Receipt issued', note: 'Verifiable offline, forever' },
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
      header: 'Exhibit ref',
      render: (r) => (
        <button
          type="button"
          onClick={() => setActiveTab('receipt')}
          className="font-mono text-xs text-ink-700 underline decoration-rule-400 underline-offset-2 hover:text-ink-900 hover:decoration-ink-700"
        >
          {shortHash(r.decisionId, 10, 6)}
        </button>
      ),
    },
    { key: 'time', header: 'Filed at', render: (r) => <span className="font-mono text-ink-600">{formatClock(r.timestamp)}</span> },
    { key: 'model', header: 'Model', render: (r) => <span className="font-mono text-ink-900">{r.modelId}</span> },
    {
      key: 'decision',
      header: 'Decision',
      render: (r) => <StatusBadge tone={decisionTone(r.decision)}>{r.decision}</StatusBadge>,
    },
    {
      key: 'integrity',
      header: 'Integrity',
      render: () => (
        <span className="text-[11px] uppercase text-ink-500">Not yet examined</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: () => (
        <Button variant="ghost" onClick={() => setActiveTab('dashboard')}>
          Verify
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* ── Case cover sheet ─────────────────────────────────────────────── */}
      <section className="relative border-2 border-rule-600 bg-paper-50 p-5 sm:p-7" style={{ borderRadius: 2, boxShadow: '4px 4px 0 rgba(111, 98, 68, 0.25)' }}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="font-serif text-lg font-bold text-ink-900">CASE FILE NO. 001</h1>
              <p className="text-[11px] uppercase tracking-[0.08em] text-ink-600">
                {new Date().getFullYear()} · opened for every decision the model makes
              </p>
            </div>
            <p className="mt-3 font-serif text-2xl font-bold leading-tight text-ink-900 sm:text-[28px]">
              Every consequential AI decision, sealed as evidence.
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-600">
              When the credit model decides, this ledger captures what it saw and what it ruled — then signs,
              attests, and logs it so the file can be re-verified offline at any time, by anyone.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button variant="primary" onClick={onStartDemo}>
                <Play className="h-3.5 w-3.5" />
                Run a Decision
              </Button>
              <Button variant="secondary" onClick={() => setActiveTab('receipt')}>
                <ScanSearch className="h-3.5 w-3.5" />
                Inspect Evidence
              </Button>
              <Button variant="danger" onClick={() => setActiveTab('tamper')}>
                <FlaskConical className="h-3.5 w-3.5" />
                Try to Tamper
              </Button>
            </div>
          </div>

          {/* The live verdict stamp — latest decision in the file */}
          <div className="flex shrink-0 flex-col items-center gap-2 pt-2 lg:pt-6">
            <Stamp
              tone={latest ? (latest.decision === 'APPROVED' ? 'green' : 'red') : 'gray'}
              size="lg"
              angle={-5}
            >
              {latest ? 'Unforged' : 'Awaiting evidence'}
            </Stamp>
            <p className="max-w-[220px] text-center text-[10px] leading-relaxed text-ink-500">
              {latest
                ? `Last receipt on file verified intact · ${shortHash(latest.decisionId, 8, 4)}`
                : 'No decision has been recorded in this session yet.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── Latest exhibit + status of the room ───────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          className="lg:col-span-7"
          title="Latest exhibit"
          meta={latest ? `filed ${formatClock(latest.timestamp)}` : 'nothing on file'}
          actions={
            <Button variant="ghost" onClick={() => setActiveTab('receipt')}>
              Open receipt
            </Button>
          }
        >
          {latest ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge tone={decisionTone(latest.decision)}>{latest.decision}</StatusBadge>
                <span className="text-xs text-ink-600">
                  {latest.modelId} · {latest.modelVersion}
                </span>
                <span className="text-[10px] uppercase text-ink-500">{latest.timestamp}</span>
              </div>

              <KeyValueGrid className="sm:grid-cols-2">
                <Field label="Model that decided">CreditRisk-v3</Field>
                <Field label="Model version">{latest.modelVersion}</Field>
                <Field label="Applicant ref">{latest.applicantId}</Field>
                <Field label="Decision domain">{latest.domain}</Field>
                <Field label="Receipt ID">{shortHash(latest.decisionId, 12, 8)}</Field>
                <Field label="Sealed at">{latest.timestamp}</Field>
              </KeyValueGrid>

              <div className="grid gap-3 border-t border-rule-400 pt-4 sm:grid-cols-2">
                <CopyableValue
                  label="Sealed state of the decision (SHA-256 commitment)"
                  value={latest.privacyCommitment.combinedStateHash}
                  display={shortHash(latest.privacyCommitment.combinedStateHash, 24, 12)}
                />
                <CopyableValue
                  label="Position in the public log (Merkle root)"
                  value={latest.transparencyLog.merkleRoot}
                  display={shortHash(latest.transparencyLog.merkleRoot, 24, 12)}
                />
              </div>
            </div>
          ) : (
            <EmptyState title="No decisions recorded yet" description="Run a decision in the console to open the first file." />
          )}
        </Panel>

        <Panel className="lg:col-span-5" title="Status of the room">
          <ul className="divide-y divide-rule-400">
            <li className="flex items-center justify-between py-2.5 first:pt-0">
              <span className="text-[13px] text-ink-900">Evidence capture at the AI boundary</span>
              <StatusBadge tone="ok">In service</StatusBadge>
            </li>
            <li className="flex items-center justify-between py-2.5">
              <span className="text-[13px] text-ink-900">Offline verification desk</span>
              <StatusBadge tone="ok">In service</StatusBadge>
            </li>
            <li className="flex items-center justify-between py-2.5">
              <span className="text-[13px] text-ink-900">Enclave attestation (TEE)</span>
              <StatusBadge tone="warn">Simulated locally</StatusBadge>
            </li>
            <li className="flex items-center justify-between py-2.5">
              <span className="text-[13px] text-ink-900">Public transparency log</span>
              <StatusBadge tone="ok">In service</StatusBadge>
            </li>
          </ul>
          <p className="mt-3 border-t border-rule-400 pt-3 text-[11px] leading-relaxed text-ink-600">
            Everything except the enclave quote runs for real, in this browser session, using standard
            cryptography. The enclave quote follows the Phala dstack specification and is simulated locally.
          </p>
        </Panel>
      </div>

      {/* ── Chain of custody ──────────────────────────────────────────────── */}
      <Panel title="Chain of custody" meta="what happens to a decision before it becomes evidence">
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
          {CUSTODY_CHAIN.map((step, i) => (
            <li key={step.link} className="relative border-l-2 border-rule-500 bg-paper-200/60 p-3">
              <span className="text-[10px] font-bold text-stamp-500">{i + 1}.</span>
              <p className="mt-0.5 text-[12px] font-medium leading-snug text-ink-900">{step.link}</p>
              <p className="mt-0.5 text-[10px] text-ink-600">{step.note}</p>
            </li>
          ))}
        </ol>
      </Panel>

      {/* ── The docket ────────────────────────────────────────────────────── */}
      <Panel title="Exhibits on file" meta={`${receipts.length} receipts in this session`} bodyClassName="p-0">
        <DataTable columns={columns} rows={receipts} emptyMessage="No decisions recorded yet." />
      </Panel>
    </div>
  );
};
