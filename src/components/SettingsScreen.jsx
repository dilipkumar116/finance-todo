import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiDownload, HiUpload, HiBell, HiPencil, HiTrash, HiCheck } from '../utils/icons';
import useFinanceStore from '../stores/useFinanceStore';
import { exportData, importData } from '../utils/helpers';
import { CATEGORY_ICONS, DEFAULT_CATEGORIES } from '../utils/categories';
import CategorySafetyModal from './finance/CategorySafetyModal';

export default function SettingsScreen() {
  const financeStore = useFinanceStore();
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [safetyAction, setSafetyAction] = useState(null); // { mode: 'edit'|'delete', category, newData }

  const handleExport = () => {
    exportData(financeStore);
    setImportStatus('Data exported!');
    setTimeout(() => setImportStatus(''), 2000);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importData(file);
      financeStore.importFinanceData(data.finance);
      setImportStatus('Data imported successfully!');
      setTimeout(() => setImportStatus(''), 2000);
    } catch (err) {
      setImportStatus(`Error: ${err.message}`);
      setTimeout(() => setImportStatus(''), 3000);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
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
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditingCategory(cat)} className="p-1.5 rounded-md hover:bg-white/5 transition-colors">
                      <HiPencil className="w-3.5 h-3.5 text-text-muted" />
                    </button>
                    <button 
                      onClick={() => setDeletingCategory(cat)} 
                      className="p-1.5 rounded-md hover:bg-accent-red/10 transition-colors"
                    >
                      <HiTrash className="w-3.5 h-3.5 text-accent-red" />
                    </button>
                  </div>
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
                  <label className="text-xs text-text-muted mb-1 block">Color</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={editingCategory.color} 
                      onChange={(e) => setEditingCategory({...editingCategory, color: e.target.value})}
                      className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0 shadow-lg"
                    />
                    <div className="flex gap-2">
                      {['#05E099', '#FFD166', '#FF3366', '#00C2FF', '#FF007F', '#BB86FC'].map(c => (
                        <button 
                          key={c}
                          onClick={() => setEditingCategory({...editingCategory, color: c})}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${editingCategory.color === c ? 'border-white scale-110 shadow-glow-white' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
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
      {/* Unified Safety Modal (for both Edit and Delete) */}
      <AnimatePresence>
        {(safetyAction || deletingCategory) && (
          <CategorySafetyModal 
            mode={safetyAction ? safetyAction.mode : 'delete'}
            category={safetyAction ? safetyAction.category : deletingCategory}
            newData={safetyAction ? safetyAction.newData : null}
            onClose={() => {
              setSafetyAction(null);
              setDeletingCategory(null);
            }} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
