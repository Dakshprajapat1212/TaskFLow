import { useState } from 'react';
import { X, User, Palette, LayoutGrid, Bell, Database, Monitor, Moon, Sun, Download, Trash2, CheckCircle2 } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useBoardStore } from '../store/useBoardStore';
import { useAuthStore } from '../store/useAuthStore';

const TABS = [
  { id: 'general', label: 'General', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'preferences', label: 'Preferences', icon: LayoutGrid },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'data', label: 'Data', icon: Database },
];

const SettingsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('general');
  const { user } = useAuthStore();
  const { 
    theme, setTheme, timezone, defaultView, defaultSort, 
    taskUpdates, dueReminders, assignmentNotifs, updateSettings 
  } = useSettingsStore();
  
  const { allWorkspaceTasks, fetchAllWorkspaceTasks, bulkDeleteTasks } = useBoardStore();
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleExport = async () => {
    setExporting(true);
    await fetchAllWorkspaceTasks();
    // In a real app we'd wait for state to update, but we'll use a small timeout hack for this synchronous-feeling action
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(useBoardStore.getState().allWorkspaceTasks, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `taskflow_export_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      setExporting(false);
      showSuccess('Data exported successfully.');
    }, 500);
  };

  const handleClearCompleted = async () => {
    if (window.confirm("Are you sure you want to delete all completed tasks across all boards? This cannot be undone.")) {
      setClearing(true);
      await fetchAllWorkspaceTasks();
      setTimeout(async () => {
        const completed = useBoardStore.getState().allWorkspaceTasks.filter(t => t.status === 'done');
        const ids = completed.map(t => t._id);
        if (ids.length > 0) {
          await bulkDeleteTasks(ids);
          showSuccess(`Cleared ${ids.length} completed tasks.`);
        } else {
          showSuccess('No completed tasks to clear.');
        }
        setClearing(false);
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-4xl bg-white dark:bg-[#09090b] rounded-xl shadow-vercel-xl border border-zinc-200 dark:border-zinc-800 flex overflow-hidden animate-slide-up max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-64 bg-zinc-50/50 dark:bg-[#09090b] border-r border-zinc-200 dark:border-zinc-800 p-4 shrink-0 overflow-y-auto">
          <div className="mb-6 px-2">
            <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Settings</h2>
            <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5">Manage your workspace preferences</p>
          </div>
          <nav className="space-y-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                    isActive 
                      ? 'bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100' 
                      : 'text-zinc-600 hover:bg-zinc-200/40 dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[1.5]" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-[#09090b]">
          <div className="flex justify-between items-center px-8 py-5 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0">
            <h3 className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">{TABS.find(t => t.id === activeTab)?.label}</h3>
            <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors dark:hover:text-zinc-200 dark:hover:bg-zinc-800">
              <X className="w-4 h-4 stroke-[2]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            {successMsg && (
              <div className="mb-6 flex items-center gap-2 text-[12px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-3 py-2 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 stroke-[2]" /> {successMsg}
              </div>
            )}

            {activeTab === 'general' && (
              <div className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Profile Name</label>
                  <input type="text" readOnly value={user?.name || ''} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-[13px] text-zinc-500 dark:text-zinc-400 cursor-not-allowed" />
                  <p className="text-[11px] text-zinc-400 mt-1.5">Your profile name is managed by your identity provider.</p>
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Email Address</label>
                  <input type="text" readOnly value={user?.email || ''} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-[13px] text-zinc-500 dark:text-zinc-400 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Timezone</label>
                  <select 
                    value={timezone} 
                    onChange={(e) => updateSettings({ timezone: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-md text-[13px] text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-900 outline-none"
                  >
                    <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>System Default ({Intl.DateTimeFormat().resolvedOptions().timeZone})</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => setTheme('light')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border ${theme === 'light' ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                    >
                      <Sun className="w-6 h-6 mb-2 stroke-[1.5] text-zinc-700 dark:text-zinc-300" />
                      <span className="text-[12px] font-medium text-zinc-900 dark:text-zinc-100">Light</span>
                    </button>
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border ${theme === 'dark' ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                    >
                      <Moon className="w-6 h-6 mb-2 stroke-[1.5] text-zinc-700 dark:text-zinc-300" />
                      <span className="text-[12px] font-medium text-zinc-900 dark:text-zinc-100">Dark</span>
                    </button>
                    <button 
                      onClick={() => setTheme('system')}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border ${theme === 'system' ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                    >
                      <Monitor className="w-6 h-6 mb-2 stroke-[1.5] text-zinc-700 dark:text-zinc-300" />
                      <span className="text-[12px] font-medium text-zinc-900 dark:text-zinc-100">System</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Default Board View</label>
                  <select 
                    value={defaultView}
                    onChange={(e) => updateSettings({ defaultView: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-md text-[13px] text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-900 outline-none"
                  >
                    <option value="kanban">Kanban Board</option>
                    <option value="list">List View (Coming Soon)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Default Task Sorting</label>
                  <select 
                    value={defaultSort}
                    onChange={(e) => updateSettings({ defaultSort: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-md text-[13px] text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-900 outline-none"
                  >
                    <option value="custom">Custom (Drag & Drop)</option>
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 max-w-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">Task Updates</h4>
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Receive notifications when tasks change status.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={taskUpdates} onChange={(e) => updateSettings({ taskUpdates: e.target.checked })} />
                    <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-100"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">Due Date Reminders</h4>
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Get notified when a task is due soon.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={dueReminders} onChange={(e) => updateSettings({ dueReminders: e.target.checked })} />
                    <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-100"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">Assignment Notifications</h4>
                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Receive an alert when a task is assigned to you.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={assignmentNotifs} onChange={(e) => updateSettings({ assignmentNotifs: e.target.checked })} />
                    <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-100"></div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6 max-w-lg">
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 bg-white dark:bg-[#09090b]">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md shrink-0">
                      <Download className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Export Workspace Data</h4>
                      <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-1 mb-3">Download a complete JSON export of all your boards, tasks, subtasks, and comments.</p>
                      <button 
                        onClick={handleExport}
                        disabled={exporting}
                        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-[12px] font-medium rounded-md transition-colors disabled:opacity-50"
                      >
                        {exporting ? 'Exporting...' : 'Export JSON'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border border-red-200 dark:border-red-900/30 rounded-xl p-5 bg-red-50/50 dark:bg-red-900/10">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-md shrink-0">
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-semibold text-red-600 dark:text-red-400 tracking-tight">Clear Completed Tasks</h4>
                      <p className="text-[12px] text-red-500/80 dark:text-red-400/80 mt-1 mb-3">Permanently delete all tasks marked as "done" across all projects. This action cannot be undone.</p>
                      <button 
                        onClick={handleClearCompleted}
                        disabled={clearing}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[12px] font-medium rounded-md transition-colors disabled:opacity-50"
                      >
                        {clearing ? 'Clearing...' : 'Clear Completed'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
