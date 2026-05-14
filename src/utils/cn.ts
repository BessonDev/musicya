import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases de forma inteligente, merging tailwind conflictivos
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}