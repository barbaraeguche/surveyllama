import { motion } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface BannerProps {
  message: string;
  type?: 'error' | 'success' | 'warning' | 'info';
  onClose?: () => void;
  className?: string;
}

export const Banner = ({ message, type = 'error', onClose, className }: BannerProps) => {
  const styles = {
    error: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "p-4 border rounded-xl flex items-center gap-3 transition-all",
        styles[type],
        className
      )}
    >
      <AlertCircle size={20} className="shrink-0" />
      <p className="text-sm font-medium leading-tight">{message}</p>
      {onClose && (
        <button 
          onClick={onClose}
          className="ml-auto p-1 hover:bg-black/5 rounded-full transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </motion.div>
  );
};