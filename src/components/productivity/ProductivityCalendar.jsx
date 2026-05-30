import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronLeft, HiChevronRight } from '../../utils/icons';
import useProductivityStore, { getLocalDateString, getCompletionRate, getGoalsForDate } from '../../stores/useProductivityStore';
import DayGoalEditor from './DayGoalEditor';

export default function ProductivityCalendar({ inline = false }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingDate, setEditingDate] = useState(null);
  
  const goals = useProductivityStore((s) => s.goals);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { firstDay, days, year, month };
  }, [currentMonth]);

  const monthData = useMemo(() => {
    const data = {};
    for (let i = 1; i <= daysInMonth.days; i++) {
      const dStr = getLocalDateString(new Date(daysInMonth.year, daysInMonth.month, i));
      const dailyGoals = getGoalsForDate(goals, dStr);
      const completed = dailyGoals.filter(g => g.completed).length;
      data[i] = { total: dailyGoals.length, completed, rate: getCompletionRate(goals, dStr) };
    }
    return data;
  }, [goals, daysInMonth]);

  return (
    <motion.div
      initial={inline ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={inline ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
      className={inline ? "flex flex-col h-full" : "fixed inset-0 z-[100] bg-primary flex flex-col"}
    >
      <div className={`flex-1 ${!inline ? 'p-5 overflow-y-auto no-scrollbar' : ''} space-y-6`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">
            {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentMonth(new Date(daysInMonth.year, daysInMonth.month - 1))}
              className="p-2 rounded-xl bg-card border border-border text-text-primary hover:bg-white/5 transition-colors"
            >
              <HiChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentMonth(new Date(daysInMonth.year, daysInMonth.month + 1))}
              className="p-2 rounded-xl bg-card border border-border text-text-primary hover:bg-white/5 transition-colors"
            >
              <HiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-text-muted py-2">{d}</div>
          ))}
          {Array.from({ length: daysInMonth.firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth.days }).map((_, i) => {
            const day = i + 1;
            const data = monthData[day];
            const isToday = new Date().getDate() === day && 
                           new Date().getMonth() === daysInMonth.month && 
                           new Date().getFullYear() === daysInMonth.year;
            
            return (
              <button 
                key={day} 
                onClick={() => setEditingDate(new Date(daysInMonth.year, daysInMonth.month, day))}
                className={`aspect-square rounded-lg flex flex-col items-center justify-between relative border transition-all py-1 bg-card text-text-primary hover:bg-white/5 ${
                  isToday ? 'border-accent-green' : 'border-border'
                }`}
              >
                {/* Dot at top */}
                <div
                  style={{
                    width: 4, height: 4, borderRadius: '50%',
                    backgroundColor: data.completed > 0 ? '#4ADE80' : 'transparent',
                  }}
                />
                <span className="text-sm font-bold">{day}</span>
                {/* Amount at bottom */}
                <span className="text-[8px] font-semibold text-text-muted">
                  {data.total > 0 ? `${data.completed}/${data.total}` : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {editingDate && (
          <DayGoalEditor date={editingDate} onClose={() => setEditingDate(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
