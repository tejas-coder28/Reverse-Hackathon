import { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import type { VerificationCheckResult } from '../../evidence/types';
import { Stamp } from './primitives';

/* ═══════════════════════════════════════════════════════════════════════════
   Verification UI primitives — lab-report check rows and the verdict stamp.
   Presentation only; all results come from src/evidence/verify.ts via the
   evidence service. No verification logic is re-implemented here.
   The stamp slam is the app's single orchestrated motion moment.
   ═════════════════════════════════════════════════ checkboxes are inked squares */

export type CheckStatus = 'pass' | 'fail' | 'pending' | 'inactive';

export interface CheckItem {
  id: string;
  name: string;
  status: CheckStatus;
  explanation: string;
  metadata: string;
  detail?: string;
  tag?: string;
  isSimulated?: boolean;
}

function CheckIcon({ status }: { status: CheckStatus }) {
  if (status === 'pass') {
    return (
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center border border-notary-500 bg-notary-50"
        style={{ borderRadius: 2 }}
      >
        <Check className="h-3.5 w-3.5 text-notary-600" strokeWidth={3} />
      </span>
    );
  }
  if (status === 'fail') {
    return (
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center border border-stamp-500 bg-stamp-50"
        style={{ borderRadius: 2 }}
      >
        <X className="h-3.5 w-3.5 text-stamp-600" strokeWidth={3} />
      </span>
    );
  }
  if (status === 'inactive') {
    return (
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center border border-rule-400 bg-paper-200 text-[10px] text-ink-500"
        style={{ borderRadius: 2 }}
      >
        n/a
      </span>
    );
  }
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center border border-rule-500 bg-paper-100 font-bold text-ink-600"
      style={{ borderRadius: 2 }}
      aria-hidden="true"
    >
      …
    </span>
  );
}

const STATUS_LABEL: Record<CheckStatus, string> = {
  pass: 'Match',
  fail: 'Mismatch',
  inactive: 'Not examined',
  pending: 'Checking',
};

const STATUS_COLOR: Record<CheckStatus, string> = {
  pass: 'text-notary-600',
  fail: 'text-stamp-600',
  inactive: 'text-ink-500',
  pending: 'text-ink-700',
};

