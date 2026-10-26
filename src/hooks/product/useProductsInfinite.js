import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { productService } from '../../services/product/productService';
import { queryKeys } from '../../utils/queryKeys';

/**
 * Custom Hook for Client-Facing Infinite Product Loading
 * Uses useInfiniteQuery for Load More pagination with server-side filters.
 */
export function useProductsInfinite({ category = '', maxPrice = '', sortBy = 'Featured', pageSize = 12 } = {}) {
  const filterParams = { category, maxPrice, sortBy, pageSize };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: queryKeys.products.infinite(filterParams),
    queryFn: ({ pageParam = null }) => productService.getProductsPage({
      pageSize,
      lastDoc: pageParam,
      category,
      maxPrice,
      sortBy
    }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => (lastPage?.hasMore && lastPage?.lastDoc ? lastPage.lastDoc : undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes cache for client product list
    gcTime: 15 * 60 * 1000,   // 15 minutes in memory
  });

  // Flatten and deduplicate all fetched page arrays by unique product ID
  const allProducts = useMemo(() => {
    if (!data?.pages) return [];
    const seen = new Set();
    const result = [];
    for (const page of data.pages) {
      if (Array.isArray(page?.products)) {
        for (const prod of page.products) {
          if (prod?.id && !seen.has(prod.id)) {
            seen.add(prod.id);
            result.push(prod);
          }
        }
      }
    }
    return result;
  }, [data?.pages]);

  return {
    allProducts,
    fetchNextPage,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  };
}

export default useProductsInfinite;
