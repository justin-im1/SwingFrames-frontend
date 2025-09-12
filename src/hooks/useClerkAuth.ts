'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useAppDispatch } from '../lib/store';
import { setUser, clearUser, setLoading } from '../features/user/userSlice';
import { User } from '../types';

export function useClerkAuth() {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isLoaded) {
      dispatch(setLoading(true));
      return;
    }

    dispatch(setLoading(false));

    if (isSignedIn && user) {
      const clerkUser: User = {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        name: user.fullName || user.firstName || 'User',
        avatar: user.imageUrl,
      };
      dispatch(setUser(clerkUser));
    } else {
      dispatch(clearUser());
    }
  }, [user, isLoaded, isSignedIn, dispatch]);

  return {
    user: isSignedIn ? user : null,
    isSignedIn,
    isLoaded,
  };
}
