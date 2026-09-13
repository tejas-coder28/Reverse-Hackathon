import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import type { TabType } from './components/Header';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { OverviewTab } from './components/OverviewTab';
import { SimulatorTab } from './components/SimulatorTab';
import { EvidenceReceiptTab } from './components/EvidenceReceiptTab';
import { AuditDashboardTab } from './components/AuditDashboardTab';
import { TamperLabTab } from './components/TamperLabTab';
import { ReceiptInspectorModal } from './components/ReceiptInspectorModal';
import type { CooLReceipt } from './cool/types';
import { evidenceService } from './services/evidenceService';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [activeReceipt, setActiveReceipt] = useState<CooLReceipt | null>(null);
  const [inspectingReceipt, setInspectingReceipt] = useState<CooLReceipt | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    const init = async () => {
      const demoReceipt = await evidenceService.seedDemoIfEmpty();
      setActiveReceipt(demoReceipt);
      setTotalCount(evidenceService.getAllReceipts().length);
    };
    init();
  }, []);

  const handleReceiptCreated = (receipt: CooLReceipt) => {
    setActiveReceipt(receipt);
    setTotalCount(evidenceService.getAllReceipts().length);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalReceiptsCount={totalCount}
      />

      <DisclaimerBanner />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 pt-6">
        {activeTab === 'overview' && (
          <OverviewTab
            onStartDemo={() => setActiveTab('simulator')}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'simulator' && (
          <SimulatorTab
            onReceiptCreated={handleReceiptCreated}
            onInspectReceipt={(r) => setInspectingReceipt(r)}
            onNavigateToReceiptView={() => setActiveTab('receipt')}
          />
        )}

        {activeTab === 'receipt' && (
          <EvidenceReceiptTab
            receipt={activeReceipt}
            onInspectRaw={(r) => setInspectingReceipt(r)}
          />
        )}

        {activeTab === 'dashboard' && (
          <AuditDashboardTab
            onInspectReceipt={(r) => {
              setActiveReceipt(r);
              setInspectingReceipt(r);
            }}
          />
        )}

        {activeTab === 'tamper' && <TamperLabTab />}
      </main>

      <ReceiptInspectorModal
        receipt={inspectingReceipt}
        onClose={() => setInspectingReceipt(null)}
      />

      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            CooL.ledger © 2026 · Cryptographic AI Decision Evidence & Audit Platform
          </div>
          <div className="flex items-center space-x-4 text-cyan-400">
            <span>EU AI Act Art. 12</span>
            <span>CA AB 316</span>
            <span>Phala dstack-TEE</span>
            <span>RFC 6962</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
