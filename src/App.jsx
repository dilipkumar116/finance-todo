import { useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from './components/BottomNav';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { HiChartBar } from './utils/icons';

const FinanceScreen = lazy(() => import('./components/finance/FinanceScreen'));
const SettingsScreen = lazy(() => import('./components/SettingsScreen'));
const ProductivityScreen = lazy(() => import('./components/productivity/ProductivityScreen'));

export default function App() {
  const [activeTab, setActiveTab] = useState('finance');
  const [financeResetKey, setFinanceResetKey] = useState(0);

  const handleTabChange = (tabId) => {
    if (activeTab === tabId && tabId === 'finance') {
      setFinanceResetKey((k) => k + 1);
    }
    setActiveTab(tabId);
  };

  return (
    <div className="h-full w-full bg-primary flex justify-center">
      <div className="w-full max-w-lg h-full flex flex-col relative">
        
        {/* Main Content */}
        <ErrorBoundary>
          <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent-green border-t-transparent rounded-full animate-spin" /></div>}>
            <AnimatePresence mode="wait">
              {activeTab === 'finance' && (
                <FinanceScreen key={`finance-${financeResetKey}`} />
              )}
              {activeTab === 'productivity' && (
                <ProductivityScreen key="productivity" setActiveTab={setActiveTab} />
              )}
              {activeTab === 'settings' && (
                <SettingsScreen key="settings" />
              )}
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />

      </div>
    </div>
  );
}
