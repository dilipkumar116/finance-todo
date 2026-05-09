import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import BottomNav from './components/BottomNav';
import FinanceScreen from './components/finance/FinanceScreen';
import TodoScreen from './components/todo/TodoScreen';
import SettingsScreen from './components/SettingsScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('finance');

  return (
    <div className="h-full w-full bg-primary flex justify-center">
      <div className="w-full max-w-lg h-full flex flex-col relative">
        
        {/* Main Content */}
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

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      </div>
    </div>
  );
}
