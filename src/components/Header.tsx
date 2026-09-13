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
          {/* Source repository — filed alongside the case */}
          <a
            href="https://github.com/aadi-learner77/Reverse-Hackathon"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View the CooL.ledger source on GitHub"
            title="View the source on GitHub"
            className="inline-flex h-[26px] w-[26px] items-center justify-center text-ink-600 transition-colors hover:text-ink-900"
          >
            <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
          </a>

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
