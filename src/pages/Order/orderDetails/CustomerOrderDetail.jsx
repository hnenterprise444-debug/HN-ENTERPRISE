import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCopy,
  FaCalendarAlt,
  FaExclamationCircle,
  FaShoppingBag,
} from "react-icons/fa";
import useCustomerOrderDetail from "../../../hooks/order/useCustomerOrderDetail";
import CustomerOrderDetailSkeleton from "./components/CustomerOrderDetailSkeleton";
import OrderProductTrackingCard from "./components/OrderProductTrackingCard";
import OrderRateExperienceCard from "./components/OrderRateExperienceCard";
import OrderDeliveryDetailsCard from "./components/OrderDeliveryDetailsCard";
import OrderPriceDetailsCard from "./components/OrderPriceDetailsCard";
import OrderCancelConfirmModal from "./components/OrderCancelConfirmModal";

/**
 * Formats date for top header
 */
function formatHeaderDate(val) {
  if (!val) return "--";
  let dateObj = null;
  if (val?.seconds) dateObj = new Date(val.seconds * 1000);
  else if (val?.toDate && typeof val.toDate === "function") dateObj = val.toDate();
  else if (typeof val === "string" || typeof val === "number") dateObj = new Date(val);
  else if (val instanceof Date) dateObj = val;

  if (!dateObj || isNaN(dateObj.getTime())) return "--";

  return dateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * CustomerOrderDetail Page
 * Responsive, clean Order Details experience inspired by modern ecommerce layouts.
 */
export default function CustomerOrderDetail() {
  const navigate = useNavigate();
  const {
    order,
    orderId,
    rawStatus,
    canCancel,
    isAuthorized,
    isLoading,
    error,
    isCancelModalOpen,
    setIsCancelModalOpen,
    cancelling,
    handleCancelOrder,
    copyToClipboard,
    refetch,
  } = useCustomerOrderDetail();

  // ── 1. Loading Skeleton State ───────────────────────────────────────────
  if (isLoading) {
    return <CustomerOrderDetailSkeleton />;
  }

  // ── 2. Unauthorized Access Guard ───────────────────────────────────────
  if (!isAuthorized) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <FaExclamationCircle size={28} />
        </div>
        <h2 className="text-lg font-black text-text-base">Access Denied</h2>
        <p className="text-xs text-text-muted">
          You do not have permission to view this order record.
        </p>
        <Link
          to="/user?tab=orders"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-compli text-xs font-bold shadow-xs hover:bg-primary-hover transition-colors"
        >
          <FaArrowLeft size={10} />
          <span>Back to My Orders</span>
        </Link>
      </div>
    );
  }

  // ── 3. Not Found / Error State ─────────────────────────────────────────
  if (!order || error) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-card border border-border-subtle text-text-muted mx-auto flex items-center justify-center">
          <FaShoppingBag size={24} />
        </div>
        <h2 className="text-lg font-black text-text-base">Order Not Found</h2>
        <p className="text-xs text-text-muted">
          We couldn't locate this order. It may have been removed or the ID is invalid.
        </p>
        <Link
          to="/user?tab=orders"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-compli text-xs font-bold shadow-xs hover:bg-primary-hover transition-colors"
        >
          <FaArrowLeft size={10} />
          <span>Return to Order History</span>
        </Link>
      </div>
    );
  }

  const items = Array.isArray(order?.products) && order.products.length > 0
    ? order.products
    : (Array.isArray(order?.items) && order.items.length > 0 ? order.items : [order]);

  const primaryItem = items[0] || {};
  const isCancelled = rawStatus === "CANCELLED";
  const orderDateStr = formatHeaderDate(order.createdAt || order.date);
  const formattedDisplayId = String(orderId).startsWith("OD") ? orderId : `OD${orderId}`;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 min-h-[80vh]">
      {/* ── 1. Top Order ID & Status Header Banner ─────────────────────── */}
      <div className="space-y-1.5 min-w-0">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate("/user?tab=orders");
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-primary transition-colors cursor-pointer group"
        >
          <FaArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to My Orders</span>
        </button>

        {/* Prominent Order ID at the top */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-base sm:text-lg font-black text-text-base">
            Order #{formattedDisplayId}
          </h1>
          <button
            type="button"
            onClick={() => copyToClipboard(orderId, "Order ID copied to clipboard!")}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card hover:bg-card-hover text-text-muted hover:text-text-base text-[11px] font-mono font-bold transition-colors cursor-pointer border border-border-subtle"
            title="Copy Order ID"
          >
            <FaCopy size={10} />
            <span>Copy</span>
          </button>
        </div>

        <p className="text-xs text-text-muted flex items-center gap-1.5 font-medium">
          <FaCalendarAlt size={11} className="text-primary/70" />
          <span>Placed on <strong className="text-text-base font-bold">{orderDateStr}</strong></span>
        </p>
      </div>

      {/* ── 2. Responsive 2-Column Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (Items, Tracking, Rate Experience) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Unified Purchased Items & Status Tracking Card */}
          <OrderProductTrackingCard
            order={order}
            items={items}
            onCancelClick={() => setIsCancelModalOpen(true)}
            canCancel={canCancel}
          />

          {/* Functional "Rate your experience" Card */}
          <OrderRateExperienceCard
            items={items}
            orderId={orderId}
            onReviewSubmitted={() => refetch()}
          />
        </div>

        {/* Right Column (Delivery details & Price details) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Delivery Details Card */}
          <OrderDeliveryDetailsCard order={order} />

          {/* Price Details Card */}
          <OrderPriceDetailsCard order={order} />
        </div>
      </div>

      {/* ── 3. Cancellation Dialog ─────────────────────────────────────── */}
      <OrderCancelConfirmModal
        open={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelOrder}
        cancelling={cancelling}
        orderId={orderId}
      />
    </div>
  );
}
