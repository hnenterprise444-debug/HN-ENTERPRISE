import { useState, useEffect, useCallback } from 'react';
import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../../services/order/orderService';
import { queryKeys } from '../../utils/queryKeys';

/**
 * Custom Hook for Admin Paginated Orders
 * Uses TanStack Query + Firestore startAfter() cursor pagination for zero unnecessary reads.
 */
export function useOrdersQuery({ statusFilter = 'ALL', pageSize = 10 } = {}) {
  const queryClient = useQueryClient();
  const [cursorStack, setCursorStack] = useState([null]);
  const [pageIndex, setPageIndex] = useState(0);

  // Reset pagination state whenever filter changes
  useEffect(() => {
    setCursorStack([null]);
    setPageIndex(0);
  }, [statusFilter, pageSize]);

  const currentCursor = cursorStack[pageIndex];

  const queryFilters = {
    statusFilter,
    pageSize,
    pageIndex,
    cursorId: currentCursor?.id || null,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: queryKeys.orders.paginated(queryFilters),
    queryFn: () => orderService.getPaginatedOrders({
      pageSize,
      lastDoc: currentCursor,
      statusFilter
    }),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000, // 30 seconds stale time for orders
  });

  const goNext = useCallback(() => {
    if (!data?.hasMore || isFetching) return;
    const nextCursor = data.lastDoc;
    setCursorStack((prev) => {
      const next = [...prev];
      next[pageIndex + 1] = nextCursor;
      return next;
    });
    setPageIndex((i) => i + 1);
  }, [data?.hasMore, data?.lastDoc, isFetching, pageIndex]);

  const goPrev = useCallback(() => {
    if (pageIndex === 0 || isFetching) return;
    setPageIndex((i) => i - 1);
  }, [isFetching, pageIndex]);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
  }, [queryClient]);

  return {
    orders: data?.orders || [],
    hasMore: Boolean(data?.hasMore),
    isLoading,
    isFetching,
    isError,
    error,
    pageIndex,
    goNext,
    goPrev,
    refetch,
    invalidate,
  };
}

export default useOrdersQuery;
