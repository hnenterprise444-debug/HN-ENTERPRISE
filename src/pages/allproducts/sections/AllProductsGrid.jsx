import React from 'react';
import CommonProductCard from '../../../components/Common/ProductCard';
import ProductCardSkeleton from '../../../components/loader/SkeletonLoader/ProductCardSkeleton';

/**
 * AllProductsGrid
 * Renders the products header counters, the sort select options, cards, and Load More button.
 */
export default function AllProductsGrid({
  loading = false,
  filteredAndSorted = [],
  totalProductsCount = 0,
  sortBy,
  setSortBy,
  addCart,
  onMobileFilterToggle,
  fetchNextPage,
  hasNextPage = false,
  isFetchingNextPage = false,
}) {
  return (
    <div className="lg:col-span-9 w-full space-y-6 ">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border-subtle">

        <p className="text-xs sm:text-sm font-semibold text-text-muted">
          Showing <span className="text-primary font-bold">{filteredAndSorted.length}</span> products
        </p>

        {/* Sort and Filters */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-text-muted w-full sm:w-auto justify-between sm:justify-end">
          <div className="relative w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none w-full sm:w-44 border border-border-subtle rounded-xl px-3 py-2 pr-10 bg-bg-surface text-text-base text-xs sm:text-sm font-semibold focus:outline-none focus:border-primary transition cursor-pointer"
            >
              <option value="Featured">Sort: Featured</option>
              <option value="Price: Low to High">
                Price: Low to High
              </option>
              <option value="Price: High to Low">
                Price: High to Low
              </option>
            </select>

            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-lg text-text-muted pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Mobile Filters Toggle Button */}
          <button
            onClick={onMobileFilterToggle}
            className="lg:hidden flex items-center gap-1.5 border border-border-subtle rounded-xl px-3 py-2 bg-card hover:bg-card-hover text-text-base text-xs font-bold transition active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm font-bold text-primary">filter_alt</span>
            <span>Filters</span>
          </button>
        </div>

      </div>

      {/* Products Grid or Skeleton Loader */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 2xl:gap-6">
          <ProductCardSkeleton count={8} />
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="py-16 sm:py-20 rounded-2xl border border-border-subtle bg-card text-center">
          <span className="material-symbols-outlined text-5xl text-text-muted">
            sentiment_dissatisfied
          </span>

          <p className="mt-3 text-sm sm:text-base font-medium text-text-muted">
            No products match your criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:gap-6 gap-2 sm:gap-3 lg:gap-4">
            {filteredAndSorted.map((item, index) => (
              <CommonProductCard
                key={item.id || index}
                item={item}
                index={index}
                addCart={addCart}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasNextPage && fetchNextPage && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-8 py-3 bg-primary hover:bg-primary-hover text-compli rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer flex items-center gap-2"
              >
                {isFetchingNextPage ? (
                  <>
                    <span className="animate-spin text-base">↻</span>
                    <span>Loading Products...</span>
                  </>
                ) : (
                  <span>Load More Products</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
