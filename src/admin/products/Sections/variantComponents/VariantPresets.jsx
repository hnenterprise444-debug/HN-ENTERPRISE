import React from "react";
import { FaInfoCircle } from "react-icons/fa";

/**
 * VariantPresets Component
 * Provides quick clickable presets (+ Size, + Color, + Storage) to prepopulate variant options.
 */
export default function VariantPresets({ onApplyPreset }) {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-bg-base/50 p-2.5 rounded-xl border border-border-subtle">
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
        <FaInfoCircle size={10} /> Quick Presets:
      </span>
      <button
        type="button"
        onClick={() => onApplyPreset("Size", ["S", "M", "L", "XL"])}
        className="px-2.5 py-1 rounded-lg bg-card border border-border-subtle text-[10px] font-semibold text-text-base hover:bg-card-hover hover:border-primary/50 transition cursor-pointer"
      >
        + Size (S, M, L, XL)
      </button>
      <button
        type="button"
        onClick={() => onApplyPreset("Color", ["Black", "White", "Blue", "Red"])}
        className="px-2.5 py-1 rounded-lg bg-card border border-border-subtle text-[10px] font-semibold text-text-base hover:bg-card-hover hover:border-primary/50 transition cursor-pointer"
      >
        + Color (Black, White, Blue)
      </button>
      <button
        type="button"
        onClick={() => onApplyPreset("Storage", ["64GB", "128GB", "256GB"])}
        className="px-2.5 py-1 rounded-lg bg-card border border-border-subtle text-[10px] font-semibold text-text-base hover:bg-card-hover hover:border-primary/50 transition cursor-pointer"
      >
        + Storage (64GB, 128GB)
      </button>
    </div>
  );
}
