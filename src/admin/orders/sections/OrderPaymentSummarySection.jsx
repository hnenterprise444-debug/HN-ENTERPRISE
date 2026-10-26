import React, { useState } from "react";
import { FaReceipt, FaCopy, FaCheck, FaMoneyBillWave } from "react-icons/fa";

const fmt = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

export default function OrderPaymentSummarySection({
  subtotal,
  couponDiscount,
  couponCode = "",
  shippingCharge,
  grandTotal,
  paymentGateway,
  paymentMethod,
  paymentStatus = "",
  paymentId,
  isCod = false,
  onRecordCashPayment,
  recordingPayment = false,
  copyToClipboard
}) {
  const [copied, setCopied] = useState(false);
  const isPaid = String(paymentStatus).toUpperCase().includes("PAID") || String(paymentStatus).toUpperCase().includes("SUCCESS");

  const handleCopyPaymentId = () => {
    copyToClipboard(paymentId, "Payment ID copied!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card p-5 rounded-2xl border border-border-subtle shadow-xs space-y-4 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle/70">
        <h2 className="text-sm font-black text-text-base flex items-center gap-2">
          <FaReceipt className="text-primary" /> Payment & Pricing
        </h2>
        <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
          {paymentGateway}
        </span>
      </div>

      {/* Financial Breakdown */}
      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between text-text-muted">
          <span>Items Subtotal</span>
          <span className="font-extrabold text-text-base">₹{fmt(subtotal)}</span>
        </div>

        {couponDiscount > 0 && (
          <div className="flex justify-between text-emerald-400 font-extrabold">
            <span>Coupon Discount {couponCode && <strong className="font-mono text-[11px] font-bold">({couponCode})</strong>}</span>
            <span>- ₹{fmt(couponDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between text-text-muted">
          <span>Shipping Fee</span>
          <span className="font-extrabold text-text-base">
            {Number(shippingCharge) === 0 ? "FREE" : `₹${fmt(shippingCharge)}`}
          </span>
        </div>

        <div className="border-t border-border-subtle/70 pt-3 flex justify-between items-center">
          <span className="text-xs font-black text-text-base">Grand Total</span>
          <span className="text-lg font-black text-primary">₹{fmt(grandTotal)}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-border-subtle/70 space-y-2 text-xs">
        <div className="flex justify-between items-center text-text-muted">
          <span>Payment Method</span>
          <span className="font-black text-text-base">{paymentMethod}</span>
        </div>

        <div className="flex justify-between items-center text-text-muted">
          <span>Payment Status</span>
          <span className={`font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
            isPaid
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : isCod
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
          }`}>
            {isPaid ? "Paid" : isCod ? "Pending on Delivery" : (paymentStatus || "Pending")}
          </span>
        </div>

        {paymentId && paymentId !== "N/A" && (
          <div className="space-y-1 pt-1">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
              Payment Transaction ID
            </label>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-bg-base border border-border-subtle/70 font-mono text-[11px]">
              <span className="truncate font-extrabold text-text-base">{paymentId}</span>
              <button
                type="button"
                onClick={handleCopyPaymentId}
                className="text-text-muted hover:text-primary transition p-1 cursor-pointer shrink-0 ml-2"
                title="Copy Payment ID"
              >
                {copied ? <FaCheck className="text-emerald-500" size={11} /> : <FaCopy size={11} />}
              </button>
            </div>
          </div>
        )}

        {/* Action for admin to record COD payment collection */}
        {isCod && !isPaid && onRecordCashPayment && (
          <div className="pt-2">
            <button
              type="button"
              disabled={recordingPayment}
              onClick={onRecordCashPayment}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <FaMoneyBillWave size={12} />
              <span>{recordingPayment ? "Recording..." : "Record Cash Payment Collected"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
