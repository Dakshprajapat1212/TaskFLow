import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, FileText, CheckSquare, Tag, LayoutGrid, CircleDot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBoardStore } from '../store/useBoardStore';

const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const { allWorkspaceTasks, fetchAllWorkspaceTasks, boards } = useBoardStore();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    // Load recent searches
    const saved = localStorage.getItem('taskflow_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAllWorkspaceTasks();
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen, fetchAllWorkspaceTasks]);

  const saveRecentSearch = (term) => {
    if (!term.trim()) return;
    const newSearches = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(newSearches);
    localStorage.setItem('taskflow_recent_searches', JSON.stringify(newSearches));
  };

  const handleSelect = (task) => {
    saveRecentSearch(query);
    onClose();
    navigate(`/boards/${task.board}`);
  };

  const clearRecent = (e, term) => {
    e.stopPropagation();
    const newSearches = recentSearches.filter(s => s !== term);
    setRecentSearches(newSearches);
    localStorage.setItem('taskflow_recent_searches', JSON.stringify(newSearches));
  };

  if (!isOpen) return null;

  // Filter tasks
  const q = query.toLowerCase().trim();
  const results = q ? allWorkspaceTasks.filter(t => {
    const titleMatch = t.title?.toLowerCase().includes(q);
    const descMatch = t.description?.toLowerCase().includes(q);
    const statusMatch = t.status?.toLowerCase().includes(q);
    const tagMatch = t.tags?.some(tag => tag.toLowerCase().includes(q));
    const subtaskMatch = t.subtasks?.some(st => st.title?.toLowerCase().includes(q));
    
    return titleMatch || descMatch || statusMatch || tagMatch || subtaskMatch;
  }).slice(0, 10) : []; // Limit to 10 results for performance

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4 animate-fade-in bg-zinc-900/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-[600px] bg-white dark:bg-[#09090b] rounded-xl shadow-vercel-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative flex items-center px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <Search className="w-5 h-5 text-zinc-400 shrink-0 mr-3 stroke-[1.5]" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-[15px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            placeholder="Search tasks, descriptions, tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-zinc-400">
              <X className="w-4 h-4 stroke-[2]" />
            </button>
          )}
        </div>

        <div className="flex-1 max-h-[60vh] overflow-y-auto custom-scrollbar bg-zinc-50/50 dark:bg-[#09090b]">
          {!q && recentSearches.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Recent Searches</div>
              {recentSearches.map(term => (
                <div 
                  key={term} 
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800/50 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-zinc-400 stroke-[1.5]" />
                    <span className="text-[13px] text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">{term}</span>
                  </div>
                  <button onClick={(e) => clearRecent(e, term)} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                    <X className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {q && results.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Results</div>
              {results.map(task => {
                const boardName = boards.find(b => b._id === task.board)?.title || 'Unknown Board';
                return (
                  <div 
                    key={task._id} 
                    onClick={() => handleSelect(task)}
                    className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <FileText className="w-4 h-4 text-zinc-400 stroke-[1.5]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 truncate">{task.title}</h4>
                          <span className="shrink-0 text-[10px] px-1.5 py-0.5 bg-zinc-200/50 dark:bg-zinc-800/80 rounded-sm text-zinc-500 font-medium capitalize">{task.status}</span>
                        </div>
                        {task.description && (
                          <p className="text-[12px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mb-1.5">{task.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mt-1">
                          <span className="flex items-center gap-1"><LayoutGrid className="w-3 h-3 stroke-[1.5]" /> {boardName}</span>
                          {task.tags?.length > 0 && (
                            <span className="flex items-center gap-1"><Tag className="w-3 h-3 stroke-[1.5]" /> {task.tags[0]} {task.tags.length > 1 && `+${task.tags.length - 1}`}</span>
                          )}
                          {task.subtasks?.length > 0 && (
                            <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3 stroke-[1.5]" /> {task.subtasks.filter(st => st.completed || st.status==='done').length}/{task.subtasks.length}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {q && results.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Search className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mb-3 stroke-[1.5]" />
              <h3 className="text-[14px] font-medium text-zinc-900 dark:text-zinc-100 mb-1">No results found</h3>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400">We couldn't find anything matching "{query}".<br/>Try a different keyword.</p>
            </div>
          )}

          {!q && recentSearches.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-3">
                <Search className="w-5 h-5 text-zinc-400 stroke-[1.5]" />
              </div>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400">Search for tasks, descriptions, or tags across your workspace.</p>
            </div>
          )}
        </div>
        
        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] flex items-center gap-4 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 shrink-0">
          <span className="flex items-center gap-1"><kbd className="bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 shadow-sm text-[10px]">↑↓</kbd> to navigate</span>
          <span className="flex items-center gap-1"><kbd className="bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 shadow-sm text-[10px]">Enter</kbd> to select</span>
          <span className="flex items-center gap-1"><kbd className="bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 shadow-sm text-[10px]">ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
