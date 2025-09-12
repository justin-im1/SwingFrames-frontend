'use client';

import { useClerkAuth } from '../../hooks/useClerkAuth';
import { SuspenseBoundary } from '../SuspenseBoundary';

interface AuthWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const { isLoaded } = useClerkAuth();

  if (!isLoaded) {
    return (
      <SuspenseBoundary fallback={fallback}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </SuspenseBoundary>
    );
  }

  return <>{children}</>;
}
