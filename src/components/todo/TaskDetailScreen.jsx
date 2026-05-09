import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowLeft, HiTrash, HiPlus, HiCheck, HiX, HiClock } from '../../utils/icons';
import { BsPinAngle, BsPinAngleFill } from '../../utils/icons';
import useTodoStore from '../../stores/useTodoStore';

export default function TaskDetailScreen({ task, onClose }) {
  const togglePin = useTodoStore((s) => s.togglePin);
  const deleteTask = useTodoStore((s) => s.deleteTask);
  const editTask = useTodoStore((s) => s.editTask);
  
  const [localTitle, setLocalTitle] = useState(task?.title || '');
  const [localDesc, setLocalDesc] = useState(task?.description || '');
  const [localChecklist, setLocalChecklist] = useState(task?.checklist || []);
  const [localReminder, setLocalReminder] = useState(task?.reminder || { enabled: false, time: '', recurring: false });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReminderMenu, setShowReminderMenu] = useState(false);

  // Autosave when local state changes
  useEffect(() => {
    if (!task) return;
    const timeoutId = setTimeout(() => {
      editTask(task.id, {
        title: localTitle,
        description: localDesc,
        checklist: localChecklist,
        reminder: localReminder.enabled ? localReminder : null,
      });
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [localTitle, localDesc, localChecklist, localReminder, task?.id]);

  if (!task) return null;

  const handleConfirmDelete = () => {
    deleteTask(task.id);
    onClose();
  };

  const addChecklistItem = () => {
    setLocalChecklist([...localChecklist, { text: '', done: false }]);
  };

  const updateChecklistItem = (idx, text) => {
    const newList = [...localChecklist];
    newList[idx].text = text;
    setLocalChecklist(newList);
  };

  const toggleCheckItem = (idx) => {
    const newList = [...localChecklist];
    newList[idx].done = !newList[idx].done;
    setLocalChecklist(newList);
  };

  const deleteCheckItem = (idx) => {
    setLocalChecklist(localChecklist.filter((_, i) => i !== idx));
  };

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 350, mass: 0.8 }}
      className="fixed inset-0 z-[110] bg-primary flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
            <HiArrowLeft className="w-6 h-6 text-text-primary" />
          </button>
          <AnimatePresence mode="wait">
            {showDeleteConfirm && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="text-xs font-bold text-accent-red uppercase tracking-wider"
              >
                Confirm Delete?
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1">
          {showDeleteConfirm ? (
            <>
              <button 
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-btn bg-accent-red text-white text-[10px] font-bold uppercase tracking-widest shadow-glow-red"
              >
                Yes, Delete
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="p-2 rounded-xl hover:bg-white/5 text-text-muted"
              >
                <HiX className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setShowReminderMenu(!showReminderMenu)}
                className={`p-2 rounded-xl transition-colors ${showReminderMenu || localReminder.enabled ? 'text-accent-blue bg-accent-blue/10' : 'text-text-primary hover:bg-white/5'}`}
              >
                <HiClock className="w-5 h-5" />
              </button>
              <button onClick={() => togglePin(task.id)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                {task.pinned ? (
                  <BsPinAngleFill className="w-5 h-5 text-accent-yellow shadow-glow-yellow" />
                ) : (
                  <BsPinAngle className="w-5 h-5 text-text-primary" />
                )}
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)} 
                className="p-2 rounded-xl hover:bg-accent-red/10 transition-colors"
              >
                <HiTrash className="w-5 h-5 text-accent-red" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Reminder Menu Panel */}
      <AnimatePresence>
        {showReminderMenu && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 border-b border-border bg-surface/30 overflow-hidden"
          >
            <div className="py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-text-primary">Enable Reminder</span>
                <input 
                  type="checkbox" 
                  checked={localReminder.enabled} 
                  onChange={(e) => setLocalReminder({...localReminder, enabled: e.target.checked})} 
                  className="accent-accent-blue w-4 h-4 cursor-pointer"
                />
              </div>
              {localReminder.enabled && (
                <div className="flex items-center gap-3">
                  <input 
                    type="time" 
                    value={localReminder.time} 
                    onChange={(e) => setLocalReminder({...localReminder, time: e.target.value})}
                    className="bg-card px-3 py-2 rounded-lg text-sm text-text-primary border border-border outline-none focus:border-accent-blue"
                  />
                  <button 
                    onClick={() => setLocalReminder({...localReminder, recurring: !localReminder.recurring})}
                    className={`text-[10px] font-bold px-3 py-2.5 rounded-lg transition-colors flex-1 uppercase tracking-widest ${localReminder.recurring ? 'bg-accent-blue text-primary' : 'bg-card text-text-muted border border-border'}`}
                  >
                    {localReminder.recurring ? 'Recurring Daily' : 'Once'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-24">
        <div className="space-y-2">
          <input 
            type="text" 
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            className="w-full bg-transparent text-2xl font-bold text-text-primary outline-none"
            placeholder="Untitled"
          />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-accent-green bg-accent-green/10 px-2 py-0.5 rounded-full uppercase">Autosaved</span>
            <p className="text-[10px] text-text-muted italic">
              {new Date(task.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {task.type !== 'checklist' ? (
          <textarea 
            value={localDesc}
            onChange={(e) => setLocalDesc(e.target.value)}
            className="w-full bg-transparent text-text-secondary leading-relaxed outline-none resize-none min-h-[400px]"
            placeholder="Type your note here..."
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Checklist</h3>
              <p className="text-xs text-accent-green font-bold">
                {Math.round((localChecklist.filter(i => i.done).length / localChecklist.length) * 100 || 0)}%
              </p>
            </div>
            <div className="space-y-3">
              {localChecklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 group">
                  <button 
                    onClick={() => toggleCheckItem(idx)}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.done ? 'bg-accent-green border-accent-green' : 'border-border hover:border-text-muted'}`}
                  >
                    {item.done && <HiCheck className="w-3.5 h-3.5 text-primary" />}
                  </button>
                  <input 
                    type="text" 
                    value={item.text}
                    onChange={(e) => updateChecklistItem(idx, e.target.value)}
                    className={`flex-1 bg-transparent text-sm outline-none ${item.done ? 'text-text-muted line-through' : 'text-text-primary'}`}
                    placeholder="Checklist item..."
                  />
                  <button onClick={() => deleteCheckItem(idx)} className="p-1 text-accent-red opacity-40 hover:opacity-100"><HiX className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <button 
                onClick={addChecklistItem}
                className="flex items-center gap-3 w-full py-3 text-accent-green text-sm font-medium hover:bg-accent-green/5 rounded-xl border border-dashed border-accent-green/30 transition-colors px-4 mt-2"
              >
                <HiPlus className="w-4 h-4" /> Add New Item
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
