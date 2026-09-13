import React from 'react';
import { ShieldCheck, Cpu, Database, AlertOctagon, Layers, FileText, CheckCircle2 } from 'lucide-react';

export type TabType = 'overview' | 'simulator' | 'receipt' | 'dashboard' | 'tamper';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  totalReceiptsCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, totalReceiptsCount }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo / Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 shadow-lg shadow-cyan-500/25">
            <ShieldCheck className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xl font-black tracking-tight text-white">
                CooL<span className="text-cyan-400">.ledger</span>
              </span>
              <span className="rounded-full bg-cyan-950/90 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-400 border border-cyan-800/60 uppercase">
                dstack-TEE RFC 6962
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">AI Governance · Forensics · Cryptographic Audit</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Overview & Why CooL?</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'simulator'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>Decision Console</span>
          </button>

          <button
            onClick={() => setActiveTab('receipt')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'receipt'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-emerald-400" />
            <span>Evidence Receipt</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Verification Console</span>
            {totalReceiptsCount > 0 && (
              <span className="ml-1 rounded-full bg-cyan-950 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-700/60 font-mono">
                {totalReceiptsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tamper')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'tamper'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md'
                : 'text-rose-400 hover:text-rose-200 hover:bg-rose-950/40'
            }`}
          >
            <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />
            <span>Tamper Lab</span>
          </button>
        </nav>

        {/* Judge 2-Minute Quick Flow Badge */}
        <div className="flex items-center space-x-3">
          <div className="hidden xl:flex items-center space-x-2 text-xs font-mono bg-cyan-950/60 border border-cyan-800/60 px-3 py-1 rounded-xl">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-cyan-300 font-semibold">2-MIN JUDGE FLOW</span>
          </div>

          <div className="flex lg:hidden items-center space-x-1 font-mono text-xs">
            <button
              onClick={() => setActiveTab('simulator')}
              className="px-2 py-1 bg-cyan-950 text-cyan-400 rounded border border-cyan-800"
            >
              Console
            </button>
            <button
              onClick={() => setActiveTab('receipt')}
              className="px-2 py-1 bg-slate-900 text-slate-300 rounded border border-slate-700"
            >
              Receipt
            </button>
            <button
              onClick={() => setActiveTab('tamper')}
              className="px-2 py-1 bg-rose-950 text-rose-400 rounded border border-rose-800"
            >
              Tamper
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
