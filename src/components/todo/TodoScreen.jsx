import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiDotsVertical } from '../../utils/icons';
import SearchBar from './SearchBar';
import TaskGrid from './TaskGrid';
import AddTaskModal from './AddTaskModal';
import FAB from '../shared/FAB';
import TaskDetailScreen from './TaskDetailScreen';
import TodoMenu from './TodoMenu';

export default function TodoScreen() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h1 className="text-2xl font-bold text-text-primary">To Do</h1>
        <div className="flex items-center gap-1">
          <SearchBar />
          <button 
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-xl hover:bg-card transition-colors duration-150"
          >
            <HiDotsVertical className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>

      <TodoMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-24">
        <TaskGrid onTaskClick={setSelectedTask} />
      </div>

      {/* FAB */}
      <FAB onClick={() => setModalOpen(true)} />

      {/* Add Task Modal */}
      <AddTaskModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Task Detail Screen */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailScreen 
            task={selectedTask} 
            onClose={() => setSelectedTask(null)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
