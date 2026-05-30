import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { HiCheck, HiTrash } from '../../utils/icons';
import useProductivityStore from '../../stores/useProductivityStore';

export default function TodayGoalItem({ goal, onEdit }) {
  const toggleGoal = useProductivityStore((s) => s.toggleGoal);
  const deleteGoal = useProductivityStore((s) => s.deleteGoal);
  const controls = useAnimation();
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);

  const handleDragEnd = (e, info) => {
    if (info.offset.x < -80) {
      deleteGoal(goal.id);
    } else {
      controls.start({ x: 0 });
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-surface border border-border group">
      {/* Background Delete Action */}
      <motion.div 
        className="absolute inset-y-0 right-0 w-24 bg-accent-red flex items-center justify-end px-4"
        style={{ opacity: deleteOpacity }}
      >
        <HiTrash className="w-5 h-5 text-white" />
      </motion.div>

      {/* Foreground Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className="relative bg-surface p-3 flex items-center gap-3 z-10 touch-pan-y"
      >
        {/* Checkbox */}
        <button
          onClick={() => toggleGoal(goal.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
            goal.completed 
              ? 'bg-accent-green border-accent-green' 
              : 'bg-transparent border-border hover:border-accent-green'
          }`}
        >
          <motion.div
            initial={false}
            animate={{ scale: goal.completed ? 1 : 0, opacity: goal.completed ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <HiCheck className="w-4 h-4 text-primary" />
          </motion.div>
        </button>

        {/* Text */}
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onEdit && onEdit(goal)}
        >
          <p 
            className={`text-sm font-medium transition-all duration-200 truncate ${
              goal.completed ? 'text-text-muted line-through' : 'text-text-primary'
            }`}
          >
            {goal.text}
          </p>
          {goal.completedAt && (
            <p className="text-[10px] text-text-muted mt-0.5">
              Done at {new Date(goal.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Category Color Dot */}
        {goal.color && (
          <div 
            className="w-2 h-2 rounded-full flex-shrink-0 shadow-sm" 
            style={{ backgroundColor: goal.color }} 
          />
        )}
      </motion.div>
    </div>
  );
}
