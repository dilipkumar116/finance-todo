import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryIcon, getCategoryById } from '../../utils/categories';
import { formatCurrency, formatTimeAgo } from '../../utils/helpers';
import useFinanceStore from '../../stores/useFinanceStore';
import { HiTrash, HiDotsVertical, HiX } from '../../utils/icons';

export default function ExpenseItem({ expense }) {
  const categories = useFinanceStore((s) => s.categories);
  const deleteExpense = useFinanceStore((s) => s.deleteExpense);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  if (!expense || !categories) return null;

  const cat = getCategoryById(categories, expense.category) || categories[0] || { name: 'Other', color: '#666', icon: 'food' };
  const Icon = getCategoryIcon(cat.icon);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 py-3 soft-separator group"
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: (cat.color || '#666') + '18' }}
      >
        <Icon className="w-5 h-5" style={{ color: cat.color }} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {expense.title || 'Untitled Expense'}
        </p>
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{cat.name}</p>
      </div>

      {/* Amount + Time or Actions */}
      <div className="text-right flex-shrink-0 flex items-center min-h-[40px]">
        <AnimatePresence mode="wait">
          {!showMenu ? (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1"
            >
              <div className="flex flex-col items-end mr-1">
                <p className="text-sm font-black text-text-primary">
                  {formatCurrency(expense.amount || 0)}
                </p>
                <p className="text-[10px] text-text-muted font-medium">
                  {formatTimeAgo(expense.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setShowMenu(true)}
                className="p-2 -mr-2 text-text-muted hover:text-text-primary transition-colors"
              >
                <HiDotsVertical className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1 bg-surface rounded-xl p-1 border border-border"
            >
              {showConfirm ? (
                <button
                  onClick={() => deleteExpense(expense.id)}
                  className="px-3 py-1.5 rounded-lg bg-accent-red text-white text-[10px] font-bold uppercase tracking-widest shadow-glow-red"
                >
                  Confirm Delete
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="p-1.5 rounded-lg text-accent-red hover:bg-accent-red/10 transition-colors"
                >
                  <HiTrash className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowConfirm(false);
                }}
                className="p-1.5 rounded-lg text-text-muted hover:bg-white/5 transition-colors"
              >
                <HiX className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
