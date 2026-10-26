import React from "react";
import { FaBox } from "react-icons/fa";

/**
 * VariantTableEmptyState Component
 * Rendered when no variant combinations exist in the product state.
 */
export default function VariantTableEmptyState() {
  return (
    <div className="bg-card border border-border-subtle rounded-2xl shadow-xs text-xs overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border-subtle bg-bg-base/40">
        <h2 className="text-sm font-black text-text-base flex items-center gap-2">
          <FaBox className="text-primary" /> Generated Variant Inventory
        </h2>
        <p className="text-[10px] text-text-muted mt-0.5">
          Generate combinations to manage pricing, stock, and individual variant images.
        </p>
      </div>

      <div className="py-12 text-center bg-bg-base/20 border-2 border-dashed border-border-subtle m-4 rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-border-subtle/40 text-text-muted flex items-center justify-center mx-auto mb-2">
          <FaBox size={20} />
        </div>
        <h3 className="font-bold text-text-base text-xs">
          No Variant Inventory Generated
        </h3>
        <p className="text-[10px] text-text-muted mt-1 max-w-xs mx-auto">
          Click <strong>Generate Combinations</strong> in the section above to generate individual SKUs.
        </p>
      </div>
    </div>
  );
}
