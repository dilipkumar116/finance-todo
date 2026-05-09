import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../utils/helpers';

const useTodoStore = create(
  persist(
    (set, get) => ({
      tasks: [],
      searchQuery: '',

      addTask: (task) => {
        const newTask = {
          id: generateId(),
          title: task.title || '',
          description: task.description || '',
          type: task.type || 'note',
          checklist: task.checklist || [],
          dueDate: task.dueDate || null,
          pinned: false,
          color: task.color || '#1E1E1E',
          order: get().tasks.length,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },

      editTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      togglePin: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, pinned: !t.pinned } : t
          ),
        }));
      },

      toggleChecklistItem: (taskId, itemIndex) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const checklist = [...t.checklist];
            checklist[itemIndex] = {
              ...checklist[itemIndex],
              done: !checklist[itemIndex].done,
            };
            return { ...t, checklist };
          }),
        }));
      },

      reorderTasks: (activeId, overId) => {
        set((state) => {
          const tasks = [...state.tasks];
          const activeIdx = tasks.findIndex((t) => t.id === activeId);
          const overIdx = tasks.findIndex((t) => t.id === overId);
          if (activeIdx === -1 || overIdx === -1) return state;
          const [moved] = tasks.splice(activeIdx, 1);
          tasks.splice(overIdx, 0, moved);
          return { tasks };
        });
      },

      setSearchQuery: (query) => set({ searchQuery: query }),

      clearCompleted: () => {
        set((state) => ({
          tasks: state.tasks.filter((t) => {
            if (t.type !== 'checklist') return true;
            return !t.checklist.every(i => i.done);
          }),
        }));
      },

      deleteAllTasks: () => {
        set({ tasks: [] });
      },

      importTodoData: (data) => {
        set({
          tasks: data.tasks || [],
        });
      },

      reorderTasks: (newTasks) => {
        set({ tasks: newTasks });
      },
    }),
    {
      name: 'todo-storage',
    }
  )
);

export function getFilteredTasks(tasks, searchQuery) {
  let filtered = [...tasks];

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }

  // pinned first
  filtered.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  return filtered;
}

export default useTodoStore;
