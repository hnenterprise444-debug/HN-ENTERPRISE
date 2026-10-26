import React from "react";
import { useNavigate } from "react-router-dom";
import { useCheckout } from "../../hooks/checkout/useCheckout";
import AddressSection from "./sections/AddressSection";
import ProductsSection from "./sections/ProductsSection";
import OrderSummaryCard from "../../components/Common/OrderSummaryCard";
import PaymentProcessingOverlay from "./components/PaymentProcessingOverlay";
import CheckoutSkeleton from "./components/CheckoutSkeleton";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const checkout = useCheckout();
 

  if (checkout.stage === "processing") {
    return <PaymentProcessingOverlay orderId={checkout.placedOrderId} />;
  }

  if (checkout.addressLoading && checkout.cart.length > 0) {
    return <CheckoutSkeleton />;
  }

  if (checkout.cart.length === 0 && checkout.stage !== "processing") {
    return (
      <div className="min-h-[75vh] bg-bg-base flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-xl shadow-primary/10 rotate-3">
            <svg className="w-12 h-12 text-primary -rotate-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-text-base mb-2 tracking-tight">Your Cart is Empty</h1>
        <p className="text-text-muted text-sm mb-8 max-w-sm leading-relaxed">
          Looks like you haven't added any products to your cart yet. Discover our curated collections today!
        </p>
        <button
          onClick={() => navigate("/allproducts")}
          className="px-8 py-3.5 bg-primary hover:bg-primary-hover text-compli font-bold rounded-2xl transition-all duration-200 shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center gap-2 cursor-pointer"
        >
          <span>Explore Catalog</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-base transition-colors duration-300">
      <main className="max-w-9xl mx-auto px-4 sm:px-6 py-2 sm:py-4">
        
        {/* Header & Stepper */}
        <div className="mb-8 space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-base">Checkout</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/cart")}
                className="text-xs sm:text-sm font-bold text-text-muted hover:text-primary flex items-center gap-1.5 transition-colors px-3 py-2 rounded-xl hover:bg-card border border-transparent hover:border-border-subtle cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {checkout.errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-between gap-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400">{checkout.errorMessage}</p>
            </div>
            <button
              onClick={checkout.handleRetry}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-red-600/20 flex-shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* 2-Column Responsive Layout (70% Left / 30% Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (70%) */}
          <div className="lg:col-span-8 space-y-6">
            <AddressSection
              addresses={checkout.addresses}
              selectedAddressId={checkout.selectedAddressId}
              addressLoading={checkout.addressLoading}
              addressFormOpen={checkout.addressFormOpen}
              editingAddress={checkout.editingAddress}
              onSelectAddress={checkout.setSelectedAddressId}
              onAddAddress={checkout.handleAddAddress}
              onUpdateAddress={checkout.handleUpdateAddress}
              onSetDefault={checkout.handleSetDefaultAddress}
              onOpenForm={checkout.openEditAddress}
              onCloseForm={checkout.closeAddressForm}
              onDelete={checkout.handleDeleteAddress}
            />

            <ProductsSection cart={checkout.cart} />
          </div>

          {/* Right Column (30%) - Sticky Order Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-6">
            <OrderSummaryCard
              subtotal={checkout.subtotal}
              productDiscount={checkout.productDiscount}
              couponDiscount={checkout.couponDiscount}
              shippingCharge={checkout.shippingCharge}
              estimatedTotal={checkout.estimatedTotal}
              appliedCoupon={checkout.appliedCoupon}
              cartCount={checkout.cart.length}
              onProceed={checkout.handleProceedToPayment}
              stage={checkout.stage}
              paymentMethod={checkout.paymentMethod}
              onSelectPaymentMethod={checkout.setPaymentMethod}
              codHandlingFee={checkout.codHandlingFee}
              finalTotal={checkout.finalTotal}
              couponCode={checkout.couponCode}
              couponLoading={checkout.couponLoading}
              couponError={checkout.couponError}
              onChangeCoupon={checkout.setCouponCode}
              onApplyCoupon={checkout.handleApplyCoupon}
              onRemoveCoupon={checkout.handleRemoveCoupon}
              pageType="checkout"
              showPaymentOptions={true}
              showTrustBadges={true}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

