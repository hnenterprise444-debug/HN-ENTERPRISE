import React from "react";
import { FaBox, FaTrash } from "react-icons/fa";

/**
 * VariantTableHeader Component
 * Renders title, SKU counter, bulk fill controls, and clear combinations action.
 */
export default function VariantTableHeader({
  variantCount,
  bulkPrice,
  setBulkPrice,
  applyBulkPrice,
  bulkStock,
  setBulkStock,
  applyBulkStock,
  onRemoveAllCombinations,
}) {
  return (
    <div className="px-5 py-4 border-b border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-base/40">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold shadow-xs">
          <FaBox size={16} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-text-base">
              Variant Inventory Grid
            </h2>
            <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full text-[10px] font-black">
              {variantCount} SKU{variantCount !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-[10px] text-text-muted mt-0.5">
            Set price, original MRP, stock, images, and publishing status for every combination.
          </p>
        </div>
      </div>

      {/* Bulk Quick Action Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-card border border-border-subtle p-2 rounded-xl">
        <span className="text-[9.5px] font-black text-text-muted uppercase tracking-wider px-1">
          Bulk Fill:
        </span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={bulkPrice}
            onChange={(e) => setBulkPrice(e.target.value)}
            placeholder="Price ₹"
            className="w-20 px-2 py-1 rounded-lg border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle text-[11px] font-semibold outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={applyBulkPrice}
            className="px-2 py-1 bg-primary text-compli text-[10px] font-bold rounded-lg hover:bg-primary-hover transition cursor-pointer"
          >
            Apply
          </button>
        </div>

        <div className="flex items-center gap-1">
          <input
            type="number"
            value={bulkStock}
            onChange={(e) => setBulkStock(e.target.value)}
            placeholder="Stock"
            className="w-16 px-2 py-1 rounded-lg border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle text-[11px] font-semibold outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={applyBulkStock}
            className="px-2 py-1 bg-primary text-compli text-[10px] font-bold rounded-lg hover:bg-primary-hover transition cursor-pointer"
          >
            Apply
          </button>
        </div>

        <div className="h-4 w-[1px] bg-border-subtle/80 mx-1 hidden sm:block" />

        <button
          type="button"
          onClick={onRemoveAllCombinations}
          className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10.5px] font-bold rounded-lg hover:bg-rose-500/20 transition flex items-center gap-1 cursor-pointer active:scale-95"
          title="Remove all generated variant combinations"
        >
          <FaTrash size={10} /> Remove All Combinations
        </button>
      </div>
    </div>
  );
}
