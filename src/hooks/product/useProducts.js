import useProductsQuery from './useProductsQuery';

/**
 * useProducts Hook
 * Reusable product hook connected to TanStack Query cache (50 products).
 * Prevents un-cached onSnapshot listeners and shares cache with Home and All Products.
 */
export default function useProducts() {
  const { products, isLoading, error } = useProductsQuery({ pageSize: 50 });
  return { products, loading: isLoading, error };
}

