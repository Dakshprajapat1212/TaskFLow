import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useBoardStore } from '../store/useBoardStore';
import { useUIStore } from '../store/useUIStore';
import { LayoutGrid, Plus, LogOut, Search, Settings, Grid2X2 } from 'lucide-react';
import { useState } from 'react';
import CreateBoardModal from './CreateBoardModal';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { boards } = useBoardStore();
  const { openSearch, openSettings, isSidebarOpen, closeSidebar } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[40] md:hidden transition-opacity" 
          onClick={closeSidebar}
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-[50] w-64 md:relative flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-[#09090b] flex flex-col h-full transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Workspace Header */}
        <div className="h-14 px-4 flex items-center shrink-0 border-b border-transparent">
          <div className="flex items-center gap-2.5 w-full hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 p-1.5 -ml-1.5 rounded-md cursor-pointer transition-colors">
            <div className="w-5 h-5 rounded-[4px] bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 shadow-sm shrink-0">
              <span className="text-[11px] font-bold">{user?.name?.charAt(0).toUpperCase() || 'W'}</span>
            </div>
            <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {user?.name}'s Workspace
            </span>
          </div>
        </div>

        {/* Main Nav */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-6">
          <div>
            <div className="space-y-0.5">
              <Link
                to="/"
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                  location.pathname === '/' 
                    ? 'bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100' 
                    : 'text-zinc-600 hover:bg-zinc-200/40 dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-200'
                }`}
              >
                <Grid2X2 className="w-[15px] h-[15px] stroke-[1.5]" />
                Overview
              </Link>
              <button
                onClick={openSearch}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] font-medium text-zinc-600 hover:bg-zinc-200/40 dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-[15px] h-[15px] stroke-[1.5]" />
                  Search
                </div>
                <kbd className="hidden group-hover:block sm:block text-[10px] font-sans border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1 rounded text-zinc-400">⌘K</kbd>
              </button>
              <button
                onClick={openSettings}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium text-zinc-600 hover:bg-zinc-200/40 dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-200 transition-colors"
              >
                <Settings className="w-[15px] h-[15px] stroke-[1.5]" />
                Settings
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-2.5 mb-1.5 group">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-500">Your Projects</span>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all rounded hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                <Plus className="w-3.5 h-3.5 stroke-2" />
              </button>
            </div>
            <div className="space-y-0.5">
              {boards.map((board) => {
                const isActive = location.pathname === `/boards/${board._id}`;
                return (
                  <Link
                    key={board._id}
                    to={`/boards/${board._id}`}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-600 hover:bg-zinc-200/40 dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-200'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5 stroke-[1.5] shrink-0" />
                    <span className="truncate">{board.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium text-zinc-600 hover:bg-zinc-200/40 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-red-400 transition-colors group"
          >
            <LogOut className="w-[15px] h-[15px] stroke-[1.5] group-hover:text-red-600 dark:group-hover:text-red-400" />
            Sign Out
          </button>
        </div>
      </div>

      <CreateBoardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Sidebar;
