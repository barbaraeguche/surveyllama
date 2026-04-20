
import { Link } from 'react-router-dom';
import { Button } from '../components/UI';
import { motion } from 'motion/react';
import { ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-24 sm:py-32 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-base font-semibold text-indigo-600">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-5xl">Page not found</h1>
        <p className="mt-6 text-base leading-7 text-neutral-600">
          Sorry, we couldn’t find the page you’re looking for. It might have been moved or deleted.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto px-8 py-3 rounded-xl flex gap-2">
              <Home size={18} />
              Go back home
            </Button>
          </Link>
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto px-8 py-3 rounded-xl border-neutral-300 flex gap-2">
              <ArrowLeft size={18} />
              Return to Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="mt-16 pt-8 border-t border-neutral-100 italic text-neutral-400 text-sm flex items-center justify-center gap-2">
          <Search size={14} />
          Can't find what you're looking for? Contact support.
        </div>
      </motion.div>
    </div>
  );
}