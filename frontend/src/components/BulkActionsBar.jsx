import { Trash2 } from 'lucide-react';

const BulkActionsBar = ({ selectedCount, onMove, onDelete, onSetCategory, onSetPriority, onClear }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl">
        <span className="text-sm font-medium">{selectedCount} selected</span>
        <div className="w-px h-5 bg-slate-700" />

        <select
          onChange={(e) => {
            if (e.target.value) onMove(e.target.value);
            e.target.value = '';
          }}
          className="bg-slate-800 text-white text-xs rounded-md px-2 py-1.5 border border-slate-700 outline-none cursor-pointer"
          defaultValue=""
        >
          <option value="" disabled>
            Move to...
          </option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          onChange={(e) => {
            if (e.target.value) onSetPriority(e.target.value);
            e.target.value = '';
          }}
          className="bg-slate-800 text-white text-xs rounded-md px-2 py-1.5 border border-slate-700 outline-none cursor-pointer"
          defaultValue=""
        >
          <option value="" disabled>
            Priority...
          </option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          onChange={(e) => {
            if (e.target.value) onSetCategory(e.target.value);
            e.target.value = '';
          }}
          className="bg-slate-800 text-white text-xs rounded-md px-2 py-1.5 border border-slate-700 outline-none cursor-pointer"
          defaultValue=""
        >
          <option value="" disabled>
            Category...
          </option>
          <option value="Development">Development</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
          <option value="HR">HR</option>
          <option value="QA">QA</option>
        </select>

        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-300 hover:text-red-200 hover:bg-red-900/30 rounded-md transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>

        <button
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-white transition-colors ml-1"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default BulkActionsBar;

