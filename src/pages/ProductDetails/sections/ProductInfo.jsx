import React from 'react';
import ProductVariants from './ProductPurchase/ProductVariants';

/**
 * ProductInfo
 * Displays product headers, ratings, dynamic variant-dependent prices/discounts,
 * price range fallbacks, and the variant select options shifted from purchase section.
 */
export default function ProductInfo({
  product,
  rating = null,
  reviewCount = 0,
  selectedVariant = null,
  priceInfo = null,
  isComplete = false,
  selectedOptions = {},
  isOptionEnabled = () => true,
  selectOption = () => {}
}) {
  if (!product) return null;

  const calculateDiscount = (originalPrice, price) => {
    const o = Number(originalPrice);
    const p = Number(price);
    if (!o || !p || o <= p) return null;
    return Math.round(((o - p) / o) * 100);
  };

  // Determine pricing display conditions
  const hasVariants = product.hasVariants ?? (product.variantTypes && product.variantTypes.length > 0);
  const showVariantPrice = hasVariants && isComplete && selectedVariant;
  const activePrice = showVariantPrice ? selectedVariant.price : product.price;
  const activeOriginalPrice = showVariantPrice 
    ? (selectedVariant.originalPrice || selectedVariant.price) 
    : (product.originalPrice || product.price);
  const discountPct = (showVariantPrice || !hasVariants) ? calculateDiscount(activeOriginalPrice, activePrice) : null;

  // Determine availability and stock states for helper message
  const isOutOfStock = hasVariants
    ? (isComplete && selectedVariant && (selectedVariant.inStock <= 0 || selectedVariant.isActive === false || selectedVariant.isAvailable === false))
    : (Number(product.inStock ?? 1) <= 0);

  let actionMessage = '';
  if (hasVariants && !isComplete) {
    actionMessage = 'Please select all options';
  } else if (isOutOfStock) {
    actionMessage = 'Currently unavailable';
  } else if (hasVariants && selectedVariant) {
    actionMessage = selectedVariant.inStock <= 5 
      ? `Only ${selectedVariant.inStock} left in stock!` 
      : 'In Stock';
  } else if (!hasVariants) {
    actionMessage = (Number(product.inStock) || 0) <= 5 && (Number(product.inStock) || 0) > 0
      ? `Only ${product.inStock} left in stock!`
      : 'In Stock';
  }

  return (
    <div className="space-y-4 ">
      <div className="space-y-2">
        {/* Brand / Category */}
        <div className="space-y-1">
          {(product.brand || product.category) && (
            <p className="text-primary text-sm font-medium tracking-wider uppercase ">
              {product.brand || product.category}
            </p>
          )}

          {/* Product Title */}
          <h1 className="md:text-2xl font-bold text-text-base">{product.title}</h1>
        </div>

        {/* Dynamic Rating Row */}
        {reviewCount > 0 && rating ? (
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 bg-emerald-700 text-white rounded-md text-xs font-bold shadow-2xs">
              <span
                className="material-symbols-outlined text-white text-[14px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="font-bold text-white text-xs">{rating}</span>
            </div>
            <p className="text-xs text-text-muted font-semibold">
              {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="material-symbols-outlined text-[16px] text-text-subtle opacity-40"
                >
                  star
                </span>
              ))}
            </div>
            <span className="text-xs text-text-muted font-semibold">No reviews yet</span>
          </div>
        )}

        {/* Price Row */}
        <div className="flex items-baseline gap-4 pt-1">
          {showVariantPrice || !hasVariants ? (
            <>
              <span className="text-3xl font-bold text-text-base">
                ₹{Number(activePrice || 0).toLocaleString('en-IN')}
              </span>
              {discountPct && (
                <>
                  <span className="text-text-subtle line-through text-sm">
                    ₹{Number(activeOriginalPrice || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold px-2.5 py-0.5 rounded-full text-xs">
                    {discountPct}% OFF
                  </span>
                </>
              )}
            </>
          ) : (
            <div>
              <span className="text-2xl font-bold text-text-base">
                {priceInfo?.isRange ? (
                  `₹${priceInfo.minPrice.toLocaleString('en-IN')} - ₹${priceInfo.maxPrice.toLocaleString('en-IN')}`
                ) : (
                  `Starting from ₹${(priceInfo?.startingPrice || product.price || 0).toLocaleString('en-IN')}`
                )}
              </span>
              <p className="text-xs text-text-muted mt-1">Select variant options to see exact pricing.</p>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Product Variant Options */}
      {hasVariants && (
        <div className="pt-2">
          <ProductVariants
            product={product}
            selectedOptions={selectedOptions}
            isOptionEnabled={isOptionEnabled}
            selectOption={selectOption}
          />
        </div>
      )}

      {/* Helper Status Message */}
      {actionMessage && (
        <p className={`text-sm font-semibold mt-2 ${isOutOfStock || (!isComplete && hasVariants) ? 'text-red-500' : 'text-emerald-600'}`}>
          {actionMessage}
        </p>
      )}
    </div>
  );
}
