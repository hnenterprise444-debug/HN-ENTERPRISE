import React from "react";
import { FaTag } from "react-icons/fa";
import { InvoiceDownloadButton } from "../../../../invoice/index";

/**
 * OrderPriceDetailsCard Component
 * Displays authentic order price breakdown, delivery charges, discounts, payment method, and invoice download.
 */
const fmt = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

export default function OrderPriceDetailsCard({ order }) {
  const pricing = order?.pricing || {};
  const items = Array.isArray(order?.products) && order.products.length > 0
    ? order.products
    : (Array.isArray(order?.items) && order.items.length > 0 ? order.items : []);

  // Compute items subtotal from items or pricing
  let itemsSubtotal = Number(pricing.subtotal || 0);
  if (!itemsSubtotal) {
    itemsSubtotal = items.reduce((acc, it) => {
      let p = Number(
        it.price ??
        it.sellingPrice ??
        it.unitPrice ??
        it.offerPrice ??
        it.discountPrice ??
        it.salePrice ??
        it.finalPrice ??
        it.productPrice ??
        it.priceAtPurchase ??
        it.selectedVariant?.price ??
        0
      );
      const q = Number(it.quantity || it.qty || 1) || 1;
      let tot = Number(it.totalPrice ?? it.total ?? it.amount ?? (p * q));
      if (!p && tot > 0) p = tot / q;
      return acc + (tot || p * q);
    }, 0);
  }

  const rawGrandTotal = order?.totalAmount ?? pricing.grandTotal ?? order?.amount ?? itemsSubtotal;
  const grandTotal = typeof rawGrandTotal === "number"
    ? rawGrandTotal
    : (parseFloat(String(rawGrandTotal).replace(/[^0-9.]/g, "")) || itemsSubtotal);

  if (!itemsSubtotal && grandTotal > 0) {
    itemsSubtotal = grandTotal;
  }

  const deliveryFee = Number(pricing.deliveryCharges || pricing.shippingCharges || order?.deliveryCharges || 0);
  const couponDiscount = Number(pricing.couponDiscount || order?.couponDiscount || order?.discount || 0);
  const couponCode = order?.couponCode || pricing.appliedCoupon || "";

  const paymentInfo = order?.paymentInfo || order?.payment || {};
  const paymentMode = (
    order?.paymentMode ||
    order?.paymentMethod ||
    paymentInfo.method ||
    paymentInfo.gateway ||
    "ONLINE"
  ).toUpperCase();

  const isCod = paymentMode.includes("COD") ||
                paymentMode.includes("CASH") ||
                String(order?.paymentMethod || "").toUpperCase().includes("COD") ||
                String(order?.payment?.method || "").toUpperCase().includes("COD") ||
                String(order?.payment?.gateway || "").toUpperCase().includes("COD") ||
                String(paymentInfo.method || "").toUpperCase().includes("COD");
  const isUpi = paymentMode.includes("UPI");

  return (
    <div className="bg-card border border-border-subtle rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3.5 border-b border-border-subtle">
        <h3 className="text-sm sm:text-base font-bold text-text-base">
          Price details
        </h3>
        <span className="text-xs text-text-muted font-semibold">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="space-y-3 text-xs">
        {/* Items Subtotal */}
        <div className="flex justify-between items-center text-text-muted">
          <span>Items Subtotal</span>
          <span className="font-bold text-text-base">
            ₹{fmt(itemsSubtotal)}
          </span>
        </div>

        {/* Coupon Discount (only if actually applied) */}
        {couponDiscount > 0 && (
          <div className="flex justify-between items-center text-emerald-400 font-medium">
            <span className="flex items-center gap-1.5">
              <FaTag size={10} />
              <span>Coupon Savings {couponCode && <strong className="font-mono">({couponCode})</strong>}</span>
            </span>
            <span className="font-bold">-₹{fmt(couponDiscount)}</span>
          </div>
        )}

        {/* Delivery Fee */}
        <div className="flex justify-between items-center text-text-muted">
          <span>Delivery Charges</span>
          <span className="font-bold text-text-base">
            {deliveryFee > 0 ? `₹${fmt(deliveryFee)}` : (
              <span className="text-emerald-400 uppercase text-[10px] tracking-wider font-bold">
                FREE
              </span>
            )}
          </span>
        </div>

        {/* COD Handling Fee */}
        {Number(pricing.codHandlingFee || 0) > 0 && (
          <div className="flex justify-between items-center text-text-muted">
            <span>COD Handling Fee</span>
            <span className="font-bold text-text-base">
              ₹{fmt(Number(pricing.codHandlingFee))}
            </span>
          </div>
        )}

        {/* Payment Method Badge */}
        <div className="flex justify-between items-center pt-0.5 text-text-muted">
          <span>Payment Method</span>
          <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider ${
            isCod ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
          }`}>
            {isCod ? "Cash on Delivery" : (isUpi ? "UPI Payment" : "Online Payment")}
          </span>
        </div>

        {/* Dashed Separator Line */}
        <div className="border-t border-dashed border-border-subtle my-2" />

        {/* Total Amount */}
        <div className="flex justify-between items-center text-sm font-bold text-text-base">
          <span>Total Amount</span>
          <span className="text-base font-black text-primary">
            ₹{fmt(grandTotal)}
          </span>
        </div>
        {/* Download Invoice Button */}
        <div className="pt-3">
          <InvoiceDownloadButton
            order={order}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border-subtle bg-bg-base hover:bg-card-hover text-text-base font-bold text-xs transition-colors shadow-2xs cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
