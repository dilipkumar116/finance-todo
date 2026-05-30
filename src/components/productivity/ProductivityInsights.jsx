import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { HiTrendingUp, HiStar, HiCheckCircle } from '../../utils/icons';
import useProductivityStore, { getWeeklyProductivity } from '../../stores/useProductivityStore';

export default function ProductivityInsights({ inline = false }) {
  const goals = useProductivityStore(s => s.goals);
  
  const weeklyData = useMemo(() => getWeeklyProductivity(goals).reverse(), [goals]);
  
  // Calculate this month's score
  const monthScore = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    
    // We can just calculate the rate of ALL goals this month
    const monthGoals = goals.filter(g => {
      const gd = new Date(g.createdAt);
      return gd.getMonth() === month && gd.getFullYear() === year;
    });
    
    if (monthGoals.length === 0) return 0;
    const completed = monthGoals.filter(g => g.completed).length;
    return Math.round((completed / monthGoals.length) * 100);
  }, [goals]);

  const getScoreMessage = (score) => {
    if (score >= 90) return "🔥 Unstoppable!";
    if (score >= 70) return "💪 Great momentum!";
    if (score >= 50) return "📈 Room to grow";
    if (score > 0) return "🌱 Every step counts";
    return "🚀 Time to start!";
  };

  const lineData = useMemo(() => ({
    labels: weeklyData.map(w => w.label),
    datasets: [{
      label: 'Completion Rate %',
      data: weeklyData.map(w => w.rate),
      fill: true,
      borderColor: '#4ADE80',
      backgroundColor: 'rgba(74, 222, 128, 0.1)',
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#4ADE80',
    }]
  }), [weeklyData]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94A3B8', font: { size: 10 } } },
      y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8', font: { size: 10 } } }
    }
  };

  // Ring gradient
  const ringColor = monthScore >= 70 ? '#4ADE80' : monthScore >= 40 ? '#FACC15' : '#F87171';

  return (
    <motion.div
      initial={inline ? { opacity: 1 } : { y: '100%' }}
      animate={inline ? { opacity: 1 } : { y: 0 }}
      exit={inline ? { opacity: 1 } : { y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={inline ? "flex flex-col h-full" : "fixed inset-0 z-[100] bg-primary flex flex-col"}
    >
      <div className={`flex-1 ${!inline ? 'overflow-y-auto p-5 no-scrollbar pb-24' : ''} space-y-6 mt-4`}>
        
        {/* Circular Score Gauge */}
        <div className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-[2rem]">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6">This Month's Score</h3>
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Background ring */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle 
                cx="80" cy="80" r="70" 
                className="stroke-surface/50" 
                strokeWidth="12" fill="none" 
              />
              <circle 
                cx="80" cy="80" r="70" 
                stroke={ringColor} 
                strokeWidth="12" fill="none" 
                strokeLinecap="round"
                strokeDasharray="439.8" 
                strokeDashoffset={439.8 - (439.8 * monthScore) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="text-center z-10">
              <span className="text-4xl font-black text-text-primary">{monthScore}<span className="text-xl text-text-muted">%</span></span>
            </div>
            <div className="absolute inset-0 blur-xl opacity-20 -z-10 rounded-full" style={{ backgroundColor: ringColor }} />
          </div>
          <p className="mt-6 text-sm font-bold" style={{ color: ringColor }}>{getScoreMessage(monthScore)}</p>
        </div>

        {/* Weekly Trend */}
        <div className="bg-card border border-border p-5 rounded-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Weekly Trend</h3>
            <HiTrendingUp className="w-4 h-4 text-accent-green" />
          </div>
          <div className="h-[180px]">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border p-4 rounded-card">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-accent-blue/10 text-accent-blue">
                <HiCheckCircle className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase">Completed</span>
            </div>
            <p className="text-xl font-black text-text-primary">{goals.filter(g => g.completed).length}</p>
            <p className="text-[10px] text-text-muted mt-0.5">All time goals</p>
          </div>
          
          <div className="bg-card border border-border p-4 rounded-card">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-accent-yellow/10 text-accent-yellow">
                <HiStar className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase">Total Set</span>
            </div>
            <p className="text-xl font-black text-text-primary">{goals.length}</p>
            <p className="text-[10px] text-text-muted mt-0.5">All time goals</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
