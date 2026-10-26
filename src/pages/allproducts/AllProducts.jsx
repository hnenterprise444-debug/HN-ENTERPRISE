import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useFilter } from '../../context/FilterContext'
import { useTheme } from '../../context/ThemeContext'
import useProductsInfinite from '../../hooks/product/useProductsInfinite'
import useDebounce from '../../hooks/common/useDebounce'
import { productService } from '../../services/product/productService'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../../redux/cartSlice'
import { toast } from 'react-toastify'
import { queryKeys } from '../../utils/queryKeys';
import { computeTotalStock } from '../../utils/productUtils';
import { normalizeCategoryName } from '../../utils/categoryUtils';
import AllProductsBanner from './sections/AllProductsBanner';
import AllProductsSidebar from './sections/AllProductsSidebar';
import AllProductsGrid from './sections/AllProductsGrid';

function Allproducts() {
    const navigate = useNavigate();
    const { searchkey, setSearchkey, filterType, setFilterType, filterPrice, setFilterPrice } = useFilter();
    const debouncedSearchkey = useDebounce(searchkey, 300);
    const { mode } = useTheme();
    const [sortBy, setSortBy] = useState('Featured');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart);

    // Fetch and cache distinct store categories via TanStack Query
    const { data: storeCategories = [] } = useQuery({
        queryKey: queryKeys.categories.all,
        queryFn: () => productService.getCategories(),
        staleTime: 10 * 60 * 1000,
    });

    const isSearchActive = Boolean(debouncedSearchkey && debouncedSearchkey.trim());

    // 1. Infinite Query Hook for scalable Firestore product browsing (when search is not active)
    const {
        allProducts,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isInfiniteLoading,
    } = useProductsInfinite({
        category: filterType,
        maxPrice: filterPrice,
        sortBy,
        pageSize: 12,
    });

    // 2. Full-Catalog Search Query (searches across entire Firestore products collection)
    const {
        data: searchedProducts = [],
        isLoading: isSearchLoading,
    } = useQuery({
        queryKey: queryKeys.products.search({
            searchTerm: debouncedSearchkey,
            category: filterType,
            maxPrice: filterPrice,
            sortBy,
        }),
        queryFn: () => productService.searchProducts({
            searchTerm: debouncedSearchkey,
            category: filterType,
            maxPrice: filterPrice,
            sortBy,
        }),
        enabled: isSearchActive,
        staleTime: 30 * 1000,
    });

    const addCart = (product) => {
        const totalStock = computeTotalStock(product);
        if (totalStock <= 0 || product.isActive === false) {
            toast.error("This product is currently out of stock.");
            return;
        }
        const hasVariants = (product.variantTypes && product.variantTypes.length > 0) || 
                            (Array.isArray(product.variants) && product.variants.length > 1);
        if (hasVariants) {
            navigate(`/productdetails/${product.id}`);
            toast.info("Please select variant options first.");
            return;
        }
        const { time, ...serializableProduct } = product;
        dispatch(addToCart(serializableProduct));
        toast.success('Added to cart!');
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        setFilterType('');
        setFilterPrice('');
    }, []);

    // Dynamically derive categories & price boundaries from database
    const dynamicCategories = Array.from(
        new Set([...storeCategories, ...allProducts.map(p => p.category)].map(normalizeCategoryName).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    const numericPrices = allProducts
        .map(p => Number(p.price || p.minPrice))
        .filter(p => !isNaN(p) && p > 0);

    const maxProductPrice = numericPrices.length > 0 ? Math.max(...numericPrices) : 100000;
    const uniquePrices = Array.from(
        new Set([
            Math.round(maxProductPrice * 0.1),
            Math.round(maxProductPrice * 0.25),
            Math.round(maxProductPrice * 0.5),
            Math.round(maxProductPrice * 0.75),
            maxProductPrice
        ].filter(p => p > 0))
    ).sort((a, b) => a - b);

    // Active dataset: full database search results when searching, or paginated catalog when browsing
    const displayedProducts = isSearchActive ? searchedProducts : allProducts;
    const loading = isSearchActive ? isSearchLoading : isInfiniteLoading;

    return (
        <div className="min-h-screen bg-bg-base text-text-base transition-colors duration-300">
            {/* Mobile Filter Backdrop */}
            {isMobileFilterOpen && (
                <div
                    className="fixed inset-0 z-45 bg-black/40 backdrop-blur-xs lg:hidden"
                    onClick={() => setIsMobileFilterOpen(false)}
                />
            )}

            <main className="max-w-9xl mx-auto px-4 sm:px-0 lg:px-8 py-6 sm:py-2 lg:py-10">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                    {/* Sidebar Filters */}
                    <AllProductsSidebar
                        searchkey={searchkey}
                        setSearchkey={setSearchkey}
                        filterType={filterType}
                        setFilterType={setFilterType}
                        filterPrice={filterPrice}
                        setFilterPrice={setFilterPrice}
                        uniqueCategory={dynamicCategories}
                        uniquePrices={uniquePrices}
                        isMobileOpen={isMobileFilterOpen}
                        onClose={() => setIsMobileFilterOpen(false)}
                    />

                    {/* Product Grid */}
                    <AllProductsGrid
                        loading={loading}
                        filteredAndSorted={displayedProducts}
                        totalProductsCount={displayedProducts.length}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        addCart={addCart}
                        onMobileFilterToggle={() => setIsMobileFilterOpen(true)}
                        fetchNextPage={!isSearchActive ? fetchNextPage : undefined}
                        hasNextPage={!isSearchActive && hasNextPage}
                        isFetchingNextPage={!isSearchActive && isFetchingNextPage}
                    />

                </div>

            </main>
        </div>
    );
}

export default Allproducts;