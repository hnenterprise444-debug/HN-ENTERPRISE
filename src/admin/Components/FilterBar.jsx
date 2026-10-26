import React from 'react';
import { FaSearch, FaTimes, FaChevronDown } from 'react-icons/fa';

/**
 * FilterBar Component
 * A generic, premium, and highly responsive filter bar with a search input, 
 * configurable select dropdowns, and an optional action slot (children).
 */
function FilterBar({
    search,
    setSearch,
    searchPlaceholder = "Search...",
    filters = [],
    children,
    className = ""
}) {
    return (
        <div className={`w-full ${className}`}>
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch lg:items-center justify-between w-full">
                {/* Search Input */}
                <div className="relative flex-1 w-full">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={search || ""}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-11 pl-10 pr-9 rounded-xl border border-border-subtle bg-bg-base text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-text-base placeholder:text-text-subtle shadow-2xs"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-primary rounded-full hover:bg-card-hover transition-colors cursor-pointer"
                            aria-label="Clear search"
                        >
                            <FaTimes className="text-xs" />
                        </button>
                    )}
                </div>

                {/* Filters & Extra Controls Slot */}
                {(filters.length > 0 || children) && (
                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
                        {/* Dropdowns */}
                        {filters.length > 0 && (
                            <div className={`grid ${filters.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} sm:flex sm:flex-row sm:flex-wrap items-center gap-2.5 w-full sm:w-auto`}>
                                {filters.map((filter, index) => {
                                    const isFiltered = Boolean(
                                        filter.value && 
                                        filter.value !== "all" && 
                                        filter.value !== "ALL" && 
                                        filter.value !== ""
                                    );
                                    return (
                                        <div key={index} className="relative flex-1 min-w-0 sm:flex-initial sm:w-auto">
                                            <select
                                                value={filter.value}
                                                onChange={(e) => filter.onChange(e.target.value)}
                                                className={`w-full appearance-none h-11 rounded-xl border pl-3.5 pr-8 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-semibold shadow-2xs ${
                                                    isFiltered
                                                        ? "border-primary bg-primary/10 text-primary"
                                                        : "border-border-subtle bg-bg-base text-text-base hover:border-primary/40"
                                                }`}
                                            >
                                                {filter.options.map((opt) => (
                                                    <option key={opt.value} value={opt.value} className="bg-card text-text-base py-1">
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <FaChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none transition-colors ${
                                                isFiltered ? "text-primary" : "text-text-muted"
                                            }`} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Extra Controls / Action Slot */}
                        {children && (
                            <div className="flex items-center w-full sm:w-auto shrink-0">
                                {children}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FilterBar;
