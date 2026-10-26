import React, { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import SearchBar from '../../../components/Common/SearchBar';

/**
 * AllProductsSidebar
 * Renders the filter panels including full-text search, category tags, price point selections, and clear buttons.
 */
export default function AllProductsSidebar({
  searchkey,
  setSearchkey,
  filterType,
  setFilterType,
  filterPrice,
  setFilterPrice,
  uniqueCategory = [],
  uniquePrices = [],
  isMobileOpen = false,
  onClose
}) {
  const [categorySearch, setCategorySearch] = useState('');

  const filteredCategories = uniqueCategory.filter(cat =>
    cat.toLowerCase().includes(categorySearch.toLowerCase().trim())
  );

  return (
    <aside className={`w-full bg-bg-surface border border-border-subtle lg:rounded-2xl lg:shadow-sm p-4 sm:p-5 space-y-5 lg:col-span-3 lg:sticky lg:top-28 transition-all duration-300 z-50 lg:z-auto ${
      isMobileOpen 
        ? "fixed bottom-0 left-0 right-0 max-h-[75vh] overflow-y-auto rounded-t-3xl border-t border-border-subtle shadow-2xl translate-y-0" 
        : "hidden lg:block"
    }`}>

      {/* Drawer Mobile Header */}
      <div className="flex items-center justify-between lg:hidden pb-2 border-b border-border-subtle">
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-base">Filters</h2>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-card text-text-muted hover:text-text-base transition cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Search */}
      <div className="space-y-2 hidden">
        <h3 className=" text-xs font-bold uppercase tracking-wider text-text-muted">
          Search Products
        </h3>

        <SearchBar
          searchkey={searchkey}
          setSearchkey={setSearchkey}
          searchClass="px-3 py-2"
        />
      </div>

      {/* Categories */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Category
          </h3>
          {uniqueCategory.length > 0 && (
            <span className="text-[10px] font-bold text-text-muted px-2 py-0.5 rounded-full bg-bg-base border border-border-subtle">
              {uniqueCategory.length}
            </span>
          )}
        </div>

        {/* Quick Category Search */}
        {uniqueCategory.length > 5 && (
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[10px] pointer-events-none" />
            <input
              type="text"
              placeholder="Search category..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="w-full h-8 pl-8 pr-7 rounded-lg border border-border-subtle bg-bg-base text-xs font-medium text-text-base focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
            />
            {categorySearch && (
              <button
                type="button"
                onClick={() => setCategorySearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-base"
              >
                <FaTimes className="text-[10px]" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Category Container */}
        <div className="max-h-48 grid grid-cols-2 gap-2 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-border-subtle">
          <button
              onClick={() => setFilterType("")}
              className={`w-full text-left px-3 text-ellipsis rounded-lg text-xs font-semibold border transition cursor-pointer truncate ${filterType === ""
                  ? "bg-primary text-compli border-primary font-bold shadow-xs"
                  : "border-border-subtle bg-bg-base hover:bg-card-hover text-text-base"
                }`}
            >
             All Categories
            </button>

          {filteredCategories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setFilterType(cat)}
              className={`w-full text-left px-3 py-1.5 text-ellipsis rounded-lg text-xs font-semibold border transition cursor-pointer truncate ${filterType === cat
                  ? "bg-primary text-compli border-primary font-bold shadow-xs"
                  : "border-border-subtle bg-bg-base hover:bg-card-hover text-text-base"
                }`}
            >
              {cat}
            </button>
          ))}

          {filteredCategories.length === 0 && (
            <p className="text-[11px] text-text-muted text-center py-2">
              No matching category
            </p>
          )}
        </div>
      </div>

      {/* Price */}
      {(() => {
        const numericPrices = uniquePrices
          .map(Number)
          .filter((n) => !isNaN(n));

        const minPriceInCatalog =
          numericPrices.length > 0 ? Math.min(...numericPrices) : 0;

        const maxPriceInCatalog =
          numericPrices.length > 0 ? Math.max(...numericPrices) : 100000;

        return (
          <div className="space-y-4">

            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Price
              </h3>

              {filterPrice && (
                <button
                  onClick={() => setFilterPrice("")}
                  className="text-[10px] font-semibold text-red-500 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            <input
              type="range"
              min={minPriceInCatalog}
              max={maxPriceInCatalog}
              value={
                filterPrice
                  ? Number(filterPrice)
                  : maxPriceInCatalog
              }
              onChange={(e) =>
                setFilterPrice(e.target.value)
              }
              className="w-full accent-primary"
            />

            <div className="flex justify-between text-[10px] sm:text-xs text-text-muted">
              <span>
                ₹{minPriceInCatalog.toLocaleString("en-IN")}
              </span>

              <span className="font-bold text-primary">
                ₹
                {Number(
                  filterPrice || maxPriceInCatalog
                ).toLocaleString("en-IN")}
              </span>

              <span>
                ₹{maxPriceInCatalog.toLocaleString("en-IN")}
              </span>
            </div>

          </div>
        );
      })()}

      {/* Clear Filters */}
      {(filterType || filterPrice || searchkey) && (
        <button
          onClick={() => {
            setFilterType("");
            setFilterPrice("");
            setSearchkey("");
          }}
          className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold transition active:scale-95 cursor-pointer"
        >
          Clear All Filters
        </button>
      )}

    </aside>
  );
}
