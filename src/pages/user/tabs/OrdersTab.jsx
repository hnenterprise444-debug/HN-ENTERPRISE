import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaShoppingBag, FaSearch, FaCheckCircle, 
  FaExclamationCircle, FaTimesCircle, FaTruck, FaClock, FaImage,
  FaChevronRight, FaCalendarAlt
} from "react-icons/fa";
import Pagination from "../../../components/Common/Pagination";
import { InvoiceDownloadButton } from "../../../invoice/index";
import { useNavigate } from "react-router-dom";

const fmt = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

function formatDate(dateVal) {
  if (!dateVal) return "N/A";
  if (typeof dateVal === "string") return dateVal;
  if (typeof dateVal === "number") return new Date(dateVal).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  if (dateVal?.seconds !== undefined) {
    return new Date(dateVal.seconds * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }
  if (dateVal?.toDate && typeof dateVal.toDate === "function") {
    return dateVal.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }
  if (dateVal instanceof Date) return dateVal.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return "N/A";
}

export function isCodOrder(o = {}) {
  if (!o || typeof o !== "object") return false;
  if (o.isCod === true) return true;
  if (Number(o.pricing?.codHandlingFee || o.codHandlingFee || 0) > 0) return true;
  
  const valuesToCheck = [
    o.paymentMode,
    o.paymentMethod,
    o.payment_method,
    o.payment_mode,
    o.paymentType,
    o.paymentId,
    o.payment?.method,
    o.payment?.gateway,
    o.payment?.mode,
    o.payment?.type,
    o.payment?.paymentMode,
    o.paymentInfo?.method,
    o.paymentInfo?.gateway,
    o.paymentInfo?.mode,
    typeof o.payment === "string" ? o.payment : "",
  ];

  return valuesToCheck.some((val) => {
    if (!val) return false;
    const s = String(val).toUpperCase();
    return s.includes("COD") || s.includes("CASH");
  });
}

function renderStatusBadge(statusRaw, paymentStatRaw, paymentModeRaw, orderObj = {}) {
  const isCod = isCodOrder({
    ...orderObj,
    paymentMode: paymentModeRaw || orderObj.paymentMode,
  });

  const raw = (statusRaw || orderObj.orderStatus || orderObj.status || "").toUpperCase().trim().replace(/[\s-]+/g, "_");
  const payStat = (paymentStatRaw || orderObj.paymentStatus || orderObj.payment?.status || "").toUpperCase().trim();

  // ── For COD Orders: never show Payment Pending ─────────────────────────
  // Initial stage is "ORDER PLACED", then "CONFIRMED", "SHIPPED", etc.
  if (isCod) {
    if (raw === "CANCELLED" || raw === "ORDER_CANCELLED") {
      return (
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-text-subtle uppercase tracking-wider">
          <FaTimesCircle className="text-text-subtle" size={11} />
          <span>CANCELLED</span>
        </span>
      );
    }
    if (raw === "DELIVERED" || raw === "ORDER_DELIVERED") {
      return (
        <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          <FaCheckCircle className="text-emerald-600" size={11} />
          <span>DELIVERED</span>
        </span>
      );
    }
    if (raw === "OUT_FOR_DELIVERY") {
      return (
        <span className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
          <FaTruck className="text-amber-600" size={11} />
          <span>OUT FOR DELIVERY</span>
        </span>
      );
    }
    if (raw === "SHIPPED" || raw === "ORDER_SHIPPED" || raw === "IN_TRANSIT") {
      return (
        <span className="flex items-center gap-1.5 text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
          <FaTruck className="text-cyan-600" size={11} />
          <span>SHIPPED</span>
        </span>
      );
    }
    if (raw === "PACKED" || raw === "PROCESSING") {
      return (
        <span className="flex items-center gap-1.5 text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
          <FaClock className="text-purple-600" size={11} />
          <span>{raw.replace(/_/g, " ")}</span>
        </span>
      );
    }
    if (raw === "CONFIRMED" || raw === "ORDER_CONFIRMED") {
      return (
        <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
          <FaCheckCircle className="text-indigo-600" size={11} />
          <span>CONFIRMED</span>
        </span>
      );
    }
    // Default initial COD status is Order Placed
    return (
      <span className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
        <FaCheckCircle className="text-blue-600" size={11} />
        <span>ORDER PLACED</span>
      </span>
    );
  }

  // ── For Online / Non-COD Orders ─────────────────────────────────────────
  if (raw === "PAYMENT_FAILED" || payStat === "FAILED") {
    return (
      <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">
        <FaExclamationCircle className="text-rose-600" size={11} />
        <span>PAYMENT_FAILED</span>
      </span>
    );
  }

  if (raw === "PAYMENT_PENDING" || (payStat === "PENDING" && (raw === "PENDING" || raw === "PAYMENT_PENDING"))) {
    return (
      <span className="flex items-center gap-1.5 text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
        <FaClock className="text-purple-600" size={11} />
        <span>PAYMENT_PENDING</span>
      </span>
    );
  }

  if (raw === "CANCELLED" || raw === "ORDER_CANCELLED") {
    return (
      <span className="flex items-center gap-1.5 text-[10px] font-bold text-text-subtle uppercase tracking-wider">
        <FaTimesCircle className="text-text-subtle" size={11} />
        <span>CANCELLED</span>
      </span>
    );
  }

  if (raw === "DELIVERED" || raw === "ORDER_DELIVERED") {
    return (
      <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
        <FaCheckCircle className="text-emerald-600" size={11} />
        <span>DELIVERED</span>
      </span>
    );
  }

  if (raw === "OUT_FOR_DELIVERY") {
    return (
      <span className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
        <FaTruck className="text-amber-600" size={11} />
        <span>OUT FOR DELIVERY</span>
      </span>
    );
  }

  if (raw === "SHIPPED" || raw === "ORDER_SHIPPED" || raw === "IN_TRANSIT") {
    return (
      <span className="flex items-center gap-1.5 text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
        <FaTruck className="text-cyan-600" size={11} />
        <span>SHIPPED</span>
      </span>
    );
  }

  if (raw === "CONFIRMED" || raw === "ORDER_CONFIRMED") {
    return (
      <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
        <FaCheckCircle className="text-indigo-600" size={11} />
        <span>CONFIRMED</span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-wider">
      <FaCheckCircle className="text-primary" size={11} />
      <span>{raw.replace(/_/g, " ") || "ORDER PLACED"}</span>
    </span>
  );
}

function getOrderItems(o) {
  if (Array.isArray(o.products) && o.products.length > 0) return o.products;
  if (Array.isArray(o.items) && o.items.length > 0) return o.items;
  if (Array.isArray(o.cart) && o.cart.length > 0) return o.cart;
  return [];
}

export default function OrdersTab({ orders = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const orderId = (o.id || o.orderId || o.paymentId || "").toLowerCase();
    const items = getOrderItems(o);
    const itemTitles = items.map((i) => (i.productName || i.title || i.name || "").toLowerCase()).join(" ");
    return orderId.includes(q) || itemTitles.includes(q);
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredOrders.length]);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
          <FaShoppingBag size={18} />
        </div>
        <h4 className="text-xs font-extrabold text-text-base">No orders placed yet</h4>
        <p className="text-[11px] text-text-muted max-w-xs">
          When you purchase products, your complete order details and status tracking will appear here.
        </p>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-3.5 text-xs">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-border-subtle">
        <div className="flex items-baseline justify-between sm:block">
          <h2 className="text-sm sm:text-base font-extrabold text-text-base tracking-tight">My Orders</h2>
          <p className="text-[10px] text-text-muted sm:mt-0.5">{orders.length} total orders recorded</p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-60">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle text-[11px]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border-subtle bg-bg-base text-text-base text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-subtle"
            />
          </div>
        </div>
      </div>

      {/* Orders List View */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="py-8 text-center text-text-muted text-xs">
            No orders matching "{searchQuery}"
          </div>
        ) : (
          paginatedOrders.map((o, idx) => {
            const items = getOrderItems(o);
            const rawAmt = o.totalAmount ?? o.pricing?.grandTotal ?? o.amount ?? 0;
            const totalAmt = typeof rawAmt === 'number' ? rawAmt : (parseFloat(String(rawAmt).replace(/[^0-9.]/g, '')) || 0);
            const orderIdDisplay = o.id || o.orderId || o.paymentId || "R0pgC" + idx;
            const targetOrderId = o.docId || o.orderId || o.id || orderIdDisplay;

            return (
              <div
                key={o.id || o.orderId || idx}
                onClick={() => navigate(`/order/${targetOrderId}`, { state: { order: o } })}
                className="group bg-card hover:bg-card-hover border border-border-subtle hover:border-primary/40 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 space-y-3 cursor-pointer relative overflow-hidden"
              >
                {/* ── Top Header Row: Status Badge & Date on Left, Total Amount & Invoice on Right ── */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-border-subtle flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    {renderStatusBadge(
                      o.orderStatus || o.status,
                      o.paymentStatus || o.payment?.status,
                      o.paymentMode || o.paymentMethod || o.payment?.gateway || o.payment?.method || o.paymentInfo?.method,
                      o
                    )}
                    <span className="text-text-muted/40 hidden sm:inline">•</span>
                    <p className="text-[11px] text-text-muted font-medium flex items-center gap-1.5 whitespace-nowrap">
                      <FaCalendarAlt size={10} className="text-primary/70 shrink-0" />
                      <span>Placed on <strong className="font-semibold text-text-base">{formatDate(o.date || o.createdAt)}</strong></span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3 ml-auto shrink-0">
                    <span className="text-sm sm:text-base font-black text-text-base">
                      ₹{fmt(totalAmt)}
                    </span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <InvoiceDownloadButton
                        order={o}
                        buttonClass="px-2.5 py-1 rounded-lg bg-bg-surface hover:bg-primary hover:text-compli border border-border-subtle text-text-base text-[10px] sm:text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        label="Invoice"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Product Items List + Arrow Icon ── */}
                <div className="flex items-center justify-between gap-3 pt-0.5">
                  <div className="divide-y divide-border-subtle space-y-2.5 min-w-0 flex-1">
                    {items.map((item, itemIdx) => {
                      const itemImg = item.productImage || item.imageUrl || item.images?.[0] || "";
                      const itemTitle = item.productName || item.title || item.name || "Product Item";
                      const itemQty = Number(item.quantity || item.qty || 1) || 1;
                      
                      const rawPrice = Number(
                        item.price ??
                        item.sellingPrice ??
                        item.unitPrice ??
                        item.offerPrice ??
                        item.discountPrice ??
                        item.salePrice ??
                        item.finalPrice ??
                        item.productPrice ??
                        item.priceAtPurchase ??
                        item.selectedVariant?.price ??
                        0
                      );
                      const rawItemTotal = Number(item.totalPrice ?? item.total ?? item.amount ?? 0);
                      let displayPrice = rawPrice;
                      if (!displayPrice && rawItemTotal > 0) {
                        displayPrice = rawItemTotal / itemQty;
                      } else if (!displayPrice && !rawItemTotal) {
                        displayPrice = totalAmt / (items.length || 1) / itemQty;
                      }

                      const variantText = item.selectedVariant
                        ? (typeof item.selectedVariant === "object"
                            ? Object.entries(item.selectedVariant).map(([k, v]) => `${k}: ${v}`).join(", ")
                            : String(item.selectedVariant))
                        : (item.variant || item.size || item.color || "");

                      return (
                        <div key={itemIdx} className={`flex items-center gap-3 ${itemIdx > 0 ? "pt-2.5" : ""}`}>
                          {/* Product Thumbnail */}
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-bg-base border border-border-subtle p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                            {itemImg ? (
                              <img src={itemImg} alt={itemTitle} className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-200" />
                            ) : (
                              <FaImage size={16} className="text-primary/40" />
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <p className="font-bold text-xs sm:text-sm text-text-base group-hover:text-primary transition-colors truncate">
                              {itemTitle}
                            </p>

                            {variantText && (
                              <p className="text-[10px] sm:text-[11px] text-text-muted font-medium truncate">
                                Variant: <span className="text-text-base font-semibold">{variantText}</span>
                              </p>
                            )}

                            <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                              <span className="font-black text-text-base">
                                ₹{fmt(displayPrice)}
                              </span>
                              <span>• Qty: {itemQty}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Right Navigation Chevron Arrow ── */}
                  <div className="shrink-0 pl-1">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-bg-base/60 border border-border-subtle flex items-center justify-center text-text-muted group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:translate-x-1 transition-all duration-200 shadow-2xs">
                      <FaChevronRight size={11} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Universal Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredOrders.length}
        pageSize={pageSize}
        pageSizeOptions={[5, 10, 20]}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
