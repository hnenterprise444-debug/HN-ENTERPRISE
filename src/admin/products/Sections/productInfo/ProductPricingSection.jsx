import React from "react";

/**
 * Section 4: Pricing and Inventory (Single Product Mode)
 */
export function ProductPricingSection({ products, setProducts }) {
    if (products.hasVariants) {
        return (
            <div className="bg-card border border-border-subtle rounded-2xl shadow-xs overflow-hidden text-xs">
                {/* Section 4 Header */}
                <div className="px-5 py-3.5 border-b border-border-subtle flex items-center justify-between bg-bg-base/40">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-primary text-compli font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                            4
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-text-base">
                                Pricing and Inventory
                            </h2>
                            <p className="text-[10px] text-text-muted mt-0.5">
                                Prices, MRP, and stock inventory are managed per-variant in the matrix below.
                            </p>
                        </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold">
                        Multi-Variant Inventory
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border-subtle rounded-2xl shadow-xs overflow-hidden text-xs">
            {/* Section 4 Header */}
            <div className="px-5 py-3.5 border-b border-border-subtle flex items-center justify-between bg-bg-base/40">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary text-compli font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                        4
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-text-base">
                            Pricing and Inventory
                        </h2>
                        <p className="text-[10px] text-text-muted mt-0.5">
                            Set standalone selling price, original MRP, and stock quantity.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Selling Price */}
                    <div>
                        <label className="block font-bold text-text-base mb-1.5">
                            Selling Price (₹) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-black text-sm">
                                ₹
                            </span>
                            <input
                                type="text"
                                value={products.price ?? ""}
                                onChange={(e) =>
                                    setProducts({
                                        ...products,
                                        price: e.target.value
                                    })
                                }
                                placeholder="e.g. 499"
                                className="w-full pl-8 rounded-xl border border-border-subtle bg-bg-base text-text-base px-3.5 py-2 text-xs font-black focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-text-subtle"
                            />
                        </div>
                    </div>

                    {/* Original MRP */}
                    <div>
                        <label className="block font-bold text-text-base mb-1.5">
                            Original MRP (₹) <span className="text-text-muted text-[10px] font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-black text-sm">
                                ₹
                            </span>
                            <input
                                type="text"
                                value={products.originalPrice ?? ""}
                                onChange={(e) =>
                                    setProducts({
                                        ...products,
                                        originalPrice: e.target.value
                                    })
                                }
                                placeholder="e.g. 799"
                                className="w-full pl-8 rounded-xl border border-border-subtle bg-bg-base px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-muted placeholder:text-text-subtle"
                            />
                        </div>
                    </div>

                    {/* Stock Qty */}
                    <div>
                        <label className="block font-bold text-text-base mb-1.5">
                            In-Stock Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={products.inStock ?? ""}
                            onChange={(e) =>
                                setProducts({
                                    ...products,
                                    inStock: e.target.value
                                })
                            }
                            placeholder="e.g. 25"
                            className="w-full rounded-xl border border-border-subtle bg-bg-base text-text-base px-3.5 py-2 text-xs font-black focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-text-subtle"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductPricingSection;
