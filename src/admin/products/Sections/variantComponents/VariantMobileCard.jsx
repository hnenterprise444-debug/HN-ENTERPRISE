import React from "react";
import { FaTrash, FaImages } from "react-icons/fa";
import StatusBadge from "../../../Components/common/StatusBadge.jsx";

/**
 * VariantMobileCard Component
 * Mobile responsive card format for editing individual variant combinations.
 */
export default function VariantMobileCard({
  variant,
  index,
  handleVariantChange,
  handleVariantImageUpload,
  handleVariantImageDelete,
  variantUploadingIndex,
  deleteVariant,
}) {
  const isVariantActive = variant.isActive !== false && variant.isAvailable !== false;

  return (
    <div className="p-4 bg-card flex flex-col gap-3">
      {/* Header: Attributes & Actions */}
      <div className="flex justify-between items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {Object.entries(variant.attributes || {}).map(([attrKey, attrVal]) => (
            <div key={attrKey} className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-lg px-2 py-1">
              <span className="text-[10px] font-bold text-primary shrink-0">{attrKey}:</span>
              <input
                type="text"
                value={attrVal || ""}
                onChange={(e) => {
                  const newAttrs = { ...(variant.attributes || {}), [attrKey]: e.target.value };
                  handleVariantChange(index, "attributes", newAttrs);
                }}
                className="w-16 px-1.5 py-0.5 rounded bg-bg-base text-text-base text-[11px] font-bold border border-border-subtle focus:border-primary focus:outline-none"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleVariantChange(index, "isActive", !isVariantActive)}
            className="cursor-pointer inline-flex active:scale-95 transition"
            title={isVariantActive ? "Click to set Draft mode" : "Click to set Live (Published)"}
          >
            <StatusBadge status={isVariantActive ? "LIVE" : "DRAFT"} size="sm" />
          </button>

          <button
            type="button"
            onClick={() => deleteVariant(index)}
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
            title="Delete Variant"
          >
            <FaTrash size={12} />
          </button>
        </div>
      </div>

      {/* Variant Images */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-text-muted font-extrabold uppercase tracking-wider">Images</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {variant.images &&
            variant.images.map((url, imgIdx) => (
              <div key={imgIdx} className="relative group w-12 h-12 rounded-xl border border-border-subtle overflow-hidden bg-bg-base shadow-xs">
                <img src={url} alt="Variant" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleVariantImageDelete(index, imgIdx)}
                  className="absolute inset-0 bg-rose-600/90 text-white flex items-center justify-center opacity-100 transition-opacity cursor-pointer"
                  title="Delete Image"
                >
                  <FaTrash size={10} />
                </button>
              </div>
            ))}
          <label className="relative flex flex-col items-center justify-center cursor-pointer w-12 h-12 rounded-xl bg-card hover:bg-card-hover border border-border-subtle transition text-[9px] font-bold text-text-muted hover:text-text-base gap-0.5 active:scale-95">
            {variantUploadingIndex === index ? (
              <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <FaImages size={12} />
                <span>Add</span>
              </>
            )}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleVariantImageUpload(index, e)}
              className="hidden"
              disabled={variantUploadingIndex !== null}
            />
          </label>
        </div>
      </div>

      {/* Fields Section (Grid of 3 columns for numeric values) */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[9.5px] text-text-muted mb-1 font-bold uppercase tracking-wider">Selling Price ₹</label>
          <input
            type="number"
            value={variant.price ?? ""}
            onChange={(e) => handleVariantChange(index, "price", Number(e.target.value))}
            className="w-full rounded-xl border border-border-subtle bg-bg-base text-text-base px-2 py-1.5 text-center font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <div>
          <label className="block text-[9.5px] text-text-muted mb-1 font-bold uppercase tracking-wider">Original MRP ₹</label>
          <input
            type="number"
            value={variant.originalPrice ?? ""}
            onChange={(e) => handleVariantChange(index, "originalPrice", Number(e.target.value))}
            className="w-full rounded-xl border border-border-subtle bg-bg-base text-text-muted px-2 py-1.5 text-center font-semibold text-xs focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <div>
          <label className="block text-[9.5px] text-text-muted mb-1 font-bold uppercase tracking-wider">Stock Qty</label>
          <input
            type="number"
            value={variant.inStock ?? ""}
            onChange={(e) => handleVariantChange(index, "inStock", Number(e.target.value))}
            className="w-full rounded-xl border border-border-subtle bg-bg-base text-text-base px-2 py-1.5 text-center font-extrabold text-xs focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
