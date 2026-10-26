import React from "react";
import { FaCreditCard, FaCopy, FaCheckCircle, FaMoneyBillWave } from "react-icons/fa";

export default function OrderPaymentDetailsSection({
  paymentGateway,
  paymentMethod,
  paymentStatus = "",
  paymentId,
  isCod = false,
  onRecordCashPayment,
  recordingPayment = false,
  copyToClipboard
}) {
  const isPaid = String(paymentStatus).toUpperCase().includes("PAID") || String(paymentStatus).toUpperCase().includes("SUCCESS");

  return (
    <div className="bg-card p-6 rounded-2xl border border-border-subtle shadow-xs space-y-4">
      <h2 className="text-sm font-bold text-text-base flex items-center gap-2">
        <FaCreditCard className="text-primary" /> Payment Details
      </h2>
      <div className="h-px bg-border-subtle/60" />

      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-text-muted">Gateway</span>
          <span className="font-bold text-text-base uppercase">{paymentGateway}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-muted">Method</span>
          <span className="font-bold text-text-base">{paymentMethod}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-muted">Status</span>
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
            <label className="text-[9.5px] font-bold text-text-muted uppercase tracking-wider block">Payment ID</label>
            <div className="flex items-center justify-between p-2 rounded-lg bg-bg-base border border-border-subtle font-mono text-[10px]">
              <span className="truncate">{paymentId}</span>
              <button
                onClick={() => copyToClipboard(paymentId, "Payment ID copied!")}
                className="text-text-muted hover:text-primary transition p-1 cursor-pointer"
              >
                <FaCopy size={10} />
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
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
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
