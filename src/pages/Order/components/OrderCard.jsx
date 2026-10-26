import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderProductItem from "./OrderProductItem";
import { FaCopy, FaCheck, FaInfoCircle, FaCalendarAlt, FaCreditCard, FaTruck, FaClock, FaTimesCircle, FaCheckCircle, FaPalette } from "react-icons/fa";
import { toast } from "react-toastify";
import { InvoiceDownloadButton } from "../../../invoice/index";
import { isCodOrder } from "../../../admin/orders/tableComponents/orderHelpers";

const fmt = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

function OrderCard({ order, onViewDetails }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const orderId = order.orderId || order.docId || order.id || "N/A";
  
  // Format Date
  let formattedDate = "--";
  if (order.createdAt?.seconds) {
    formattedDate = new Date(order.createdAt.seconds * 1000).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } else if (order.date) {
    formattedDate = typeof order.date === "string" ? order.date : new Date(order.date).toLocaleDateString("en-IN");
  }

  // Format Status
  const isCod = isCodOrder(order) ||
                String(order.paymentMode || order.paymentMethod || order.payment?.gateway || order.payment?.method || "").toUpperCase().includes("COD") ||
                String(order.paymentMode || "").toUpperCase().includes("CASH");

  let rawStatus = (order.orderStatus || order.status || "PLACED").toUpperCase();
  if (isCod && (rawStatus === "PAYMENT_PENDING" || rawStatus === "PENDING" || !rawStatus)) {
    rawStatus = "PLACED";
  }
  const getStatusBadge = (st) => {
    switch (st) {
      case "DELIVERED":
        return {
          label: "Delivered",
          icon: <FaCheckCircle className="text-emerald-500" />,
          className: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
        };
      case "OUT_FOR_DELIVERY":
        return {
          label: "Out For Delivery",
          icon: <FaTruck className="text-orange-500" />,
          className: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300"
        };
      case "SHIPPED":
      case "IN_TRANSIT":
        return {
          label: "Shipped",
          icon: <FaTruck className="text-cyan-500" />,
          className: "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/40 dark:text-cyan-300"
        };
      case "PACKED":
        return {
          label: "Packed",
          icon: <FaClock className="text-purple-500" />,
          className: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300"
        };
      case "CONFIRMED":
        return {
          label: "Confirmed",
          icon: <FaCheckCircle className="text-blue-500" />,
          className: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300"
        };
      case "PLACED":
        return {
          label: "Order Placed",
          icon: <FaClock className="text-indigo-500 animate-pulse" />,
          className: "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300"
        };
      case "PAYMENT_PENDING":
        return {
          label: "Payment Pending",
          icon: <FaClock className="text-amber-500 animate-pulse" />,
          className: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300"
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          icon: <FaTimesCircle className="text-rose-500" />,
          className: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300"
        };
      default:
        return {
          label: st.replace(/_/g, " "),
          icon: <FaClock className="text-text-muted" />,
          className: "bg-card text-text-muted border-border-subtle"
        };
    }
  };

  const statusInfo = getStatusBadge(rawStatus);

  const handleCopyId = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    toast.success("Order ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isCustomOrder = Boolean(order.isCustom || order.itemInfo);
  const items = Array.isArray(order.products) && order.products.length > 0
    ? order.products
    : (Array.isArray(order.items) && order.items.length > 0
        ? order.items
        : (Array.isArray(order.cart) && order.cart.length > 0
            ? order.cart
            : (Array.isArray(order.cartItems) ? order.cartItems : [])));
  const grandTotal = order.pricing?.grandTotal || order.totalAmount || 0;

  return (
    <div className="bg-card border border-border-subtle rounded-2xl shadow-xs overflow-hidden transition-all duration-200 hover:border-primary/40">
      {/* Card Header Bar */}
      <div className="px-5 py-3.5 border-b border-border-subtle bg-bg-surface/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Left: ID & Date */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-black text-text-base">
            <span>Order #{orderId.slice(0, 12)}</span>
            <button
              type="button"
              onClick={handleCopyId}
              className="text-text-muted hover:text-primary transition p-1 cursor-pointer"
              title="Copy Order ID"
            >
              {copied ? <FaCheck className="text-emerald-400" size={12} /> : <FaCopy size={12} />}
            </button>
          </div>

          <span className="text-border-subtle">•</span>

          <div className="flex items-center gap-1.5 text-text-muted font-medium">
            <FaCalendarAlt size={12} />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Right: Status Pill & Amount */}
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 shrink-0 ${statusInfo.className}`}>
            {statusInfo.icon}
            <span>{statusInfo.label}</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-text-muted font-bold block leading-none">Total</span>
            <span className="font-black text-sm text-text-base leading-tight">₹{fmt(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 space-y-3">
        {isCustomOrder ? (
          /* Custom Order Representation */
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-bg-surface border border-border-subtle">
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-lg bg-bg-base border border-border-subtle p-1 overflow-hidden shrink-0 shadow-xs">
                {order.image ? (
                  <img src={order.image} alt="Custom Artwork" className="w-full h-full object-cover rounded-md" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                    <FaPalette size={20} />
                  </div>
                )}
              </div>

              <div>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-black uppercase">
                  Custom Artwork Commission
                </span>
                <h4 className="font-extrabold text-sm text-text-base mt-1">
                  {order.itemInfo?.selectedDrawingType || "Handmade Custom Portrait"}
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  Sheet Type: <strong className="text-text-base">{order.itemInfo?.selectedSheetType || "Standard"}</strong>
                </p>
                {order.edDate && (
                  <p className="text-[11px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                    <FaClock size={10} /> Estimated Delivery: {order.edDate?.toDate ? order.edDate.toDate().toLocaleDateString("en-IN") : String(order.edDate)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : items.length > 0 ? (
          /* Standard Product Items List */
          items.map((item, idx) => (
            <OrderProductItem
              key={idx}
              item={item}
              orderStatus={rawStatus}
            />
          ))
        ) : (
          <div className="p-4 text-center text-text-muted text-xs font-bold">
            No item details available for this order.
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="px-5 py-3 border-t border-border-subtle bg-bg-surface/50 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[11px] text-text-muted font-bold">
          <FaCreditCard size={12} className="text-primary" />
          <span>Payment: <strong className="text-text-base">{
            isCod ? "Cash on Delivery" : (order.paymentMode || order.paymentMethod || order.payment?.method || order.payment?.gateway || "Online Payment")
          }</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <InvoiceDownloadButton order={order} />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/order/${orderId}`, { state: { order } });
            }}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-compli hover:bg-primary-hover font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <FaInfoCircle size={12} />
            <span>Order Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderCard;
