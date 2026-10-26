import React from "react";
import { FaTimes, FaMapMarkerAlt, FaCreditCard, FaTruck, FaReceipt, FaCheckCircle, FaClock, FaBoxOpen } from "react-icons/fa";
import { InvoiceDownloadButton } from "../../../invoice/index";

const fmt = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

function OrderDetailsModal({ open, onClose, order }) {
  if (!open || !order) return null;

  const orderId = order.orderId || order.docId || order.id || "N/A";
  const dateStr = order.date || order.createdAt
    ? (order.createdAt?.seconds 
        ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : (typeof order.date === "string" ? order.date : new Date().toLocaleDateString("en-IN")))
    : "--";

  const status = (order.orderStatus || order.status || "PLACED").toUpperCase();
  const isCancelled = status === "CANCELLED";

  const address = order.addressInfo || order.address || order.shippingAddress || {};
  const pricing = order.pricing || {};
  const grandTotal = pricing.grandTotal || order.totalAmount || 0;
  const items = Array.isArray(order.products) ? order.products : (Array.isArray(order.items) ? order.items : []);

  const steps = [
    { title: "Order Placed", active: true },
    { title: "Processing", active: ["PROCESSING", "SHIPPED", "DELIVERED"].includes(status) },
    { title: "Shipped", active: ["SHIPPED", "DELIVERED"].includes(status) },
    { title: "Delivered", active: status === "DELIVERED" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-card border border-border-subtle rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col text-xs text-text-base">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-bg-surface/50">
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Order Summary</span>
            <h3 className="text-base font-black text-text-base flex items-center gap-2 mt-0.5">
              <span>#{orderId}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                isCancelled
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : status === "DELIVERED"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
              }`}>
                {status}
              </span>
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg-base border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-base hover:bg-card-hover transition cursor-pointer"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Timeline Tracking Header (If not cancelled) */}
          {!isCancelled && (
            <div className="bg-bg-base/40 p-4 rounded-xl border border-border-subtle">
              <h4 className="font-extrabold text-xs text-text-base mb-3 flex items-center gap-2">
                <FaTruck className="text-primary" /> Delivery Progress
              </h4>

              <div className="grid grid-cols-4 gap-2 text-center relative">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-colors ${
                      step.active
                        ? "bg-emerald-500 text-white shadow-xs"
                        : "bg-card border border-border-subtle text-text-muted"
                    }`}>
                      {step.active ? <FaCheckCircle size={12} /> : idx + 1}
                    </div>
                    <span className={`text-[10px] font-bold ${step.active ? "text-text-base" : "text-text-muted"}`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items Summary List */}
          <div>
            <h4 className="font-extrabold text-xs text-text-base mb-2.5 flex items-center gap-2">
              <FaBoxOpen className="text-primary" /> Purchased Items ({items.length})
            </h4>

            <div className="space-y-2.5">
              {items.map((item, idx) => {
                const img = item.productImage || item.imageUrl || item.images?.[0] || "https://via.placeholder.com/100";
                const title = item.productName || item.title || item.name || "Item";
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
                  <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-bg-surface border border-border-subtle">
                    <div className="flex items-center gap-3">
                      <img src={img} alt={title} className="w-12 h-12 rounded-lg object-cover bg-bg-base border border-border-subtle p-0.5" />
                      <div>
                        <p className="font-bold text-text-base">{title}</p>
                        <p className="text-[10px] text-text-muted font-medium mt-0.5">Qty: {qty} × ₹{fmt(price)}</p>
                      </div>
                    </div>
                    <span className="font-black text-xs text-text-base">₹{fmt(price * qty)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping Address & Payment Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Address */}
            <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle space-y-1.5">
              <h4 className="font-extrabold text-xs text-text-base flex items-center gap-1.5 mb-2">
                <FaMapMarkerAlt className="text-primary" /> Shipping Address
              </h4>
              <p className="font-bold text-text-base">{address.name || address.fullName || "Customer"}</p>
              <p className="text-text-muted leading-relaxed">{address.address || address.street || "Address Details"}</p>
              <p className="text-text-muted">{address.city}, {address.state} - {address.pincode}</p>
              <p className="text-text-muted font-semibold mt-1">Phone: {address.mobileNumber || address.phoneNumber || address.phone || "--"}</p>
            </div>

            {/* Payment Details */}
            <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle space-y-2">
              <h4 className="font-extrabold text-xs text-text-base flex items-center gap-1.5 mb-2">
                <FaReceipt className="text-primary" /> Payment Summary
              </h4>

              <div className="flex justify-between text-text-muted">
                <span>Subtotal:</span>
                <span className="font-semibold text-text-base">₹{fmt(pricing.subtotal || grandTotal)}</span>
              </div>
              {pricing.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Discount:</span>
                  <span>-₹{fmt(pricing.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-text-muted">
                <span>Shipping Fee:</span>
                <span className="font-semibold text-text-base">
                  {pricing.shippingFee ? `₹${fmt(pricing.shippingFee)}` : "FREE"}
                </span>
              </div>

              <div className="pt-2 border-t border-border-subtle flex justify-between font-black text-sm text-text-base">
                <span>Grand Total:</span>
                <span className="text-primary font-black">₹{fmt(grandTotal)}</span>
              </div>

              <div className="pt-1 text-[10px] text-text-muted font-bold flex items-center justify-between">
                <span>Payment Mode:</span>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-extrabold">
                  {order.paymentMethod || "COD"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border-subtle bg-bg-surface/50 flex items-center justify-between gap-3">
          <InvoiceDownloadButton order={order} />

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-bg-base border border-border-subtle font-bold text-xs hover:bg-card-hover text-text-base transition cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsModal;
