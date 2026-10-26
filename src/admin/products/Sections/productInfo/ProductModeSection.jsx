import React from "react";
import { FaBoxOpen, FaLayerGroup, FaCheck } from "react-icons/fa";

/**
 * Section 3: Variants or Single Product Mode Switch
 */
export function ProductModeSection({ products, setProducts }) {
    const isVariants = Boolean(products.hasVariants);

    return (
        <div className="bg-card border border-border-subtle rounded-2xl shadow-xs overflow-hidden text-xs">
            {/* Section 3 Header */}
            <div className="px-5 py-3.5 border-b border-border-subtle flex items-center justify-between bg-bg-base/40">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary text-compli font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                        3
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-text-base">
                            Variants or Single Product
                        </h2>
                        <p className="text-[10px] text-text-muted mt-0.5">
                            Choose whether this product is a single SKU or has multiple options (e.g. Size, Color, Storage).
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Single Product Card */}
                    <div
                        onClick={() => setProducts({ ...products, hasVariants: false })}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-start gap-3.5 ${
                            !isVariants
                                ? "border-primary bg-primary/10 shadow-xs"
                                : "border-border-subtle bg-bg-base hover:border-primary/50"
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            !isVariants ? "bg-primary text-compli font-bold" : "bg-card text-text-muted border border-border-subtle"
                        }`}>
                            <FaBoxOpen size={16} />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-extrabold text-xs text-text-base">
                                    Single Standalone Product
                                </h3>
                                {!isVariants && <FaCheck className="text-primary" size={12} />}
                            </div>
                            <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                                Standard item with 1 fixed selling price, 1 MRP, and 1 stock quantity. No size or color variants.
                            </p>
                        </div>
                    </div>

                    {/* Product with Variants Card */}
                    <div
                        onClick={() => setProducts({ ...products, hasVariants: true })}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-start gap-3.5 ${
                            isVariants
                                ? "border-primary bg-primary/10 shadow-xs"
                                : "border-border-subtle bg-bg-base hover:border-primary/50"
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isVariants ? "bg-primary text-compli font-bold" : "bg-card text-text-muted border border-border-subtle"
                        }`}>
                            <FaLayerGroup size={16} />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-extrabold text-xs text-text-base">
                                    Product with Variants
                                </h3>
                                {isVariants && <FaCheck className="text-primary" size={12} />}
                            </div>
                            <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                                Multi-SKU product with custom option attributes (e.g., Size, Color, Storage) with per-variant prices and inventory.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductModeSection;
