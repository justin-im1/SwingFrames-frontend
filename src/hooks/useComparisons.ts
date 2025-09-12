import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { comparisonsApi } from '../lib/api';
import { Comparison } from '../types';

// Query keys
export const comparisonKeys = {
  all: ['comparisons'] as const,
  list: () => [...comparisonKeys.all, 'list'] as const,
  comparison: (id: string) => [...comparisonKeys.all, id] as const,
};

// Hooks
export const useComparisons = () => {
  return useQuery({
    queryKey: comparisonKeys.list(),
    queryFn: () => comparisonsApi.getComparisons(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useComparison = (id: string) => {
  return useQuery({
    queryKey: comparisonKeys.comparison(id),
    queryFn: () => comparisonsApi.getComparison(id),
    enabled: !!id,
  });
};

export const useCreateComparison = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comparisonData: Partial<Comparison>) =>
      comparisonsApi.createComparison(comparisonData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: comparisonKeys.list() });
    },
  });
};

export const useUpdateComparison = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      comparisonData,
    }: {
      id: string;
      comparisonData: Partial<Comparison>;
    }) => comparisonsApi.updateComparison(id, comparisonData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: comparisonKeys.list() });
      queryClient.invalidateQueries({
        queryKey: comparisonKeys.comparison(variables.id),
      });
    },
  });
};

export const useDeleteComparison = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => comparisonsApi.deleteComparison(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: comparisonKeys.list() });
      queryClient.removeQueries({ queryKey: comparisonKeys.comparison(id) });
    },
  });
};
