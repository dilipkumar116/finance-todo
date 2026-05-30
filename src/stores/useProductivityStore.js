import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useProductivityStore = create(
  persist(
    (set, get) => ({
      goals: [],
      habits: [],

      // Goals Actions
      addGoal: (goalData) => set((state) => ({
        goals: [
          {
            id: Date.now().toString(),
            completed: false,
            completedAt: null,
            createdAt: new Date().toISOString(),
            ...goalData,
          },
          ...state.goals,
        ],
      })),

      toggleGoal: (id) => set((state) => {
        const goals = state.goals.map((goal) => {
          if (goal.id === id) {
            const isCompleted = !goal.completed;
            return {
              ...goal,
              completed: isCompleted,
              completedAt: isCompleted ? new Date().toISOString() : null,
            };
          }
          return goal;
        });
        return { goals };
      }),

      editGoal: (id, updates) => set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g),
      })),

      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter(g => g.id !== id),
      })),

      // Habits Actions
      addHabit: (habitData) => set((state) => ({
        habits: [
          {
            id: Date.now().toString(),
            completions: [],
            createdAt: new Date().toISOString(),
            ...habitData,
          },
          ...state.habits,
        ],
      })),

      toggleHabitForDate: (id, dateStr) => set((state) => {
        const habits = state.habits.map((habit) => {
          if (habit.id === id) {
            const hasCompleted = habit.completions.includes(dateStr);
            const newCompletions = hasCompleted
              ? habit.completions.filter(d => d !== dateStr)
              : [...habit.completions, dateStr];
            return { ...habit, completions: newCompletions };
          }
          return habit;
        });
        return { habits };
      }),

      editHabit: (id, updates) => set((state) => ({
        habits: state.habits.map(h => h.id === id ? { ...h, ...updates } : h),
      })),

      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter(h => h.id !== id),
      })),
      
      // We can also import Productivity data if needed later
      importProductivityData: (data) => set(() => ({
        goals: data.goals || [],
        habits: data.habits || [],
      })),

    }),
    {
      name: 'prodance-productivity-storage',
    }
  )
);

export default useProductivityStore;

// --- Helper Functions ---

// Returns local date string in YYYY-MM-DD format based on local time
export const getLocalDateString = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getGoalsForDate = (goals, dateStr) => {
  return goals.filter(g => g.date === dateStr).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getCompletionRate = (goals, dateStr) => {
  const dailyGoals = getGoalsForDate(goals, dateStr);
  if (dailyGoals.length === 0) return 0;
  const completed = dailyGoals.filter(g => g.completed).length;
  return Math.round((completed / dailyGoals.length) * 100);
};

export const getMonthlyData = (goals, year, month) => {
  // month is 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const data = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = getLocalDateString(new Date(year, month, i));
    const rate = getCompletionRate(goals, dStr);
    data.push({ day: i, dateStr: dStr, rate });
  }
  return data;
};

export const getCurrentStreak = (habit) => {
  if (!habit || !habit.completions || habit.completions.length === 0) return 0;
  
  const todayStr = getLocalDateString(new Date());
  let streak = 0;
  let currentCheck = new Date();
  
  // Start checking from today backwards
  while (true) {
    const checkStr = getLocalDateString(currentCheck);
    if (habit.completions.includes(checkStr)) {
      streak++;
    } else {
      // If we miss today, that's fine, the streak might still be active up to yesterday.
      // But if we miss yesterday and beyond, the streak is broken.
      if (checkStr !== todayStr) {
         break;
      }
    }
    // Go back one day
    currentCheck.setDate(currentCheck.getDate() - 1);
  }
  return streak;
};

export const getWeeklyProductivity = (goals) => {
  const data = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dStr = getLocalDateString(d);
    const rate = getCompletionRate(goals, dStr);
    // e.g. "Mon"
    const dayName = d.toLocaleDateString(undefined, { weekday: 'short' }); 
    data.push({ dateStr: dStr, label: dayName, rate });
  }
  return data;
};
