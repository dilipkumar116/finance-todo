import { motion, AnimatePresence } from 'framer-motion';
import { HiTrash, HiCheckCircle, HiX } from '../../utils/icons';
import useTodoStore from '../../stores/useTodoStore';

export default function TodoMenu({ open, onClose }) {
  const clearCompleted = useTodoStore((s) => s.clearCompleted);
  const deleteAllTasks = useTodoStore((s) => s.deleteAllTasks);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-end p-5 pt-16 pointer-events-none">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/20 pointer-events-auto" onClick={onClose} 
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        className="relative w-48 bg-card border border-border rounded-xl shadow-card p-2 pointer-events-auto"
      >
        <div className="flex items-center justify-between px-3 py-2 mb-1 border-b border-border">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Options</span>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/5"><HiX className="w-3.5 h-3.5 text-text-muted" /></button>
        </div>
        
        <button 
          onClick={() => { clearCompleted(); onClose(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
        >
          <HiCheckCircle className="w-4 h-4 text-accent-green" />
          <span className="text-xs font-medium text-text-primary">Clear Completed</span>
        </button>

        <div className="h-px bg-border my-1" />

        <button 
          onClick={() => { if(confirm('Delete all tasks?')) { deleteAllTasks(); onClose(); } }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent-red/10 transition-colors text-left"
        >
          <HiTrash className="w-4 h-4 text-accent-red" />
          <span className="text-xs font-medium text-accent-red">Delete All</span>
        </button>
      </motion.div>
    </div>
  );
}
