// This utility function merges class names using clsx and tailwind-merge
// It's useful for combining conditional classes and Tailwind CSS classes efficiently// This utility function merges class names using clsx and tailwind-merge
// It's useful for combining conditional classes and Tailwind CSS classes efficiently
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
