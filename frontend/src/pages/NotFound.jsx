import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-[#09090b] px-4">
      <AlertCircle className="w-16 h-16 text-zinc-400 mb-6" />
      <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">404</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-center max-w-sm">
        Oops! We couldn't find the page you were looking for. It might have been moved or deleted.
      </p>
      <Link 
        to="/" 
        className="px-6 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-sm"
      >
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
