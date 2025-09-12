'use client';

import {
  useDeferredValue,
  useTransition,
  useState,
  useCallback,
  useOptimistic,
} from 'react';

/**
 * Modern state hook using React 19's useDeferredValue for performance optimization
 */
export function useDeferredState<T>(initialValue: T) {
  const [value, setValue] = useState(initialValue);
  const deferredValue = useDeferredValue(value);

  return [value, setValue, deferredValue] as const;
}

/**
 * Hook using React 19's useTransition for non-blocking updates
 */
export function useTransitionState<T>(initialValue: T) {
  const [value, setValue] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    startTransition(() => {
      setValue(newValue);
    });
  }, []);

  return [value, updateValue, isPending] as const;
}

/**
 * Hook for handling async state with React 19's use() hook
 */
export function useAsyncState<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    startTransition(() => {
      setError(null);
    });

    try {
      return await asyncFn();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    }
  }, [asyncFn]);

  return { execute, isPending, error };
}

/**
 * Hook for optimistic updates with React 19's useOptimistic
 */
export function useOptimisticState<T>(
  initialValue: T,
  reducer: (state: T, action: unknown) => T
) {
  const [state, setState] = useState(initialValue);
  const [optimisticState, addOptimistic] = useOptimistic(state, reducer);

  const updateState = useCallback(
    (action: unknown) => {
      addOptimistic(action);
      // In a real app, you'd also update the actual state
      setState(prevState => reducer(prevState, action));
    },
    [addOptimistic, reducer]
  );

  return [optimisticState, updateState, state] as const;
}

// Note: useFormState hook removed due to TypeScript compatibility issues
// Use useActionState directly in components when needed
