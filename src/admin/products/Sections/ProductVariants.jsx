import React from "react";
import { FaPlus, FaLayerGroup } from "react-icons/fa";
import VariantPresets from "./variantComponents/VariantPresets";
import VariantOptionCard from "./variantComponents/VariantOptionCard";
import VariantGeneratorBar from "./variantComponents/VariantGeneratorBar";

/**
 * ProductVariants Component (Admin Products Module)
 * Manages product option attributes (Size, Color, Material, etc.) and combination generation.
 * Refactored into modular subcomponents for maintainability and readability.
 */
function ProductVariants({
  products,
  setProducts,
  addVariantType,
  deleteVariantType,
  handleVariantTypeNameChange,
  handleVariantTypeValuesChange,
  generateCombinations,
  addManualVariant,
  deleteAllVariants,
}) {
  const handleClearAll = () => {
    if (typeof deleteAllVariants === "function") {
      deleteAllVariants();
    } else if (typeof setProducts === "function") {
      setProducts((prev) => ({ ...prev, variants: [] }));
    }
  };

  // Quick option presets helper
  const applyPreset = (name, presetValues) => {
    const existingIndex = products.variantTypes?.findIndex(
      (v) => v.name?.toLowerCase() === name.toLowerCase()
    );
    if (existingIndex !== undefined && existingIndex >= 0) {
      handleVariantTypeValuesChange(existingIndex, presetValues);
    } else {
      const newIndex = products.variantTypes?.length || 0;
      addVariantType();
      setTimeout(() => {
        handleVariantTypeNameChange(newIndex, name);
        handleVariantTypeValuesChange(newIndex, presetValues);
      }, 50);
    }
  };

  return (
    <div className="bg-card border border-border-subtle rounded-2xl shadow-xs text-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle bg-bg-base/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold">
            <FaLayerGroup size={14} />
          </div>
          <div>
            <h2 className="text-sm font-black text-text-base flex items-center gap-2">
              Product Variant Options
            </h2>
            <p className="text-[10px] text-text-muted mt-0.5">
              Define option attributes like Size, Color, or Material to generate combinations.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={addVariantType}
          className="flex items-center gap-1.5 bg-primary text-compli px-3 py-1.5 rounded-xl font-bold hover:bg-primary-hover transition text-xs shadow-xs cursor-pointer active:scale-95"
        >
          <FaPlus size={10} />
          Add Option Attribute
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Preset Suggestions */}
        <VariantPresets onApplyPreset={applyPreset} />

        {/* Variant Types List */}
        <div className="space-y-3">
          {(!products.variantTypes || products.variantTypes.length === 0) && (
            <div className="border-2 border-dashed border-border-subtle rounded-2xl py-8 text-center bg-bg-base/20">
              <div className="w-10 h-10 rounded-full bg-border-subtle/40 text-text-muted flex items-center justify-center mx-auto mb-2">
                <FaLayerGroup size={16} />
              </div>
              <h3 className="font-bold text-text-base text-xs">
                No Option Attributes Defined Yet
              </h3>
              <p className="text-[10px] text-text-muted mt-1 max-w-xs mx-auto">
                Click <strong>Add Option Attribute</strong> or select a quick preset above to get started.
              </p>
            </div>
          )}

          {products.variantTypes?.map((variant, index) => (
            <VariantOptionCard
              key={index}
              variant={variant}
              index={index}
              deleteVariantType={deleteVariantType}
              handleVariantTypeNameChange={handleVariantTypeNameChange}
              handleVariantTypeValuesChange={handleVariantTypeValuesChange}
            />
          ))}
        </div>

        {/* Generator Call to Actions */}
        {products.variantTypes?.length > 0 && (
          <VariantGeneratorBar
            optionCount={products.variantTypes.length}
            variantCount={products.variants?.length || 0}
            isActive={products.isActive}
            generateCombinations={generateCombinations}
            addManualVariant={addManualVariant}
            onClearAll={handleClearAll}
          />
        )}
      </div>
    </div>
  );
}

export default ProductVariants;