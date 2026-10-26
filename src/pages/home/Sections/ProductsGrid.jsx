import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addToCart } from '../../../redux/cartSlice';
import { useFilter } from '../../../context/FilterContext';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../utils/queryKeys';
import { computeTotalStock } from '../../../utils/productUtils';
import ProductCard from '../../../components/Common/ProductCard';
import ProductCardSkeleton from '../../../components/loader/SkeletonLoader/ProductCardSkeleton';
import useProductsQuery from '../../../hooks/product/useProductsQuery';
import { configureService } from '../../../services/configure/configureService';

function ProductsGrid() {
    const { products, isLoading: productsLoading } = useProductsQuery({ pageSize: 50 });
    const { searchkey, filterType, filterPrice, setFilterType, setFilterPrice } = useFilter();
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart);

    // Fetch and cache active collections via TanStack Query
    const { data: rawCollections = [], isLoading: collectionsLoading } = useQuery({
        queryKey: queryKeys.configure.collections,
        queryFn: () => configureService.getCollections(),
        staleTime: 10 * 60 * 1000, // 10 minutes cache
    });

    const collections = rawCollections.filter((c) => c.isActive !== false);

    const handleCopyProducts = () => {
        if (!products || products.length === 0) {
            toast.info("No products loaded yet.");
            return;
        }
        const jsonStr = JSON.stringify(products, null, 2);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(jsonStr)
                .then(() => toast.success(`Copied ${products.length} products to clipboard!`))
                .catch(() => fallbackCopy(jsonStr));
        } else {
            fallbackCopy(jsonStr);
        }
    };

    const fallbackCopy = (text) => {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        toast.success(`Copied ${products.length} products to clipboard!`);
    };

    useEffect(() => {
        window.copyProductsData = handleCopyProducts;
    }, [products]);

    useEffect(() => {
        setFilterType('');
        setFilterPrice('');
    }, []);

    const navigate = useNavigate();

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
        toast.success('Added to cart');
    };

    const applySearchFilters = (arr) =>
        arr
            .filter((p) => p.title?.toLowerCase().includes(searchkey.toLowerCase()))
            .filter((p) => !filterType || p.category?.includes(filterType))
            .filter((p) => !filterPrice || p.price?.includes(filterPrice));

    if (collectionsLoading || productsLoading) {
        return (
            <section className="py-6 sm:py-8 lg:py-12 space-y-8 sm:space-y-12">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2 animate-pulse">
                            <div className="h-3 w-24 bg-border-base/40 rounded" />
                            <div className="h-6 w-48 bg-border-base/50 rounded-lg" />
                        </div>
                        <div className="h-4 w-16 bg-border-base/30 rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                        <ProductCardSkeleton count={5} />
                    </div>
                </div>
            </section>
        );
    }

    if (!collections || collections.length === 0) {
        return null;
    }

    return (
        <section className="py-6 sm:py-8 lg:py-12">
            <div className="space-y-8 sm:space-y-12">
                {collections.map((col) => {
                    const collectionProducts = (col.productIds || [])
                        .map((id) => products.find((p) => p.id === id))
                        .filter(Boolean);

                    const filtered = applySearchFilters(collectionProducts);
                    if (filtered.length === 0) return null;

                    return (
                        <div key={col.collectionId || col.id}>
                            {/* Section Header */}
                            <div className="mb-4 sm:mb-6 flex items-end justify-between gap-4">
                                <div>
                                    {col.subtitle && (
                                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[2px] text-primary">
                                            {col.subtitle}
                                        </p>
                                    )}
                                    <h2 className="mt-1 text-lg sm:text-xl lg:text-2xl font-extrabold text-text-base">
                                        {col.title}
                                    </h2>
                                </div>
                                <Link
                                    to="/allproducts"
                                    className="text-xs sm:text-sm font-bold text-primary hover:text-primary-hover whitespace-nowrap transition-colors"
                                >
                                    View All →
                                </Link>
                            </div>

                            {/* Auto-fitting Responsive UI Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                                {filtered.map((item, i) => (
                                    <ProductCard
                                        key={item.id || i}
                                        item={item}
                                        addCart={addCart}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default ProductsGrid;