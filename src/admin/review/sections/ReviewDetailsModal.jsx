import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  FaTimes,
  FaStar,
  FaRegStar,
  FaTrash,
  FaExternalLinkAlt,
  FaCopy,
  FaCheck,
  FaQuoteLeft,
  FaCalendarAlt,
  FaUser,
  FaBoxOpen,
  FaCheckCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";

function StarRating({ rating = 0 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) =>
        s <= rating ? (
          <FaStar key={s} className="text-amber-400 text-sm" />
        ) : (
          <FaRegStar key={s} className="text-border-base text-sm" />
        )
      )}
    </div>
  );
}

function formatDate(timestamp) {
  if (!timestamp) return "—";
  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return String(timestamp);
}

export default function ReviewDetailsModal({
  open,
  review,
  products = {},
  onClose,
  onDelete,
}) {
  const [copiedType, setCopiedType] = useState(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !review || !mounted || typeof document === "undefined" || !document.body) return null;

  const productName = review.productId
    ? products[review.productId] || review.productId
    : "Unspecified Product";

  const handleCopy = (text, type, successMessage) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast.success(successMessage || "Copied to clipboard!");
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  const getSentiment = (rating) => {
    if (rating >= 4) {
      return {
        label: rating === 5 ? "5.0 ★ Excellent" : "4.0 ★ Very Good",
        badgeClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      };
    }
    if (rating === 3) {
      return {
        label: "3.0 ★ Average",
        badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      };
    }
    return {
      label: `${rating}.0 ★ Critical Review`,
      badgeClass: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    };
  };

  const sentiment = getSentiment(review.rating || 0);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="min-h-full flex items-center justify-center py-4 sm:py-6">
        <div
          className="relative w-full max-w-4xl lg:max-w-5xl bg-card border border-border-subtle rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-border-subtle bg-bg-base/70">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                ★
              </span>
              <div>
                <h3 className="text-base font-bold text-text-base leading-tight">
                  Review Moderation Details
                </h3>
                <p className="text-xs text-text-muted">
                  View complete customer feedback, associated product, and take actions
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-card hover:bg-card-hover border border-border-subtle text-text-muted hover:text-text-base flex items-center justify-center transition cursor-pointer"
              aria-label="Close modal"
            >
              <FaTimes size={13} />
            </button>
          </div>

          {/* Body: Wide 2-Column Layout */}
          <div className="p-5 sm:p-7">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              
              {/* Left Column: Context & Metadata (5 of 12) */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-3.5">
                
                {/* Rating Banner & Sentiment */}
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-bg-base border border-border-subtle">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Rating Score
                    </span>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <span className="text-sm font-extrabold text-text-base">
                        {review.rating} / 5
                      </span>
                    </div>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${sentiment.badgeClass}`}
                  >
                    {sentiment.label}
                  </div>
                </div>

                {/* Product Card */}
                <div className="p-3.5 rounded-2xl bg-bg-base border border-border-subtle space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                      <FaBoxOpen className="text-primary text-xs" /> Product
                    </span>
                    {review.productId && (
                      <Link
                        to={`/productdetails/${review.productId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                      >
                        <span>Store Page</span>
                        <FaExternalLinkAlt className="text-[9px]" />
                      </Link>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-text-base leading-snug line-clamp-2">
                    {productName}
                  </h4>
                  <p className="text-[11px] text-text-muted font-mono truncate">
                    ID: {review.productId || "—"}
                  </p>
                </div>

                {/* Reviewer & Submission Info */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-bg-base border border-border-subtle space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                      <FaUser className="text-text-muted text-[10px]" /> Customer
                    </span>
                    <p className="text-xs font-bold text-text-base truncate flex items-center gap-1">
                      <span className="truncate">{review.userName || "Anonymous"}</span>
                      <FaCheckCircle className="text-emerald-500 text-[11px] shrink-0" title="Verified Customer" />
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-bg-base border border-border-subtle space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                      <FaCalendarAlt className="text-text-muted text-[10px]" /> Date
                    </span>
                    <p className="text-xs font-semibold text-text-base truncate">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Technical IDs */}
                <div className="p-2.5 rounded-xl bg-bg-base/70 border border-border-subtle flex items-center justify-between gap-2 text-[11px] text-text-muted">
                  <div className="flex items-center gap-1.5 truncate">
                    <span>User:</span>
                    <span className="font-mono text-text-base truncate max-w-[120px] sm:max-w-[150px]">
                      {review.userId || "—"}
                    </span>
                    {review.userId && (
                      <button
                        type="button"
                        onClick={() => handleCopy(review.userId, "uid", "User ID copied!")}
                        className="p-1 hover:text-text-base cursor-pointer shrink-0"
                        title="Copy User ID"
                      >
                        {copiedType === "uid" ? (
                          <FaCheck className="text-emerald-500 text-[10px]" />
                        ) : (
                          <FaCopy className="text-[10px]" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span>Review ID:</span>
                    <span className="font-mono text-text-base text-[10px]">
                      {review.id ? review.id.slice(0, 8) + "…" : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Full Customer Feedback Text (7 of 12) */}
              <div className="lg:col-span-7 flex flex-col h-full">
                <div className="flex items-center justify-between pb-2">
                  <label className="text-xs font-bold text-text-base flex items-center gap-1.5">
                    <FaQuoteLeft className="text-primary text-xs" /> Full Customer Review
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(review.review, "text", "Review text copied!")}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-muted hover:text-text-base cursor-pointer transition"
                  >
                    {copiedType === "text" ? (
                      <>
                        <FaCheck className="text-emerald-500 text-[10px]" />
                        <span className="text-emerald-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <FaCopy className="text-[10px]" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex-1 p-5 rounded-2xl bg-bg-base border border-border-subtle flex flex-col justify-between min-h-[190px]">
                  <p className="text-sm md:text-[15px] text-text-base leading-relaxed whitespace-pre-wrap select-text italic">
                    {review.review ? (
                      `"${review.review}"`
                    ) : (
                      <span className="text-text-muted not-italic">No written comment provided with this rating.</span>
                    )}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 sm:px-7 py-3.5 border-t border-border-subtle bg-bg-base/70 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onDelete(review)}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <FaTrash size={12} />
              <span>Delete Review</span>
            </button>

            <div className="flex items-center gap-2.5">
              {review.productId && (
                <Link
                  to={`/productdetails/${review.productId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl border border-border-subtle bg-card hover:bg-card-hover text-text-base text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Store Page</span>
                  <FaExternalLinkAlt className="text-[10px]" />
                </Link>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-compli text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
