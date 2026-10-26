import React from 'react'
import { useNavigate } from 'react-router-dom'
import { computeTotalStock } from '../../utils/productUtils'

/**
 * ProductCard
 * Renders a premium, interactive product catalog item.
 * Features hover transformations, dynamic rating stars, category labels, stock validation, and cart add triggers.
 * Enforces uniform height and alignment across grid layouts.
 */
function ProductCard({ item = {}, index, addCart }) {
    const navigate = useNavigate();
    const { 
        title = '', 
        price = 0, 
        originalPrice, 
        mrp, 
        variants = [], 
        variantTypes = [],
        description = '', 
        imageUrl = '', 
        images = [], 
        category = '', 
        averageRating, 
        rating 
    } = item;
    
    const displayImage = imageUrl || (Array.isArray(images) && images.length > 0 ? images[0] : '');

    const ratingValue = Number(averageRating || rating || 0);
    const hasRating = !isNaN(ratingValue) && ratingValue > 0;

    const totalStock = computeTotalStock(item);
    const isOutOfStock = totalStock <= 0 || item.isActive === false;

    const sellingPrice = Number(
        price || item.minPrice || (Array.isArray(variants) && variants.length > 0 ? variants[0].price : 0) || 0
    );
    const rawOriginalPrice = Number(
        originalPrice || mrp || (Array.isArray(variants) && variants.length > 0 ? variants[0].originalPrice : 0) || 0
    );
    const hasDiscount = rawOriginalPrice > sellingPrice && sellingPrice > 0;
    const discountPercent = hasDiscount ? Math.round(((rawOriginalPrice - sellingPrice) / rawOriginalPrice) * 100) : 0;

    const descText = typeof description === "object"
        ? (description?.short || "")
        : (typeof description === "string" ? description : "");

    const handleAddToCartClick = (e) => {
        e.stopPropagation();
        if (isOutOfStock) return;

        // If item requires selecting variants (size, color, etc.), open detail page
        const hasVariantOptions = (Array.isArray(variantTypes) && variantTypes.length > 0) || 
                                  (Array.isArray(variants) && variants.length > 1);
        if (hasVariantOptions) {
            navigate(`/productdetails/${item.id}`);
            return;
        }

        if (addCart) {
            addCart(item);
        }
    };

    return (
        <div
            onClick={() => navigate(`/productdetails/${item.id}`)}
            key={index}
            className="group flex flex-col h-full cursor-pointer overflow-hidden rounded-2xl bg-card hover:bg-card-hover border border-border-subtle hover:border-primary/40 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-2.5"
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-bg-base rounded-xl  flex items-center justify-center p-2">
                <img
                    src={displayImage}
                    alt={title}
                    className={`max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-105 ${
                        isOutOfStock ? "grayscale-50 opacity-80" : ""
                    }`}
                />

                {/* Floating Category Tag */}
                {category && (
                    <span className="absolute top-2 left-2 bg-bg-surface/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-bold uppercase tracking-wide text-primary shadow-xs border border-border-subtle whitespace-nowrap max-w-[65%] truncate">
                        {category}
                    </span>
                )}

                {/* Floating Rating Badge */}
                {hasRating && (
                    <div className="absolute top-2 right-2 bg-bg-surface/90 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[9px] font-bold text-amber-400 flex items-center gap-0.5 shadow-xs border border-border-subtle shrink-0">
                        <span
                            className="material-symbols-outlined text-[11px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            star
                        </span>
                        <span>{ratingValue.toFixed(1)}</span>
                    </div>
                )}

                {/* Out of Stock Overlay Badge */}
                {isOutOfStock && (
                    <span className="absolute bottom-2 left-2 bg-rose-600/95 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-xs">
                        Out of Stock
                    </span>
                )}
            </div>

            {/* Content Container */}
            <div className="flex flex-col flex-1 justify-between pt-2.5 space-y-1.5">
                <div className="space-y-1.5">
                    {/* Title (fixed uniform 2-line height for perfect horizontal alignment) */}
                    <h2 className="text-xs sm:text-sm font-bold text-text-base line-clamp-2 group-hover:text-primary transition-colors duration-200 h-9 sm:h-10 leading-snug flex items-start overflow-hidden">
                        {title}
                    </h2>

                    {/* Description (fixed uniform 2-line height for perfect horizontal alignment) */}
                    <p className="text-[10px] sm:text-[11px] text-text-muted line-clamp-2 leading-relaxed h-8 sm:h-9 overflow-hidden">
                        {descText || "Experience premium build quality and exceptional performance."}
                    </p>
                </div>

                {/* Price and Cart Action (pinned to bottom) */}
                <div className="flex items-center justify-between pt-2.5 mt-auto border-t border-border-subtle shrink-0 gap-2">
                    <div className="min-w-0 flex-1">
                        <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-text-subtle font-bold">
                            Price
                        </span>
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm lg:text-base font-extrabold text-text-base leading-tight">
                                ₹{sellingPrice.toLocaleString("en-IN")}
                            </span>
                            {hasDiscount && (
                                <span className="text-[10px] sm:text-xs text-text-subtle line-through font-medium opacity-65 leading-tight">
                                    ₹{rawOriginalPrice.toLocaleString("en-IN")}
                                </span>
                            )}
                            {hasDiscount && (
                                <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-400 leading-tight">
                                    {discountPercent}% off
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={handleAddToCartClick}
                        className={`w-8 h-8 sm:w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-xs shrink-0 ${
                            isOutOfStock
                                ? "bg-bg-base text-text-subtle border border-border-subtle cursor-not-allowed opacity-60"
                                : "bg-primary text-compli font-bold hover:bg-primary-hover active:scale-95 cursor-pointer"
                        }`}
                        title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    >
                        <span className="material-symbols-outlined text-[18px] sm:text-[20px] text-inherit">
                            {isOutOfStock ? "remove_shopping_cart" : "add_shopping_cart"}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;