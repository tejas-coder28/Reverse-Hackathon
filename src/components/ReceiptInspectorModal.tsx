import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import type { CooLReceipt } from '../cool/types';
import { Button, StatusBadge } from './ui/primitives';
import { decisionTone } from './ui/format';

interface ReceiptInspectorModalProps {
  receipt: CooLReceipt | null;
  onClose: () => void;
}

export const ReceiptInspectorModal: React.FC<ReceiptInspectorModalProps> = ({ receipt, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!receipt) return null;

  const jsonString = JSON.stringify(receipt, null, 2);

  const handleCopy = () => {
    navigator.clipboard?.writeText(jsonString).catch(() => {
      /* clipboard unavailable — no-op */
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-base-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Receipt JSON inspector"
    >
      <div
        className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-line-600 bg-base-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-line-700 bg-base-850 px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-semibold text-ink-100">Receipt inspector</h3>
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                canonical JSON · v{receipt.version}
              </span>
            </div>
            <p className="truncate font-mono text-xs text-accent-300">{receipt.decisionId}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="secondary" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5 text-ok-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy JSON'}
            </Button>
            <Button variant="ghost" onClick={onClose} aria-label="Close inspector">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
          {/* Summary strip */}
          <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-md border border-line-700 bg-base-850 px-3 py-2.5">
            <StatusBadge tone={decisionTone(receipt.decision)}>{receipt.decision}</StatusBadge>
            <span className="font-mono text-[11px] text-ink-300">
              {receipt.modelId} · {receipt.modelVersion}
            </span>
            <span className="font-mono text-[11px] text-ink-400">{receipt.domain}</span>
            <span className="font-mono text-[11px] text-ink-500">{receipt.timestamp}</span>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-ink-500">
              {jsonString.length.toLocaleString()} bytes
            </span>
          </div>

          <pre className="custom-scrollbar overflow-x-auto rounded-md border border-line-700 bg-base-950 p-4 font-mono text-[11px] leading-relaxed text-ink-200">
            {jsonString}
          </pre>

          <p className="mt-3 text-[11px] leading-relaxed text-ink-400">
            This is the exact receipt structure an offline verifier consumes. No raw applicant PII appears in this
            document — applicant inputs exist only as salted SHA-256 commitments.
          </p>
        </div>
      </div>
    </div>
  );
};
