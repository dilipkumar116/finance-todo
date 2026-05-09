import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiDownload, HiUpload, HiBell, HiPencil, HiTrash, HiCheck } from '../utils/icons';
import useFinanceStore from '../stores/useFinanceStore';
import useTodoStore from '../stores/useTodoStore';
import { exportData, importData } from '../utils/helpers';
import { CATEGORY_ICONS, DEFAULT_CATEGORIES } from '../utils/categories';

export default function SettingsScreen() {
  const financeStore = useFinanceStore();
  const todoStore = useTodoStore();
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [notifPermission, setNotifPermission] = useState(Notification.permission);

  const handleExport = () => {
    exportData(financeStore, todoStore);
    setImportStatus('Data exported!');
    setTimeout(() => setImportStatus(''), 2000);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importData(file);
      financeStore.importFinanceData(data.finance);
      todoStore.importTodoData(data.todo);
      setImportStatus('Data imported successfully!');
      setTimeout(() => setImportStatus(''), 2000);
    } catch (err) {
      setImportStatus(`Error: ${err.message}`);
      setTimeout(() => setImportStatus(''), 3000);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const requestNotifPermission = async () => {
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
      className="h-full flex flex-col px-5 pt-5 pb-24 overflow-y-auto no-scrollbar"
    >
      <h1 className="text-2xl font-bold text-text-primary mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Data Management */}
        <section>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Data Management</h3>
          <div className="space-y-2">
            <button onClick={handleExport} className="w-full flex items-center gap-3 px-4 py-3 rounded-btn bg-card border border-border hover:bg-card-hover transition-colors">
              <HiDownload className="w-5 h-5 text-accent-blue" />
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">Export Data</p>
                <p className="text-[10px] text-text-muted">Download your productivity backup</p>
              </div>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-3 rounded-btn bg-card border border-border hover:bg-card-hover transition-colors">
              <HiUpload className="w-5 h-5 text-accent-green" />
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">Import Data</p>
                <p className="text-[10px] text-text-muted">Restore from a JSON backup</p>
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            {importStatus && <p className={`text-[10px] text-center mt-1 ${importStatus.startsWith('Error') ? 'text-accent-red' : 'text-accent-green'}`}>{importStatus}</p>}
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Notifications</h3>
          <button 
            onClick={requestNotifPermission}
            disabled={notifPermission === 'granted'}
            className="w-full flex items-center justify-between px-4 py-3 rounded-btn bg-card border border-border hover:bg-card-hover transition-colors disabled:opacity-60"
          >
            <div className="flex items-center gap-3">
              <HiBell className={`w-5 h-5 ${notifPermission === 'granted' ? 'text-accent-green' : 'text-text-muted'}`} />
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">Push Notifications</p>
                <p className="text-[10px] text-text-muted">Required for task reminders</p>
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${notifPermission === 'granted' ? 'bg-accent-green/20 text-accent-green' : 'bg-surface text-text-muted'}`}>
              {notifPermission === 'granted' ? 'Enabled' : 'Request'}
            </span>
          </button>
        </section>

        {/* Categories */}
        <section>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Finance Categories</h3>
          <div className="grid grid-cols-2 gap-2">
            {financeStore.categories.map((cat) => (
              <div key={cat.id} className="p-3 rounded-btn bg-card border border-border flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + '18' }}>
                    {(() => {
                      const Icon = CATEGORY_ICONS[cat.icon] || HiDownload;
                      return <Icon className="w-4 h-4" style={{ color: cat.color }} />;
                    })()}
                  </div>
                  <button onClick={() => setEditingCategory(cat)} className="p-1.5 rounded-md hover:bg-white/5 transition-colors">
                    <HiPencil className="w-3.5 h-3.5 text-text-muted" />
                  </button>
                </div>
                <p className="text-xs font-medium text-text-primary truncate">{cat.name}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Edit Category Modal */}
      <AnimatePresence>
        {editingCategory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingCategory(null)} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-card rounded-card border border-border p-6 shadow-card"
            >
              <h2 className="text-lg font-bold text-text-primary mb-4">Edit Category</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Name</label>
                  <input 
                    type="text" value={editingCategory.name} 
                    onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-input bg-surface border border-border text-sm text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Icon</label>
                  <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto no-scrollbar p-1">
                    {Object.keys(CATEGORY_ICONS).map((iconName) => {
                      const Icon = CATEGORY_ICONS[iconName];
                      return (
                        <button 
                          key={iconName} 
                          onClick={() => setEditingCategory({...editingCategory, icon: iconName})}
                          className={`flex items-center justify-center p-2 rounded-lg border ${editingCategory.icon === iconName ? 'bg-accent-green/20 border-accent-green' : 'bg-surface border-border'}`}
                        >
                          <Icon className={`w-5 h-5 ${editingCategory.icon === iconName ? 'text-accent-green' : 'text-text-muted'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => setEditingCategory(null)} 
                    className="flex-1 py-2.5 rounded-btn bg-surface text-text-primary text-sm font-medium"
                  >Cancel</button>
                  <button 
                    onClick={() => {
                      financeStore.editCategory(editingCategory.id, editingCategory);
                      setEditingCategory(null);
                    }} 
                    className="flex-1 py-2.5 rounded-btn bg-accent-green text-primary text-sm font-bold"
                  >Save</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
