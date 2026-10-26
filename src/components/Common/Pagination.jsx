import React from 'react';
import { FaChevronLeft, FaChevronRight, FaChevronDown, FaSyncAlt, FaSpinner } from 'react-icons/fa';

/**
 * Universal Reusable Pagination Component
 * Follows the exact unified UI style of Products, Orders, and Users throughout the entire application.
 */
function Pagination({
    // Standard Offset Props
    currentPage,
    totalItems,
    onPageChange,

    // Cursor-Based Props
    pageIndex,
    hasMore,
    isFetching = false,
    onPrev,
    onNext,
    onRefresh,

    // Common Props
    pageSize = 10,
    onPageSizeChange,
    pageSizeOptions = [5, 10, 20, 50],
    className = "",
}) {
    const isCursorMode = typeof pageIndex === 'number' || (onPrev && onNext);

    // If offset mode and no items exist, don't render
    if (!isCursorMode && (totalItems === undefined || totalItems === 0)) {
        return null;
    }

    const activePage = isCursorMode ? (pageIndex || 0) + 1 : (currentPage || 1);
    const totalCount = totalItems || 0;
    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);

    const handlePrev = () => {
        if (isCursorMode) {
            if (onPrev && pageIndex > 0 && !isFetching) onPrev();
        } else {
            if (activePage > 1 && onPageChange) onPageChange(activePage - 1);
        }
    };

    const handleNext = () => {
        if (isCursorMode) {
            if (onNext && hasMore && !isFetching) onNext();
        } else {
            if (activePage < totalPages && onPageChange) onPageChange(activePage + 1);
        }
    };

    const isPrevDisabled = isCursorMode
        ? (pageIndex === 0 || isFetching)
        : (activePage <= 1);

    const isNextDisabled = isCursorMode
        ? (!hasMore || isFetching)
        : (totalPages === 0 || activePage >= totalPages);

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-1 text-xs text-text-muted select-none ${className}`}>
            
            {/* Left: Page Indicator & Page Size Selector */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 font-medium text-xs text-text-muted">
                    <span>Showing Page</span>
                    <span className="font-extrabold text-text-base px-2.5 py-0.5 rounded-lg bg-bg-surface border border-border-subtle font-mono">
                        {activePage}
                    </span>
                    {isFetching && <FaSpinner className="animate-spin text-primary ml-1" size={12} />}
                </div>

                {onPageSizeChange && (
                    <div className="flex items-center gap-2 pl-2 border-l border-border-subtle">
                        <span className="text-[11px] font-semibold text-text-muted">Show:</span>
                        <div className="relative">
                            <select
                                value={pageSize}
                                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                                className="appearance-none h-8 pl-2.5 pr-6 bg-bg-surface border border-border-subtle hover:border-primary/40 rounded-xl text-xs font-extrabold text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-2xs"
                            >
                                {pageSizeOptions.map((opt) => (
                                    <option key={opt} value={opt} className="bg-card text-text-base font-semibold py-1">
                                        {opt}
                                    </option>
                                ))}
                            </select>
                            <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-text-muted pointer-events-none" />
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Refresh, Previous, and Next Buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
                {/* Refresh Button */}
                {onRefresh && (
                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={isFetching}
                        className="h-8 px-3 rounded-xl border border-border-subtle bg-bg-surface text-text-base hover:bg-card-hover hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                        title="Refresh Page"
                    >
                        <FaSyncAlt size={10} className={isFetching ? "animate-spin" : ""} />
                        <span>Refresh</span>
                    </button>
                )}

                {/* Previous Button */}
                <button
                    type="button"
                    onClick={handlePrev}
                    disabled={isPrevDisabled}
                    className="h-8 px-3 rounded-xl border border-border-subtle bg-bg-surface text-text-base hover:bg-card-hover hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                    title="Previous Page"
                >
                    <FaChevronLeft size={9} />
                    <span>Previous</span>
                </button>

                {/* Next Button */}
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={isNextDisabled}
                    className="h-8 px-3 rounded-xl border border-border-subtle bg-bg-surface text-text-base hover:bg-card-hover hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                    title="Next Page"
                >
                    <span>Next</span>
                    <FaChevronRight size={9} />
                </button>
            </div>
        </div>
    );
}

export default Pagination;
