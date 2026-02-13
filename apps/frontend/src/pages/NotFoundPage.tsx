import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center space-y-6">
        <h1 className="text-8xl font-bold text-indigo-500">404</h1>

        <h2 className="text-2xl font-semibold">
          Page Not Found
        </h2>

        <p className="text-slate-400 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>

        <Link
          to="/"
          className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}