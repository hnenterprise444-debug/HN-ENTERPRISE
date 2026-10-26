import { useState, useEffect, useCallback } from 'react';
import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/product/productService';
import { queryKeys } from '../../utils/queryKeys';

/**
 * Custom Hook for Admin Paginated Products
 * Uses TanStack Query + Firestore startAfter() cursor pagination for zero unnecessary reads.
 */
export function useProductsQuery({ category = 'ALL', statusFilter = 'ALL', stockFilter = 'ALL', sortBy = 'Featured', pageSize = 10 } = {}) {
  const queryClient = useQueryClient();
  const [cursorStack, setCursorStack] = useState([null]);
  const [pageIndex, setPageIndex] = useState(0);

  // Reset pagination state whenever filter or sort options change
  useEffect(() => {
    setCursorStack([null]);
    setPageIndex(0);
  }, [category, statusFilter, stockFilter, sortBy, pageSize]);

  const currentCursor = cursorStack[pageIndex];

  const queryFilters = {
    category,
    statusFilter,
    stockFilter,
    sortBy,
    pageSize,
    pageIndex,
    cursorId: currentCursor?.id || null,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: queryKeys.products.paginated(queryFilters),
    queryFn: () => productService.getPaginatedProducts({
      pageSize,
      lastDoc: currentCursor,
      category,
      statusFilter,
      stockFilter,
      sortBy
    }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time for catalog
    gcTime: 15 * 60 * 1000,   // 15 minutes garbage collection in memory
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
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
  }, [queryClient]);

  return {
    products: data?.products || [],
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

export default useProductsQuery;
