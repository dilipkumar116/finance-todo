import { useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from './components/BottomNav';
import ErrorBoundary from './components/shared/ErrorBoundary';

const FinanceScreen = lazy(() => import('./components/finance/FinanceScreen'));
const SettingsScreen = lazy(() => import('./components/SettingsScreen'));
const ProductivityScreen = lazy(() => import('./components/productivity/ProductivityScreen'));

export default function App() {
  const [activeTab, setActiveTab] = useState('finance');
  const [financeResetKey, setFinanceResetKey] = useState(0);
  const [productivityResetKey, setProductivityResetKey] = useState(0);

  const handleTabChange = (tabId) => {
    if (activeTab === tabId) {
      if (tabId === 'finance') setFinanceResetKey((k) => k + 1);
      if (tabId === 'productivity') setProductivityResetKey((k) => k + 1);
    }
    setActiveTab(tabId);
  };

  return (
    <div className="h-full w-full bg-primary flex justify-center">
      <div className="w-full max-w-lg h-full flex flex-col relative">
        
        {/* Main Content */}
        <div className="flex-1 h-full overflow-hidden">
          <Suspense fallback={<div className="flex-1 h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent-green border-t-transparent rounded-full animate-spin" /></div>}>
            <AnimatePresence mode="wait">
              {activeTab === 'finance' && (
                <motion.div key={`finance-${financeResetKey}`} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full">
                  <ErrorBoundary>
                    <FinanceScreen />
                  </ErrorBoundary>
                </motion.div>
              )}
              {activeTab === 'productivity' && (
                <motion.div key={`productivity-${productivityResetKey}`} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full">
                  <ErrorBoundary>
                    <ProductivityScreen setActiveTab={setActiveTab} />
                  </ErrorBoundary>
                </motion.div>
              )}
              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full">
                  <ErrorBoundary>
                    <SettingsScreen />
                  </ErrorBoundary>
                </motion.div>
              )}
            </AnimatePresence>
          </Suspense>
        </div>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />

      </div>
    </div>
  );
}
