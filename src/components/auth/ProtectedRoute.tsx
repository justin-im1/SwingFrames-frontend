'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SuspenseBoundary } from '../SuspenseBoundary';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  fallback,
}: ProtectedRouteProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, isLoaded, router]);

  if (!isLoaded) {
    return (
      <SuspenseBoundary fallback={fallback}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </SuspenseBoundary>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect to sign-in
  }

  return <>{children}</>;
}
