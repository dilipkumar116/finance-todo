export const exportData = (financeState, todoState) => {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    finance: {
      expenses: financeState.expenses,
      categories: financeState.categories,
    },
    todo: {
      tasks: todoState.tasks,
    },
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `productivity-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.version || !data.finance || !data.todo) {
          reject(new Error('Invalid backup file format'));
          return;
        }
        resolve(data);
      } catch (err) {
        reject(new Error('Failed to parse backup file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatTimeAgo = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const getFilterDateRange = (filter) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case 'Today':
      return { start: startOfDay, end: now };
    case 'Last Week': {
      const start = new Date(startOfDay);
      start.setDate(start.getDate() - 7);
      return { start, end: now };
    }
    case 'Last Month': {
      const start = new Date(startOfDay);
      start.setMonth(start.getMonth() - 1);
      return { start, end: now };
    }
    case 'Last Year': {
      const start = new Date(startOfDay);
      start.setFullYear(start.getFullYear() - 1);
      return { start, end: now };
    }
    case 'Overall':
    default:
      return { start: new Date(0), end: now };
  }
};

export const scheduleNotification = (taskId, title, body, date, recurring = false) => {
  if (Notification.permission !== 'granted') return;

  const now = new Date().getTime();
  const target = new Date(date).getTime();
  const delay = target - now;

  if (delay > 0) {
    setTimeout(() => {
      new Notification(title, { body, icon: '/vite.svg' });
      if (recurring) {
        // Schedule next day
        const nextDay = new Date(target + 24 * 60 * 60 * 1000);
        scheduleNotification(taskId, title, body, nextDay, true);
      }
    }, delay);
  }
};
