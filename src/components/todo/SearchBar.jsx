import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiX } from '../../utils/icons';
import useTodoStore from '../../stores/useTodoStore';

export default function SearchBar() {
  const [expanded, setExpanded] = useState(false);
  const searchQuery = useTodoStore((s) => s.searchQuery);
  const setSearchQuery = useTodoStore((s) => s.setSearchQuery);
  const inputRef = useRef(null);

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  const handleClose = () => {
    setExpanded(false);
    setSearchQuery('');
  };

  return (
    <div className="flex items-center">
      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div
            key="input"
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: 200, opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 px-3 py-2 rounded-btn bg-card border border-border"
          >
            <HiSearch className="w-4 h-4 text-text-muted flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-text-primary w-full"
            />
            <button onClick={handleClose} className="flex-shrink-0">
              <HiX className="w-4 h-4 text-text-muted hover:text-text-primary transition-colors" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="icon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpanded(true)}
            className="p-2 rounded-xl hover:bg-card transition-colors duration-150"
          >
            <HiSearch className="w-5 h-5 text-text-secondary" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
