import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCartPlus } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/product/productService';
import { normalizeCategoryName } from '../../utils/categoryUtils';
import useAdmin from '../../hooks/auth/useAdmin';
import useProductsQuery from '../../hooks/product/useProductsQuery';
import useDebounce from '../../hooks/common/useDebounce';
import ProductDetailTable from './ProductDetailTable';
import ProductForm from './ProductForm';
import Header from "../Components/Header";
import FilterBar from "../Components/FilterBar";
import UnsavedChangesDialog from '../Components/common/UnsavedChangesDialog';

/**
 * Products Component
 * Main entry point for catalog management: handles viewing list, adding new, and updating products.
 * Uses TanStack Query + Firestore cursor pagination for server-side filtering and zero duplicate reads.
 */
function Products({ mode, formatDate: propFormatDate }) {
    const formatDate = propFormatDate || ((dateValue) => {
        if (!dateValue) return 'N/A';
        if (typeof dateValue?.toDate === 'function') {
            return dateValue.toDate().toLocaleString('en-IN');
        }
        if (typeof dateValue === 'number') {
            return new Date(dateValue).toLocaleDateString('en-IN');
        }
        return String(dateValue);
    });

    const location = useLocation();
    const navigate = useNavigate();
    const adminHook = useAdmin();
    const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'

    // Filter states
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [stockFilter, setStockFilter] = useState('ALL');
    const [pageSize, setPageSize] = useState(10);

    // Query Hook for paginated server-side products
    const {
        products,
        hasMore,
        isLoading,
        isFetching,
        pageIndex,
        goNext,
        goPrev,
        refetch,
    } = useProductsQuery({
        category: categoryFilter,
        statusFilter,
        stockFilter,
        pageSize,
    });

    // Fetch and cache all distinct store categories via TanStack Query
    const { data: storeCategories = [] } = useQuery({
        queryKey: ['categories', 'all'],
        queryFn: () => productService.getCategories(),
        staleTime: 10 * 60 * 1000,
    });

    // ── Navigation guard state ─────────────────────────────────────────────────
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

    // Refs for use inside effects (avoid stale closures)
    const prevViewRef = useRef('list');
    const pendingNavRef = useRef(null);        // path user tried to navigate to
    const interceptingRef = useRef(false);     // prevents re-entry on navigate-back
    const isDirtyRef = useRef(adminHook.isDirty);

    // Keep isDirty ref in sync with latest state
    useEffect(() => {
        isDirtyRef.current = adminHook.isDirty;
    }, [adminHook.isDirty]);

    // ── Route sync + navigation interception ──────────────────────────────────
    useEffect(() => {
        if (interceptingRef.current) {
            interceptingRef.current = false;
            return;
        }

        const currPath = location.pathname;
        const prevView = prevViewRef.current;
        const isLeavingForm = (prevView === 'add' || prevView === 'edit') &&
            currPath !== '/addproduct' && currPath !== '/updateproduct';

        if (isLeavingForm && isDirtyRef.current) {
            pendingNavRef.current = { pathname: currPath, state: location.state };
            interceptingRef.current = true;
            const formPath = prevView === 'add' ? '/addproduct' : '/updateproduct';
            navigate(formPath, { replace: true });
            setShowUnsavedDialog(true);
            return;
        }

        if (currPath === '/addproduct') {
            setView('add');
            prevViewRef.current = 'add';
            adminHook.recheckDraft();
        } else if (currPath === '/updateproduct') {
            const productToEdit = location.state?.product;
            if (productToEdit) adminHook.edithandle(productToEdit);
            setView('edit');
            prevViewRef.current = 'edit';
        } else {
            if (prevView === 'add') adminHook.resetForm();
            setView('list');
            prevViewRef.current = 'list';
        }
    }, [location.pathname, location.state]);

    // ── Navigation guard handlers ──────────────────────────────────────────────
    const handleStay = useCallback(() => {
        setShowUnsavedDialog(false);
        pendingNavRef.current = null;
    }, []);

    const handleDiscardAndLeave = useCallback(() => {
        const target = pendingNavRef.current;
        adminHook.discardDraft();
        adminHook.resetForm();
        setShowUnsavedDialog(false);
        pendingNavRef.current = null;
        prevViewRef.current = 'list';
        setView('list');
        if (target) navigate(target.pathname, { state: target.state, replace: true });
    }, [adminHook, navigate]);

    // ── Form button handlers ───────────────────────────────────────────────────
    const handleAddClick = () => navigate('/addproduct');
    const handleEditClick = (item) => {
        const { docSnap, ...cleanItem } = item || {};
        navigate('/updateproduct', { state: { product: cleanItem } });
    };

    const handleCancel = useCallback(() => {
        if (isDirtyRef.current) {
            pendingNavRef.current = { pathname: '/products' };
            setShowUnsavedDialog(true);
        } else {
            adminHook.resetForm();
            navigate('/products');
        }
    }, [adminHook, navigate]);

    // ── Render form views ──────────────────────────────────────────────────────
    if (view === 'add') {
        return (
            <>
                <ProductForm
                    {...adminHook}
                    products={adminHook.productForm}
                    setProducts={adminHook.setProductForm}
                    handleCancel={handleCancel}
                />
                {showUnsavedDialog && (
                    <UnsavedChangesDialog
                        onStay={handleStay}
                        onDiscard={handleDiscardAndLeave}
                    />
                )}
            </>
        );
    }

    if (view === 'edit') {
        return (
            <>
                <ProductForm
                    title="Update Product"
                    description="Modify existing product details, pricing, and variants."
                    {...adminHook}
                    products={adminHook.productForm}
                    setProducts={adminHook.setProductForm}
                    addProduct={adminHook.updateProduct}
                    handleCancel={handleCancel}
                />
                {showUnsavedDialog && (
                    <UnsavedChangesDialog
                        onStay={handleStay}
                        onDiscard={handleDiscardAndLeave}
                    />
                )}
            </>
        );
    }

    // Client-side text search within the currently loaded server-side page
    const filteredProducts = products.filter(p => {
        if (!debouncedSearch) return true;
        const searchLower = debouncedSearch.toLowerCase().trim();
        return p.title?.toLowerCase().includes(searchLower) ||
            p.brand?.toLowerCase().includes(searchLower) ||
            p.category?.toLowerCase().includes(searchLower);
    });



    const categoryOptions = Array.from(
        new Set([...storeCategories, ...products.map(p => p.category)].map(normalizeCategoryName).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    const filtersConfig = [
        {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
                { value: "ALL", label: "All Status" },
                { value: "LIVE", label: "Live" },
                { value: "DRAFT", label: "Draft" }
            ]
        },
        {
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
                { value: "ALL", label: "All Categories" },
                ...categoryOptions.map(c => ({ value: c, label: c }))
            ]
        },
        {
            value: stockFilter,
            onChange: setStockFilter,
            options: [
                { value: "ALL", label: "All Stock Status" },
                { value: "IN_STOCK", label: "In Stock (>5)" },
                { value: "LOW_STOCK", label: "Low Stock (1-5)" },
                { value: "OUT_OF_STOCK", label: "Out of Stock (0)" }
            ]
        }
    ];

    return (
        <div className="space-y-6 px-4 md:px-0">
            <Header
                title="Product Catalog"
                description="Manage catalog items, descriptions, categories, and base prices."
                icon={<FaCartPlus />}
                buttonText="Add Product"
                clickhandler={handleAddClick}
            />
            <FilterBar
                search={search}
                setSearch={setSearch}
                searchPlaceholder="Search within this page by title, brand, or category..."
                filters={filtersConfig}
            />
            <ProductDetailTable
                mode={mode}
                product={filteredProducts}
                loading={isLoading}
                onEditClick={handleEditClick}
                deleteProduct={adminHook.deleteProduct}
                toggleActiveStatus={adminHook.toggleProductActiveStatus}
                formatDate={formatDate}
                pageIndex={pageIndex}
                hasMore={hasMore}
                isFetching={isFetching}
                onPrev={goPrev}
                onNext={goNext}
                onRefresh={refetch}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
            />
        </div>
    );
}

export default Products;