import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiArrowUp, HiArrowDown, HiTrendingUp } from '../../utils/icons';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import useFinanceStore, { getCategoryTotals, getWeeklyTrend } from '../../stores/useFinanceStore';
import { formatCurrency } from '../../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsScreen({ onClose, inline = false }) {
  const expenses = useFinanceStore((s) => s.expenses);
  const categories = useFinanceStore((s) => s.categories);

  const categoryTotals = useMemo(() => {
    return getCategoryTotals(categories, expenses).sort((a, b) => b.total - a.total);
  }, [categories, expenses]);

  const weeklyTrend = useMemo(() => getWeeklyTrend(expenses), [expenses]);

  const totalSpent = useMemo(() => categoryTotals.reduce((s, c) => s + (c.total || 0), 0), [categoryTotals]);
  const highestExpense = categoryTotals[0];

  const barData = useMemo(() => ({
    labels: categoryTotals.map(c => c.name),
    datasets: [{
      label: 'Spending',
      data: categoryTotals.map(c => c.total),
      backgroundColor: categoryTotals.map(c => c.color + 'CC'),
      borderColor: categoryTotals.map(c => c.color),
      borderWidth: 1,
      borderRadius: 8,
    }]
  }), [categoryTotals]);

  const lineData = useMemo(() => ({
    labels: weeklyTrend.map(w => w.date),
    datasets: [{
      label: 'Daily Spending',
      data: weeklyTrend.map(w => w.total),
      fill: true,
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#10B981',
    }]
  }), [weeklyTrend]);

  const commonOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94A3B8', font: { size: 10 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false }, ticks: { color: '#94A3B8', font: { size: 10 } } }
    }
  }), []);

  return (
    <motion.div
      initial={inline ? { opacity: 1 } : { y: '100%' }}
      animate={inline ? { opacity: 1 } : { y: 0 }}
      exit={inline ? { opacity: 1 } : { y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={inline ? "flex flex-col h-full" : "fixed inset-0 z-[100] bg-primary flex flex-col"}
    >
      {!inline && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 -ml-2 rounded-xl hover:bg-white/5">
              <HiArrowLeft className="w-6 h-6 text-text-primary" />
            </button>
            <h2 className="text-lg font-bold text-text-primary">Advanced Analytics</h2>
          </div>
        </div>
      )}

      <div className={`flex-1 ${!inline ? 'overflow-y-auto p-5 no-scrollbar pb-24' : ''} space-y-6`}>
        {/* Weekly Trend */}
        <div className="bg-card border border-border p-5 rounded-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Weekly Spending Trend</h3>
            <HiTrendingUp className="w-4 h-4 text-accent-green" />
          </div>
          <div className="h-[200px]">
            <Line data={lineData} options={commonOptions} />
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="bg-card border border-border p-5 rounded-card">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Spending by Category</h3>
          <div className="h-[250px]">
            <Bar 
              data={barData} 
              options={{ ...commonOptions, indexAxis: 'y' }} 
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border p-4 rounded-card">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-accent-green/10 text-accent-green">
                <HiArrowUp className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase">Peak Category</span>
            </div>
            <p className="text-sm font-bold text-text-primary truncate">{highestExpense?.name || 'N/A'}</p>
            <p className="text-xs text-text-muted">{formatCurrency(highestExpense?.total || 0)}</p>
          </div>
          <div className="bg-card border border-border p-4 rounded-card">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-accent-blue/10 text-accent-blue">
                <HiArrowDown className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase">Transactions</span>
            </div>
            <p className="text-sm font-bold text-text-primary">{expenses.length}</p>
            <p className="text-xs text-text-muted">In this period</p>
          </div>
        </div>

        {/* Category List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Category Breakdown</h3>
          <div className="space-y-2">
            {categoryTotals.map((cat, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm font-medium text-text-primary">{cat.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-text-primary">{formatCurrency(cat.total)}</p>
                  <p className="text-[10px] text-text-muted">{Math.round((cat.total / totalSpent) * 100 || 0)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
