'use client';

import { useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';
import { createAuthenticatedApi } from '../lib/api';

export function useAuthenticatedApi() {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  const api = useMemo(() => {
    return {
      async getToken() {
        if (!isLoaded) {
          throw new Error('Authentication not loaded');
        }
        if (!isSignedIn) {
          throw new Error('User not signed in');
        }
        const token = await getToken();
        if (!token) {
          throw new Error('No authentication token available');
        }
        return token;
      },

      async swings() {
        const token = await this.getToken();
        return createAuthenticatedApi(token).swings;
      },

      async comparisons() {
        const token = await this.getToken();
        return createAuthenticatedApi(token).comparisons;
      },

      async poseAnalysis() {
        const token = await this.getToken();
        return createAuthenticatedApi(token).poseAnalysis;
      },
    };
  }, [getToken, isSignedIn, isLoaded]);

  return api;
}
