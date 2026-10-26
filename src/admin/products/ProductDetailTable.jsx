import React, { useState, useEffect } from 'react';
import WarningModal from '../../components/modal/WarningModal';
import TableSkeleton from '../../components/loader/SkeletonLoader/TableSkeleton';
import Pagination from '../../components/Common/Pagination';
import CursorPagination from '../../components/Common/CursorPagination';
import DataTable from '../Components/common/DataTable';
import ProductMobileCard from './tableComponents/ProductMobileCard';
import getProductTableColumns  from './tableComponents/ProductColumns';

/**
 * ProductDetailTable Component (Admin Products Module)
 * Main product management table panel: renders desktop data table, mobile cards, pagination, and delete warning modal.
 * Uses modular section components and utilities to keep the component clean and maintainable.
 */
function ProductDetailTable({ 
    mode, 
    product = [], 
    loading = false, 
    onAddClick, 
    onEditClick, 
    deleteProduct, 
    toggleActiveStatus, 
    formatDate,
    // Cursor Pagination Props
    pageIndex,
    hasMore,
    isFetching,
    onPrev,
    onNext,
    onRefresh,
    pageSize = 10,
    onPageSizeChange,
}) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProductToDelete, setSelectedProductToDelete] = useState(null);

    // Fallback client-side pagination state (when cursor props are not provided)
    const [currentPage, setCurrentPage] = useState(1);
    const [internalPageSize, setInternalPageSize] = useState(10);

    const isCursorPaginated = typeof pageIndex === 'number';

    useEffect(() => {
        if (!isCursorPaginated) {
            setCurrentPage(1);
        }
    }, [product.length, isCursorPaginated]);

    const handleDeleteClick = (item) => {
        setSelectedProductToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedProductToDelete && deleteProduct) {
            deleteProduct(selectedProductToDelete);
        }
        setIsDeleteModalOpen(false);
        setSelectedProductToDelete(null);
    };

    if (loading) {
        return <TableSkeleton rows={pageSize || internalPageSize} columns={8} />;
    }

    // Determine rendered items & startIndex
    const activePageSize = pageSize || internalPageSize;
    const startIndex = isCursorPaginated ? pageIndex * activePageSize : (currentPage - 1) * activePageSize;
    const displayProducts = isCursorPaginated ? product : product.slice(startIndex, startIndex + activePageSize);

    // Column definitions generated via utility helper
    const columns = getProductTableColumns({
        startIndex,
        onEditClick,
        onDeleteClick: handleDeleteClick,
        toggleActiveStatus,
        formatDate,
    });

    return (
        <div className="mb-12 space-y-4">
            {/* Reusable Data Table */}
            <DataTable
                columns={columns}
                data={displayProducts}
                emptyMessage="No products available."
                mobileCardRender={(item, idx) => (
                    <ProductMobileCard
                        key={idx}
                        item={item}
                        index={idx}
                        onEditClick={onEditClick}
                        onDeleteClick={handleDeleteClick}
                        toggleActiveStatus={toggleActiveStatus}
                        formatDate={formatDate}
                    />
                )}
            />

            {/* Pagination Controls */}
            {isCursorPaginated ? (
                <CursorPagination
                    pageIndex={pageIndex}
                    hasMore={hasMore}
                    isFetching={isFetching}
                    onPrev={onPrev}
                    onNext={onNext}
                    onRefresh={onRefresh}
                    pageSize={pageSize}
                    onPageSizeChange={onPageSizeChange}
                />
            ) : (
                <Pagination
                    currentPage={currentPage}
                    totalItems={product.length}
                    pageSize={internalPageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(newSize) => {
                        setInternalPageSize(newSize);
                        setCurrentPage(1);
                    }}
                />
            )}

            {/* Confirmation delete modal */}
            <WarningModal
                isOpen={isDeleteModalOpen}
                message={`Are you sure you want to delete "${selectedProductToDelete?.title}"? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedProductToDelete(null);
                }}
                confirmText="Delete"
                mode={mode}
            />
        </div>
    );
}

export default ProductDetailTable;

