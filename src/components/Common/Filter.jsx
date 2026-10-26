import React from 'react'
import { useFilter } from '../../context/FilterContext'
import { useTheme } from '../../context/ThemeContext'
import useProducts from '../../hooks/product/useProducts'
import { normalizeCategoryName } from '../../utils/categoryUtils'

function Filter() {
    const { mode, searchkey, setSearchkey, filterType, setFilterType,
        filterPrice, setFilterPrice } = useFilter();
    const { products } = useProducts();

    const uniquePrices = [...new Set(products.map((item) => item.price))];
    const uniqueCategory = [...new Set(products.map((item) => normalizeCategoryName(item.category)).filter(Boolean))].sort((a, b) => a.localeCompare(b));


    return (
        <div className="container mx-auto">
            <div className=" rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300">


                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 h-11 rounded-xl bg-card border border-border-subtle text-text-base text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 cursor-pointer transition-all duration-200 w-full sm:w-44"
                    >
                        <option value="">All Categories</option>
                        {uniqueCategory.map((category, index) => {
                            return (
                                <option key={index} value={category}>{category}</option>
                            )
                        })}
                    </select>

                    <select
                        value={filterPrice}
                        onChange={(e) => setFilterPrice(e.target.value)}
                        className="px-3 h-11 rounded-xl bg-card border border-border-subtle text-text-base text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 cursor-pointer transition-all duration-200 w-full sm:w-44"
                    >
                        <option value="">All Prices</option>
                        {uniquePrices.map((price, index) => {
                            return (
                                <option key={index} value={price}>₹{price}</option>
                            )
                        })}
                    </select>

                    {(filterType || filterPrice) && (
                        <button
                            onClick={() => { setFilterType(''); setFilterPrice(''); }}
                            className="text-xs font-bold text-rose-500 hover:underline px-2 transition-all shrink-0 cursor-pointer"
                        >
                            Reset
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                <div className=" flex items-center pr-10 h-11 px-4 rounded-full bg-bg-base border border-border-subtle shadow-inner focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-200 ">
                    <span className="material-symbols-outlined text-xl text-text-muted">
                        search
                    </span>

                    <input
                        type="text"
                        value={searchkey}
                        onChange={(e) => setSearchkey(e.target.value)}
                        placeholder="Search products..."
                        className=" bg-transparent px-3 text-sm text-text-base placeholder:text-text-muted outline-none w-full"
                    />

                    {searchkey && (
                        <button
                            onClick={() => setSearchkey("")}
                            className="material-symbols-outlined text-lg text-text-muted hover:text-text-base transition-colors duration-200"
                        >
                            close
                        </button>
                    )}
                </div>
            </div>
        </div>

    )
}

export default Filter