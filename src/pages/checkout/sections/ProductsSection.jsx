import React from "react";
import { useNavigate } from "react-router-dom";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ProductsSection({ cart }) {
  const navigate = useNavigate();

  return (
    <section className="bg-card rounded-xl shadow-sm border border-border-subtle overflow-hidden">
      {/* Section Header */}
      <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between bg-bg-surface">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="font-bold text-sm text-text-base">Order Items ({cart.length})</h2>
          </div>
        </div>
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-primary font-bold text-xs hover:text-primary-hover cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
          Edit Cart
        </button>
      </div>

      {/* Items List */}
      <div className="p-4 sm:p-6 divide-y divide-border-subtle space-y-6">
        {cart.map((item, idx) => {
          const originalPrice = Number(item.originalPrice || item.price || 0);
          const sellingPrice = Number(item.price || 0);
          const discount = originalPrice - sellingPrice;
          const hasDiscount = discount > 0;
          const discountPercent = hasDiscount && originalPrice > 0 ? Math.round((discount / originalPrice) * 100) : 0;

          const variantEntries = item.selectedVariant
            ? Object.entries(item.selectedVariant).filter(
                ([k]) => !["variantId", "sku", "id", "price", "stock", "images", "isActive", "originalPrice"].includes(k)
              )
            : [];

          return (
            <div key={`${item.id}-${idx}`} className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {/* Product Thumbnail */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-bg-base shrink-0 border border-border-subtle p-1 flex items-center justify-center">
                {(item.imageUrl || item.images?.[0]) ? (
                  <img
                    src={item.imageUrl || item.images?.[0]}
                    alt={item.title}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted">
                    <span className="material-symbols-outlined text-[32px]">image</span>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex flex-col md:flex-row justify-between w-full">
                <div className="flex flex-col gap-1">
                 <div>
                   <h3 className="font-bold text-xs text-text-muted">{item.brand}</h3>
                  <h3 className="font-bold text-base text-text-base">{item.title}</h3>
                 </div>
                  
                  {/* Variant & Qty Pills */}
                  <div className="flex flex-wrap gap-2.5">
                    {variantEntries.map(([k, v]) => (
                      <span key={k} className="flex items-center gap-1 text-xs text-text-muted bg-bg-base border border-border-subtle px-3 py-1 rounded-lg">
                        {k}: <span className="text-text-base font-bold">{v}</span>
                      </span>
                    ))}
                    <span className="flex items-center gap-1 text-xs text-text-muted bg-bg-base border border-border-subtle px-3 py-1 rounded-lg">
                      Qty: <span className="text-text-base font-bold">{item.quantity}</span>
                    </span>
                  </div>

                  {/* Price Row */}
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-extrabold text-2xl text-text-base">₹{fmt(sellingPrice * item.quantity)}</span>
                    {hasDiscount && (
                      <>
                        <span className="text-xs text-text-subtle line-through opacity-60">₹{fmt(originalPrice * item.quantity)}</span>
                        <span className="text-emerald-400 font-bold text-xs bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                          Save ₹{fmt(discount * item.quantity)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Unit Price (Desktop)
                <div className="mt-4 md:mt-0 md:text-right flex flex-col justify-center shrink-0">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Unit Price</span>
                  <span className="font-bold text-base text-text-base">₹{fmt(sellingPrice)}</span>
                  <span className="text-[10px] text-text-muted opacity-60">incl. of all taxes</span>
                </div> */}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

