import React, { useState } from "react";
import MediaLibraryModal from "../../../components/modal/MediaLibraryModal.jsx";
import VariantTableEmptyState from "./variantComponents/VariantTableEmptyState";
import VariantTableHeader from "./variantComponents/VariantTableHeader";
import VariantTableRow from "./variantComponents/VariantTableRow";
import VariantMobileCard from "./variantComponents/VariantMobileCard";

/**
 * VariantTable Component (Admin Products Module)
 * Displays and manages the generated variant inventory grid.
 * Refactored into modular section components for maintainability.
 */
function VariantTable({
  products,
  setProducts,
  deleteVariant,
  deleteAllVariants,
  handleVariantChange,
  handleVariantImageUpload,
  handleVariantImageDelete,
  variantUploadingIndex,
}) {
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");
  const [activeVariantMediaIndex, setActiveVariantMediaIndex] = useState(null);

  const handleRemoveAllCombinations = () => {
    if (typeof deleteAllVariants === "function") {
      deleteAllVariants();
    } else {
      setProducts({ ...products, variants: [] });
    }
  };

  const handleSelectVariantMedia = (selectedUrls) => {
    if (activeVariantMediaIndex === null || !selectedUrls) return;
    const urls = (Array.isArray(selectedUrls) ? selectedUrls : [selectedUrls])
      .flat(Infinity)
      .filter((u) => typeof u === "string" && u.trim() !== "");
    if (urls.length === 0) return;

    const updatedVariants = (products.variants || []).map((v, i) => {
      if (i === activeVariantMediaIndex) {
        const existing = (Array.isArray(v.images) ? v.images : [])
          .flat(Infinity)
          .filter((u) => typeof u === "string" && u.trim() !== "");
        const merged = Array.from(new Set([...existing, ...urls]));
        return {
          ...v,
          images: merged,
        };
      }
      return v;
    });

    setProducts({ ...products, variants: updatedVariants });
    setActiveVariantMediaIndex(null);
  };

  const applyBulkPrice = () => {
    if (!bulkPrice || isNaN(Number(bulkPrice))) return;
    const newVariants = (products.variants || []).map((v) => ({
      ...v,
      price: Number(bulkPrice),
    }));
    setProducts({ ...products, variants: newVariants });
  };

  const applyBulkStock = () => {
    if (bulkStock === "" || isNaN(Number(bulkStock))) return;
    const newVariants = (products.variants || []).map((v) => ({
      ...v,
      inStock: Number(bulkStock),
    }));
    setProducts({ ...products, variants: newVariants });
  };

  if (!products.variants || products.variants.length === 0) {
    return <VariantTableEmptyState />;
  }

  return (
    <div className="bg-card border border-border-subtle rounded-2xl shadow-xs text-xs overflow-hidden space-y-0">
      {/* Header & Bulk Controls */}
      <VariantTableHeader
        variantCount={products.variants.length}
        bulkPrice={bulkPrice}
        setBulkPrice={setBulkPrice}
        applyBulkPrice={applyBulkPrice}
        bulkStock={bulkStock}
        setBulkStock={setBulkStock}
        applyBulkStock={applyBulkStock}
        onRemoveAllCombinations={handleRemoveAllCombinations}
      />

      {/* Desktop View (Table Layout) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-base text-text-muted text-[10px] uppercase tracking-wider font-extrabold">
              <th className="px-5 py-3">Variant Attributes</th>
              <th className="px-3 py-3 text-center">Images</th>
              <th className="px-3 py-3 text-center">Price (₹)</th>
              <th className="px-3 py-3 text-center">MRP (₹)</th>
              <th className="px-3 py-3 text-center">Stock</th>
              <th className="px-3 py-3 text-center">Publish Status</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/50">
            {products.variants.map((variant, index) => (
              <VariantTableRow
                key={index}
                variant={variant}
                index={index}
                handleVariantChange={handleVariantChange}
                handleVariantImageUpload={handleVariantImageUpload}
                handleVariantImageDelete={handleVariantImageDelete}
                variantUploadingIndex={variantUploadingIndex}
                setActiveVariantMediaIndex={setActiveVariantMediaIndex}
                deleteVariant={deleteVariant}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View (Card Layout) */}
      <div className="md:hidden divide-y divide-border-subtle">
        {products.variants.map((variant, index) => (
          <VariantMobileCard
            key={index}
            variant={variant}
            index={index}
            handleVariantChange={handleVariantChange}
            handleVariantImageUpload={handleVariantImageUpload}
            handleVariantImageDelete={handleVariantImageDelete}
            variantUploadingIndex={variantUploadingIndex}
            deleteVariant={deleteVariant}
          />
        ))}
      </div>

      <MediaLibraryModal
        isOpen={activeVariantMediaIndex !== null}
        onClose={() => setActiveVariantMediaIndex(null)}
        onSelectImages={handleSelectVariantMedia}
        multiple={true}
      />
    </div>
  );
}

export default VariantTable;