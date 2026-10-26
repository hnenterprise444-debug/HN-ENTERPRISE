import React from "react";
import { FaCheckCircle, FaTruck, FaBoxOpen, FaClock, FaTimesCircle } from "react-icons/fa";

/**
 * Universal helper to check if an order is Cash on Delivery (COD)
 */
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

/**
 * Format variant details safely whether string or object
 */
export function formatVariantName(variant) {
    if (!variant) return "";
    if (typeof variant === "string") return variant;
    if (typeof variant === "object") {
        return Object.entries(variant)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" • ");
    }
    return String(variant);
}

/**
 * Format date & time into "Aug 2, 6:16 PM"
 */
export function formatTableDateTime(dateVal) {
    if (!dateVal) return "N/A";
    let dateObj = null;
    if (dateVal?.seconds !== undefined) {
        dateObj = new Date(dateVal.seconds * 1000);
    } else if (dateVal?.toDate && typeof dateVal.toDate === "function") {
        dateObj = dateVal.toDate();
    } else if (typeof dateVal === "number" || typeof dateVal === "string") {
        dateObj = new Date(dateVal);
    } else if (dateVal instanceof Date) {
        dateObj = dateVal;
    }

    if (!dateObj || isNaN(dateObj.getTime())) return "N/A";

    return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}

/**
 * Format items summary e.g. "T-Shirt (+2)"
 */
export function formatItemsSummary(items, isCustom, itemInfo) {
    if (isCustom) {
        return itemInfo?.selectedDrawingType || "Custom Artwork";
    }
    if (!Array.isArray(items) || items.length === 0) return "No items";
    const firstTitle = items[0].productName || items[0].title || items[0].name || "Product Item";
    const extraCount = items.length - 1;
    if (extraCount > 0) {
        return `${firstTitle} (+${extraCount})`;
    }
    return firstTitle;
}

/**
 * Format dates safely
 */
export function safeFormatDate(dateVal, customFormatFn) {
    if (typeof customFormatFn === 'function') {
        try {
            const res = customFormatFn(dateVal);
            if (res && res !== 'N/A') return res;
        } catch (e) {
            // Fallback
        }
    }
    if (!dateVal) return "N/A";
    if (typeof dateVal === "string") return dateVal;
    if (typeof dateVal === "number") return new Date(dateVal).toLocaleDateString("en-IN");
    if (dateVal?.seconds !== undefined) {
        return new Date(dateVal.seconds * 1000).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }
    if (dateVal?.toDate && typeof dateVal.toDate === "function") {
        return dateVal.toDate().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }
    if (dateVal instanceof Date) return dateVal.toLocaleDateString("en-IN");
    return "N/A";
}

/**
 * Normalize Order object structure
 */
export function normalizeOrder(allorder) {
    if (!allorder) return {};

    const sAddr = allorder.shippingAddress || {};
    const aInfo = allorder.addressInfo || {};

    const name = aInfo.name || aInfo.fullName || sAddr.fullName || sAddr.name || allorder.userProfile?.name || allorder.userName || 'N/A';
    const email =
        allorder.email ||
        allorder.userEmail ||
        allorder.customerEmail ||
        allorder.userProfile?.email ||
        aInfo.email ||
        sAddr.email ||
        'N/A';
    const phone = aInfo.phoneNumber || aInfo.phone || sAddr.phone || sAddr.phoneNumber || sAddr.mobile || allorder.phone || allorder.userProfile?.phone || 'N/A';
    
    const streetAddress = aInfo.address || [sAddr.houseNo, sAddr.street, sAddr.landmark, sAddr.city, sAddr.state].filter(Boolean).join(', ') || 'N/A';
    const pincode = aInfo.pincode || sAddr.pincode || 'N/A';

    const rawAmount = allorder.totalAmount ?? allorder.pricing?.grandTotal ?? allorder.amount ?? 0;
    const totalAmount = typeof rawAmount === 'number' ? rawAmount : (parseFloat(rawAmount) || 0);

    const isCod = isCodOrder(allorder) || 
                  String(allorder.paymentMode || allorder.paymentMethod || allorder.paymentInfo?.method || allorder.payment?.gateway || allorder.payment?.method || '').toUpperCase().includes('COD') || 
                  String(allorder.paymentMode || '').toUpperCase().includes('CASH');

    const paymentMode = isCod 
      ? 'Cash on Delivery' 
      : (allorder.paymentMode || allorder.paymentMethod || allorder.paymentInfo?.method || allorder.payment?.gateway || allorder.payment?.method || 'Online Payment');
    const paymentId = allorder.paymentId || allorder.payment?.paymentId || allorder.gatewayOrderId || allorder.orderId || '';

    const dateVal = allorder.date || allorder.createdAt;
    const rawStatus = (allorder.orderStatus || allorder.status || '').toUpperCase();
    const paymentStat = (allorder.paymentStatus || allorder.payment?.status || '').toUpperCase();

    let orderStatus = rawStatus;
    if (isCod) {
        if (orderStatus === 'CONFIRMED' || orderStatus === 'ORDER_CONFIRMED' || orderStatus === 'ORDER CONFIRMED') {
            orderStatus = 'CONFIRMED';
        } else if (orderStatus === 'SHIPPED' || orderStatus === 'ORDER_SHIPPED' || orderStatus === 'ORDER SHIPPED' || orderStatus === 'IN_TRANSIT') {
            orderStatus = 'SHIPPED';
        } else if (orderStatus === 'OUT_FOR_DELIVERY') {
            orderStatus = 'OUT_FOR_DELIVERY';
        } else if (orderStatus === 'DELIVERED' || orderStatus === 'ORDER_DELIVERED' || orderStatus === 'ORDER DELIVERED') {
            orderStatus = 'DELIVERED';
        } else if (orderStatus === 'CANCELLED' || orderStatus === 'ORDER_CANCELLED' || orderStatus === 'ORDER CANCELLED') {
            orderStatus = 'CANCELLED';
        } else if (orderStatus === 'PACKED' || orderStatus === 'PROCESSING') {
            orderStatus = orderStatus;
        } else {
            // All initial COD states normalize directly to PLACED
            orderStatus = 'PLACED';
        }
    } else {
        if (!orderStatus || orderStatus === 'ORDER PLACED' || orderStatus === 'ORDER_PLACED' || orderStatus === 'PLACED') {
            orderStatus = 'PLACED';
        } else if (orderStatus === 'PENDING') {
            orderStatus = (paymentStat === 'PAID' || paymentStat === 'SUCCESS') ? 'PLACED' : 'PAYMENT_PENDING';
        } else if (orderStatus === 'PAYMENT_PENDING' || orderStatus === 'PAYMENT PENDING') {
            orderStatus = 'PAYMENT_PENDING';
        } else if (orderStatus === 'ORDER CANCELLED' || orderStatus === 'ORDER_CANCELLED') {
            orderStatus = 'CANCELLED';
        } else if (orderStatus === 'ORDER DELIVERED' || orderStatus === 'ORDER_DELIVERED') {
            orderStatus = 'DELIVERED';
        } else if (orderStatus === 'ORDER SHIPPED' || orderStatus === 'ORDER_SHIPPED') {
            orderStatus = 'SHIPPED';
        }
    }

    const targetId = allorder.docId || allorder.id || allorder.orderId || paymentId;
    const displayId = allorder.orderId || allorder.docId || allorder.id || 'N/A';

    return {
        targetId,
        displayId,
        orderStatus,
        paymentStatus: paymentStat,
        isCod,
        name,
        email,
        phone,
        streetAddress,
        pincode,
        totalAmount,
        paymentMode,
        paymentId,
        dateVal,
        items: allorder.products || allorder.items || allorder.cart || [],
        isCustom: Boolean(allorder.isCustom),
        image: allorder.image,
        itemInfo: allorder.itemInfo,
    };
}

