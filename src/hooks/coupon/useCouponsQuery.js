import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { couponService } from '../../services/coupon/couponService';
import { queryKeys } from '../../utils/queryKeys';

/**
 * Custom Hook for Admin Coupons
 * Uses TanStack Query for full collection caching with zero duplicate reads.
 */
export function useCouponsQuery() {
  const queryClient = useQueryClient();

  const { data: coupons = [], isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: queryKeys.coupons.all,
    queryFn: () => couponService.getCoupons(),
    staleTime: 5 * 60 * 1000, // 5 minutes stale time for coupons
    gcTime: 15 * 60 * 1000,   // 15 minutes cache retention
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.coupons.all });
  }, [queryClient]);

  return {
    coupons,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    invalidate,
  };
}

export default useCouponsQuery;
