import React from 'react';
import { motion } from 'motion/react';

export const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <motion.div
      animate={{
        rotate: 360,
        borderRadius: ["25%", "25%", "50%", "50%", "25%"],
      }}
      transition={{
        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
        borderRadius: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }}
      className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-xl"
    />
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-4 text-neutral-500 font-medium"
    >
      Loading your insights...
    </motion.p>
  </div>
);

export const Skeleton = ({ className }: { className?: string }) => (
  <motion.div
    animate={{
      opacity: [0.5, 0.8, 0.5],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className={`bg-neutral-200 rounded-lg ${className}`}
  />
);

export const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);
