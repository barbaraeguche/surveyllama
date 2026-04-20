import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Info, CheckCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './UI';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  isSubmitting?: boolean;
}

const icons = {
  danger: <AlertTriangle className="h-6 w-6 text-red-600" />,
  warning: <AlertCircle className="h-6 w-6 text-amber-600" />,
  info: <Info className="h-6 w-6 text-blue-600" />,
  success: <CheckCircle className="h-6 w-6 text-emerald-600" />,
};

const bgColors = {
  danger: 'bg-red-100',
  warning: 'bg-amber-100',
  info: 'bg-blue-100',
  success: 'bg-emerald-100',
};

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  isSubmitting = false,
}: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="p-6">
              <div className="sm:flex sm:items-start">
                <div className={cn(
                  "mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10",
                  bgColors[type]
                )}>
                  {icons[type]}
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-xl font-semibold text-neutral-900" id="modal-title">
                    {title}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                {cancelText}
              </Button>
              <Button
                variant={type === 'danger' ? 'danger' : 'primary'}
                onClick={onConfirm}
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : confirmText}
              </Button>
            </div>

            {/* Close button icon for accessibility */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-500 transition-colors hidden sm:block"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
