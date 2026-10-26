import React from "react";
import { FaCopy, FaCheck, FaEye, FaBoxOpen, FaMapMarkerAlt } from "react-icons/fa";
import { normalizeOrder } from "./orderHelpers";
import StatusBadge from "../../Components/common/StatusBadge";

function OrderMobileCard({ allorder, index, copiedId, onCopy, onNavigate }) {
  const norm = normalizeOrder(allorder);

  return (
    <div
      onClick={() => norm.targetId && onNavigate(norm.targetId)}
      className="bg-card p-5 rounded-2xl border border-border-subtle shadow-xs space-y-4 cursor-pointer hover:border-primary/50 transition-all text-xs"
    >
      {/* Card Top Banner */}
      <div className="flex justify-between items-center text-xs pb-3 border-b border-border-subtle/60">
        <div className="flex items-center gap-1.5 font-mono font-black text-text-base">
          <span>#{norm.displayId.slice(0, 12)}</span>
          <button
            type="button"
            onClick={(e) => onCopy(e, norm.displayId, `mob-${index}`)}
            className="text-text-muted hover:text-primary transition p-1"
            title="Copy Order ID"
          >
            {copiedId === `mob-${index}` ? (
              <FaCheck className="text-emerald-500" size={12} />
            ) : (
              <FaCopy size={11} />
            )}
          </button>
        </div>

        <StatusBadge status={norm.orderStatus} size="sm" />
      </div>

      {/* Customer Info */}
      <div className="bg-bg-base p-3.5 rounded-xl border border-border-subtle/50 space-y-1.5 text-xs">
        <div className="font-extrabold text-text-base flex items-center justify-between">
          <span>{norm.name}</span>
          {norm.phone && (
            <span className="font-semibold text-primary text-[11px]">
              {norm.phone}
            </span>
          )}
        </div>
        <div className="text-[11px] text-text-muted truncate">{norm.email}</div>
      </div>

      {/* Shipping Address */}
      <div className="text-xs text-text-muted leading-relaxed space-y-1 bg-bg-base/40 p-3 rounded-xl border border-border-subtle/50">
        <div className="font-extrabold text-text-base uppercase tracking-wider text-[9.5px] flex items-center gap-1 text-primary">
          <FaMapMarkerAlt size={10} /> Shipping Address:
        </div>
        <div>{norm.streetAddress}</div>
        <div className="font-extrabold text-text-base">
          Pincode: {norm.pincode}
        </div>
      </div>

      {/* Items Preview */}
      <div className="space-y-2">
        <div className="font-extrabold text-text-base uppercase tracking-wider text-[9.5px] flex items-center gap-1">
          <FaBoxOpen size={11} className="text-primary" /> Items ({norm.items.length}):
        </div>
        {norm.isCustom ? (
          <div className="flex items-center gap-3 bg-bg-base/60 p-3 rounded-xl border border-border-subtle/50">
            <img
              className="w-12 h-12 rounded-lg object-cover border border-border-subtle bg-bg-base shrink-0"
              src={norm.image || "https://via.placeholder.com/100"}
              alt="custom"
            />
            <div>
              <div className="font-extrabold text-xs text-text-base">
                {norm.itemInfo?.selectedDrawingType}
              </div>
              <div className="text-[10px] text-primary font-bold mt-0.5">
                Custom Sheet: {norm.itemInfo?.selectedSheetType}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {norm.items.map((item, itemIdx) => {
              const itemImg =
                item.imageUrl ||
                item.image ||
                item.productImage ||
                item.images?.[0] ||
                "https://via.placeholder.com/100";
              const itemTitle =
                item.title || item.productName || item.name || "Product Item";
              const itemQty = Number(item.quantity || item.qty || 1) || 1;
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
              let itemTotal = Number(item.totalPrice ?? item.total ?? item.amount ?? (itemPrice * itemQty));

              if (!itemPrice && itemTotal) {
                itemPrice = itemTotal / itemQty;
              } else if (!itemPrice && (item.originalPrice || item.mrp)) {
                itemPrice = Number(item.originalPrice || item.mrp);
                itemTotal = itemPrice * itemQty;
              } else if (!itemTotal && itemPrice) {
                itemTotal = itemPrice * itemQty;
              }

              return (
                <div
                  key={itemIdx}
                  className="flex items-center justify-between gap-3 bg-bg-base/60 p-2.5 rounded-xl border border-border-subtle/50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      className="w-10 h-10 rounded-lg object-cover border border-border-subtle bg-bg-base shrink-0"
                      src={itemImg}
                      alt={itemTitle}
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-text-base truncate">
                        {itemTitle}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        Qty: {itemQty} × ₹{itemPrice}
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-xs text-text-base">
                    ₹{itemPrice * itemQty}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pricing & Footer */}
      <div className="pt-3 border-t border-border-subtle/60 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Grand Total
          </span>
          <span className="font-black text-base text-primary">
            ₹{norm.totalAmount.toLocaleString("en-IN")}
          </span>
        </div>

        <button
          type="button"
          onClick={() => norm.targetId && onNavigate(norm.targetId)}
          className="px-3.5 py-1.5 rounded-xl bg-primary text-compli font-bold text-xs shadow-2xs hover:bg-primary-hover transition flex items-center gap-1.5 cursor-pointer"
        >
          <FaEye size={12} />
          <span>Details</span>
        </button>
      </div>
    </div>
  );
}

export default OrderMobileCard;
