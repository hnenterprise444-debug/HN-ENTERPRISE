import React from "react";
import ProductDescriptionBuilder from "../ProductDescriptionBuilder";

/**
 * Section 5: Description / Content
 */
export function ProductContentSection({ products, setProducts }) {
    return (
        <div className="bg-card border border-border-subtle rounded-2xl shadow-xs overflow-hidden text-xs">
            {/* Section 5 Header */}
            <div className="px-5 py-3.5 border-b border-border-subtle flex items-center justify-between bg-bg-base/40">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary text-compli font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                        5
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-text-base">
                            Description / Content
                        </h2>
                        <p className="text-[10px] text-text-muted mt-0.5">
                            Provide product summary and construct structured text or specifications table sections.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-5">
                <ProductDescriptionBuilder
                    value={products.description}
                    onChange={(newDesc) =>
                        setProducts({
                            ...products,
                            description: newDesc
                        })
                    }
                />
            </div>
        </div>
    );
}

export default ProductContentSection;
