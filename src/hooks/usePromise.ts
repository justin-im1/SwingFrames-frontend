'use client';

import { use } from 'react';

/**
 * React 19's use() hook for handling promises
 * This replaces the need for useEffect + useState patterns for async data
 */
export function usePromise<T>(promise: Promise<T>): T {
  return use(promise);
}

/**
 * Hook for handling async operations with React 19's use() hook
 * Provides a clean way to handle promises in components
 */
export function useAsyncData<T>(asyncFn: () => Promise<T>): T | null {
  // In a real implementation, you'd want to memoize the promise
  // and handle dependencies properly
  try {
    return use(asyncFn());
  } catch (error) {
    // Handle promise rejection
    if (error instanceof Promise) {
      throw error; // Re-throw to let Suspense handle it
    }
    throw error;
  }
}

/**
 * Hook for handling conditional async operations
 */
export function useConditionalPromise<T>(promise: Promise<T> | null): T | null {
  if (!promise) return null;

  try {
    return use(promise);
  } catch (error) {
    if (error instanceof Promise) {
      throw error;
    }
    throw error;
  }
}
