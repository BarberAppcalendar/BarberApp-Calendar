import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateBarberId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `BB_${randomStr}${timestamp.slice(-3)}`;
}
