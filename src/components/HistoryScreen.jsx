import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowLeft, HiCalendar, HiListBullet, HiChevronLeft, HiChevronRight, HiPlus } from '../utils/icons';
import useFinanceStore, { getFilteredExpenses, getTotalSpent } from '../stores/useFinanceStore';
import { formatCurrency } from '../utils/helpers';
import ExpenseItem from './finance/ExpenseItem';
import AddExpenseModal from './finance/AddExpenseModal';

export default function HistoryScreen({ onClose, inline = false, initialView = 'calendar' }) {
  const [viewMode, setViewMode] = useState(initialView); // Default to calendar
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sync viewMode with parent prop if it changes
  useState(() => {
    if (inline) setViewMode(initialView);
  }, [initialView]);
  const expenses = useFinanceStore((s) => s.expenses);
  const categories = useFinanceStore((s) => s.categories);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { firstDay, days, year, month };
  }, [currentMonth]);

  const monthData = useMemo(() => {
    const data = {};
    expenses.forEach(exp => {
      const d = new Date(exp.createdAt);
      if (d.getMonth() === daysInMonth.month && d.getFullYear() === daysInMonth.year) {
        const date = d.getDate();
        data[date] = (data[date] || 0) + exp.amount;
      }
    });
    return data;
  }, [expenses, daysInMonth]);

  const filteredBySelectedDate = useMemo(() => {
    return expenses.filter(exp => {
      const d = new Date(exp.createdAt);
      return d.getDate() === selectedDate.getDate() && 
             d.getMonth() === selectedDate.getMonth() && 
             d.getFullYear() === selectedDate.getFullYear();
    });
  }, [expenses, selectedDate]);

  const filteredExpenses = useMemo(() => {
    if (selectedCategory === 'all') return expenses;
    return expenses.filter(e => e.category === selectedCategory);
  }, [expenses, selectedCategory]);

  const dailyTotalsList = useMemo(() => {
    const totals = {};
    filteredExpenses.forEach(exp => {
      const dateKey = new Date(exp.createdAt).toDateString();
      totals[dateKey] = (totals[dateKey] || 0) + exp.amount;
    });
    return Object.entries(totals)
      .map(([date, amount]) => ({ date: new Date(date), amount }))
      .sort((a, b) => b.date - a.date);
  }, [filteredExpenses]);

  return (
    <motion.div
      initial={inline ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={inline ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
      className={inline ? "flex flex-col h-full" : "fixed inset-0 z-[100] bg-primary flex flex-col"}
    >
      {/* Header (Only shown if NOT inline) */}
      {!inline && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 -ml-2 rounded-xl hover:bg-white/5">
              <HiArrowLeft className="w-6 h-6 text-text-primary" />
            </button>
            <h2 className="text-lg font-bold text-text-primary">Spending History</h2>
          </div>
          <div className="flex bg-surface p-1 rounded-btn border border-border">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-accent-green text-primary' : 'text-text-muted'}`}
            >
              <HiListBullet className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'calendar' ? 'bg-accent-green text-primary' : 'text-text-muted'}`}
            >
              <HiCalendar className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 ${!inline ? 'overflow-y-auto no-scrollbar pb-10' : ''}`}>
        {(inline ? initialView : viewMode) === 'list' ? (
          <div className="space-y-4">
            {/* Category Filter Pills */}
            <div className="flex gap-2 px-5 pt-5 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-accent-green border-accent-green text-primary'
                    : 'bg-card border-border text-text-muted'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    selectedCategory === cat.id
                      ? 'border-accent-green text-accent-green bg-accent-green/10'
                      : 'bg-card border-border text-text-muted'
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="px-5 pb-4 space-y-4">
              {dailyTotalsList.map(({ date, amount }) => (
                <div key={date.toDateString()} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      {date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                    </h3>
                    <span className="text-sm font-bold text-text-primary">{formatCurrency(amount)}</span>
                  </div>
                  <div className="glass rounded-card p-3 space-y-1">
                    {filteredExpenses.filter(e => new Date(e.createdAt).toDateString() === date.toDateString()).map(exp => (
                      <ExpenseItem key={exp.id} expense={exp} />
                    ))}
                  </div>
                </div>
              ))}
              {dailyTotalsList.length === 0 && (
                <p className="text-sm text-text-muted text-center py-20 italic">No history available</p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-6">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary">
                {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentMonth(new Date(daysInMonth.year, daysInMonth.month - 1))}
                  className="p-2 rounded-xl bg-card border border-border text-text-primary"
                >
                  <HiChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setCurrentMonth(new Date(daysInMonth.year, daysInMonth.month + 1))}
                  className="p-2 rounded-xl bg-card border border-border text-text-primary"
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
                const total = monthData[day] || 0;
                const isSelected = selectedDate.getDate() === day && 
                                  selectedDate.getMonth() === daysInMonth.month && 
                                  selectedDate.getFullYear() === daysInMonth.year;
                const isToday = new Date().getDate() === day && 
                               new Date().getMonth() === daysInMonth.month && 
                               new Date().getFullYear() === daysInMonth.year;
                
                return (
                  <button 
                    key={day} 
                    onClick={() => setSelectedDate(new Date(daysInMonth.year, daysInMonth.month, day))}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-between relative border transition-all py-1 ${
                      isSelected ? 'bg-accent-green border-accent-green text-primary' : 'bg-card border-border text-text-primary'
                    } ${isToday && !isSelected ? 'border-accent-green' : ''}`}
                  >
                    {/* Dot at top */}
                    <div
                      style={{
                        width: 4, height: 4, borderRadius: '50%',
                        backgroundColor: total > 0 ? (isSelected ? '#000000' : '#4ADE80') : 'transparent',
                      }}
                    />
                    <span className="text-sm font-bold">{day}</span>
                    {/* Amount at bottom */}
                    <span style={{
                      fontSize: 8, fontWeight: 600, lineHeight: 1,
                      color: total > 0 ? (isSelected ? 'rgba(0,0,0,0.7)' : '#4ADE80') : 'transparent',
                    }}>
                      {total > 0 ? `₹${total >= 1000 ? `${(total/1000).toFixed(1)}k` : total}` : '0'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Day Details */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-text-primary">
                    {selectedDate.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}
                  </h3>
                  <button 
                    onClick={() => setAddModalOpen(true)}
                    className="p-1.5 rounded-full bg-accent-green/20 text-accent-green hover:bg-accent-green/30 transition-colors"
                    title="Add expense for this date"
                  >
                    <HiPlus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-lg font-bold text-accent-green">
                  {formatCurrency(filteredBySelectedDate.reduce((s, e) => s + e.amount, 0))}
                </span>
              </div>
              <div className="space-y-2">
                {filteredBySelectedDate.map(exp => (
                  <ExpenseItem key={exp.id} expense={exp} />
                ))}
                {filteredBySelectedDate.length === 0 && (
                  <div className="text-center py-10 px-6 bg-surface/30 rounded-card border border-dashed border-border">
                    <p className="text-sm text-text-muted italic mb-3">No expenses on this day</p>
                    <button 
                      onClick={() => setAddModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-btn bg-accent-green/10 text-accent-green text-xs font-bold"
                    >
                      <HiPlus className="w-4 h-4" /> Add Expense
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Modal for History */}
      <AddExpenseModal 
        open={addModalOpen} 
        onClose={() => setAddModalOpen(false)} 
        defaultDate={selectedDate}
      />
    </motion.div>
  );
}
