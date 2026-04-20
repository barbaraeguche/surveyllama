import { motion } from 'motion/react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button, Card } from './UI';
import { Link } from 'react-router-dom';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showHome?: boolean;
}

export const ErrorState = ({ 
  title = "Something went wrong", 
  message, 
  onRetry,
  showHome = false
}: ErrorStateProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="max-w-md mx-auto mt-10 sm:mt-20 px-4"
  >
    <Card className="p-8 sm:p-12 text-center border-red-100 bg-red-50/30">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
        <AlertCircle className="h-10 w-10 text-red-600" aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-neutral-900 mb-2">{title}</h2>
      <p className="text-neutral-600 mb-8 leading-relaxed">
        {message}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} className="w-full sm:w-auto flex gap-2">
            <RefreshCw size={18} />
            Try Again
          </Button>
        )}
        {showHome && (
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto flex gap-2 border-neutral-300">
              <Home size={18} />
              Go Back Home
            </Button>
          </Link>
        )}
      </div>
    </Card>
  </motion.div>
);