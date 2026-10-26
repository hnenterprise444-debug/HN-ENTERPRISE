import React from "react";
import { FaArrowLeft, FaSyncAlt, FaPrint, FaCopy, FaCheck } from "react-icons/fa";
import StatusBadge from "../../Components/common/StatusBadge.jsx";

export default function OrderDetailHeaderSection({
  orderId,
  createdAt,
  updatedAt,
  currentStatus,
  paymentStatus,
  isCod,
  statusBadgeStyles,
  paymentBadgeStyles,
  formatDate,
  copyToClipboard,
  onBack,
  onRefresh,
  onPrint,
  loading
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    copyToClipboard(orderId, "Order ID copied!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 ">
      {/* Top Nav Action Row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border-subtle bg-card text-xs font-bold text-text-muted hover:text-text-base hover:bg-card-hover hover:border-primary/40 transition active:scale-95 cursor-pointer shadow-2xs"
        >
          <FaArrowLeft size={11} /> Back to Orders
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-2 py-2 rounded-full border border-border-subtle bg-card text-xs font-bold text-text-muted hover:text-primary hover:bg-card-hover hover:border-primary/40 transition active:scale-95 cursor-pointer shadow-2xs"
          >
            <FaSyncAlt size={11} className={loading ? "animate-spin" : ""} />

          </button>

          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-compli text-xs font-bold shadow-sm hover:bg-primary-hover transition active:scale-95 cursor-pointer"
          >
            <FaPrint size={11} />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Main Order Info Banner */}
      <div className="px-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-mono font-black text-text-base tracking-tight">
                #{orderId}
              </h1>
              <button
                type="button"
                onClick={handleCopy}
                className="text-text-muted hover:text-primary transition p-1 cursor-pointer"
                title="Copy Order ID"
              >
                {copied ? <FaCheck className="text-emerald-500" size={13} /> : <FaCopy size={13} />}
              </button>
            </div>

            <p className="text-xs text-text-muted">
              Placed On: <span className="font-bold text-text-base">{formatDate(createdAt)}</span>
              {updatedAt && (
                <span className="ml-3">Updated: <span className="font-bold text-text-base">{formatDate(updatedAt)}</span></span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <StatusBadge status={currentStatus} size="lg" />

            <StatusBadge
              status={
                isCod
                  ? (String(paymentStatus).toUpperCase().includes("PAID") ? "DELIVERED" : "COD")
                  : String(paymentStatus).toUpperCase().includes("SUCCESS") || String(paymentStatus).toUpperCase().includes("PAID")
                  ? "DELIVERED"
                  : String(paymentStatus).toUpperCase().includes("FAIL")
                  ? "CANCELLED"
                  : "PAYMENT_PENDING"
              }
              label={`Payment: ${paymentStatus}`}
              size="lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
