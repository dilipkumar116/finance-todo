import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChartBar, HiClock } from '../../utils/icons';
import ExpenseSummaryCard from './ExpenseSummaryCard';
import AddExpenseCard from './AddExpenseCard';
import RecentExpenses from './RecentExpenses';
import HistoryScreen from '../HistoryScreen';
import AnalyticsScreen from './AnalyticsScreen';

export default function FinanceScreen() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h1 className="text-2xl font-bold text-text-primary">Finance</h1>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setHistoryOpen(true)}
            className="p-2 rounded-xl hover:bg-card transition-colors duration-150 flex items-center gap-2"
            title="Spending History"
          >
            <HiClock className="w-5 h-5 text-text-secondary" />
          </button>
          <button 
            onClick={() => setAnalyticsOpen(true)}
            className="p-2 rounded-xl hover:bg-card transition-colors duration-150"
            title="Detailed Analytics"
          >
            <HiChartBar className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {historyOpen && <HistoryScreen onClose={() => setHistoryOpen(false)} />}
      </AnimatePresence>

      {/* Analytics Modal */}
      <AnimatePresence>
        {analyticsOpen && <AnalyticsScreen onClose={() => setAnalyticsOpen(false)} />}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-24 space-y-4">
        <ExpenseSummaryCard />
        <AddExpenseCard />
        <RecentExpenses />
      </div>
    </motion.div>
  );
}
