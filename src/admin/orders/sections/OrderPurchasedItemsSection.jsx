import React from "react";
import { Link } from "react-router-dom";
import { FaBoxOpen, FaExternalLinkAlt } from "react-icons/fa";

function formatVariantName(variant) {
  if (!variant) return "";
  if (typeof variant === "string") return variant;
  if (typeof variant === "object") {
    return Object.entries(variant)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" • ");
  }
  return String(variant);
}

export default function OrderPurchasedItemsSection({ productsList = [] }) {
  return (
    <div className="bg-card p-5 rounded-2xl border border-border-subtle shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle/70">
        <h2 className="text-sm font-black text-text-base flex items-center gap-2">
          <FaBoxOpen className="text-primary" /> Purchased Items
        </h2>
        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black">
          {productsList.length} {productsList.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      <div className="space-y-3">
        {productsList.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-4">No items found in this order.</p>
        ) : (
          productsList.map((item, idx) => {
            const img = item.productImage || item.imageUrl || item.image || item.images?.[0] || "https://via.placeholder.com/100";
            const title = item.productName || item.title || item.name || "Product Item";
            const category = item.category || "General";
            const rawVariant = item.variantName || item.selectedVariant || item.variant || item.options;
            const variantName = formatVariantName(rawVariant);
            const sku = item.sku || item.variantId || "N/A";
            const pid = item.productId || item.id || "";

            const qty = Number(item.quantity || item.qty || item.count || 1) || 1;

            // Extract unit price with full property fallbacks
            let itemPrice = Number(
              item.price ??
              item.sellingPrice ??
              item.unitPrice ??
              item.offerPrice ??
              item.discountPrice ??
              item.salePrice ??
              item.finalPrice ??
              item.productPrice ??
              item.priceAtPurchase ??
              item.selectedVariant?.price ??
              0
            );

            let itemTotal = Number(
              item.totalPrice ??
              item.total ??
              item.amount ??
              item.itemTotal ??
              (itemPrice * qty)
            );

            // Fallback calculations if itemPrice is 0
            if (!itemPrice && itemTotal) {
              itemPrice = itemTotal / qty;
            } else if (!itemPrice && (item.originalPrice || item.mrp)) {
              itemPrice = Number(item.originalPrice || item.mrp);
              itemTotal = itemPrice * qty;
            } else if (!itemTotal && itemPrice) {
              itemTotal = itemPrice * qty;
            }

            const origPrice = Number(item.originalPrice || item.mrp || itemPrice);


            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border-subtle bg-bg-base hover:bg-card-hover transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-16 h-16 rounded-xl object-cover border border-border-subtle bg-bg-base overflow-hidden shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <img
                      src={img}
                      alt={title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/100";
                      }}
                    />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <h3 className="text-xs font-black text-text-base truncate group-hover:text-primary transition-colors">
                      {title}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap text-[10px] text-text-muted">
                      <span className="bg-card px-2 py-0.5 rounded border border-border-subtle font-bold">
                        {category}
                      </span>
                      {variantName && (
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-extrabold">
                          {variantName}
                        </span>
                      )}
                      <span>SKU: <strong className="font-mono text-text-base">{sku}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-border-subtle/40 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-bold text-text-base">
                      ₹{itemPrice.toLocaleString("en-IN")} × {qty}
                    </p>
                    {origPrice > itemPrice && (
                      <p className="text-[10px] text-text-muted line-through">₹{origPrice.toLocaleString("en-IN")}</p>
                    )}
                    <p className="text-sm font-black text-primary mt-0.5">₹{itemTotal.toLocaleString("en-IN")}</p>
                  </div>

                  {pid && (
                    <Link
                      to={`/productdetails/${pid}`}
                      target="_blank"
                      className="p-2 rounded-lg border border-border-subtle bg-card text-text-muted hover:text-primary hover:border-primary transition shadow-2xs"
                      title="View Product Details"
                    >
                      <FaExternalLinkAlt size={11} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
