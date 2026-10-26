import React from 'react'

/**
 * SearchBar Component
 * Reusable full-text search input with styling for consistent look.
 */
function SearchBar({ searchkey, setSearchkey, searchClass = "" }) {
    return (
        <div className="w-full">
            <div className={`relative flex items-center border border-border-subtle focus-within:border-primary rounded-full bg-bg-base focus-within:ring-2 focus-within:ring-primary/20 transition-all ${searchClass}`}>
                <span className="material-symbols-outlined text-text-muted text-lg mr-2 pointer-events-none select-none">
                    search
                </span>
                <input
                    type="text"
                    value={searchkey}
                    onChange={(e) => setSearchkey(e.target.value)}
                    placeholder="Search products..."
                    className="bg-transparent border-none text-xs w-full focus:outline-none focus:ring-0 text-text-base placeholder:text-text-subtle font-medium"
                />
            </div>
        </div>
    )
}

export default SearchBar