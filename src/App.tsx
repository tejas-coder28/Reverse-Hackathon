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
import type { CooLReceipt } from './evidence/types';
import { evidenceService } from './services/evidenceService';
import { seedDemoOnce } from './components/ui/demoSeed';

const VALID_TABS: TabType[] = ['overview', 'simulator', 'receipt', 'dashboard', 'tamper'];

function initialTabFromUrl(): TabType {
  const param = new URLSearchParams(window.location.search).get('tab');
  return VALID_TABS.includes(param as TabType) ? (param as TabType) : 'overview';
}

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>(initialTabFromUrl);
  const [activeReceipt, setActiveReceipt] = useState<CooLReceipt | null>(null);
  const [inspectingReceipt, setInspectingReceipt] = useState<CooLReceipt | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    seedDemoOnce().then((demoReceipt) => {
      if (cancelled) return;
      setActiveReceipt(demoReceipt);
      setTotalCount(evidenceService.getAllReceipts().length);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleReceiptCreated = (receipt: CooLReceipt) => {
    setActiveReceipt(receipt);
    setTotalCount(evidenceService.getAllReceipts().length);
  };

  const openVerification = (receipt: CooLReceipt) => {
    setActiveReceipt(receipt);
    setActiveTab('receipt');
  };

  return (
    <div className="flex min-h-screen flex-col bg-folder-500 text-ink-900">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalReceiptsCount={totalCount}
      />

      <DisclaimerBanner />

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6">
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
            onInspectReceipt={openVerification}
          />
        )}

        {activeTab === 'tamper' && <TamperLabTab />}
      </main>

      <ReceiptInspectorModal
        receipt={inspectingReceipt}
        onClose={() => setInspectingReceipt(null)}
      />

      <footer className="border-t-2 border-rule-600 bg-folder-600">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-2 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] text-ink-700">
            CooL.ledger · Evidence Room for AI Decisions · Demo environment
          </p>
          <p className="text-[11px] text-ink-600">
            Built for Reverse Hackathon by Team Beta Onepiece
          </p>
        </div>
          <p className="text-[10px] uppercase tracking-[0.08em] text-ink-500">
            SHA-256 · Ed25519 · ML-DSA-65 (FIPS 204) · Phala dstack TEE · RFC 6962
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
