import React from "react";
import { Link } from "react-router-dom";
import { FaChevronRight, FaBox } from "react-icons/fa";

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

const fmt = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

function OrderProductItem({ item, orderStatus }) {
  const img = item.productImage || item.imageUrl || item.images?.[0] || "https://via.placeholder.com/150";
  const title = item.productName || item.title || item.name || "Product Item";
  const productId = item.productId || item.id;
  const rawVariant = item.variantName || item.selectedVariant || item.variant || item.options;
  const variantName = formatVariantName(rawVariant);
  const qty = Number(item.qty || item.quantity || 1) || 1;

  let price = Number(
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

  let itemTotal = Number(item.totalPrice ?? item.total ?? item.amount ?? (price * qty));

  if (!price && itemTotal) {
    price = itemTotal / qty;
  } else if (!price && (item.originalPrice || item.mrp)) {
    price = Number(item.originalPrice || item.mrp);
    itemTotal = price * qty;
  } else if (!itemTotal && price) {
    itemTotal = price * qty;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border-subtle hover:bg-card-hover transition-colors group">
      {/* Product Image & Info */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <div className="w-16 h-16 rounded-lg bg-bg-base border border-border-subtle p-1 overflow-hidden shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-200">
          <img
            src={img}
            alt={title}
            className="w-full h-full object-cover rounded-md"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/150";
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="font-extrabold text-xs text-text-base truncate group-hover:text-primary transition-colors">
            {title}
          </h4>

          {variantName && (
            <div className="mt-1 flex flex-wrap gap-1">
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
                {variantName}
              </span>
            </div>
          )}

          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-text-muted">
            <span className="font-semibold">Qty: <strong className="text-text-base">{qty}</strong></span>
            <span>•</span>
            <span className="font-semibold">Price: <strong className="text-text-base">₹{fmt(price)}</strong></span>
          </div>
        </div>
      </div>

      {/* Item Price */}
      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle shrink-0">
        <div className="text-right">
          <span className="text-[10px] text-text-muted block font-semibold">Total Item Price</span>
          <span className="font-black text-sm text-text-base">
            ₹{fmt(itemTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default OrderProductItem;
