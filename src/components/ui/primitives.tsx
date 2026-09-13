import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   CooL.ledger shared UI primitives — enterprise security console styling.
   Presentation only: no product logic lives here.
   ═══════════════════════════════════════════════════════════════════════════ */

export type BadgeTone = 'ok' | 'warn' | 'bad' | 'accent' | 'neutral';

const BADGE_TONES: Record<BadgeTone, string> = {
  ok: 'border-ok-900 bg-ok-950 text-ok-300',
  warn: 'border-warn-900 bg-warn-950 text-warn-300',
  bad: 'border-bad-900 bg-bad-950 text-bad-300',
  accent: 'border-accent-600/50 bg-accent-950 text-accent-300',
  neutral: 'border-line-700 bg-base-850 text-ink-300',
};

const BADGE_DOTS: Record<BadgeTone, string> = {
  ok: 'bg-ok-400',
  warn: 'bg-warn-400',
  bad: 'bg-bad-400',
  accent: 'bg-accent-400',
  neutral: 'bg-ink-400',
};

/* ── StatusBadge ───────────────────────────────────────────────────────────── */
export function StatusBadge({
  tone,
  children,
  withDot = true,
  className = '',
}: {
  tone: BadgeTone;
  children: React.ReactNode;
  withDot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider ${BADGE_TONES[tone]} ${className}`}
    >
      {withDot && <span className={`h-1.5 w-1.5 rounded-full ${BADGE_DOTS[tone]}`} />}
      {children}
    </span>
  );
}

/* ── Button ────────────────────────────────────────────────────────────────── */
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-600 text-white border border-accent-500 hover:bg-accent-500 focus-visible:border-accent-300',
  secondary:
    'bg-base-800 text-ink-100 border border-line-700 hover:bg-base-700 hover:border-line-600',
  ghost:
    'bg-transparent text-ink-300 border border-transparent hover:bg-base-800 hover:text-ink-100',
  danger:
    'bg-bad-900 text-bad-300 border border-bad-500/60 hover:bg-bad-500/20 hover:border-bad-400',
  success:
    'bg-ok-900 text-ok-300 border border-ok-400/50 hover:bg-ok-400/15 hover:border-ok-300',
};

export function Button({
  variant = 'secondary',
  className = '',
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={`inline-flex select-none items-center justify-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs font-medium uppercase tracking-wide transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent-400 disabled:cursor-not-allowed disabled:opacity-40 ${BUTTON_VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ── Panel ─────────────────────────────────────────────────────────────────── */
export function Panel({
  title,
  actions,
  meta,
  children,
  className = '',
  bodyClassName = '',
}: {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`overflow-hidden rounded-lg border border-line-700 bg-base-900 ${className}`}>
      {(title || actions) && (
        <header className="flex min-h-[42px] flex-wrap items-center justify-between gap-2 border-b border-line-700 bg-base-850 px-4 py-2">
          <div className="flex items-center gap-3">
            {typeof title === 'string' ? (
              <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-300">
                {title}
              </h3>
            ) : (
              title
            )}
            {meta && <span className="font-mono text-[10px] text-ink-500">{meta}</span>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName || 'p-4'}>{children}</div>
    </section>
  );
}

/* ── SectionHeader ─────────────────────────────────────────────────────────── */
export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <div className="font-mono text-[11px] font-medium uppercase tracking-widest text-accent-400">
            {eyebrow}
          </div>
        )}
        <h2 className="mt-0.5 text-xl font-semibold text-ink-100">{title}</h2>
        {description && <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-ink-300">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ── Field (label + value definition list entry) ────────────────────────────── */
export function Field({
  label,
  children,
  mono = true,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className="label">{label}</dt>
      <dd className={`mt-0.5 truncate text-xs text-ink-100 ${mono ? 'font-mono' : ''}`}>{children}</dd>
    </div>
  );
}

/* ── CopyableValue ─────────────────────────────────────────────────────────── */
export function CopyableValue({
  value,
  display,
  label,
  className = '',
}: {
  value: string;
  display?: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(value).catch(() => {
      /* clipboard unavailable — no-op */
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <span className={`group/copy inline-flex max-w-full min-w-0 items-center gap-1.5 ${className}`}>
      <span className="min-w-0 flex-1">
        {label && <span className="label mb-0.5 block">{label}</span>}
        <code
          className="block cursor-text truncate font-mono text-xs text-accent-300"
          title={value}
        >
          {display ?? value}
        </code>
      </span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : 'Copy value'}
        title={copied ? 'Copied' : 'Copy'}
        className="shrink-0 rounded border border-transparent p-1 text-ink-400 transition-colors hover:border-line-700 hover:text-ink-100"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-ok-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </span>
  );
}

/* ── EmptyState ────────────────────────────────────────────────────────────── */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line-700 bg-base-900/50 px-6 py-14 text-center">
      <p className="text-sm font-medium text-ink-200">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-md font-mono text-xs leading-relaxed text-ink-400">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ── KeyValueTable (dense definition grid used across evidence views) ──────── */
export function KeyValueGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <dl className={`grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-4 ${className}`}>{children}</dl>;
}
