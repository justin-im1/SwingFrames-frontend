'use client';

import { Suspense, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface SuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

function DefaultFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center space-x-3"
      >
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
        <span className="text-gray-600">Loading...</span>
      </motion.div>
    </div>
  );
}

export function SuspenseBoundary({
  children,
  fallback = <DefaultFallback />,
  className,
}: SuspenseBoundaryProps) {
  return (
    <div className={className}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </div>
  );
}

// Specialized loading components for different use cases
export function VideoLoadingFallback() {
  return (
    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Loading video...</p>
      </motion.div>
    </div>
  );
}

export function CardLoadingFallback() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );
}

export function ListLoadingFallback({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <CardLoadingFallback key={index} />
      ))}
    </div>
  );
}
