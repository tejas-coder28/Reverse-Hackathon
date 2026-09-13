import React from 'react';

export type TabType = 'overview' | 'simulator' | 'receipt' | 'dashboard' | 'tamper';

const NAV_ITEMS: Array<{ id: TabType; label: string; count?: boolean }> = [
  { id: 'overview', label: 'Case Overview' },
  { id: 'simulator', label: 'Decision Console' },
  { id: 'receipt', label: 'Evidence' },
  { id: 'dashboard', label: 'Docket', count: true },
  { id: 'tamper', label: 'Tamper Lab' },
];

export const Header: React.FC<{
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  totalReceiptsCount: number;
}> = ({ activeTab, setActiveTab, totalReceiptsCount }) => {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-rule-600 bg-folder-500">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        {/* Brand — file drawer label */}
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className="flex shrink-0 items-center gap-2.5 text-left"
        >
          <span className="bg-ink-900 text-paper-100 leading-tight" style={{ borderRadius: 2, padding: '3px 7px' }}>
            <span className="block font-serif text-[13px] font-bold">
              CooL<span className="text-stamp-300">.</span>ledger
            </span>
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.08em] text-ink-600 sm:block">
            Evidence Room
          </span>
        </button>

        <span className="hidden h-5 w-px bg-rule-500 lg:block" />

        {/* Primary navigation — file drawer tabs */}
        <nav className="hidden items-center lg:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex items-center gap-1.5 px-3 py-4 font-mono text-[13px] transition-colors ${
                  active ? 'font-bold text-ink-900' : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                {item.label}
                {item.count && totalReceiptsCount > 0 && (
                  <span
                    className="border border-rule-500 bg-paper-100 px-1 py-px text-[10px] text-ink-700"
                    style={{ borderRadius: 2 }}
                  >
                    {totalReceiptsCount}
                  </span>
                )}
                {active && <span className="absolute inset-x-2 bottom-0 h-[3px] bg-stamp-500" />}
              </button>
            );
          })}
        </nav>

        {/* Environment + system status */}
        <div className="ml-auto flex items-center gap-2">
          <span
            className="hidden items-center gap-1.5 border border-rule-500 bg-paper-100 px-2 py-1 text-[10px] uppercase text-ink-600 sm:inline-flex"
            style={{ borderRadius: 2 }}
          >
            Demo environment
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
