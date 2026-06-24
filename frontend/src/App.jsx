import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useBoardStore } from './store/useBoardStore';
import { useUIStore } from './store/useUIStore';
import { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BoardDetails from './pages/BoardDetails';
import NotFound from './pages/NotFound';

// Components
import Sidebar from './components/Sidebar';
import GlobalSearchModal from './components/GlobalSearchModal';
import SettingsModal from './components/SettingsModal';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

import { CheckCircle2 } from 'lucide-react';

// Global Feedback Toast
const FeedbackToast = () => {
  const { error, clearError, successMsg, clearSuccessMsg } = useBoardStore();
  const [visible, setVisible] = useState(false);
  const [toastData, setToastData] = useState({ type: null, message: null });

  useEffect(() => {
    if (error || successMsg) {
      setToastData({
        type: error ? 'error' : 'success',
        message: error || successMsg,
      });
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          if (error) clearError();
          if (successMsg) clearSuccessMsg();
        }, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, successMsg, clearError, clearSuccessMsg]);

  if (!toastData.message && !visible) return null;

  const isError = toastData.type === 'error';

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-3 rounded-lg shadow-vercel-lg border border-zinc-800 dark:border-zinc-200 transition-all duration-300 ${visible ? 'toast-in' : 'opacity-0 translate-y-4'}`}>
      {isError ? (
        <AlertCircle className="w-4 h-4 text-red-400 dark:text-red-500" />
      ) : (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-500" />
      )}
      <span className="text-[13px] font-medium tracking-tight">{toastData.message}</span>
      <button 
        onClick={() => { 
          setVisible(false); 
          setTimeout(() => {
            if (error) clearError();
            if (successMsg) clearSuccessMsg();
          }, 300); 
        }}
        className="ml-2 text-zinc-400 hover:text-white dark:text-zinc-500 dark:hover:text-zinc-900 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// App Content component to access useLocation
const AppContent = () => {
  const location = useLocation();
  const { isSearchOpen, isSettingsOpen, closeSearch, closeSettings, openSearch } = useUIStore();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  return (
    <div className="h-screen w-full flex bg-white dark:bg-[#09090b] overflow-hidden text-zinc-900 dark:text-zinc-100">
      {!isAuthPage && <Sidebar />}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/boards/:id" 
            element={
              <ProtectedRoute>
                <BoardDetails />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <FeedbackToast />
      <GlobalSearchModal isOpen={isSearchOpen} onClose={closeSearch} />
      <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
    </div>
  );
};

function App() {
  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
