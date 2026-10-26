import React from "react";
import { useSiteConfig } from "../../context/SiteConfigContext";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * OrderSummaryCard
 * Unified, premium Order Summary Component used across Cart and Checkout pages.
 * Adapts features (payment options, CTA text, trust badges) dynamically based on page context.
 */
export default function OrderSummaryCard({
  // Pricing
  subtotal = 0,
  productDiscount = 0,
  couponDiscount = 0,
  shippingCharge = 0,
  codHandlingFee = 0,
  estimatedTotal,
  finalTotal: propFinalTotal,

  // Coupon
  appliedCoupon = null,
  couponCode = "",
  couponLoading = false,
  couponError = "",
  onChangeCoupon,
  onApplyCoupon,
  onRemoveCoupon,

  // Mode & Flags
  pageType = "checkout", // "cart" | "checkout"
  showPaymentOptions = false,
  paymentMethod = "ONLINE",
  onSelectPaymentMethod,

  // Actions & CTA
  onProceed,
  stage,
  isBusy: propIsBusy,
  ctaText,
  cartCount,

  // Styling / Customization
  showTrustBadges = true,
  className = ""
}) {
  const { config } = useSiteConfig();
  
  // Admin-controlled payment method flags (default both enabled when not configured)
  const enableOnline = config?.paymentMethods?.enableOnline !== false;
  const enableCod    = config?.paymentMethods?.enableCod    !== false;

  const isBusy = propIsBusy || stage === "submitting" || stage === "payment_modal" || stage === "processing";

  const isShippingFree = shippingCharge === 0 || 
                         shippingCharge === "0" || 
                         shippingCharge === "Free" || 
                         shippingCharge === "FREE" || 
                         shippingCharge === "free";

  const numShipping = isShippingFree ? 0 : (Number(shippingCharge) || 0);

  const finalTotal = propFinalTotal !== undefined 
    ? propFinalTotal 
    : (estimatedTotal !== undefined 
        ? (paymentMethod === "COD" ? estimatedTotal + codHandlingFee : estimatedTotal) 
        : Math.max(0, subtotal - (couponDiscount || 0) + numShipping + (paymentMethod === "COD" ? codHandlingFee : 0)));

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-card rounded-2xl shadow-sm border border-border-subtle overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <h2 className="font-bold text-xl text-text-base">Order Summary</h2>
          {cartCount !== undefined && (
            <span className="text-xs font-bold text-text-muted">
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Price Breakdown */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-sm text-text-muted">
              <span>{productDiscount > 0 ? "Subtotal (MRP)" : "Subtotal"}</span>
              <span className="text-text-base font-bold">
                ₹{fmt(subtotal + (productDiscount || 0))}
              </span>
            </div>

            {productDiscount > 0 && (
              <div className="flex justify-between items-center text-sm text-text-muted">
                <span>Product Discount</span>
                <span className="text-emerald-400 font-bold">- ₹{fmt(productDiscount)}</span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div className="flex justify-between items-center text-sm text-text-muted">
                <span>Coupon Discount ({appliedCoupon?.code})</span>
                <span className="text-emerald-400 font-bold">- ₹{fmt(couponDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm text-text-muted">
              <span>Shipping Charge</span>
              {isShippingFree ? (
                <span className="text-emerald-400 font-bold tracking-widest text-xs uppercase">
                  FREE
                </span>
              ) : (
                <span className="text-text-base font-bold">
                  ₹{fmt(numShipping)}
                </span>
              )}
            </div>

            {showPaymentOptions && paymentMethod === "COD" && codHandlingFee > 0 && (
              <div className="flex justify-between items-center text-sm text-text-muted">
                <span>COD Handling Fee</span>
                <span className="text-amber-400 font-bold">₹{fmt(codHandlingFee)}</span>
              </div>
            )}

            {/* Coupon Code Box */}
            {onChangeCoupon && (
              <div className="flex flex-col gap-3">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs shadow-2xs">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-emerald-400 text-sm tracking-wider uppercase">
                          {appliedCoupon.code}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md text-[9px] font-black uppercase tracking-wider shadow-2xs">
                          Active
                        </span>
                      </div>
                      {couponDiscount > 0 && (
                        <p className="text-xs font-bold text-emerald-400">
                          Coupon Applied: <strong className="font-black text-emerald-300">-₹{fmt(couponDiscount)}</strong>
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={onRemoveCoupon}
                      className="px-3 py-1.5 rounded-lg bg-card border border-rose-500/30 text-rose-400 hover:text-rose-300 font-extrabold text-xs transition-all cursor-pointer shadow-2xs shrink-0 hover:bg-rose-500/10"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <div className="flex-1 relative group">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => onChangeCoupon(e.target.value.toUpperCase())}
                          placeholder="Enter Promo Code"
                          onKeyDown={(e) => e.key === "Enter" && onApplyCoupon && onApplyCoupon()}
                          className="w-full h-10 px-3 rounded-lg border border-border-subtle bg-bg-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold uppercase tracking-widest text-text-base placeholder:text-text-subtle placeholder:normal-case placeholder:tracking-normal placeholder:font-normal"
                        />
                        <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-text-subtle opacity-40 text-[18px]">
                          sell
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={onApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-4 h-10 bg-primary hover:bg-primary-hover text-compli rounded-lg font-bold text-xs active:scale-95 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        {couponLoading ? "..." : "APPLY"}
                      </button>
                    </div>

                    {couponError && <p className="text-xs text-red-400 font-semibold">{couponError}</p>}
                  </>
                )}
              </div>
            )}

            {/* Grand Total */}
            <div className="flex flex-col gap-1 pt-2 border-t border-border-subtle">
              <div className="flex justify-between items-end">
                <span className="font-bold text-xl text-text-base">Grand Total</span>
                <span className="text-2xl font-black text-primary">
                  ₹{fmt(finalTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector (Checkout Page Only) */}
          {showPaymentOptions && (enableOnline || enableCod) && (
            <div className="flex flex-col gap-2.5 pt-2 border-t border-border-subtle">
              {/* Heading shown only when both methods are available (user must pick) */}
              {enableOnline && enableCod && (
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Select Payment Method</span>
              )}

              {/* Option 1: Online Payment */}
              {enableOnline && (
                <label
                  onClick={() => onSelectPaymentMethod && onSelectPaymentMethod("ONLINE")}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === "ONLINE"
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-border-subtle bg-bg-surface hover:border-primary/40 hover:bg-card-hover"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-[22px] transition-colors ${
                        paymentMethod === "ONLINE" ? "text-primary" : "text-text-muted"
                      }`}
                      style={{ fontVariationSettings: paymentMethod === "ONLINE" ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {paymentMethod === "ONLINE" ? "radio_button_checked" : "radio_button_unchecked"}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-text-base">Online Payment</span>
                      <span className="text-[10px] text-text-muted">UPI, Cards, NetBanking, Wallets</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Instant
                  </span>
                </label>
              )}

              {/* Option 2: Cash on Delivery (COD) */}
              {enableCod && (
                <label
                  onClick={() => onSelectPaymentMethod && onSelectPaymentMethod("COD")}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === "COD"
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-border-subtle bg-bg-surface hover:border-primary/40 hover:bg-card-hover"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-[22px] transition-colors ${
                        paymentMethod === "COD" ? "text-primary" : "text-text-muted"
                      }`}
                      style={{ fontVariationSettings: paymentMethod === "COD" ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {paymentMethod === "COD" ? "radio_button_checked" : "radio_button_unchecked"}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-text-base">Cash on Delivery (COD)</span>
                      <span className="text-[10px] text-text-muted">Pay with cash when order arrives</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    codHandlingFee > 0 ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                  }`}>
                    {codHandlingFee > 0 ? `+₹${fmt(codHandlingFee)}` : "Free"}
                  </span>
                </label>
              )}
            </div>
          )}

          {/* Fallback if all payment methods are disabled */}
          {showPaymentOptions && !enableOnline && !enableCod && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-semibold">
              ⚠ No payment methods are currently enabled. Please contact the store admin.
            </div>
          )}

          {/* CTA Button */}
          <div className="flex flex-col">
            <button
              type="button"
              onClick={onProceed}
              disabled={isBusy}
              className="group relative w-full py-3.5 bg-primary hover:bg-primary-hover text-compli rounded-xl flex items-center justify-center gap-2 font-black text-sm sm:text-base transition-all shadow-md active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              <span>
                {ctaText 
                  ? ctaText 
                  : (pageType === "cart" 
                      ? "Proceed to Checkout" 
                      : (isBusy
                          ? "Processing..."
                          : paymentMethod === "COD"
                          ? "Place Cash on Delivery Order"
                          : "Proceed To Payment"))}
              </span>
              {pageType === "cart" && (
                <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
              )}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
            </button>
          </div>

          {/* Trust Badges */}
          {showTrustBadges && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-subtle">
              {[
                { icon: "verified_user", label: "Secure Checkout" },
                { icon: "package_2", label: "Easy Returns" },
                { icon: "local_shipping", label: "Free Delivery" }
              ].map((badge, idx) => (
                <div key={idx} className="flex flex-col border border-border-subtle rounded-xl items-center gap-1 py-2 text-text-muted bg-bg-surface">
                  <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {badge.icon}
                  </span>
                  <p className="text-[10px] sm:text-[11px] font-bold text-center leading-tight">{badge.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
