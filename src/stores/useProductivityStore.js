import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useProductivityStore = create(
  persist(
    (set) => ({
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
            const currentCompletions = habit.completions || [];
            const hasCompleted = currentCompletions.includes(dateStr);
            const newCompletions = hasCompleted
              ? currentCompletions.filter(d => d !== dateStr)
              : [...currentCompletions, dateStr];
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

      moveHabitUp: (id) => set((state) => {
        const index = state.habits.findIndex(h => h.id === id);
        if (index <= 0) return state; // Already at top
        const newHabits = [...state.habits];
        [newHabits[index - 1], newHabits[index]] = [newHabits[index], newHabits[index - 1]];
        return { habits: newHabits };
      }),

      moveHabitDown: (id) => set((state) => {
        const index = state.habits.findIndex(h => h.id === id);
        if (index === -1 || index === state.habits.length - 1) return state; // Already at bottom
        const newHabits = [...state.habits];
        [newHabits[index], newHabits[index + 1]] = [newHabits[index + 1], newHabits[index]];
        return { habits: newHabits };
      }),
      
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

export const getHabitCompletionRateForDate = (habits, dateStr) => {
  if (!habits || habits.length === 0) return 0;
  const completed = habits.filter(h => h.completions && h.completions.includes(dateStr)).length;
  return Math.round((completed / habits.length) * 100);
};

export const getMonthlyHabitData = (habits, year, month) => {
  // month is 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const data = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = getLocalDateString(new Date(year, month, i));
    const rate = getHabitCompletionRateForDate(habits, dStr);
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

export const getLongestStreak = (habit) => {
  if (!habit || !habit.completions || habit.completions.length === 0) return 0;
  
  // Sort completions chronologically
  const sorted = [...habit.completions].sort();
  
  let maxStreak = 0;
  let currentStreak = 0;
  let prevDate = null;

  for (const dateStr of sorted) {
    const currDate = new Date(dateStr);
    currDate.setHours(0, 0, 0, 0); // normalize time

    if (!prevDate) {
      currentStreak = 1;
    } else {
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        currentStreak = 1; // reset streak
      }
    }
    maxStreak = Math.max(maxStreak, currentStreak);
    prevDate = currDate;
  }
  
  return maxStreak;
};

export const getWeeklyHabitProductivity = (habits) => {
  const data = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dStr = getLocalDateString(d);
    const rate = getHabitCompletionRateForDate(habits, dStr);
    // e.g. "Mon"
    const dayName = d.toLocaleDateString(undefined, { weekday: 'short' }); 
    data.push({ dateStr: dStr, label: dayName, rate });
  }
  return data;
};


export const getHabitLeaderboard = (habits) => {
  if (!habits) return [];
  return [...habits]
    .map(h => ({
      ...h,
      totalCompletions: h.completions ? h.completions.length : 0
    }))
    .sort((a, b) => b.totalCompletions - a.totalCompletions);
};

export const getTotalCompletions = (habits) => {
  if (!habits) return 0;
  return habits.reduce((acc, habit) => acc + (habit.completions ? habit.completions.length : 0), 0);
};
