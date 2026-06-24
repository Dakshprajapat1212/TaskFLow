import { useState } from 'react';
import { X, LayoutGrid } from 'lucide-react';
import { useBoardStore } from '../store/useBoardStore';

const CreateBoardModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { createBoard, isLoading, error, clearError } = useBoardStore();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBoard(title, description);
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      // Error handled in store
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    clearError();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#09090b] w-full max-w-[440px] rounded-xl shadow-vercel-xl border border-zinc-200 dark:border-zinc-800 animate-slide-up">
        
        {/* Header */}
        <div className="flex justify-between items-start px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
              <LayoutGrid className="w-4 h-4 text-zinc-500 stroke-[1.5]" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">Create New Project</h2>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5">Set up a new workspace for your tasks.</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 px-3 py-2.5 rounded-md text-[13px] border border-red-200 dark:border-red-900/30">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[12px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Project Title
            </label>
            <input
              type="text"
              required
              autoFocus
              className="w-full px-3 py-2 text-[13px] border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 outline-none transition-all placeholder:text-zinc-400 shadow-vercel-sm"
              placeholder="e.g. Q4 Marketing Campaign"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) clearError();
              }}
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 flex justify-between">
              Description <span className="text-zinc-400 font-normal">Optional</span>
            </label>
            <textarea
              className="w-full px-3 py-2 text-[13px] border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 outline-none transition-all resize-none placeholder:text-zinc-400 shadow-vercel-sm"
              placeholder="Briefly describe the goal of this project."
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-[13px] font-medium rounded-md transition-colors disabled:opacity-50 flex items-center shadow-vercel-sm"
            >
              {isLoading && <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white dark:border-zinc-900/20 dark:border-t-zinc-900 rounded-full animate-spin mr-2"></span>}
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;
