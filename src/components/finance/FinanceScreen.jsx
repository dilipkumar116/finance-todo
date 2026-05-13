import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiHome, HiChartBar, HiListBullet, HiCalendar } from '../../utils/icons';
import ExpenseSummaryCard from './ExpenseSummaryCard';
import AddExpenseCard from './AddExpenseCard';
import RecentExpenses from './RecentExpenses';
import HistoryScreen from '../HistoryScreen';
import AnalyticsScreen from './AnalyticsScreen';

export default function FinanceScreen() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'list', 'calendar', 'analytics'

  const tabs = [
    { id: 'overview', icon: HiHome, label: 'Home' },
    { id: 'list', icon: HiListBullet, label: 'List' },
    { id: 'calendar', icon: HiCalendar, label: 'Calendar' },
    { id: 'analytics', icon: HiChartBar, label: 'Analytics' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="h-full flex flex-col"
    >
      {/* Fixed Header with 4 Navigation Icons */}
      <div className="px-5 pt-5 pb-4 bg-primary/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Finance</h1>
          
          <div className="flex bg-surface p-1 rounded-xl border border-border shadow-inner">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`p-2 rounded-lg transition-all duration-200 relative ${
                    isActive ? 'bg-accent-green text-primary shadow-lg' : 'text-text-muted hover:text-text-secondary'
                  }`}
                  title={tab.label}
                >
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabGlow"
                      className="absolute inset-0 bg-accent-green/20 blur-md -z-10 rounded-lg"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area with Fast Minimal Animations */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <ExpenseSummaryCard />
              <AddExpenseCard />
              <RecentExpenses />
            </motion.div>
          )}

          {activeTab === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <HistoryScreen inline initialView="list" />
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <HistoryScreen inline initialView="calendar" />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <AnalyticsScreen inline />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
