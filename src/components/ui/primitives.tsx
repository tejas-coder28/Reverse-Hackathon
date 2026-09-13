import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   CooL.ledger shared UI primitives — "The Evidence Room"
   Documents on a manila folder. Typewriter ink, hairline rules, rubber stamps.
   Presentation only: no product logic lives here.
   ═════════════════════════════════════════════════════════════ alternating paper tones */

export type BadgeTone = 'ok' | 'warn' | 'bad' | 'accent' | 'neutral';

const BADGE_TONES: Record<BadgeTone, string> = {
  ok: 'border-notary-500 text-notary-600',
  warn: 'border-annotation-500 text-annotation-500',
  bad: 'border-stamp-500 text-stamp-600',
  accent: 'border-rule-500 text-ink-700',
  neutral: 'border-rule-400 text-ink-600',
};

/* ── StatusBadge — a typed margin annotation, not a status pill ─────────────── */
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
      className={`inline-flex items-center gap-1.5 border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase ${BADGE_TONES[tone]} ${className}`}
      style={{ borderRadius: 2 }}
    >
      {withDot && <span className={`h-1.5 w-1.5 ${tone === 'bad' ? 'bg-stamp-500' : tone === 'ok' ? 'bg-notary-500' : tone === 'warn' ? 'bg-annotation-500' : 'bg-ink-400'}`} />}
      {children}
    </span>
  );
}

/* ── Stamp — the one bold move. Rotated ink-on-paper verdict seal. ──────────── */
export function Stamp({
  children,
  tone = 'red',
  size = 'md',
  angle = -4,
  animate = false,
  className = '',
}: {
  children: React.ReactNode;
  tone?: 'red' | 'green' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  angle?: number;
  animate?: boolean;
  className?: string;
}) {
  const toneCls =
    tone === 'red'
      ? 'border-stamp-500 text-stamp-500'
      : tone === 'green'
        ? 'border-notary-500 text-notary-500'
        : 'border-rule-500 text-ink-600';
  const sizeCls =
    size === 'lg'
      ? 'text-2xl sm:text-4xl px-4 py-2 sm:px-6 sm:py-3 border-[3px]'
      : size === 'sm'
        ? 'text-sm px-2.5 py-1 border-2'
        : 'text-xl px-4 py-2 border-2';
  return (
    <span
      className={`inline-block max-w-full text-center font-serif font-bold uppercase ${toneCls} ${sizeCls} ${animate ? 'animate-stamp' : ''} ${className}`}
      style={{
        borderRadius: 4,
        transform: `rotate(${angle}deg)`,
        ['--stamp-rot' as string]: `${angle}deg`,
        boxShadow: 'inset 0 0 10px rgba(163, 39, 30, 0.04)',
        maskImage:
          "radial-gradient(ellipse at 30% 60%, black 55%, rgba(0,0,0,0.92) 70%, black 100%), linear-gradient(105deg, black 0%, rgba(0,0,0,0.9) 40%, black 70%, rgba(0,0,0,0.94) 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at 30% 60%, black 55%, rgba(0,0,0,0.92) 70%, black 100%), linear-gradient(105deg, black 0%, rgba(0,0,0,0.9) 40%, black 70%, rgba(0,0,0,0.94) 100%)",
      }}
    >
      {children}
</span>
  );
}

/* ── Button — rectangular stamp-plate controls. No shadows, no arrows. ─────── */
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-ink-900 text-paper-100 border border-ink-900 hover:bg-ink-700 hover:border-ink-700',
  secondary: 'bg-paper-100 text-ink-900 border border-rule-500 hover:border-rule-600 hover:bg-paper-200',
  ghost: 'bg-transparent text-ink-600 border border-transparent hover:bg-paper-200 hover:text-ink-900',
  danger: 'bg-paper-100 text-stamp-600 border border-stamp-500 hover:bg-stamp-50 hover:border-stamp-600',
  success: 'bg-paper-100 text-notary-600 border border-notary-500 hover:bg-notary-50',
};

export function Button({
  variant = 'secondary',
  className = '',
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={`inline-flex select-none items-center justify-center gap-1.5 px-3 py-1.5 font-mono text-xs font-medium uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${BUTTON_VARIANTS[variant]} ${className}`}
      style={{ borderRadius: 2 }}
      {...rest}
    >
      {children}
  </button>
  );
}

/* ── Panel — a document sheet. Sharp 2px corners, hairline rule, header underline. */
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
    <section
      className={`overflow-hidden border border-rule-400 bg-paper-100 ${className}`}
      style={{ borderRadius: 2 }}
    >
      {(title || actions) && (
        <header className="flex min-h-[42px] flex-wrap items-center justify-between gap-2 border-b border-rule-400 px-4 py-2">
          <div className="flex min-w-0 items-center gap-3">
            {typeof title === 'string' ? (
              <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-700">{title}</h3>
            ) : (
              title
            )}
            {meta && <span className="truncate text-[10px] text-ink-500">{meta}</span>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName || 'p-4'}>{children}</div>
    </section>
  );
}

/* ── SectionHeader — a typed file tab, not an eyebrow. ──────────────────────── */
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
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1 inline-block border border-rule-500 bg-paper-200 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-700">
            {eyebrow}
          </div>
        )}
        <h2 className="text-xl font-bold text-ink-900">{title}</h2>
        {description && <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-ink-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
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
      <dd className={`mt-0.5 truncate text-xs text-ink-900 ${mono ? 'font-mono' : ''}`}>{children}</dd>
    </div>
  );
}

/* ── CopyableValue — typed hash line with a copy control ────────────────────── */
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
        <code className="block cursor-text truncate font-mono text-xs text-ink-700" title={value}>
          {display ?? value}
        </code>
      </span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : 'Copy value'}
        title={copied ? 'Copied' : 'Copy'}
        className="shrink-0 border border-transparent p-1 text-ink-500 transition-colors hover:border-rule-400 hover:text-ink-900"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-notary-500" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </span>
  );
}

/* ── EmptyState — an empty evidence folder ──────────────────────────────────── */
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
    <div
      className="flex flex-col items-center justify-center border border-dashed border-rule-500 bg-paper-100/60 px-6 py-14 text-center"
      style={{ borderRadius: 2 }}
    >
      <p className="font-serif text-sm font-bold text-ink-700">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-ink-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ── KeyValueGrid — dense typed definition grid ─────────────────────────────── */
export function KeyValueGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <dl className={`grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-4 ${className}`}>{children}</dl>;
}
