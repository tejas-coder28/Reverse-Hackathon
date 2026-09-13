import React from 'react';
import { ShieldCheck } from 'lucide-react';

export type TabType = 'overview' | 'simulator' | 'receipt' | 'dashboard' | 'tamper';

const NAV_ITEMS: Array<{ id: TabType; label: string; count?: boolean }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'simulator', label: 'Decision Console' },
  { id: 'receipt', label: 'Evidence' },
  { id: 'dashboard', label: 'Verification', count: true },
  { id: 'tamper', label: 'Tamper Lab' },
];

export const Header: React.FC<{
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  totalReceiptsCount: number;
}> = ({ activeTab, setActiveTab, totalReceiptsCount }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-line-700 bg-base-950/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        {/* Brand */}
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className="flex shrink-0 items-center gap-2.5 text-left"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded border border-accent-600/60 bg-accent-950">
            <ShieldCheck className="h-4 w-4 text-accent-400" />
          </span>
          <span className="leading-tight">
            <span className="block font-mono text-[13px] font-semibold tracking-tight text-ink-100">
              CooL<span className="text-accent-400">.ledger</span>
            </span>
            <span className="block text-[10px] text-ink-400">AI Decision Evidence</span>
          </span>
        </button>

        <span className="hidden h-5 w-px bg-line-700 lg:block" />

        {/* Primary navigation */}
        <nav className="hidden items-center lg:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex items-center gap-1.5 px-3 py-4 text-[13px] transition-colors ${
                  active ? 'text-ink-100' : 'text-ink-400 hover:text-ink-200'
                }`}
              >
                {item.label}
                {item.count && totalReceiptsCount > 0 && (
                  <span className="rounded-sm border border-line-700 bg-base-850 px-1 py-px font-mono text-[10px] text-ink-300">
                    {totalReceiptsCount}
                  </span>
                )}
                {active && <span className="absolute inset-x-2 bottom-0 h-0.5 bg-accent-400" />}
              </button>
            );
          })}
        </nav>

        {/* Environment + system status */}
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded border border-line-700 bg-base-850 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-300 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-ok-400" />
            Environment: Demo
          </span>
          <span className="hidden items-center gap-1.5 rounded border border-ok-900 bg-ok-950 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ok-300 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-ok-400" />
            Operational
          </span>

          {/* Mobile nav */}
          <select
            aria-label="Navigate"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as TabType)}
            className="select w-40 lg:hidden"
          >
            {NAV_ITEMS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