export function VerificationCheckRow({ item }: { item: CheckItem }) {
  const [open, setOpen] = useState(false);
  const canExpand = Boolean(item.detail);

  const nameColor =
    item.status === 'pass'
      ? 'text-ink-900'
      : item.status === 'fail'
        ? 'text-stamp-600'
        : item.status === 'inactive'
          ? 'text-ink-500'
          : 'text-ink-700';

  return (
    <li className="border-b border-rule-400 last:border-b-0">
      <button
        type="button"
        onClick={() => canExpand && setOpen((v) => !v)}
        className={`flex w-full items-start gap-3 px-4 py-3 text-left ${canExpand ? 'cursor-pointer hover:bg-paper-200/60' : 'cursor-default'}`}
        disabled={!canExpand}
      >
        <CheckIcon status={item.status} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`text-[13px] font-bold ${nameColor}`}>{item.name}</span>
            {item.tag && (
              <span
                className={`border px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                  item.isSimulated
                    ? 'border-annotation-500 bg-annotation-50 text-annotation-500'
                    : 'border-rule-500 bg-paper-200 text-ink-600'
                }`}
                style={{ borderRadius: 2 }}
              >
                {item.tag}
              </span>
            )}
            <span className={`text-[10px] font-bold uppercase ${STATUS_COLOR[item.status]}`}>
              {STATUS_LABEL[item.status]}
            </span>
            {canExpand && (
              <ChevronDown
                className={`ml-auto h-3.5 w-3.5 shrink-0 text-ink-500 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            )}
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-600">{item.explanation}</p>
          <p className="mt-0.5 truncate text-[10px] text-ink-500">{item.metadata}</p>
          {canExpand && open && (
            <div className="mt-2 border border-rule-400 bg-paper-50 p-2.5" style={{ borderRadius: 2 }}>
              <p className="whitespace-pre-wrap break-words text-[11px] leading-relaxed text-ink-700">
                {item.detail}
              </p>
            </div>
          )}
        </div>
      </button>
    </li>
  );
}

export function VerificationCheckList({ items }: { items: CheckItem[] }) {
  return (
    <ul className="divide-y divide-rule-400">
      {items.map((item) => (
        <VerificationCheckRow key={item.id} item={item} />
      ))}
    </ul>
  );
}

/* ── VerdictStamp — the lab report's conclusion, pressed in ink ────────────── */
export function VerdictStamp({
  verdict,
  receiptId,
  note,
}: {
  verdict: 'authentic' | 'tampered' | 'pending';
  receiptId?: string;
  note?: string;
}) {
  if (verdict === 'pending') {
    return (
      <div
        className="flex flex-wrap items-center gap-x-4 gap-y-1 border border-rule-500 bg-paper-200 px-4 py-3"
        style={{ borderRadius: 2 }}
      >
        <span className="text-[11px] font-bold uppercase text-ink-700">Under examination</span>
        {note && <span className="text-xs text-ink-600">{note}</span>}
      </div>
    );
  }

  const authentic = verdict === 'authentic';
  return (
    <div className="flex flex-col items-start gap-2 border border-rule-400 bg-paper-50 px-4 py-5" style={{ borderRadius: 2 }}>
      <Stamp tone={authentic ? 'green' : 'red'} size="md" angle={authentic ? -4 : -6} animate>
        {authentic ? 'Unforged' : 'Evidence tampered'}
      </Stamp>
      <p className="text-xs leading-relaxed text-ink-700">
        {authentic
          ? 'The laboratory recomputed every check offline and the evidence matches its sealed state.'
          : 'The laboratory recomputed every check offline and the evidence no longer matches its sealed state. This receipt cannot be trusted.'}
      </p>
      {receiptId && <p className="text-[10px] uppercase tracking-[0.08em] text-ink-500">Exhibit ref {receiptId}</p>}
      {note && <p className="text-[11px] text-ink-500">{note}</p>}
    </div>
  );
}

/* ── Map a VerificationCheckResult onto display check items ────────────────── */
export function checksFromResult(
  result: VerificationCheckResult,
  opts: { includeCommitment?: boolean; includeDisclaimer?: boolean } = {}
): CheckItem[] {
  const { includeCommitment = true, includeDisclaimer = true } = opts;

  const items: CheckItem[] = [];

  if (includeCommitment) {
    items.push({
      id: 'commitment',
      name: 'Sealed state matches the decision',
      tag: 'REAL SHA-256',
      isSimulated: false,
      status: result.hashCommitmentValid ? 'pass' : 'fail',
      explanation: 'The SHA-256 fingerprint of the recorded inputs and outputs reproduces exactly.',
      metadata: result.details.hashCommitmentDetail,
      detail: 'Recomputes H(SALT : input || output) and compares it to the stored combined state hash. Any change to the decision outcome or metadata breaks this equality.',
    });
  }

  items.push(
    {
      id: 'signature',
      name: 'Institution signature checks out',
      tag: 'REAL CRYPTO',
      isSimulated: false,
      status: result.signatureValid ? 'pass' : 'fail',
      explanation: 'The classical Ed25519 signature on this receipt was produced by the institution\u2019s key, not forged after the fact.',
      metadata: result.details.signatureDetail,
      detail: 'Recomputes the expected Ed25519 signature binding for the recorded public key and compares it byte-for-byte with the stored signature string.',
    },
    {
      id: 'pqs',
      name: 'Quantum-era signature checks out',
      tag: 'REAL POST-QUANTUM',
      isSimulated: false,
      status: result.signatureValid ? 'pass' : 'fail',
      explanation: 'The ML-DSA-65 (FIPS 204) signature holds, so the receipt survives future quantum attackers.',
      metadata: result.details.signatureDetail,
      detail: 'Recomputes the expected ML-DSA-65 (Dilithium, FIPS 204) signature binding and compares it with the stored value.',
    },
    {
      id: 'tee',
      name: 'Enclave witness statement',
      tag: 'SIMULATED / DEMO',
      isSimulated: true,
      status: result.teeAttestationValid ? 'pass' : 'fail',
      explanation: 'A simulated secure-enclave quote confirms the decision ran inside the attested code (browser demo of the Phala dstack flow).',
      metadata: result.details.teeAttestationDetail,
      detail: 'Validates the dstack quote signature over mrEnclave : mrSigner : state hash : timestamp in client-side local-demo mode.',
    },
    {
      id: 'merkle',
      name: 'Entry exists in the public log',
      tag: 'REAL MERKLE LOG',
      isSimulated: false,
      status: result.transparencyLogValid ? 'pass' : 'fail',
      explanation: 'The receipt\u2019s entry traces up the RFC 6962 append-only tree to the published root — it cannot have been silently removed.',
      metadata: result.details.transparencyLogDetail,
      detail: 'Replays the inclusion proof from the leaf hash up to the Merkle root and compares the result with the recorded root.',
    }
  );

  if (includeDisclaimer) {
    items.push({
      id: 'scope',
      name: 'Was the decision itself correct or fair?',
      status: 'inactive',
      explanation: 'Outside the scope of this ledger — integrity is proven, decision quality is not claimed.',
      metadata: result.details.disclaimer,
    });
  }

  return items;
}
