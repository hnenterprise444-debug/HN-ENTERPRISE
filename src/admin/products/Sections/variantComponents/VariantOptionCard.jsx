import React from "react";
import { FaTrash } from "react-icons/fa";
import VariantValuesInput from "./VariantValuesInput";

/**
 * VariantOptionCard Component
 * Card editor for a single attribute option (e.g. Option #1: Size -> S, M, L).
 */
export default function VariantOptionCard({
  variant,
  index,
  deleteVariantType,
  handleVariantTypeNameChange,
  handleVariantTypeValuesChange,
}) {
  return (
    <div className="border border-border-subtle rounded-2xl p-4 bg-bg-base space-y-3 hover:border-primary/40 transition-all shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
          Option #{index + 1}
        </span>
        <button
          type="button"
          onClick={() => deleteVariantType(index)}
          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
          title="Delete Option Attribute"
        >
          <FaTrash size={12} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Option Name */}
        <div className="sm:col-span-1">
          <label className="block font-bold text-text-base mb-1 text-[11px]">
            Attribute Name
          </label>
          <input
            type="text"
            value={variant.name}
            placeholder="e.g. Size, Color"
            onChange={(e) => handleVariantTypeNameChange(index, e.target.value)}
            className="w-full rounded-xl border border-border-subtle bg-card text-text-base placeholder:text-text-subtle px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        {/* Values */}
        <div className="sm:col-span-2">
          <label className="block font-bold text-text-base mb-1 text-[11px]">
            Option Values
          </label>
          <VariantValuesInput
            index={index}
            values={variant.values}
            onChange={handleVariantTypeValuesChange}
          />
        </div>
      </div>
    </div>
  );
}
