import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="border-b border-line-700 bg-base-900">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-5 gap-y-1 px-4 py-1.5 sm:px-6">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-ok-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          Integrity proven
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
          Model fairness: out of scope
        </span>
        <p className="min-w-0 basis-full text-[11px] leading-relaxed text-ink-400 sm:basis-auto sm:flex-1 sm:truncate sm:text-right">
          CooL verifies evidence integrity &amp; provenance — not AI correctness, fairness, or statutory compliance.
        </p>
      </div>
    </div>
  );
};
