import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, Timestamp, collection, query, where, getDocs } from "firebase/firestore";
import { fireDB, auth } from "../../firebase/FirebaseConfig";
import { orderService } from "../../services/order/orderService";
import { toast } from "react-toastify";
import { FaExclamationTriangle } from "react-icons/fa";
import { getFriendlyErrorMessage } from "../../utils/firebaseErrorHandler.js";

import OrderDetailHeaderSection from "./sections/OrderDetailHeaderSection";
import OrderFulfillmentSection from "./sections/OrderFulfillmentSection";
import OrderPurchasedItemsSection from "./sections/OrderPurchasedItemsSection";
import OrderHistoryAuditSection from "./sections/OrderHistoryAuditSection";
import OrderCustomerInfoSection from "./sections/OrderCustomerInfoSection";
import OrderPaymentSummarySection from "./sections/OrderPaymentSummarySection";
import OrderLogisticsSection from "./sections/OrderLogisticsSection";
import OrderMetadataSection from "./sections/OrderMetadataSection";
import OrderInvoiceAdminSection from "./sections/OrderInvoiceAdminSection";
import { OrderCancelModal, OrderTrackingModal } from "./sections/OrderModals";
import OrderDetailSkeleton from "../../components/loader/SkeletonLoader/OrderDetailSkeleton";

