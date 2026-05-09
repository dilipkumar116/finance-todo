import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import { generateId, getFilterDateRange } from '../utils/helpers';

const useFinanceStore = create(
  persist(
    (set, get) => ({
      expenses: [],
      categories: [...DEFAULT_CATEGORIES],
      filter: 'Last Month',

      addExpense: (expense) => {
        const newExpense = {
          id: generateId(),
          ...expense,
          createdAt: expense.date ? new Date(expense.date).toISOString() : new Date().toISOString(),
        };
        set((state) => ({
          expenses: [newExpense, ...state.expenses],
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }));
      },

      editExpense: (id, updates) => {
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        }));
      },

      setFilter: (filter) => set({ filter }),

      addCategory: (category) => {
        const newCat = { id: generateId(), ...category };
        set((state) => ({
          categories: [...state.categories, newCat],
        }));
      },

      editCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },

      importFinanceData: (data) => {
        set({
          expenses: data.expenses || [],
          categories: data.categories || [...DEFAULT_CATEGORIES],
        });
      },
    }),
    {
      name: 'finance-storage',
      version: 2,
      migrate: (persistedState, version) => {
        if (version < 2) {
          // Force update to the new default categories with vibrant colors
          persistedState.categories = [...DEFAULT_CATEGORIES];
        }
        return persistedState;
      },
    }
  )
);

// Derived data helpers (not selectors — call these in components)
export function getFilteredExpenses(expenses, filter) {
  const { start, end } = getFilterDateRange(filter);
  return expenses.filter((e) => {
    const date = new Date(e.createdAt);
    return date >= start && date <= end;
  });
}

export function getCategoryTotals(categories, filteredExpenses) {
  if (!categories || !filteredExpenses) return [];
  
  const totals = {};
  categories.forEach((cat) => { totals[cat.id] = 0; });

  filteredExpenses.forEach((exp) => {
    const catId = exp.category || exp.categoryId; // Handle both key names for safety
    if (totals[catId] !== undefined) {
      totals[catId] += exp.amount || 0;
    } else {
      // Map unknown/old categories to 'others'
      totals['others'] = (totals['others'] || 0) + (exp.amount || 0);
    }
  });

  return Object.entries(totals)
    .filter(([, amount]) => amount > 0)
    .map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId) || { name: 'Others', color: '#6B7280', id: 'others' };
      return { ...cat, total: amount };
    });
}

export function getTotalSpent(filteredExpenses) {
  return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getWeeklyTrend(expenses) {
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    return d;
  }).reverse();

  return last7Days.map(date => {
    const dayTotal = expenses
      .filter(exp => {
        const expDate = new Date(exp.createdAt);
        return expDate.getDate() === date.getDate() &&
               expDate.getMonth() === date.getMonth() &&
               expDate.getFullYear() === date.getFullYear();
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    return {
      date: date.toLocaleDateString(undefined, { weekday: 'short' }),
      total: dayTotal
    };
  });
}

export default useFinanceStore;
