import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import useTodoStore, { getFilteredTasks } from '../../stores/useTodoStore';
import TaskCard from './TaskCard';

export default function TaskGrid({ onTaskClick }) {
  const tasks = useTodoStore((s) => s.tasks);
  const searchQuery = useTodoStore((s) => s.searchQuery);
  const reorderTasks = useTodoStore((s) => s.reorderTasks);
  
  const filteredTasks = useMemo(() => getFilteredTasks(tasks, searchQuery), [tasks, searchQuery]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Avoid accidental drags when clicking
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);
      
      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      reorderTasks(newTasks);
    }
  };

  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <p className="text-text-muted text-sm">No tasks yet</p>
        <p className="text-text-muted text-xs mt-1">Tap + to create your first task</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-2 gap-4">
        <SortableContext 
          items={filteredTasks.map(t => t.id)} 
          strategy={rectSortingStrategy}
        >
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onClick={() => onTaskClick(task)}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
      </div>
    </DndContext>
  );
}
