import { useEffect, useState } from 'react';
import { useBoardStore } from '../store/useBoardStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { Plus, LayoutGrid, Trash2, Search, CalendarDays, CheckCircle2, CircleDashed, LayoutTemplate, Clock, AlertCircle, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateBoardModal from '../components/CreateBoardModal';
import { format } from 'date-fns';

const Dashboard = () => {
  const { boards, fetchBoards, isLoading, deleteBoard, allWorkspaceTasks, fetchAllWorkspaceTasks } = useBoardStore();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    const initData = async () => {
      await fetchBoards();
      fetchAllWorkspaceTasks();
    };
    initData();
  }, [fetchBoards, fetchAllWorkspaceTasks]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this board? All tasks will be lost.')) {
      await deleteBoard(id);
    }
  };

  const filteredBoards = boards.filter(board =>
    board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (board.description && board.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Derived Stats
  const totalProjects = boards.length;
  const totalTasks = allWorkspaceTasks.length;
  const tasksCompleted = allWorkspaceTasks.filter(t => t.status === 'done').length;
  const tasksInProgress = allWorkspaceTasks.filter(t => t.status === 'in-progress').length;
  const overdueTasks = allWorkspaceTasks.filter(t => {
    if (t.status === 'done' || !t.dueDate) return false;
    return new Date(t.dueDate) < new Date();
  }).length;
  
  const completionPercentage = totalTasks === 0 ? 0 : Math.round((tasksCompleted / totalTasks) * 100);

  return (
    <div className="flex-1 bg-white dark:bg-[#09090b] min-h-0 overflow-y-auto custom-scrollbar">
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#09090b] border-b border-zinc-200 dark:border-zinc-800/80 px-8 py-6 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSidebar}
              className="md:hidden shrink-0 p-1.5 -ml-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors dark:hover:text-white dark:hover:bg-zinc-800"
            >
              <Menu className="w-5 h-5 stroke-[2]" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Overview
              </h1>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">
                Manage your projects and track progress across your workspace.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 stroke-[1.5]" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-1.5 text-[13px] bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100 shadow-vercel-sm"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-[13px] font-medium px-4 py-1.5 rounded-md transition-colors shadow-vercel-sm shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2]" />
              New Project
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        
        {/* Statistics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 shadow-vercel-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                <LayoutTemplate className="w-4 h-4 text-zinc-600 dark:text-zinc-300 stroke-[1.5]" />
              </div>
              <h3 className="text-[13px] font-medium text-zinc-600 dark:text-zinc-400">Total Projects</h3>
            </div>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{totalProjects}</p>
          </div>
          <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 shadow-vercel-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <CircleDashed className="w-4 h-4 text-blue-600 dark:text-blue-400 stroke-[1.5]" />
              </div>
              <h3 className="text-[13px] font-medium text-zinc-600 dark:text-zinc-400">Active Tasks</h3>
            </div>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{tasksInProgress}</p>
          </div>
          <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 shadow-vercel-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[1.5]" />
              </div>
              <h3 className="text-[13px] font-medium text-zinc-600 dark:text-zinc-400">Completed</h3>
            </div>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{tasksCompleted}</p>
          </div>
          <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 shadow-vercel-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 stroke-[1.5]" />
              </div>
              <h3 className="text-[13px] font-medium text-zinc-600 dark:text-zinc-400">Overdue</h3>
            </div>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{overdueTasks}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 shadow-vercel-sm mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-[14px] font-medium text-zinc-900 dark:text-zinc-100 mb-1">Productivity Summary</h3>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-3">You have completed {tasksCompleted} out of {totalTasks} total tasks across all projects.</p>
            <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-1000 ease-out" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-end">
            <span className="text-[28px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">{completionPercentage}%</span>
            <span className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-wider">Completion Rate</span>
          </div>
        </div>

        <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 mb-4 tracking-tight">Recent Projects</h2>

        {/* Loading Skeletons */}
        {isLoading && boards.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 animate-pulse flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-md bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                </div>
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full mb-1.5" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2 mt-auto" />
              </div>
            ))}
          </div>
        ) : filteredBoards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBoards.map((board) => (
              <div
                key={board._id}
                onClick={() => navigate(`/boards/${board._id}`)}
                className="group flex flex-col bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-vercel-md transition-all duration-300 ease-out shadow-vercel-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[6px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <LayoutGrid className="w-4 h-4 text-zinc-500 stroke-[1.5]" />
                    </div>
                    <h3 className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                      {board.title}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, board._id)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                    aria-label="Delete project"
                  >
                    <Trash2 className="w-[15px] h-[15px] stroke-[1.5]" />
                  </button>
                </div>
                
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 min-h-[40px] leading-relaxed">
                  {board.description || 'No description provided.'}
                </p>

                <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 stroke-[1.5]" />
                    {format(new Date(board.createdAt), 'MMM d, yyyy')}
                  </div>
                  <span>{allWorkspaceTasks.filter(t => t.board === board._id).length} tasks</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in border border-dashed border-zinc-200 dark:border-zinc-800/80 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20">
            <div className="w-12 h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center mb-4 shadow-vercel-sm">
              <LayoutGrid className="w-5 h-5 text-zinc-400 stroke-[1.5]" />
            </div>
            <h3 className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5 tracking-tight">
              {searchQuery ? 'No projects found' : 'Create your first project'}
            </h3>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed">
              {searchQuery 
                ? 'Try adjusting your search query to find what you are looking for.'
                : 'Get started by creating a board to organize your tasks and streamline your workflow.'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors shadow-vercel-sm"
              >
                <Plus className="w-4 h-4 stroke-[2]" />
                New Project
              </button>
            )}
          </div>
        )}
      </div>

      <CreateBoardModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
