import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { paymentService } from '../../../services/payment/paymentService';
import { getFriendlyErrorMessage } from '../../../utils/firebaseErrorHandler.js';
import OrderSummaryCard from '../../../components/Common/OrderSummaryCard';

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * OrderSummary (Cart Page Wrapper)
 * Uses the shared unified OrderSummaryCard component.
 * Supports Desktop sticky sidebar and Mobile floating bottom drawer.
 */
export default function OrderSummary({ subtotal = 0, shippingFee = "Free", cartItems = [], onCheckout }) {
  const [promoCode, setPromoCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [applying, setApplying] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const isShippingFree = shippingFee === "Free" || shippingFee === "FREE" || shippingFee === 0 || shippingFee === "0";
  const numShipping = isShippingFree ? 0 : (Number(shippingFee) || 0);
  const grandTotal = Math.max(0, subtotal - discountAmount + numShipping);

  // Sync / load saved coupon on mount or subtotal change
  useEffect(() => {
    const numSubtotal = Number(subtotal) || 0;
    if (numSubtotal <= 0 || cartItems.length === 0) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      sessionStorage.removeItem('appliedCoupon');
      return;
    }

    const saved = sessionStorage.getItem('appliedCoupon');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.code) {
          setAppliedCoupon(parsed);
          setPromoCode(parsed.code);
          let discount = Number(parsed.discountAmount || 0);
          if (parsed.type === 'PERCENTAGE' || parsed.type === 'percentage') {
            const val = Number(parsed.discountValue || parsed.value || 0);
            discount = (numSubtotal * val) / 100;
          }
          setDiscountAmount(Math.min(discount, numSubtotal));
        }
      } catch (e) {
        console.warn("Failed to parse stored coupon:", e);
      }
    }
  }, [subtotal, cartItems.length]);

  const handleApplyCoupon = async () => {
    if (!promoCode.trim()) {
      setCouponError('Please enter a coupon code.');
      toast.error('Please enter a coupon code');
      return;
    }

    const currentSubtotal = Number(subtotal) || 0;
    if (currentSubtotal <= 0 || cartItems.length === 0) {
      const msg = 'Add items to your cart before applying a coupon.';
      setCouponError(msg);
      toast.error(msg);
      return;
    }

    setApplying(true);
    setCouponError('');
    try {
      const res = await paymentService.validateCoupon(promoCode.trim(), currentSubtotal);
      if (res && res.valid) {
        const couponObj = {
          code: res.code,
          type: res.type,
          value: res.discountValue,
          discountValue: res.discountValue,
          discountAmount: res.discountAmount
        };
        setAppliedCoupon(couponObj);
        setDiscountAmount(res.discountAmount);
        setCouponError('');
        sessionStorage.setItem('appliedCoupon', JSON.stringify(couponObj));
        toast.success(`Coupon "${res.code}" applied! You save ₹${fmt(res.discountAmount)}`);
      } else {
        const errorMsg = getFriendlyErrorMessage(res?.message, 'Invalid or expired coupon code.');
        setCouponError(errorMsg);
        toast.error(errorMsg);
        setAppliedCoupon(null);
        setDiscountAmount(0);
        sessionStorage.removeItem('appliedCoupon');
      }
    } catch (err) {
      const errorMsg = getFriendlyErrorMessage(err, 'Invalid or expired coupon code.');
      setCouponError(errorMsg);
      toast.error(errorMsg);
      setAppliedCoupon(null);
      setDiscountAmount(0);
      sessionStorage.removeItem('appliedCoupon');
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setPromoCode('');
    setCouponError('');
    sessionStorage.removeItem('appliedCoupon');
    toast.info('Coupon removed');
  };

  const handleProceed = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      navigate('/checkout', { state: { appliedCoupon } });
    }
  };

  // If cart has no items, do not render summary sidebar or mobile floating drawer
  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  return (
    <>
      {/* 1. Desktop Sticky Sidebar View */}
      <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-[120px] w-full">
        <OrderSummaryCard
          subtotal={subtotal}
          couponDiscount={discountAmount}
          shippingCharge={shippingFee}
          finalTotal={grandTotal}
          cartCount={cartItems.length}
          appliedCoupon={appliedCoupon}
          couponCode={promoCode}
          couponLoading={applying}
          couponError={couponError}
          onChangeCoupon={setPromoCode}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={handleRemoveCoupon}
          onProceed={handleProceed}
          pageType="cart"
          showPaymentOptions={false}
          showTrustBadges={true}
        />
      </div>

      {/* 2. Mobile Floating Drawer Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-[35] lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* 3. Mobile Floating Summary Drawer */}
      <div
        className={`lg:hidden fixed left-4 right-4 z-40 transition-all duration-300 bg-primary text-compli rounded-2xl shadow-xl border border-primary/40 overflow-hidden ${
          isExpanded ? "bottom-[76px] max-h-[85vh] overflow-y-auto" : "bottom-[76px] h-16"
        }`}
      >
        {/* Toggle Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-16 px-5 flex items-center justify-between cursor-pointer select-none border-b border-black/10 bg-primary"
        >
          <div className="flex flex-col">
            <span className="text-[10px] text-compli/75 font-bold uppercase tracking-wider">
              {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
            </span>
            <span className="text-base sm:text-lg font-black leading-tight text-compli">₹{fmt(grandTotal)}</span>
          </div>

          <div className="flex items-center gap-1 bg-black/10 px-3 py-1.5 rounded-full hover:bg-black/20 transition text-[11px] font-bold text-compli">
            <span>{isExpanded ? "Hide Details" : "View Summary"}</span>
            <span className="material-symbols-outlined text-[18px]">
              {isExpanded ? "expand_more" : "expand_less"}
            </span>
          </div>
        </div>

        {/* Collapsible Full Order Summary Card */}
        {isExpanded && (
          <div className="p-2 sm:p-4 bg-bg-surface text-text-base max-h-[65vh] overflow-y-auto border-t border-border-subtle">
            <OrderSummaryCard
              subtotal={subtotal}
              couponDiscount={discountAmount}
              shippingCharge={shippingFee}
              finalTotal={grandTotal}
              cartCount={cartItems.length}
              appliedCoupon={appliedCoupon}
              couponCode={promoCode}
              couponLoading={applying}
              couponError={couponError}
              onChangeCoupon={setPromoCode}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              onProceed={handleProceed}
              pageType="cart"
              showPaymentOptions={false}
              showTrustBadges={true}
              className="shadow-none border-0"
            />
          </div>
        )}
      </div>
    </>
  );
}