/**
 * Get distinct status badge style without background fill for maximum clarity
 */
export function getStatusBadge(status) {
    let s = (status || 'PLACED').toUpperCase().trim();
    if (s === 'ORDER PLACED' || s === 'ORDER_PLACED') s = 'PLACED';
    if (s === 'ORDER CANCELLED' || s === 'ORDER_CANCELLED') s = 'CANCELLED';
    if (s === 'ORDER DELIVERED' || s === 'ORDER_DELIVERED') s = 'DELIVERED';
    if (s === 'ORDER SHIPPED' || s === 'ORDER_SHIPPED') s = 'SHIPPED';

    switch (s) {
        case "DELIVERED":
            return {
                label: "Delivered",
                icon: <FaCheckCircle className="text-emerald-500" size={11} />,
                className: "bg-transparent text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/30"
            };
        case "OUT_FOR_DELIVERY":
            return {
                label: "Out For Delivery",
                icon: <FaTruck className="text-amber-500" size={11} />,
                className: "bg-transparent text-amber-600 dark:text-amber-400 font-extrabold border border-amber-500/30"
            };
        case "SHIPPED":
        case "IN_TRANSIT":
            return {
                label: "Shipped",
                icon: <FaTruck className="text-sky-500" size={11} />,
                className: "bg-transparent text-sky-600 dark:text-sky-400 font-extrabold border border-sky-500/30"
            };
        case "PACKED":
            return {
                label: "Packed",
                icon: <FaBoxOpen className="text-purple-500" size={11} />,
                className: "bg-transparent text-purple-600 dark:text-purple-400 font-extrabold border border-purple-500/30"
            };
        case "CONFIRMED":
            return {
                label: "Confirmed",
                icon: <FaCheckCircle className="text-indigo-500" size={11} />,
                className: "bg-transparent text-indigo-600 dark:text-indigo-400 font-extrabold border border-indigo-500/30"
            };
        case "PLACED":
            return {
                label: "Placed",
                icon: <FaClock className="text-blue-500 animate-pulse" size={11} />,
                className: "bg-transparent text-blue-600 dark:text-blue-400 font-extrabold border border-blue-500/30"
            };
        case "PAYMENT_PENDING":
            return {
                label: "Payment Pending",
                icon: <FaClock className="text-amber-500 animate-pulse" size={11} />,
                className: "bg-transparent text-amber-600 dark:text-amber-400 font-extrabold border border-amber-500/30"
            };
        case "CANCELLED":
            return {
                label: "Cancelled",
                icon: <FaTimesCircle className="text-rose-500" size={11} />,
                className: "bg-transparent text-rose-600 dark:text-rose-400 font-extrabold border border-rose-500/30"
            };
        default:
            return {
                label: status.replace(/_/g, " "),
                icon: <FaClock className="text-text-muted" size={11} />,
                className: "bg-transparent text-text-muted font-extrabold border border-border-subtle"
            };
    }
}
