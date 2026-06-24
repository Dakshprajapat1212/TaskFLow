import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, LayoutGrid } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="h-14 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 shrink-0 transition-colors">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center shrink-0 shadow-sm group-hover:bg-blue-700 transition-colors">
          <LayoutGrid className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
          TaskFlow
        </span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {isAuthenticated && (
          <>
            <div className="flex items-center gap-2 px-2">
              <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center text-white dark:text-gray-900 text-xs font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                {user?.name}
              </span>
            </div>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 hidden sm:block" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 px-2 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
