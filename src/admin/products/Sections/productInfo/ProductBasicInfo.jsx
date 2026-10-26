import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../../utils/queryKeys.js";
import { productService } from "../../../../services/product/productService.js";
import { DEFAULT_CATEGORIES, normalizeCategoryName } from "../../../../utils/categoryUtils.js";
import { toast } from "react-toastify";

/**
 * Section 2: Basic Information
 */
export function ProductBasicInfo({ products, setProducts, handleTagsChange }) {
    const queryClient = useQueryClient();
    const [isAddingCustom, setIsAddingCustom] = useState(Boolean(products.isAddingCustomCategory));
    const [customInput, setCustomInput] = useState("");
    const [isSavingCustom, setIsSavingCustom] = useState(false);

    // Fetch all categories dynamically from Firestore & products
    const { data: dbCategories = [] } = useQuery({
        queryKey: queryKeys.categories.all,
        queryFn: () => productService.getCategories(),
        staleTime: 5 * 60 * 1000,
    });

    // Merge default categories, DB categories, and current product category into a normalized, sorted list
    const allCategories = useMemo(() => {
        const catMap = new Map();
        const add = (c) => {
            const norm = normalizeCategoryName(c);
            if (norm) catMap.set(norm.toLowerCase(), norm);
        };

        DEFAULT_CATEGORIES.forEach(add);
        (dbCategories || []).forEach(add);
        if (products.category) add(products.category);

        return Array.from(catMap.values()).sort((a, b) => a.localeCompare(b));
    }, [dbCategories, products.category]);

    const handleSaveCustomCategory = async () => {
        const targetVal = customInput || products.category;
        const norm = normalizeCategoryName(targetVal);
        if (!norm) {
            toast.error("Please enter a category name");
            return;
        }

        setIsSavingCustom(true);
        try {
            await productService.saveCategory(norm);
            await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
            setProducts(prev => ({
                ...prev,
                category: norm,
                isAddingCustomCategory: false
            }));
            setIsAddingCustom(false);
            setCustomInput("");
            toast.success(`Category "${norm}" saved and selected!`);
        } catch (err) {
            toast.error("Failed to save category. Please try again.");
        } finally {
            setIsSavingCustom(false);
        }
    };

    const handleCancelCustom = () => {
        setIsAddingCustom(false);
        setCustomInput("");
        setProducts(prev => ({
            ...prev,
            isAddingCustomCategory: false,
            // If current category isn't a valid known category, reset it
            category: allCategories.includes(prev.category) ? prev.category : ""
        }));
    };

    return (
        <div className="bg-card border border-border-subtle rounded-2xl shadow-xs overflow-hidden text-xs">
            {/* Section 2 Header */}
            <div className="px-5 py-3.5 border-b border-border-subtle flex items-center justify-between bg-bg-base/40">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary text-compli font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                        2
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-text-base flex items-center gap-2">
                            Basic Information
                        </h2>
                        <p className="text-[10px] text-text-muted mt-0.5">
                            Define the product brand, title, category, and search keywords.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Brand */}
                    <div>
                        <label className="block font-bold text-text-base mb-1.5">
                            Brand Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={products.brand || ""}
                            onChange={(e) =>
                                setProducts({
                                    ...products,
                                    brand: e.target.value
                                })
                            }
                            placeholder="e.g. Apple, Nike, Samsung"
                            className="w-full rounded-xl border border-border-subtle bg-bg-base px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold text-text-base placeholder:text-text-subtle"
                        />
                    </div>

                    {/* Category Select Dropdown with Add New Option */}
                    <div>
                        <label className="block font-bold text-text-base mb-1.5">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                            <select
                                value={isAddingCustom ? "__NEW__" : (products.category || "")}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "__NEW__") {
                                        setIsAddingCustom(true);
                                        setCustomInput("");
                                        setProducts(prev => ({ ...prev, category: "", isAddingCustomCategory: true }));
                                    } else {
                                        setIsAddingCustom(false);
                                        setCustomInput("");
                                        setProducts(prev => ({ ...prev, category: val, isAddingCustomCategory: false }));
                                    }
                                }}
                                className="w-full rounded-xl border border-border-subtle bg-bg-base text-text-base px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold cursor-pointer"
                            >
                                <option value="" className="bg-bg-base text-text-muted">Select Category...</option>
                                <option value="__NEW__" className="font-bold text-primary bg-bg-base">+ Add Custom Category</option>
                                {allCategories.map((cat) => (
                                    <option key={cat} value={cat} className="bg-bg-base text-text-base">
                                        {cat}
                                    </option>
                                ))}
                            </select>

                            {isAddingCustom && (
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="text"
                                        value={customInput}
                                        onChange={(e) => {
                                            setCustomInput(e.target.value);
                                            setProducts(prev => ({ ...prev, category: e.target.value }));
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSaveCustomCategory();
                                            }
                                        }}
                                        placeholder="Type new category name..."
                                        className="flex-1 rounded-xl border border-primary/40 bg-bg-base text-text-base px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        disabled={isSavingCustom}
                                        onClick={handleSaveCustomCategory}
                                        className="px-3 py-2 rounded-xl bg-primary text-compli hover:bg-primary-hover text-xs font-bold transition cursor-pointer disabled:opacity-50"
                                        title="Save Category to Database"
                                    >
                                        {isSavingCustom ? "Saving..." : "Add"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelCustom}
                                        className="px-2.5 py-2 rounded-xl border border-border-subtle bg-bg-base hover:bg-card-hover text-text-muted hover:text-text-base text-xs font-bold transition cursor-pointer"
                                        title="Cancel custom category"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Title */}
                    <div className="md:col-span-2">
                        <label className="block font-bold text-text-base mb-1.5">
                            Product Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={products.title || ""}
                            onChange={(e) =>
                                setProducts({
                                    ...products,
                                    title: e.target.value
                                })
                            }
                            placeholder="e.g. Premium Noise Cancelling Headphones"
                            className="w-full rounded-xl border border-border-subtle bg-bg-base text-text-base px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-extrabold text-sm placeholder:text-text-subtle"
                        />
                    </div>

                    {/* Tags / Search Keywords */}
                    <div className="md:col-span-2">
                        <label className="block font-bold text-text-base mb-1.5">
                            Search Tags & Keywords <span className="text-text-muted text-[10px] font-normal">(Comma separated)</span>
                        </label>
                        <input
                            type="text"
                            value={typeof products.tags === 'string' ? products.tags : (Array.isArray(products.tags) ? products.tags.join(", ") : "")}
                            onChange={handleTagsChange}
                            placeholder="e.g. wireless, bluetooth, gaming, bass"
                            className="w-full rounded-xl border border-border-subtle bg-bg-base text-text-base px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium placeholder:text-text-subtle"
                        />
                        {(() => {
                            const badges = typeof products.tags === 'string'
                                ? products.tags.split(',').map(t => t.trim()).filter(Boolean)
                                : (Array.isArray(products.tags) ? products.tags : []);
                            if (badges.length === 0) return null;
                            return (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {badges.map((tag, idx) => (
                                        <span key={idx} className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
                                             #{tag}
                                        </span>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductBasicInfo;
