import React from "react";
import { FaTrash, FaImages } from "react-icons/fa";
import StatusBadge from "../../../Components/common/StatusBadge.jsx";

/**
 * VariantTableRow Component
 * Desktop table row for editing individual variant combination attributes, images, prices, stock, and live/draft status.
 */
export default function VariantTableRow({
  variant,
  index,
  handleVariantChange,
  handleVariantImageUpload,
  handleVariantImageDelete,
  variantUploadingIndex,
  setActiveVariantMediaIndex,
  deleteVariant,
}) {
  const isVariantActive = variant.isActive !== false && variant.isAvailable !== false;
  const stockNum = Number(variant.inStock || 0);

  return (
    <tr className="hover:bg-card-hover transition-colors">
      {/* Variant attributes */}
      <td className="px-5 py-3.5">
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
                className="w-16 px-1.5 py-0.5 rounded bg-card text-text-base text-[11px] font-bold border border-border-subtle focus:border-primary focus:outline-none"
              />
            </div>
          ))}
        </div>
      </td>

      {/* Variant Images */}
      <td className="px-3 py-3.5 text-center">
        <div className="flex flex-col items-center justify-center gap-1.5">
          {variant.images && variant.images.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1 max-w-[120px]">
              {variant.images.map((url, imgIdx) => (
                <div key={imgIdx} className="relative group w-8 h-8 rounded-lg border border-border-subtle overflow-hidden bg-bg-base shadow-xs">
                  <img src={url} alt="Variant" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleVariantImageDelete(index, imgIdx)}
                    className="absolute inset-0 bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    title="Delete Image"
                  >
                    <FaTrash size={9} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1">
            <label className="relative flex items-center justify-center cursor-pointer px-2 py-1 rounded-lg bg-card hover:bg-card-hover border border-border-subtle transition text-[10px] font-bold gap-1 text-text-muted hover:text-text-base active:scale-95">
              {variantUploadingIndex === index ? (
                <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <FaImages size={10} />
              )}
              <span>{variantUploadingIndex === index ? "Uploading..." : "Upload"}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleVariantImageUpload(index, e)}
                className="hidden"
                disabled={variantUploadingIndex !== null}
              />
            </label>

            <button
              type="button"
              onClick={() => setActiveVariantMediaIndex(index)}
              className="px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition text-[10px] font-extrabold flex items-center gap-1 cursor-pointer active:scale-95"
              title="Select from Media Library"
            >
              <FaImages size={10} /> Library
            </button>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="px-3 py-3.5">
        <div className="relative max-w-[100px] mx-auto">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted font-bold text-[11px]">₹</span>
          <input
            type="number"
            value={variant.price ?? ""}
            onChange={(e) => handleVariantChange(index, "price", Number(e.target.value))}
            className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-border-subtle bg-bg-base text-text-base text-center font-bold text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>
      </td>

      {/* Original Price */}
      <td className="px-3 py-3.5">
        <div className="relative max-w-[100px] mx-auto">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted font-bold text-[11px]">₹</span>
          <input
            type="number"
            value={variant.originalPrice ?? ""}
            onChange={(e) => handleVariantChange(index, "originalPrice", Number(e.target.value))}
            placeholder="Optional"
            className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-border-subtle bg-bg-base text-center font-semibold text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-text-muted placeholder:text-text-subtle"
          />
        </div>
      </td>

      {/* Stock */}
      <td className="px-3 py-3.5">
        <input
          type="number"
          value={variant.inStock ?? ""}
          onChange={(e) => handleVariantChange(index, "inStock", Number(e.target.value))}
          className={`w-20 mx-auto block rounded-xl border px-2 py-1.5 text-center font-extrabold text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${
            stockNum === 0
              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
              : stockNum < 5
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
              : "bg-bg-base border-border-subtle text-text-base"
          }`}
        />
      </td>

      {/* Live vs Draft Status Toggle */}
      <td className="px-3 py-3.5 text-center">
        <button
          type="button"
          onClick={() => handleVariantChange(index, "isActive", !isVariantActive)}
          className="cursor-pointer inline-flex active:scale-95 transition"
          title={isVariantActive ? "Click to set Draft mode" : "Click to set Live (Published)"}
        >
          <StatusBadge status={isVariantActive ? "LIVE" : "DRAFT"} size="sm" />
        </button>
      </td>

      {/* Delete */}
      <td className="px-4 py-3.5 text-center">
        <button
          type="button"
          onClick={() => deleteVariant(index)}
          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition cursor-pointer"
          title="Delete Variant"
        >
          <FaTrash size={12} />
        </button>
      </td>
    </tr>
  );
}
