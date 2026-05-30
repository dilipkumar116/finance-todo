import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus } from '../../utils/icons';
import useProductivityStore, { getLocalDateString } from '../../stores/useProductivityStore';

const COLORS = ['#05E099', '#FFD166', '#FF3366', '#00C2FF', '#FF007F', '#BB86FC', '#FFFFFF'];

export default function AddGoalCard({ defaultDate = new Date() }) {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  
  const addGoal = useProductivityStore((s) => s.addGoal);

  const handleSave = () => {
    if (!text.trim()) return;
    addGoal({
      text: text.trim(),
      color,
      date: getLocalDateString(defaultDate),
    });
    setText('');
    setExpanded(false);
  };

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <AnimatePresence initial={false} mode="wait">
        {!expanded ? (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpanded(true)}
            className="w-full flex items-center justify-center gap-2 p-4 text-accent-green hover:bg-white/5 transition-colors"
          >
            <HiPlus className="w-5 h-5" />
            <span className="text-sm font-bold">Add a goal</span>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 space-y-4"
          >
            <input
              autoFocus
              type="text"
              placeholder="What do you want to accomplish?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full bg-transparent text-sm text-text-primary placeholder-text-muted border-none focus:ring-0 p-0"
            />
            
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-5 h-5 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white/20' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setExpanded(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-text-muted hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!text.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-accent-green text-primary disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
