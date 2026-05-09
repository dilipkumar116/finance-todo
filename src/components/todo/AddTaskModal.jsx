import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiPlus, HiTrash, HiBell } from 'react-icons/hi';
import { BsPinAngle, BsPinAngleFill } from 'react-icons/bs';
import useTodoStore from '../../stores/useTodoStore';
import { TASK_COLORS } from '../../utils/categories';

export default function AddTaskModal({ open, onClose }) {
  const addTask = useTodoStore((s) => s.addTask);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('note');
  const [dueDate, setDueDate] = useState('');
  const [reminder, setReminder] = useState({ enabled: false, time: '', recurring: false });
  const [color, setColor] = useState(TASK_COLORS[0].bg);
  const [checklist, setChecklist] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [pinned, setPinned] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('note');
    setDueDate('');
    setReminder({ enabled: false, time: '', recurring: false });
    setColor(TASK_COLORS[0].bg);
    setChecklist([]);
    setNewItem('');
    setPinned(false);
    setError('');
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    addTask({
      title: title.trim(),
      description: description.trim(),
      type,
      dueDate: dueDate || null,
      color,
      pinned,
      checklist: type === 'checklist' ? checklist : [],
      reminder: reminder.enabled ? reminder : null,
    });
    resetForm();
    onClose();
  };

  const addChecklistItem = () => {
    if (!newItem.trim()) return;
    setChecklist([...checklist, { text: newItem.trim(), done: false }]);
    setNewItem('');
  };

  const removeChecklistItem = (idx) => {
    setChecklist(checklist.filter((_, i) => i !== idx));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] modal-backdrop flex items-end justify-center"
          onClick={onClose}
        >
          <motion.form
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="w-full max-w-lg bg-card rounded-t-[28px] p-6 pb-10 max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-text-primary">New {type === 'note' ? 'Note' : type === 'task' ? 'Task' : 'Checklist'}</h2>
              <div className="flex items-center gap-1">
                <button 
                  type="button" 
                  onClick={() => setPinned(!pinned)} 
                  className={`p-2 rounded-xl transition-colors ${pinned ? 'bg-accent-yellow/10 text-accent-yellow shadow-glow-yellow' : 'hover:bg-surface text-text-primary'}`}
                >
                  {pinned ? <BsPinAngleFill className="w-5 h-5" /> : <BsPinAngle className="w-5 h-5" />}
                </button>
                <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-surface transition-colors">
                  <HiX className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-accent-red mb-3">{error}</p>}

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={title}
                autoFocus
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-input bg-surface border border-border text-sm text-text-primary focus:border-accent-green/40 outline-none"
              />

              <div className="flex gap-2">
                {['note', 'task', 'checklist'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 rounded-btn text-xs font-medium capitalize transition-all ${type === t ? 'bg-accent-green text-primary' : 'bg-surface text-text-secondary border border-border'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {type !== 'checklist' ? (
                <textarea
                  placeholder="Details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-input bg-surface border border-border text-sm text-text-primary outline-none resize-none"
                />
              ) : (
                <div className="space-y-2">
                  {checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded border border-text-muted" />
                      <span className="flex-1 text-sm text-text-secondary">{item.text}</span>
                      <button type="button" onClick={() => removeChecklistItem(idx)} className="p-1 text-accent-red"><HiTrash className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add item..."
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addChecklistItem(); } }}
                      className="flex-1 px-3 py-2 rounded-input bg-surface border border-border text-sm text-text-primary outline-none"
                    />
                    <button type="button" onClick={addChecklistItem} className="p-2 rounded-input bg-accent-green/20 text-accent-green"><HiPlus className="w-4 h-4" /></button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block uppercase">Due Date</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 rounded-input bg-surface border border-border text-xs text-text-primary outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block uppercase">Reminder</label>
                  <button 
                    type="button" 
                    onClick={() => setReminder({...reminder, enabled: !reminder.enabled})}
                    className={`w-full px-3 py-2 rounded-input border text-xs flex items-center justify-center gap-2 transition-colors ${reminder.enabled ? 'bg-accent-blue/10 border-accent-blue text-accent-blue' : 'bg-surface border-border text-text-muted'}`}
                  >
                    <HiBell className="w-3.5 h-3.5" />
                    {reminder.enabled ? 'Set' : 'Off'}
                  </button>
                </div>
              </div>

              {reminder.enabled && (
                <div className="p-3 rounded-btn bg-surface border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <input type="time" value={reminder.time} onChange={(e) => setReminder({...reminder, time: e.target.value})} className="bg-transparent text-sm text-text-primary outline-none" />
                    <button 
                      type="button" 
                      onClick={() => setReminder({...reminder, recurring: !reminder.recurring})}
                      className={`text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${reminder.recurring ? 'bg-accent-purple text-white' : 'bg-card text-text-muted'}`}
                    >
                      {reminder.recurring ? 'RECURRING' : 'ONCE'}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] text-text-muted mb-1.5 block uppercase">Color</label>
                <div className="flex gap-2">
                  {TASK_COLORS.map((c) => (
                    <button key={c.id} type="button" onClick={() => setColor(c.bg)} className={`w-7 h-7 rounded-full transition-all ${color === c.bg ? 'ring-2 ring-accent-green ring-offset-2 ring-offset-card scale-110' : ''}`} style={{ backgroundColor: c.bg }} />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-btn bg-accent-green text-primary font-bold text-sm shadow-glow-green mt-2"
              >
                Save {type}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