// Allowed Status Flow
const STATUS_STEPS = [
  "PAYMENT_PENDING",
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const COD_STATUS_STEPS = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const STATUS_BADGE_STYLES = {
  PAYMENT_PENDING: "bg-transparent text-amber-500 font-extrabold border border-amber-500/30",
  PLACED: "bg-transparent text-indigo-400 font-extrabold border border-indigo-500/30",
  CONFIRMED: "bg-transparent text-blue-400 font-extrabold border border-blue-500/30",
  PACKED: "bg-transparent text-purple-400 font-extrabold border border-purple-500/30",
  SHIPPED: "bg-transparent text-sky-400 font-extrabold border border-sky-500/30",
  IN_TRANSIT: "bg-transparent text-teal-400 font-extrabold border border-teal-500/30",
  OUT_FOR_DELIVERY: "bg-transparent text-amber-500 font-extrabold border border-amber-500/30",
  DELIVERED: "bg-transparent text-emerald-400 font-extrabold border border-emerald-500/30",
  CANCELLED: "bg-transparent text-rose-500 font-extrabold border border-rose-500/30",
  REFUNDED: "bg-transparent text-text-muted font-extrabold border border-border-subtle",
};

const PAYMENT_BADGE_STYLES = {
  Pending: "bg-transparent text-amber-500 font-extrabold border border-amber-500/30",
  Success: "bg-transparent text-emerald-400 font-extrabold border border-emerald-500/30",
  Paid: "bg-transparent text-emerald-400 font-extrabold border border-emerald-500/30",
  Failed: "bg-transparent text-rose-500 font-extrabold border border-rose-500/30",
  Refunded: "bg-transparent text-blue-400 font-extrabold border border-blue-500/30",
};

function formatDate(dateVal) {
  if (!dateVal) return "N/A";
  if (typeof dateVal === "string") return dateVal;
  if (typeof dateVal === "number") return new Date(dateVal).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  if (dateVal?.seconds !== undefined) {
    return new Date(dateVal.seconds * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  if (dateVal?.toDate && typeof dateVal.toDate === "function") {
    return dateVal.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  if (dateVal instanceof Date) return dateVal.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return "N/A";
}

function copyToClipboard(text, label = "Copied to clipboard!") {
  if (!text) return;
  navigator.clipboard.writeText(text);
  toast.success(label);
}

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  // Tracking Edit Form
  const [trackingForm, setTrackingForm] = useState({
    courier: "",
    trackingId: "",
    trackingUrl: "",
  });

  const fetchOrder = useCallback(async (isSilent = false) => {
    if (!id) return;
    if (!isSilent) {
      setLoading(true);
    }
    try {
      const docRef = doc(fireDB, "orders", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };

        // Fallback: If email is missing on order, lookup user profile by userId / userid
        let orderEmail =
          data.email ||
          data.userEmail ||
          data.customerEmail ||
          data.userProfile?.email ||
          data.shippingAddress?.email ||
          data.addressInfo?.email;

        const uid = data.userId || data.userid || data.userProfile?.uid;

        if (!orderEmail && uid) {
          try {
            const userDocRef = doc(fireDB, "users", uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists() && userDocSnap.data().email) {
              orderEmail = userDocSnap.data().email;
            } else {
              const qUsers = query(collection(fireDB, "users"), where("uid", "==", uid));
              const userQuerySnap = await getDocs(qUsers);
              if (!userQuerySnap.empty) {
                orderEmail = userQuerySnap.docs[0].data().email;
              }
            }
          } catch (userErr) {
            console.warn("Could not fetch user email fallback:", userErr);
          }
        }

        if (orderEmail) {
          data.email = orderEmail;
        }

        setOrder(data);
        setTrackingForm({
          courier: data.tracking?.courier || "",
          trackingId: data.tracking?.trackingId || "",
          trackingUrl: data.tracking?.trackingUrl || "",
        });

      } else {
        if (!isSilent) {
          toast.error("Order not found in database.");
          setOrder(null);
        }
      }
    } catch (err) {
      console.error("Error fetching order detail:", err);
      if (!isSilent) {
        toast.error("Failed to load order details.");
      }
    } finally {
      if (!isSilent) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleUpdateStatus = async (newStatus) => {
    if (!order) return;
    if (newStatus === "CANCELLED") {
      setShowCancelModal(true);
      return;
    }
    await executeStatusChange(newStatus);
  };

  const executeStatusChange = async (newStatus) => {
    setUpdating(true);
    const prevStatus = order?.orderStatus || order?.status;
    
    // 1. Optimistic Local State Update (Instant UI response, zero page flash)
    setOrder((prev) => {
      if (!prev) return prev;
      const nowIso = new Date().toISOString();
      const existingHistory = Array.isArray(prev.statusHistory) ? prev.statusHistory : [];
      return {
        ...prev,
        orderStatus: newStatus,
        status: newStatus,
        cancelledAt: newStatus === "CANCELLED" ? nowIso : prev.cancelledAt,
        statusHistory: [
          ...existingHistory,
          { status: newStatus, updatedBy: "ADMIN", timestamp: nowIso }
        ]
      };
    });

    try {
      await orderService.updateOrderStatus(id, newStatus, "ADMIN");
      toast.success(`Order status updated to ${newStatus.replace(/_/g, " ")}`);
      setShowCancelModal(false);
      // 2. Silent background sync without triggering full-page skeleton
      fetchOrder(true);
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err, "Failed to update status. Please try again."));
      // Rollback on error
      fetchOrder(true);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveTracking = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const docRef = doc(fireDB, "orders", id);
      const now = Timestamp.now();
      await updateDoc(docRef, {
        tracking: {
          courier: trackingForm.courier,
          trackingId: trackingForm.trackingId,
          trackingUrl: trackingForm.trackingUrl,
          updatedAt: now,
        },
        updatedAt: now,
      });
      toast.success("Tracking information updated successfully!");
      setShowTrackingModal(false);
      // Silent background sync
      fetchOrder(true);
    } catch (err) {
      console.error("Error saving tracking:", err);
      toast.error("Failed to update tracking.");
    } finally {
      setUpdating(false);
    }
  };

  const [recordingPayment, setRecordingPayment] = useState(false);

  const handleRecordCashPayment = async () => {
    setRecordingPayment(true);
    try {
      const adminUid = auth.currentUser?.uid || "ADMIN";
      await orderService.recordCashPayment(id, adminUid);
      toast.success("Cash payment recorded as collected!");
      fetchOrder(true);
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err, "Failed to record cash payment."));
    } finally {
      setRecordingPayment(false);
    }
  };

  const handlePrintInvoice = () => {
    navigate(`/admin/order/${id}/invoice`);
  };

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto">
        <FaExclamationTriangle className="text-4xl text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-text-base">Order Not Found</h2>
        <p className="text-xs text-text-muted">The requested order ID does not exist or has been deleted.</p>
        <button
          onClick={() => navigate("/orders")}
          className="px-5 py-2.5 rounded-xl bg-primary text-compli text-xs font-bold shadow-sm hover:bg-primary-hover transition cursor-pointer"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  // Normalized Fields
  const orderId = order.orderId || order.id || id;
  const currentStatus = order.orderStatus || order.status || "PLACED";
  const sAddr = order.shippingAddress || order.addressInfo || {};

  const customerName = sAddr.fullName || sAddr.name || order.userProfile?.name || "N/A";
  const customerPhone = sAddr.phone || sAddr.phoneNumber || order.userProfile?.phone || "N/A";
  const customerEmail =
    order.email ||
    order.userEmail ||
    order.customerEmail ||
    order.userProfile?.email ||
    sAddr.email ||
    sAddr.userEmail ||
    order.user?.email ||
    order.userInfo?.email ||
    "N/A";
  const addressType = sAddr.addressType || sAddr.type || "HOME";

  const fullStreet = [sAddr.houseNo, sAddr.buildingName, sAddr.street, sAddr.landmark].filter(Boolean).join(", ") || sAddr.address || "N/A";
  const city = sAddr.city || "N/A";
  const state = sAddr.state || "N/A";
  const pincode = sAddr.pincode || "N/A";

  const productsList = order.products || order.items || order.cart || [];
  const rawSubtotal = order.pricing?.subtotal ?? order.totalAmount ?? 0;
  const subtotal = typeof rawSubtotal === "number" ? rawSubtotal : parseFloat(rawSubtotal) || 0;
  const couponDiscount = Number(order.pricing?.couponDiscount ?? order.coupon?.discountValue ?? order.couponDiscount ?? order.discount ?? 0);
  const couponCode = order.couponCode || order.pricing?.appliedCoupon || order.coupon?.code || "";
  const shippingCharge = Number(order.pricing?.shippingCharge ?? 40);
  const grandTotal = Number(order.pricing?.grandTotal ?? order.totalAmount ?? (subtotal - couponDiscount + shippingCharge));

  const isCod = String(order.paymentMode || order.paymentMethod || order.payment?.gateway || order.payment?.method || "").toUpperCase().includes("COD") ||
                String(order.paymentMode || "").toUpperCase().includes("CASH");

  const advancedStatuses = ["CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];
  const paymentStatus = isCod 
    ? (currentStatus === "DELIVERED" ? "Paid" : "Cash on Delivery")
    : (order.payment?.status || order.paymentStatus || (advancedStatuses.includes(currentStatus.toUpperCase()) ? "Success" : "Pending"));
  const paymentGateway = isCod ? "COD" : (order.payment?.gateway || order.paymentMode || order.paymentInfo?.method || "ONLINE");
  const paymentMethod = isCod ? "Cash on Delivery" : (order.payment?.method || order.paymentMode || "Online Payment");
  const paymentId = order.payment?.paymentId || order.paymentId || order.id || "N/A";

  const tracking = order.tracking || null;
  const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];
  const effectiveSteps = isCod ? COD_STATUS_STEPS : STATUS_STEPS;
  const currentStepIndex = effectiveSteps.indexOf(currentStatus);

  return (
    <div className="p-4 sm:p-3 max-w-8xl mx-auto space-y-6 text-text-base">
      {/* Header Section */}
      <OrderDetailHeaderSection
        orderId={orderId}
        createdAt={order.createdAt || order.date}
        updatedAt={order.updatedAt}
        currentStatus={currentStatus}
        paymentStatus={paymentStatus}
        isCod={isCod}
        statusBadgeStyles={STATUS_BADGE_STYLES}
        paymentBadgeStyles={PAYMENT_BADGE_STYLES}
        formatDate={formatDate}
        copyToClipboard={copyToClipboard}
        onBack={() => {
          if (window.history.length > 2) {
            navigate(-1);
          } else {
            navigate('/orders', { state: { activeView: 'orders' } });
          }
        }}
        onRefresh={fetchOrder}
        onPrint={handlePrintInvoice}
        loading={loading}
      />

      {/* 2-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (70%) */}
        <div className="lg:col-span-2 space-y-6">
          <OrderFulfillmentSection
            currentStatus={currentStatus}
            paymentStatus={paymentStatus}
            statusSteps={effectiveSteps}
            currentStepIndex={currentStepIndex}
            isCod={isCod}
            updating={updating}
            cancelledAt={order.cancelledAt}
            updatedAt={order.updatedAt}
            formatDate={formatDate}
            onUpdateStatus={handleUpdateStatus}
          />
             <OrderPurchasedItemsSection
            productsList={productsList}
          />
           <OrderLogisticsSection
            tracking={tracking}
            onOpenTrackingModal={() => setShowTrackingModal(true)}
          />

       

          <OrderHistoryAuditSection
            history={history}
            currentStatus={currentStatus}
            createdAt={order.createdAt || order.date}
            formatDate={formatDate}
          />
        </div>

        {/* Right Sticky Sidebar (30%) */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <OrderInvoiceAdminSection
            order={order}
            onRefresh={fetchOrder}
          />

          <OrderCustomerInfoSection
            customerName={customerName}
            customerPhone={customerPhone}
            customerEmail={customerEmail}
            addressType={addressType}
            fullStreet={fullStreet}
            city={city}
            state={state}
            pincode={pincode}
            copyToClipboard={copyToClipboard}
          />

          <OrderPaymentSummarySection
            subtotal={subtotal}
            couponDiscount={couponDiscount}
            couponCode={couponCode}
            shippingCharge={shippingCharge}
            grandTotal={grandTotal}
            paymentGateway={paymentGateway}
            paymentMethod={paymentMethod}
            paymentStatus={order.paymentStatus || order.payment?.status || (isCod ? "PENDING" : paymentStatus)}
            paymentId={paymentId}
            isCod={isCod}
            onRecordCashPayment={handleRecordCashPayment}
            recordingPayment={recordingPayment}
            copyToClipboard={copyToClipboard}
          />
          {/* <OrderMetadataSection
            userId={order.userId || order.userid}
            itemCount={productsList.length}
          /> */}
        </div>
      </div>

      {/* Modals */}
      <OrderCancelModal
        isOpen={showCancelModal}
        orderId={orderId}
        updating={updating}
        onClose={() => setShowCancelModal(false)}
        onConfirmCancel={() => executeStatusChange("CANCELLED")}
      />

      <OrderTrackingModal
        isOpen={showTrackingModal}
        trackingForm={trackingForm}
        setTrackingForm={setTrackingForm}
        updating={updating}
        onClose={() => setShowTrackingModal(false)}
        onSaveTracking={handleSaveTracking}
      />
    </div>
  );
}
