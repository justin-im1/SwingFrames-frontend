import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../lib/api';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

// Hooks
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => authApi.getCurrentUser(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
