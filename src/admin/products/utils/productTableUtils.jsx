import React from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import StatusBadge from '../../Components/common/StatusBadge';

/**
 * Product Table Utilities (Admin Products Module)
 * Helper functions for computing stock totals, price displays, date formatting, and table columns.
 */

/**
 * Calculates total stock for a product (handles single product stock and multi-variant stock arrays)
 */
export function getProductStockCount(item) {
  if (!item) return 0;
  const hasVariants = Boolean(item.hasVariants || (Array.isArray(item.variants) && item.variants.length > 0));
  if (hasVariants && Array.isArray(item.variants) && item.variants.length > 0) {
    return item.variants.reduce((acc, v) => {
      const stock = Number(v.inStock ?? v.stock ?? v.quantity ?? 0);
      return acc + (isNaN(stock) ? 0 : stock);
    }, 0);
  }
  const rootStock = Number(item.inStock ?? item.stock ?? item.quantity ?? item.totalStock ?? 0);
  return isNaN(rootStock) ? 0 : rootStock;
}

/**
 * Formats variant attributes into a readable label
 */
export function formatVariantLabel(variant, fallbackIndex = 0) {
  if (!variant) return `Variant ${fallbackIndex + 1}`;
  if (variant.attributes && typeof variant.attributes === 'object') {
    const entries = Object.entries(variant.attributes).filter(([_, v]) => v !== undefined && v !== '');
    if (entries.length > 0) {
      return entries.map(([k, v]) => `${k}: ${v}`).join(', ');
    }
  }
  return variant.title || variant.name || `Variant ${fallbackIndex + 1}`;
}

/**
 * Calculates complete variant inventory breakdown for a product
 */
export function getProductStockInfo(item) {
  if (!item) {
    return {
      totalStock: 0,
      hasVariants: false,
      variantCount: 0,
      variants: [],
      outOfStockVariants: [],
      lowStockVariants: [],
      inStockVariants: [],
      isAllOutOfStock: true,
      hasOutOfStockVariant: false,
      hasLowStockVariant: false,
    };
  }

  const hasVariants = Boolean(item.hasVariants || (Array.isArray(item.variants) && item.variants.length > 0));

  if (hasVariants && Array.isArray(item.variants) && item.variants.length > 0) {
    const totalVariants = item.variants.length;
    const outOfStockVariants = [];
    const lowStockVariants = [];
    const inStockVariants = [];
    let totalStock = 0;

    const mappedVariants = item.variants.map((v, idx) => {
      const stockVal = Number(v.inStock ?? v.stock ?? v.quantity ?? 0);
      const stock = isNaN(stockVal) ? 0 : stockVal;
      totalStock += stock;

      const label = formatVariantLabel(v, idx);
      const isOOS = stock <= 0;
      const isLow = !isOOS && stock <= 5;

      const detail = {
        ...v,
        label,
        stock,
        isOOS,
        isLow,
        index: idx,
      };

      if (isOOS) {
        outOfStockVariants.push(detail);
      } else if (isLow) {
        lowStockVariants.push(detail);
      } else {
        inStockVariants.push(detail);
      }

      return detail;
    });

    const isAllOutOfStock = totalStock <= 0 || outOfStockVariants.length === totalVariants;
    const hasOutOfStockVariant = outOfStockVariants.length > 0;
    const hasLowStockVariant = lowStockVariants.length > 0;

    return {
      totalStock,
      hasVariants: true,
      variantCount: totalVariants,
      variants: mappedVariants,
      outOfStockVariants,
      lowStockVariants,
      inStockVariants,
      isAllOutOfStock,
      hasOutOfStockVariant,
      hasLowStockVariant,
    };
  }

  // Single product (no variants)
  const rootStock = Number(item.inStock ?? item.stock ?? item.quantity ?? item.totalStock ?? 0);
  const totalStock = isNaN(rootStock) ? 0 : rootStock;
  const isAllOutOfStock = totalStock <= 0;

  return {
    totalStock,
    hasVariants: false,
    variantCount: 0,
    variants: [],
    outOfStockVariants: [],
    lowStockVariants: [],
    inStockVariants: [],
    isAllOutOfStock,
    hasOutOfStockVariant: false,
    hasLowStockVariant: !isAllOutOfStock && totalStock <= 5,
  };
}

/**
 * Calculates display price for a product (variant price or base price)
 */
export function getProductDisplayPrice(item) {
  if (!item) return 0;
  if (item.hasVariants && Array.isArray(item.variants) && item.variants.length > 0) {
    return item.variants[0].price;
  }
  return item.price;
}

/**
 * Gets props for rendering stock badge indicator using StatusBadge
 */
export function getStockBadgeProps(stockCount) {
  if (stockCount <= 0) {
    return {
      status: "OUT_OF_STOCK",
      size: "sm",
    };
  }
  if (stockCount <= 5) {
    return {
      status: "LOW_STOCK",
      label: `${stockCount} left`,
      size: "sm",
    };
  }
  return {
    status: "IN_STOCK",
    label: `${stockCount} in stock`,
    size: "sm",
  };
}

/**
 * Formats product creation dates safely
 */
export function formatProductDate(dateVal, formatDateFn) {
  if (typeof formatDateFn === 'function') {
    return formatDateFn(dateVal);
  }
  if (!dateVal) return 'N/A';
  if (typeof dateVal === 'string') return dateVal;
  if (typeof dateVal === 'number') return new Date(dateVal).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  if (dateVal?.seconds) return new Date(dateVal.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  if (dateVal instanceof Date) return dateVal.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return String(dateVal);
}

/**
 * Builds table column definitions for desktop view
 */
