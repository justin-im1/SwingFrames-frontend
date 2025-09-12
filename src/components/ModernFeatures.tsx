'use client';

import { useTransition, useDeferredValue, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from './ui/Card';
import Button from './ui/Button';
import { SuspenseBoundary } from './SuspenseBoundary';

/**
 * Component demonstrating React 19's useTransition for non-blocking updates
 */
export function TransitionDemo() {
  const [items, setItems] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const addItem = useCallback(() => {
    startTransition(() => {
      const newItem = `Item ${items.length + 1}`;
      setItems(prev => [...prev, newItem]);
    });
  }, [items.length]);

  const clearItems = useCallback(() => {
    startTransition(() => {
      setItems([]);
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">useTransition Demo</h3>
        <p className="text-sm text-gray-600">
          Non-blocking updates with React 19&apos;s useTransition
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button onClick={addItem} loading={isPending}>
            Add Item
          </Button>
          <Button onClick={clearItems} variant="outline" disabled={isPending}>
            Clear All
          </Button>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-2 bg-gray-50 rounded border"
            >
              {item}
            </motion.div>
          ))}
        </div>

        {isPending && (
          <div className="text-sm text-blue-600">
            Updating... (Non-blocking)
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Component demonstrating React 19's useDeferredValue for performance optimization
 */
export function DeferredValueDemo() {
  const [input, setInput] = useState('');
  const deferredInput = useDeferredValue(input);

  const expensiveComputation = (value: string) => {
    // Simulate expensive computation
    return value.split('').reverse().join('');
  };

  const result = expensiveComputation(deferredInput);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">useDeferredValue Demo</h3>
        <p className="text-sm text-gray-600">
          Deferred value updates for better performance
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type something:
          </label>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Type to see deferred computation..."
          />
        </div>

        <div className="space-y-2">
          <div>
            <strong>Input:</strong> {input}
          </div>
          <div>
            <strong>Deferred Input:</strong> {deferredInput}
          </div>
          <div>
            <strong>Computed Result:</strong> {result}
          </div>
        </div>

        {input !== deferredInput && (
          <div className="text-sm text-orange-600">
            Computation is deferred for better performance
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Main component showcasing React 19 features
 */
export default function ModernFeatures() {
  return (
    <SuspenseBoundary>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            React 19 Features Demo
          </h2>
          <p className="text-gray-600">
            Showcasing the latest React 19 features and patterns
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TransitionDemo />
          <DeferredValueDemo />
        </div>
      </div>
    </SuspenseBoundary>
  );
}
