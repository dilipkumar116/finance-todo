import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiCheck } from '../../utils/icons';
import useProductivityStore, { getLocalDateString, getCurrentStreak } from '../../stores/useProductivityStore';
import * as Icons from '../../utils/icons';

export default function HabitCard({ habit }) {
  const toggleHabitForDate = useProductivityStore(s => s.toggleHabitForDate);
  const [expanded, setExpanded] = useState(false);

  const Icon = Icons[habit.icon] || Icons.HiLightningBolt;
  const streak = getCurrentStreak(habit);
  const todayStr = getLocalDateString(new Date());
  const isDoneToday = habit.completions.includes(todayStr);

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = getLocalDateString(d);
    return {
      dateStr: dStr,
      label: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
      done: habit.completions.includes(dStr)
    };
  });

  return (
    <motion.div 
      layout
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <div 
        className="p-4 flex items-center gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
        >
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-text-primary truncate">{habit.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-orange flex items-center gap-1">
              🔥 {streak} {streak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleHabitForDate(habit.id, todayStr);
          }}
          className={`w-10 h-10 rounded-full border-2 flex flex-shrink-0 items-center justify-center transition-colors duration-300 ${
            isDoneToday 
              ? 'bg-accent-green border-accent-green text-primary' 
              : 'border-border text-transparent hover:border-accent-green hover:text-accent-green/30'
          }`}
        >
          <motion.div
            initial={false}
            animate={{ scale: isDoneToday ? 1 : 0.5, opacity: isDoneToday ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <HiCheck className="w-6 h-6" />
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/50 bg-surface/30"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Last 7 Days</span>
              </div>
              
              <div className="flex justify-between items-center">
                {last7Days.map((day) => (
                  <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
                    <div 
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        day.done ? 'bg-accent-green border-accent-green text-primary' : 'border-border text-transparent'
                      }`}
                    >
                      {day.done && <HiCheck className="w-3 h-3" />}
                    </div>
                    <span className={`text-[9px] font-bold ${day.dateStr === todayStr ? 'text-accent-green' : 'text-text-muted'}`}>
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
