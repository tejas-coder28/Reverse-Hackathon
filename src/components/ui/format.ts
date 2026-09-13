/* ═════════════════════════════════════════════════════════════════ presentation layer only ═══
   Display formatting helpers — presentation only. No product logic.
   ═════════════════════════════════════════════════════════════════════════════════════════════ */

/** Format an ISO-8601 timestamp as HH:MM:SS for ledger table rows. */
export function formatClock(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString('en-GB', { hour12: false });
}

/** Format an ISO-8601 timestamp as YYYY-MM-DD HH:MM:SS for receipts. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${formatClock(iso)}`;
}

/** Map a decision value to a badge tone. */
export function decisionTone(decision: string): 'ok' | 'warn' | 'bad' {
  if (decision === 'APPROVED') return 'ok';
  if (decision === 'MANUAL_REVIEW') return 'warn';
  return 'bad';
}

/** Shorten a long hash for table cells: 8a91f2…c0de */
export function shortHash(hash: string | undefined, head = 6, tail = 4): string {
  if (!hash) return '—';
  if (hash.length <= head + tail + 1) return hash;
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}

/** Map an integrity verdict to a badge tone. */
export function integrityTone(isUnforged: boolean | undefined): 'ok' | 'bad' {
  return isUnforged === true ? 'ok' : 'bad';
}
