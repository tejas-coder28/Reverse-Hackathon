import { useState } from 'react';
import { Check, ChevronDown, Loader2, X } from 'lucide-react';
import type { VerificationCheckResult } from '../../evidence/types';

/* ═══════════════════════════════════════════════════════════════════════════
   Verification UI primitives — check rows and overall verdict banner.
   Presentation only; all results come from src/evidence/verify.ts via the
   evidence service. No verification logic is re-implemented here.
   ═══════════════════════════════════════════════════════════════════════════ */

export type CheckStatus = 'pass' | 'fail' | 'pending' | 'inactive';

export interface CheckItem {
  id: string;
  name: string;
  status: CheckStatus;
  explanation: string;
  metadata: string;
  detail?: string;
}

function CheckIcon({ status }: { status: CheckStatus }) {
  if (status === 'pass') {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-ok-900 bg-ok-950">
        <Check className="h-3.5 w-3.5 text-ok-400" strokeWidth={2.5} />
      </span>
    );
  }
  if (status === 'fail') {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-bad-900 bg-bad-950">
        <X className="h-3.5 w-3.5 text-bad-400" strokeWidth={2.5} />
      </span>
    );
  }
  if (status === 'inactive') {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-line-700 bg-base-850 font-mono text-[10px] text-ink-500">
        —
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-line-700 bg-base-850">
      <Loader2 className="h-3 w-3 animate-spin text-accent-400" />
    </span>
  );
}

export function VerificationCheckRow({ item }: { item: CheckItem }) {
  const [open, setOpen] = useState(false);
  const canExpand = Boolean(item.detail);

  const nameColor =
    item.status === 'pass'
      ? 'text-ink-100'
      : item.status === 'fail'
        ? 'text-bad-300'
        : item.status === 'inactive'
          ? 'text-ink-400'
          : 'text-ink-300';

  return (
    <li className="animate-check-in border-b border-line-700/60 last:border-b-0">
      <button
        type="button"
        onClick={() => canExpand && setOpen((v) => !v)}
        className={`flex w-full items-start gap-3 px-4 py-3 text-left ${canExpand ? 'cursor-pointer hover:bg-base-850' : 'cursor-default'}`}
        disabled={!canExpand}
      >
        <CheckIcon status={item.status} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`text-[13px] font-medium ${nameColor}`}>{item.name}</span>
            <span
              className={`font-mono text-[10px] font-semibold uppercase tracking-wider ${
                item.status === 'pass'
                  ? 'text-ok-400'
                  : item.status === 'fail'
                    ? 'text-bad-400'
                    : item.status === 'inactive'
                      ? 'text-ink-500'
                      : 'text-accent-400'
              }`}
            >
              {item.status === 'pass'
                ? 'PASS'
                : item.status === 'fail'
                  ? 'FAIL'
                  : item.status === 'inactive'
                    ? 'NOT APPLICABLE'
                    : 'CHECKING…'}
            </span>
            {canExpand && (
              <ChevronDown
                className={`ml-auto h-3.5 w-3.5 shrink-0 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            )}
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-300">{item.explanation}</p>
          <p className="mt-0.5 truncate font-mono text-[10px] text-ink-500">{item.metadata}</p>
          {canExpand && open && (
            <div className="mt-2 rounded border border-line-700 bg-base-950 p-2.5">
              <p className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-ink-200">
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
    <ul className="divide-y divide-line-700/60">
      {items.map((item) => (
        <VerificationCheckRow key={item.id} item={item} />
      ))}
    </ul>
  );
}

/* ── Overall verdict banner ────────────────────────────────────────────────── */
export function VerdictBanner({
  verdict,
  receiptId,
  note,
}: {
  verdict: 'authentic' | 'tampered' | 'pending';
  receiptId?: string;
  note?: string;
}) {
  const styles =
    verdict === 'authentic'
      ? 'border-ok-400/40 bg-ok-950/60 text-ok-300'
      : verdict === 'tampered'
        ? 'border-bad-400/50 bg-bad-950/70 text-bad-300'
        : 'border-line-700 bg-base-850 text-ink-300';
  const headline =
    verdict === 'authentic' ? 'EVIDENCE AUTHENTIC' : verdict === 'tampered' ? 'EVIDENCE TAMPERED' : 'PENDING VERIFICATION';

  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border px-4 py-3 ${styles}`}>
      <span className="font-mono text-base font-semibold tracking-wide">{headline}</span>
      {receiptId && <span className="font-mono text-xs opacity-70">{receiptId}</span>}
      {note && <span className="text-xs opacity-80">{note}</span>}
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
      name: 'Commitment integrity',
      status: result.hashCommitmentValid ? 'pass' : 'fail',
      explanation: 'Sealed SHA-256 state commitment matches the recorded decision output.',
      metadata: result.details.hashCommitmentDetail,
      detail: 'Recomputes H(SALT : input || output) and compares it to the stored combined state hash. Any change to the decision outcome or metadata breaks this equality.',
    });
  }

  items.push(
    {
      id: 'signature',
      name: 'Ed25519 signature',
      status: result.signatureValid ? 'pass' : 'fail',
      explanation: 'Classical signature over the state commitment validates against the institutional public key.',
      metadata: result.details.signatureDetail,
      detail: 'Recomputes the expected Ed25519 signature binding for the recorded public key and compares it byte-for-byte with the stored signature string.',
    },
    {
      id: 'pqs',
      name: 'ML-DSA-65 signature',
      status: result.signatureValid ? 'pass' : 'fail',
      explanation: 'Post-quantum signature (FIPS 204) guards the same commitment against future quantum adversaries.',
      metadata: result.details.signatureDetail,
      detail: 'Recomputes the expected ML-DSA-65 (Dilithium, FIPS 204) signature binding and compares it with the stored value.',
    },
    {
      id: 'tee',
      name: 'TEE attestation',
      status: result.teeAttestationValid ? 'pass' : 'fail',
      explanation: 'Phala dstack enclave quote is bound to the commitment and is not self-editable.',
      metadata: result.details.teeAttestationDetail,
      detail: 'Validates the dstack quote signature over mrEnclave : mrSigner : state hash : timestamp.',
    },
    {
      id: 'merkle',
      name: 'Merkle inclusion proof',
      status: result.transparencyLogValid ? 'pass' : 'fail',
      explanation: 'RFC 6962 append-only log proof recalculates to the recorded tree root.',
      metadata: result.details.transparencyLogDetail,
      detail: 'Replays the inclusion proof from the leaf hash up to the Merkle root and compares the result with the recorded root.',
    }
  );

  if (includeDisclaimer) {
    items.push({
      id: 'scope',
      name: 'Model correctness & fairness',
      status: 'inactive',
      explanation: 'Outside the scope of this ledger — integrity is proven, decision quality is not claimed.',
      metadata: result.details.disclaimer,
    });
  }

  return items;
}
