import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import type { CooLReceipt } from '../evidence/types';
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Receipt JSON inspector"
    >
      <div
        className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden border-2 border-rule-600 bg-paper-100"
        style={{ borderRadius: 2, boxShadow: '6px 6px 0 rgba(35, 32, 26, 0.35)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-rule-400 bg-paper-200 px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-[13px] font-bold text-ink-900">The exhibit, as filed</h3>
              <span className="text-[10px] uppercase text-ink-500">
                canonical JSON · v{receipt.version}
              </span>
            </div>
            <p className="truncate text-xs text-ink-700">{receipt.decisionId}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="secondary" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5 text-notary-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy JSON'}
            </Button>
            <Button variant="ghost" onClick={onClose} aria-label="Close inspector">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
          {/* Summary strip */}
          <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 border border-rule-400 bg-paper-200 px-3 py-2.5" style={{ borderRadius: 2 }}>
            <StatusBadge tone={decisionTone(receipt.decision)}>{receipt.decision}</StatusBadge>
            <span className="text-[11px] text-ink-700">
              {receipt.modelId} · {receipt.modelVersion}
            </span>
            <span className="text-[11px] text-ink-600">{receipt.domain}</span>
            <span className="text-[11px] text-ink-500">{receipt.timestamp}</span>
            <span className="ml-auto text-[10px] uppercase text-ink-500">
              {jsonString.length.toLocaleString()} bytes
            </span>
          </div>

          <pre className="custom-scrollbar overflow-x-auto border border-rule-400 bg-paper-50 p-4 text-[11px] leading-relaxed text-ink-900" style={{ borderRadius: 2 }}>
            {jsonString}
          </pre>

          <p className="mt-3 text-[11px] leading-relaxed text-ink-600">
            This is the exact receipt structure an offline verifier consumes. No raw applicant PII appears in this
            document — applicant inputs exist only as salted SHA-256 fingerprints.
          </p>
        </div>
      </div>
    </div>
  );
};
