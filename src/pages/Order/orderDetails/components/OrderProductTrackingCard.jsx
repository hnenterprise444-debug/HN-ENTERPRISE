import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaBoxOpen,
  FaExternalLinkAlt,
  FaBan,
  FaClock,
  FaChevronDown,
} from "react-icons/fa";
import { isCodOrder } from "../../../../admin/orders/tableComponents/orderHelpers";

/**
 * Formats a timestamp or date to "D MMM YYYY" (e.g. "7 Aug 2026")
 */
function formatShortDate(val) {
  if (!val) return null;
  let dateObj = null;
  if (val?.seconds) dateObj = new Date(val.seconds * 1000);
  else if (val?.toDate && typeof val.toDate === "function") dateObj = val.toDate();
  else if (typeof val === "string" || typeof val === "number") dateObj = new Date(val);
  else if (val instanceof Date) dateObj = val;

  if (!dateObj || isNaN(dateObj.getTime())) return null;

  return dateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(val) {
  if (!val) return null;
  let dateObj = null;
  if (val?.seconds) dateObj = new Date(val.seconds * 1000);
  else if (val?.toDate && typeof val.toDate === "function") dateObj = val.toDate();
  else if (typeof val === "string" || typeof val === "number") dateObj = new Date(val);
  else if (val instanceof Date) dateObj = val;

  if (!dateObj || isNaN(dateObj.getTime())) return null;

  return dateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Resolves item price with full schema fallback support
 */
function resolveItemPrice(item, order) {
  const qty = Number(item?.quantity || item?.qty || 1) || 1;
  let unitPrice = Number(
    item?.price ??
    item?.sellingPrice ??
    item?.unitPrice ??
    item?.offerPrice ??
    item?.discountPrice ??
    item?.salePrice ??
    item?.finalPrice ??
    item?.productPrice ??
    item?.priceAtPurchase ??
    item?.selectedVariant?.price ??
    0
  );

  let itemTotal = Number(item?.totalPrice ?? item?.total ?? item?.amount ?? 0);

  if (!unitPrice && itemTotal > 0) {
    unitPrice = itemTotal / qty;
  } else if (unitPrice > 0 && !itemTotal) {
    itemTotal = unitPrice * qty;
  } else if (!unitPrice && !itemTotal) {
    const fallbackTotal = Number(
      order?.totalAmount ??
      order?.pricing?.grandTotal ??
      order?.pricing?.subtotal ??
      order?.amount ??
      0
    );
    const totalItemsCount = (Array.isArray(order?.products) ? order.products.length : (Array.isArray(order?.items) ? order.items.length : 1)) || 1;
    unitPrice = (fallbackTotal / totalItemsCount) / qty;
    itemTotal = unitPrice * qty;
  }

  return { unitPrice, itemTotal, qty };
}

const fmt = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

/**
 * OrderProductTrackingCard Component
 * Unifies all purchased order items with a single cohesive status tracking stepper.
 */
export default function OrderProductTrackingCard({
  order,
  items = [],
  onCancelClick,
  canCancel,
}) {
  const [showAllUpdates, setShowAllUpdates] = useState(false);

  const isCod = isCodOrder(order) ||
                String(order?.paymentMode || order?.paymentMethod || order?.payment?.gateway || order?.payment?.method || "").toUpperCase().includes("COD") ||
                String(order?.paymentMode || "").toUpperCase().includes("CASH");

  let rawStatus = (order?.orderStatus || order?.status || "PLACED").toUpperCase();
  if (isCod && (rawStatus === "PAYMENT_PENDING" || rawStatus === "PENDING" || !rawStatus)) {
    rawStatus = "PLACED";
  }
  const isCancelled = rawStatus === "CANCELLED";
  const isPaymentPending = !isCod && rawStatus === "PAYMENT_PENDING";

  const productList = items.length > 0
    ? items
    : (Array.isArray(order?.products) && order.products.length > 0
        ? order.products
        : (Array.isArray(order?.items) && order.items.length > 0 ? order.items : [order]));

  // Real milestone dates from order history (search latest entries first)
  const history = Array.isArray(order?.statusHistory) ? order.statusHistory : [];
  const getTimestampForStatus = (statusName) => {
    const reversed = [...history].reverse();
    const found = reversed.find(
      (h) => (h.status || "").toUpperCase() === statusName.toUpperCase()
    );
    if (found?.timestamp) return formatShortDate(found.timestamp);
    if (statusName === "PLACED" && (order?.createdAt || order?.date)) {
      return formatShortDate(order.createdAt || order.date);
    }
    if (statusName === "DELIVERED" && order?.deliveredAt) {
      return formatShortDate(order.deliveredAt);
    }
    if (statusName === "CANCELLED" && (order?.cancelledAt || order?.updatedAt)) {
      return formatShortDate(order.cancelledAt || order.updatedAt);
    }
    return null;
  };

  const placedDate = getTimestampForStatus("PLACED");
  const confirmedDate = getTimestampForStatus("CONFIRMED");
  const packedDate = getTimestampForStatus("PACKED") || getTimestampForStatus("PROCESSING");
  const shippedDate = getTimestampForStatus("SHIPPED") || getTimestampForStatus("IN_TRANSIT");
  const outForDeliveryDate = getTimestampForStatus("OUT_FOR_DELIVERY");
  const deliveredDate = getTimestampForStatus("DELIVERED");
  const cancelledDate = getTimestampForStatus("CANCELLED");

  const isOrderPlaced = !isPaymentPending && !isCancelled && ["PLACED", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(rawStatus);

  // Stepper milestones list
  const milestones = [
    { key: "PLACED", label: "Order Placed", date: placedDate, active: isOrderPlaced },
    { key: "CONFIRMED", label: "Order Confirmed", date: confirmedDate, active: ["CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(rawStatus) },
    { key: "PACKED", label: "Packed & Processed", date: packedDate, active: ["PROCESSING", "PACKED", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(rawStatus) },
    { key: "SHIPPED", label: "Shipped", date: shippedDate, active: ["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(rawStatus) },
    { key: "OUT_FOR_DELIVERY", label: "Out For Delivery", date: outForDeliveryDate, active: ["OUT_FOR_DELIVERY", "DELIVERED"].includes(rawStatus) },
    { key: "DELIVERED", label: "Delivered", date: deliveredDate, active: rawStatus === "DELIVERED" },
  ];

  // Logistics tracking
  const trackingInfo = order?.tracking || order?.courier || {};
  const courierName = trackingInfo.courierName || trackingInfo.carrier || order?.carrier || "";
  const awbNumber = trackingInfo.trackingNumber || trackingInfo.awb || order?.awbNumber || "";
  const trackingUrl = trackingInfo.trackingUrl || trackingInfo.url || "";

  return (
    <div className="bg-card border border-border-subtle rounded-2xl shadow-xs overflow-hidden divide-y divide-border-subtle">
      {/* ── 1. Purchased Items List ─────────────────────────────────────── */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="divide-y divide-border-subtle space-y-4">
          {productList.map((item, idx) => {
            const img = item?.productImage || item?.imageUrl || item?.images?.[0] || "";
            const title = item?.productName || item?.title || item?.name || "Product Item";
            const pid = item?.productId || item?.id || "";
            const { unitPrice, itemTotal, qty } = resolveItemPrice(item, order);

            const variantText = item?.selectedVariant
              ? (typeof item?.selectedVariant === "object"
                  ? Object.entries(item.selectedVariant).map(([k, v]) => `${k}: ${v}`).join(", ")
                  : String(item.selectedVariant))
              : (item?.variant || item?.size || item?.color || "");

            return (
              <div
                key={idx}
                className={`flex items-start gap-4 ${idx > 0 ? "pt-4" : ""}`}
              >
                {/* Product Thumbnail */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-bg-base border border-border-subtle p-1.5 shrink-0 overflow-hidden flex items-center justify-center shadow-2xs">
                  {img ? (
                    <img
                      src={img}
                      alt={title}
                      className="w-full h-full object-contain rounded-lg hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <FaBoxOpen size={20} className="text-primary/40" />
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-1 min-w-0 flex-1">
                  {pid ? (
                    <Link
                      to={`/productdetails/${pid}`}
                      className="text-sm sm:text-base font-bold text-text-base hover:text-primary transition-colors line-clamp-2 leading-snug block"
                    >
                      {title}
                    </Link>
                  ) : (
                    <h2 className="text-sm sm:text-base font-bold text-text-base line-clamp-2 leading-snug">
                      {title}
                    </h2>
                  )}

                  {variantText && (
                    <p className="text-xs text-text-muted font-medium">
                      Variant: <span className="text-text-base font-semibold">{variantText}</span>
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs pt-0.5 flex-wrap">
                    <span className="text-base font-black text-text-base">
                      ₹{fmt(unitPrice)}
                    </span>
                    <span className="text-text-muted font-medium">• Qty: {qty}</span>
                    {qty > 1 && (
                      <span className="text-primary font-bold">
                        (Total: ₹{fmt(itemTotal)})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. Unified Status Milestone Stepper ────────────────────────── */}
      <div className="px-5 sm:px-6 py-4 space-y-3.5 bg-bg-base/10">
        {isCancelled ? (
          <div className="flex items-start gap-3 text-xs text-rose-700 bg-rose-50/50 p-3.5 rounded-xl border border-rose-200/60">
            <FaTimesCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Order Cancelled</p>
              <p className="text-text-muted mt-0.5">
                Cancelled on {cancelledDate || placedDate || "request"}. Any refund will be credited to your original payment method.
              </p>
            </div>
          </div>
        ) : isPaymentPending ? (
          <div className="flex items-start gap-3 text-xs text-amber-700 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80">
            <FaClock size={15} className="text-amber-500 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-bold text-sm">Payment Pending</p>
              <p className="text-text-muted mt-0.5">
                Payment confirmation is pending for this order. Once payment is completed, your order will be confirmed and processed.
              </p>
            </div>
          </div>
        ) : (
          /* Vertical Step Milestone Line */
          <div className="space-y-3 pl-1">
            {milestones.filter((m) => m.active).map((step, idx, arr) => (
              <div key={step.key} className="flex items-start gap-3 relative">
                {/* Connecting Green Line */}
                {idx < arr.length - 1 && (
                  <div className="absolute top-4 left-2 w-0.5 h-6 bg-emerald-500" />
                )}

                <FaCheckCircle className="text-emerald-500 shrink-0 mt-0.5 z-10 bg-bg-surface" size={15} />
                <div className="text-xs">
                  <span className="font-bold text-text-base">{step.label}</span>
                  {step.date && <span className="text-text-muted font-medium">, {step.date}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* See All Updates Link */}
        {history.length > 0 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAllUpdates(!showAllUpdates)}
              className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>See All Updates</span>
              <FaChevronDown size={10} className={`transition-transform duration-200 ${showAllUpdates ? "rotate-180" : ""}`} />
            </button>

            {showAllUpdates && (
              <div className="mt-3 p-3.5 bg-bg-base rounded-xl border border-border-subtle text-xs space-y-2 animate-fadeIn">
                {history.map((h, i) => (
                  <div key={i} className="flex justify-between items-center text-text-muted">
                    <span className="font-bold text-text-base">{(h.status || "").replace(/_/g, " ")}</span>
                    <span className="text-[11px]">{formatDateTime(h.timestamp)}</span>
                  </div>
                ))}

                {courierName && (
                  <div className="pt-2 border-t border-border-subtle flex justify-between items-center text-[11px]">
                    <span>Courier: <strong className="text-text-base">{courierName}</strong></span>
                    {awbNumber && <span>AWB: <strong className="font-mono text-primary">{awbNumber}</strong></span>}
                  </div>
                )}

                {trackingUrl && (
                  <div className="pt-1">
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline font-bold inline-flex items-center gap-1"
                    >
                      <span>Live Courier Tracking</span>
                      <FaExternalLinkAlt size={9} />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
