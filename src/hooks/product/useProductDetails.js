import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { productService } from '../../services/product/productService.js';
import { addToCart } from '../../redux/cartSlice';
import { queryKeys } from '../../utils/queryKeys';

/**
 * Custom Hook: useProductDetails
 * Fetches and caches a single product and its verified ratings via TanStack Query.
 * Provides instant cached returns when navigating between products or returning to previously viewed items.
 */
export default function useProductDetails() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);

  const [selectedImage, setSelectedImage] = useState('');

  // ── 1. Fetch & Cache Product Data ─────────────────────────────────
  const {
    data: product = null,
    isLoading: isProductLoading,
    isFetching: isProductFetching,
    error: productQueryError,
  } = useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productService.getProductById(id),
    enabled: Boolean(id),
    initialData: () => {
      if (!id) return undefined;
      // Search all cached product queries in TanStack Query cache (paginated, infinite, etc.)
      const cachedQueries = queryClient.getQueriesData({ queryKey: queryKeys.products.all });
      for (const [, queryData] of cachedQueries) {
        if (!queryData) continue;
        // 1. Array format (e.g. data = [products])
        if (Array.isArray(queryData)) {
          const found = queryData.find((p) => (p?.id || p?.docId) === id);
          if (found) return found;
        }
        // 2. Paginated format (e.g. data = { products: [...] })
        if (Array.isArray(queryData?.products)) {
          const found = queryData.products.find((p) => (p?.id || p?.docId) === id);
          if (found) return found;
        }
        // 3. Infinite query format (e.g. data = { pages: [{ products: [...] }] })
        if (Array.isArray(queryData?.pages)) {
          for (const page of queryData.pages) {
            if (Array.isArray(page?.products)) {
              const found = page.products.find((p) => (p?.id || p?.docId) === id);
              if (found) return found;
            }
          }
        }
      }
      return undefined;
    },
    initialDataUpdatedAt: () => {
      if (!id) return undefined;
      const queryCache = queryClient.getQueryCache();
      const cachedQueries = queryClient.getQueriesData({ queryKey: queryKeys.products.all });
      for (const [key, queryData] of cachedQueries) {
        if (!queryData) continue;
        let match = false;
        if (Array.isArray(queryData) && queryData.some((p) => (p?.id || p?.docId) === id)) match = true;
        if (Array.isArray(queryData?.products) && queryData.products.some((p) => (p?.id || p?.docId) === id)) match = true;
        if (Array.isArray(queryData?.pages)) {
          for (const page of queryData.pages) {
            if (Array.isArray(page?.products) && page.products.some((p) => (p?.id || p?.docId) === id)) {
              match = true;
              break;
            }
          }
        }
        if (match) {
          const queryObj = queryCache.find({ queryKey: key });
          return queryObj?.state?.dataUpdatedAt;
        }
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes fresh cache
    gcTime: 15 * 60 * 1000,    // 15 minutes in memory
    retry: 1,
  });

  // ── 2. Fetch & Cache Ratings ──────────────────────────────────────
  const {
    data: ratings = [],
    refetch: refetchRatingsQuery,
  } = useQuery({
    queryKey: queryKeys.products.ratings(id),
    queryFn: () => productService.getProductRatings(id),
    enabled: Boolean(id),
    staleTime: 3 * 60 * 1000, // 3 minutes fresh cache
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  // ── 3. Derived Ratings Calculation ────────────────────────────────
  const averageRating = useMemo(() => {
    if (!ratings || ratings.length === 0) {
      if (product?.averageRating) return Number(Number(product.averageRating).toFixed(1));
      if (product?.rating) return Number(Number(product.rating).toFixed(1));
      return null;
    }
    const total = ratings.reduce((acc, curr) => acc + Number(curr.rating || curr.stars || 0), 0);
    return Number((total / ratings.length).toFixed(1));
  }, [ratings, product]);

  // ── 4. Sync Initial Selected Image ────────────────────────────────
  useEffect(() => {
    if (product) {
      setSelectedImage(
        product.images && product.images.length > 0 ? product.images[0] : (product.imageUrl || '')
      );
    }
  }, [product]);

  // ── 5. Cart Helper ────────────────────────────────────────────────
  const addProductToCart = useCallback((prod, selectedVariant = null, quantity = 1) => {
    const variantId = selectedVariant
      ? (selectedVariant.variantId || selectedVariant.id || selectedVariant.sku || null)
      : null;
    const variantAttrs = selectedVariant
      ? (selectedVariant.attributes || (typeof selectedVariant === 'object' && !selectedVariant.attributes ? selectedVariant : null))
      : null;

    const cartItem = {
      ...prod,
      price: selectedVariant?.price !== undefined ? Number(selectedVariant.price) : Number(prod.price),
      originalPrice: selectedVariant?.originalPrice !== undefined
        ? Number(selectedVariant.originalPrice)
        : (selectedVariant?.price !== undefined ? Number(selectedVariant.price) : Number(prod.originalPrice || prod.price)),
      selectedVariant: variantAttrs,
      selectedVariantObj: selectedVariant ? {
        variantId: variantId,
        id: variantId,
        sku: selectedVariant.sku || null,
        title: selectedVariant.title || null,
        attributes: variantAttrs,
        price: selectedVariant.price,
        originalPrice: selectedVariant.originalPrice,
        inStock: selectedVariant.inStock,
        images: selectedVariant.images
      } : null,
      variantId: variantId,
      quantity: quantity
    };
    const { time: _time, ...serializable } = cartItem;
    dispatch(addToCart(serializable));
    toast.success('Added to cart!');
  }, [dispatch]);

  // ── 7. Refetch ratings and invalidate cache ───────────────────────
  const refetchRatings = useCallback(async () => {
    if (!id) return;
    queryClient.invalidateQueries({ queryKey: queryKeys.products.ratings(id) });
    await refetchRatingsQuery();
  }, [id, queryClient, refetchRatingsQuery]);

  const error = productQueryError
    ? (productQueryError.message === 'Product not found'
        ? 'Product not found. The database may have been re-seeded. Please return to the Home page and select a product again.'
        : 'Failed to load product. Please try again.')
    : null;

  return {
    product,
    selectedImage,
    setSelectedImage,
    ratings,
    averageRating,
    reviewCount: ratings.length,
    refetchRatings,
    isLoading: isProductLoading && !product,
    isFetching: isProductFetching,
    error,
    cartItems,
    addProductToCart,
  };
}
