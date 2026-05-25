import { useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from './components/BottomNav';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { HiChartBar } from './utils/icons';

const FinanceScreen = lazy(() => import('./components/finance/FinanceScreen'));
const SettingsScreen = lazy(() => import('./components/SettingsScreen'));

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
                <motion.div
                  key="productivity"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="flex-1 flex flex-col justify-between items-center p-6 bg-primary pb-24"
                >
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 max-w-sm">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-accent-green via-teal-400 to-emerald-500 bg-clip-text text-transparent animate-pulse tracking-wider">
                      Coming Soon
                    </h2>
                    <p className="text-text-muted text-sm px-4 leading-relaxed">
                      We are crafting a cutting-edge Productivity Tracker to elevate your performance. Stay tuned!
                    </p>
                    
                    {/* Centered Minimal Element */}
                    <div className="relative w-48 h-48 rounded-[2rem] bg-gradient-to-br from-white/[0.08] to-white/[0.01] border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden group transition-all duration-300 hover:scale-[1.03] hover:border-white/15">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent-green/20 to-transparent blur-2xl opacity-50 transition-opacity duration-300 group-hover:opacity-75" />
                      <HiChartBar className="w-20 h-20 text-accent-green/80 relative z-10 drop-shadow-[0_0_15px_rgba(74,222,128,0.3)] transition-transform duration-300 group-hover:scale-105" />
                    </div>
                  </div>

                  {/* Close from bottom */}
                  <button
                    onClick={() => setActiveTab('finance')}
                    className="w-full max-w-sm py-4 bg-accent-green hover:bg-accent-green/90 text-black font-bold rounded-xl shadow-lg shadow-accent-green/20 active:scale-[0.98] transition-all duration-150"
                  >
                    Close
                  </button>
                </motion.div>
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
