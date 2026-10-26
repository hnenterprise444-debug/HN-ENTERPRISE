import React from "react";
import { FaReceipt } from "react-icons/fa";

const fmt = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

export default function OrderPricingSummarySection({
  subtotal,
  couponDiscount,
  shippingCharge,
  grandTotal
}) {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border-subtle shadow-xs space-y-4">
      <h2 className="text-sm font-bold text-text-base flex items-center gap-2">
        <FaReceipt className="text-primary" /> Pricing Summary
      </h2>
      <div className="h-px bg-border-subtle/60" />

      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-text-muted">
          <span>Subtotal</span>
          <span className="font-semibold text-text-base">₹{fmt(subtotal)}</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-emerald-400 font-semibold">
            <span>Coupon Savings</span>
            <span>- ₹{fmt(couponDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between text-text-muted">
          <span>Shipping Charge</span>
          <span className="font-semibold text-text-base">₹{fmt(shippingCharge)}</span>
        </div>

        <div className="border-t border-border-subtle pt-2.5 flex justify-between items-center">
          <span className="text-sm font-extrabold text-text-base">Grand Total</span>
          <span className="text-lg font-extrabold text-primary">₹{fmt(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
