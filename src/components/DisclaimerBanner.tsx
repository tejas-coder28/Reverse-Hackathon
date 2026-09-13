import React from 'react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="border-b border-rule-400 bg-paper-200">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-5 gap-y-1 px-4 py-1.5 sm:px-6">
        <span className="text-[10px] font-bold uppercase text-notary-600">
          Integrity proven here
        </span>
        <span className="text-[10px] uppercase text-ink-500">
          Model fairness: out of scope
        </span>
        <p className="min-w-0 basis-full text-[11px] leading-relaxed text-ink-600 sm:basis-auto sm:flex-1 sm:truncate sm:text-right">
          CooL verifies evidence integrity &amp; provenance — not AI correctness, fairness, or statutory compliance.
        </p>
      </div>
    </div>
  );
};
