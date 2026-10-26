import { useState, useEffect, useCallback } from 'react';
import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/user/userService';
import { queryKeys } from '../../utils/queryKeys';

/**
 * Custom Hook for Admin Paginated Users
 * Uses TanStack Query + Firestore startAfter() cursor pagination for zero unnecessary reads.
 */
export function useUsersQuery({ roleFilter = 'ALL', pageSize = 10 } = {}) {
  const queryClient = useQueryClient();
  const [cursorStack, setCursorStack] = useState([null]);
  const [pageIndex, setPageIndex] = useState(0);

  // Reset pagination state whenever filter or page size changes
  useEffect(() => {
    setCursorStack([null]);
    setPageIndex(0);
  }, [roleFilter, pageSize]);

  const currentCursor = cursorStack[pageIndex];

  const queryFilters = {
    roleFilter,
    pageSize,
    pageIndex,
    cursorId: currentCursor?.id || null,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: queryKeys.users.paginated(queryFilters),
    queryFn: () => userService.getPaginatedUsers({
      pageSize,
      lastDoc: currentCursor,
      roleFilter,
    }),
    placeholderData: keepPreviousData,
    staleTime: 3 * 60 * 1000, // 3 minutes stale time for user profiles
    gcTime: 10 * 60 * 1000,   // 10 minutes cache retention in memory
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
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  }, [queryClient]);

  return {
    users: data?.users || [],
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

export default useUsersQuery;
