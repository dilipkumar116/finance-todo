import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { HiFire, HiCheckCircle, HiChartBar } from '../../utils/icons';
import useProductivityStore, { getLocalDateString, getGoalsForDate, getMonthlyData, getCompletionRate } from '../../stores/useProductivityStore';
import TodayGoalItem from './TodayGoalItem';
import AddGoalCard from './AddGoalCard';
import HabitCard from './HabitCard';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';

// Setup ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function ProductivityHome({ onNavigateToSettings }) {
  const goals = useProductivityStore(s => s.goals);
  const habits = useProductivityStore(s => s.habits);
  
  const todayStr = getLocalDateString(new Date());
  const todayGoals = getGoalsForDate(goals, todayStr);
  const todayCompleted = todayGoals.filter(g => g.completed).length;
  const todayRate = todayGoals.length ? Math.round((todayCompleted / todayGoals.length) * 100) : 0;

  // Monthly data
  const currentMonthData = useMemo(() => {
    const today = new Date();
    return getMonthlyData(goals, today.getFullYear(), today.getMonth());
  }, [goals]);

  const monthAvg = currentMonthData.length ? Math.round(currentMonthData.reduce((s, d) => s + d.rate, 0) / currentMonthData.length) : 0;

  // Calculate generic streak based on days with > 0 completion rate
  const currentStreak = useMemo(() => {
    let streak = 0;
    const current = new Date();
    while (true) {
      const dStr = getLocalDateString(current);
      const rate = getCompletionRate(goals, dStr);
      if (rate > 0) {
        streak++;
      } else if (dStr !== todayStr) {
        break;
      }
      current.setDate(current.getDate() - 1);
    }
    return streak;
  }, [goals, todayStr]);

  const chartData = {
    labels: currentMonthData.map(d => d.day),
    datasets: [{
      label: 'Completion %',
      data: currentMonthData.map(d => d.rate),
      backgroundColor: currentMonthData.map(d => 
        d.dateStr === todayStr ? '#4ADE80' : `rgba(74, 222, 128, ${Math.max(0.1, d.rate / 100)})`
      ),
      borderRadius: 4,
      borderSkipped: false,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { tooltip: { enabled: true } },
    scales: {
      x: { display: false },
      y: { display: false, min: 0, max: 100 }
    }
  };

  return (
    <div className="space-y-6">
      {/* Monthly Progress Card */}
      <div className="glass rounded-card p-5 shadow-card border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div>
            <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Monthly Progress</h2>
            <p className="text-lg font-bold text-text-primary">
              {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="h-24 w-full relative z-10 mb-4">
          <Bar data={chartData} options={chartOptions} />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50 relative z-10">
          <div>
            <p className="text-xs text-text-muted">Total Goals Done</p>
            <p className="text-sm font-bold text-text-primary">{goals.filter(g => g.completed).length}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">Monthly Avg</p>
            <p className="text-sm font-bold text-accent-green">{monthAvg}%</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-surface border border-border rounded-xl p-3 flex flex-col items-center justify-center text-center">
          <HiFire className="w-5 h-5 text-accent-orange mb-1" />
          <p className="text-[10px] font-bold text-text-muted uppercase">Streak</p>
          <p className="text-lg font-black text-text-primary">{currentStreak}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-3 flex flex-col items-center justify-center text-center">
          <HiCheckCircle className="w-5 h-5 text-accent-green mb-1" />
          <p className="text-[10px] font-bold text-text-muted uppercase">Today</p>
          <p className="text-lg font-black text-text-primary">{todayCompleted}/{todayGoals.length}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-3 flex flex-col items-center justify-center text-center">
          <HiChartBar className="w-5 h-5 text-accent-blue mb-1" />
          <p className="text-[10px] font-bold text-text-muted uppercase">Score</p>
          <p className="text-lg font-black text-text-primary">{todayRate}%</p>
        </div>
      </div>

      {/* Today's Goals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Today's Goals</h3>
          {todayGoals.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-surface border border-border text-text-primary">
              {todayCompleted} of {todayGoals.length}
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4">
          {todayGoals.map((goal) => (
            <TodayGoalItem key={goal.id} goal={goal} />
          ))}
          {todayGoals.length === 0 && (
            <div className="text-center py-8 bg-surface/50 border border-dashed border-border rounded-xl">
              <p className="text-xs text-text-muted italic">No goals set for today yet.</p>
            </div>
          )}
        </div>
        
        <AddGoalCard />
      </div>

      {/* Today's Habits */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Today's Habits</h3>
        </div>

        <div className="space-y-3 mb-6">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
          {habits.length === 0 && (
            <div className="text-center py-6 bg-surface/50 border border-dashed border-border rounded-xl">
              <p className="text-xs text-text-muted italic">No habits configured.</p>
            </div>
          )}
        </div>
      </div>

      {/* Settings Banner */}
      <div className="bg-surface/30 border border-border rounded-2xl p-5 text-center flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center mb-3">
          <span className="text-xl">⚡</span>
        </div>
        <p className="text-sm font-bold text-text-primary mb-1">Manage Your Habits</p>
        <p className="text-xs text-text-muted mb-4">
          To create, edit, or delete habits, head to Settings.
        </p>
        <button 
          onClick={onNavigateToSettings}
          className="px-5 py-2.5 bg-card border border-border hover:bg-white/5 transition-colors rounded-xl text-xs font-bold text-text-primary shadow-sm"
        >
          Go to Settings
        </button>
      </div>
    </div>
  );
}
