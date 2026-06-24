import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="text-9xl font-bold text-primary opacity-20">404</h1>
      <h2 className="text-3xl font-semibold text-card-foreground mt-4 mb-2">Page Not Found</h2>
      <p className="text-gray-500 max-w-md mx-auto mb-8">
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
