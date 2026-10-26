import React from 'react';
import { 
  FaCheckCircle, FaTruck, FaBoxOpen, FaClock, 
  FaTimesCircle, FaShieldAlt, FaUser, FaExclamationTriangle, FaCheck, FaCrown, FaMoneyBillWave
} from 'react-icons/fa';

/**
 * Reusable StatusBadge Component
 * Admin design component used across all tables and preview cards for Orders, Products, Users, Stock, and Coupons.
 * Enforces crisp contrast, high legibility, transparent border-only backgrounds, and clean font-semibold weight.
 */
export default function StatusBadge({
  status = '',
  label,
  icon,
  size = 'md', // 'sm' | 'md' | 'lg'
  variant = 'outline', // 'outline' | 'subtle'
  className = '',
}) {
  const normStatus = String(status || '').toUpperCase().trim().replace(/[\s_-]+/g, '_');

  let defaultLabel = label;
  let defaultIcon = icon;
  let badgeColorClasses = '';

  // Size mapping
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[9.5px]',
    md: 'px-2.5 py-1 text-[10.5px]',
    lg: 'px-3 py-1.5 text-xs',
  }[size] || 'px-2.5 py-1 text-[10.5px]';

  const iconSize = size === 'sm' ? 10 : size === 'lg' ? 13 : 11;

  switch (normStatus) {
    // ── Order Statuses ──────────────────────────────────────────────────────────
    case 'DELIVERED':
    case 'ORDER_DELIVERED':
      defaultLabel = defaultLabel || 'Delivered';
      defaultIcon = defaultIcon || <FaCheckCircle className="text-emerald-500" size={iconSize} />;
      badgeColorClasses = 'bg-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
      break;

    case 'OUT_FOR_DELIVERY':
      defaultLabel = defaultLabel || 'Out For Delivery';
      defaultIcon = defaultIcon || <FaTruck className="text-amber-500" size={iconSize} />;
      badgeColorClasses = 'bg-transparent text-amber-600 dark:text-amber-400 border border-amber-500/30';
      break;

    case 'SHIPPED':
    case 'IN_TRANSIT':
    case 'ORDER_SHIPPED':
      defaultLabel = defaultLabel || 'Shipped';
      defaultIcon = defaultIcon || <FaTruck className="text-sky-500" size={iconSize} />;
      badgeColorClasses = 'bg-transparent text-sky-600 dark:text-sky-400 border border-sky-500/30';
      break;

    case 'PACKED':
      defaultLabel = defaultLabel || 'Packed';
      defaultIcon = defaultIcon || <FaBoxOpen className="text-purple-500" size={iconSize} />;
      badgeColorClasses = 'bg-transparent text-purple-600 dark:text-purple-400 border border-purple-500/30';
      break;

    case 'CONFIRMED':
      defaultLabel = defaultLabel || 'Confirmed';
      defaultIcon = defaultIcon || <FaCheckCircle className="text-indigo-500" size={iconSize} />;
      badgeColorClasses = 'bg-transparent text-indigo-600 dark:text-indigo-400 border border-indigo-500/30';
      break;

    case 'PLACED':
    case 'ORDER_PLACED':
      defaultLabel = defaultLabel || 'Placed';
      defaultIcon = defaultIcon || <FaClock className="text-blue-500 animate-pulse" size={iconSize} />;
      badgeColorClasses = 'bg-transparent text-blue-600 dark:text-blue-400 border border-blue-500/30';
      break;

    case 'PAYMENT_PENDING':
    case 'PENDING':
      defaultLabel = defaultLabel || 'Payment Pending';
      defaultIcon = defaultIcon || <FaClock className="text-amber-500 animate-pulse" size={iconSize} />;
      badgeColorClasses = 'bg-transparent text-amber-600 dark:text-amber-400 border border-amber-500/30';
      break;

    case 'COD':
    case 'CASH_ON_DELIVERY':
      defaultLabel = defaultLabel || 'Cash on Delivery';
      defaultIcon = defaultIcon || <FaMoneyBillWave className="text-amber-500" size={iconSize} />;
      badgeColorClasses = 'bg-transparent text-amber-600 dark:text-amber-400 border border-amber-500/30';
      break;

    case 'CANCELLED':
    case 'REFUNDED':
    case 'ORDER_CANCELLED':
      defaultLabel = defaultLabel || 'Cancelled';
      defaultIcon = defaultIcon || <FaTimesCircle className="text-rose-500" size={iconSize} />;
      badgeColorClasses = 'bg-transparent text-rose-600 dark:text-rose-400 border border-rose-500/30';
      break;

    // ── Stock Statuses ──────────────────────────────────────────────────────────
    case 'OUT_OF_STOCK':
      defaultLabel = defaultLabel || 'Out of Stock';
      defaultIcon = defaultIcon || <FaTimesCircle className="text-rose-500" size={iconSize} />;
      badgeColorClasses = 'bg-transparent text-rose-600 dark:text-rose-400 border border-rose-500/30';
      break;

    case 'LOW_STOCK':
      defaultLabel = defaultLabel || (label ? label : 'Low Stock');
      defaultIcon = defaultIcon || <FaExclamationTriangle className="text-amber-500" size={iconSize} />;
      badgeColorClasses = 'bg-transparent text-amber-600 dark:text-amber-400 border border-amber-500/30';
      break;

    case 'IN_STOCK':
      defaultLabel = defaultLabel || (label ? label : 'In Stock');
      defaultIcon = defaultIcon || <FaCheck className="text-emerald-500" size={iconSize} />;
      badgeColorClasses = 'bg-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
      break;

    // ── Role Statuses ───────────────────────────────────────────────────────────
    case 'SUPERADMIN':
    case 'OWNER':
      defaultLabel = defaultLabel || 'SUPERADMIN';
      defaultIcon = defaultIcon || <FaCrown className="text-amber-500" size={iconSize} />;
      badgeColorClasses = 'bg-transparent text-amber-600 dark:text-amber-400 border border-amber-500/40';
      break;

    case 'ADMIN':
      defaultLabel = defaultLabel || 'ADMIN';
      defaultIcon = defaultIcon || <FaShieldAlt className="text-purple-500" size={iconSize} />;
      badgeColorClasses = 'bg-transparent text-purple-600 dark:text-purple-400 border border-purple-500/30';
      break;

    case 'USER':
    case 'CUSTOMER':
      defaultLabel = defaultLabel || 'USER';
      defaultIcon = defaultIcon || <FaUser className="text-blue-500" size={iconSize} />;
      badgeColorClasses = 'bg-transparent text-blue-600 dark:text-blue-400 border border-blue-500/30';
      break;

    // ── Product / Coupon Active Statuses ────────────────────────────────────────
    case 'LIVE':
      defaultLabel = defaultLabel || 'Live';
      defaultIcon = defaultIcon || <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />;
      badgeColorClasses = 'bg-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
      break;

    case 'ACTIVE':
      defaultLabel = defaultLabel || 'Active';
      defaultIcon = defaultIcon || <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />;
      badgeColorClasses = 'bg-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
      break;

    case 'DRAFT':
      defaultLabel = defaultLabel || 'Draft';
      defaultIcon = defaultIcon || <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />;
      badgeColorClasses = 'bg-transparent text-amber-600 dark:text-amber-400 border border-amber-500/30';
      break;

    case 'INACTIVE':
      defaultLabel = defaultLabel || 'Inactive';
      defaultIcon = defaultIcon || <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />;
      badgeColorClasses = 'bg-transparent text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700';
      break;

    case 'EXPIRED':
      defaultLabel = defaultLabel || 'Expired';
      defaultIcon = defaultIcon || <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />;
      badgeColorClasses = 'bg-transparent text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700';
      break;

    default:
      defaultLabel = defaultLabel || status.replace(/_/g, ' ');
      badgeColorClasses = 'bg-transparent text-text-muted border border-border-subtle';
      break;
  }

  return (
    <span
      className={`rounded-full font-semibold inline-flex items-center gap-1.5 whitespace-nowrap ${sizeClasses} ${badgeColorClasses} ${className}`}
    >
      {defaultIcon}
      <span>{defaultLabel}</span>
    </span>
  );
}
