import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * merges Tailwind CSS classes using clsx and tailwind-merge.
 * @param inputs - the classes to merge.
 * @returns the merged classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}