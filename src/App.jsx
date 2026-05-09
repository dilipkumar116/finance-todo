import { useState, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import BottomNav from './components/BottomNav';

const FinanceScreen = lazy(() => import('./components/finance/FinanceScreen'));
const TodoScreen = lazy(() => import('./components/todo/TodoScreen'));
const SettingsScreen = lazy(() => import('./components/SettingsScreen'));

export default function App() {
  const [activeTab, setActiveTab] = useState('finance');

  return (
    <div className="h-full w-full bg-primary flex justify-center">
      <div className="w-full max-w-lg h-full flex flex-col relative">
        
        {/* Main Content */}
        <Suspense fallback={<div className="flex-1 bg-primary" />}>
          <AnimatePresence mode="wait">
            {activeTab === 'finance' && (
              <FinanceScreen key="finance" />
            )}
            {activeTab === 'todo' && (
              <TodoScreen key="todo" />
            )}
            {activeTab === 'settings' && (
              <SettingsScreen key="settings" />
            )}
          </AnimatePresence>
        </Suspense>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      </div>
    </div>
  );
}
