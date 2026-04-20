import React from 'react';
import { cn } from '../lib/utils';

type BadgeColor = 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
  dot?: boolean;
}

const colorStyles: Record<BadgeColor, string> = {
  gray: 'bg-neutral-100 text-neutral-700 ring-neutral-600/20',
  red: 'bg-red-100 text-red-700 ring-red-600/10',
  yellow: 'bg-amber-100 text-amber-700 ring-amber-600/10',
  green: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  blue: 'bg-blue-100 text-blue-700 ring-blue-700/10',
  indigo: 'bg-indigo-100 text-indigo-700 ring-indigo-700/10',
  purple: 'bg-purple-100 text-purple-700 ring-purple-700/10',
  pink: 'bg-pink-100 text-pink-700 ring-pink-700/10',
};

const dotStyles: Record<BadgeColor, string> = {
  gray: 'fill-neutral-500',
  red: 'fill-red-500',
  yellow: 'fill-amber-500',
  green: 'fill-emerald-500',
  blue: 'fill-blue-500',
  indigo: 'fill-indigo-500',
  purple: 'fill-purple-500',
  pink: 'fill-pink-500',
};

/**
 * A versatile Badge component following Tailwind Plus UI's "Small flat pill with dot" style.
 */
export function Badge({ children, color = 'gray', className, dot = true }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-x-1.5 rounded-full px-2 py-2 text-xs font-medium ring-1 ring-inset ",
      colorStyles[color],
      className
    )}>
      {dot && (
        <svg className={cn("h-1.5 w-1.5", dotStyles[color])} viewBox="0 0 6 6" aria-hidden="true">
          <circle cx="3" cy="3" r="3" />
        </svg>
      )}
      {children}
    </span>
  );
}