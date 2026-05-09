import { motion } from 'framer-motion';
import { HiCash, HiClipboardList, HiCog } from 'react-icons/hi';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'finance', label: 'Finance', icon: HiCash },
    { id: 'todo', label: 'To Do', icon: HiClipboardList },
    { id: 'settings', label: 'Settings', icon: HiCog },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-lg mx-auto flex">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex-1 flex flex-col items-center justify-center py-3 gap-1
                         transition-colors duration-150"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[3px] rounded-full bg-accent-green"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                className={`w-6 h-6 transition-colors duration-150 ${
                  isActive ? 'text-accent-green' : 'text-text-muted'
                }`}
              />
              <span
                className={`text-[11px] font-medium transition-colors duration-150 ${
                  isActive ? 'text-accent-green' : 'text-text-muted'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
