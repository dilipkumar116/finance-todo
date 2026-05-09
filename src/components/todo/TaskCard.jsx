import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BsPinAngle, BsPinAngleFill } from '../../utils/icons';
import useTodoStore from '../../stores/useTodoStore';

export default function TaskCard({ task, onClick }) {
  const togglePin = useTodoStore((s) => s.togglePin);
  const toggleChecklistItem = useTodoStore((s) => s.toggleChecklistItem);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: task.color,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  const completedItems = task.checklist?.filter((i) => i.done).length || 0;
  const totalItems = task.checklist?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`rounded-card p-4 shadow-card group cursor-grab active:cursor-grabbing
                 border border-transparent hover:border-white/5
                 transition-colors duration-200 relative aspect-square flex flex-col overflow-hidden ${isDragging ? 'shadow-2xl ring-2 ring-accent-green/50' : ''}`}
    >
      {/* Top Actions */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary leading-snug truncate">
            {task.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePin(task.id);
            }}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors duration-100"
          >
            {task.pinned ? (
              <BsPinAngleFill className="w-5 h-5 text-accent-yellow shadow-glow-yellow" />
            ) : (
              <BsPinAngle className="w-5 h-5 text-text-primary opacity-80 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && task.type !== 'checklist' && (
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-4 mb-2">
          {task.description}
        </p>
      )}

      {/* Checklist */}
      {task.type === 'checklist' && task.checklist.length > 0 && (
        <div className="space-y-1.5 mb-2 pointer-events-none">
          {task.checklist.slice(0, 4).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded border ${item.done ? 'bg-accent-green border-accent-green' : 'border-text-muted'}`} />
              <span className={`text-[10px] leading-snug truncate ${item.done ? 'text-text-muted line-through' : 'text-text-secondary'}`}>
                {item.text}
              </span>
            </div>
          ))}
          {totalItems > 0 && (
            <div className="mt-auto pt-2">
              <div className="w-full bg-white/5 rounded-full h-1">
                <div
                  className="h-1 rounded-full bg-accent-green transition-all duration-300"
                  style={{ width: `${(completedItems / totalItems) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Due Date Indicator */}
      {task.dueDate && (
        <div className="mt-auto pt-1">
          <p className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">
            {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>
        </div>
      )}
    </div>
  );
}
