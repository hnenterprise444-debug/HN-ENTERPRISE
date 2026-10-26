import React from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import StatusBadge from "../../Components/common/StatusBadge";
import ToggleButton from "../../../components/Common/ToggleButton";
import {
  getProductStockCount,
  getProductStockInfo,
  getProductDisplayPrice,
  getStockBadgeProps,
  formatProductDate,
} from "../utils/productTableUtils";
import VariantStockDropdown from "./VariantStockDropdown";

/**
 * ProductMobileCard Component (Admin Products Module)
 * Mobile responsive card component for rendering product table items on small screens.
 */
export default function ProductMobileCard({
  item,
  index,
  onEditClick,
  onDeleteClick,
  toggleActiveStatus,
  formatDate,
}) {
  const { title, price, category, isActive, date } = item;
  const imageUrl = item.imageUrl || item.images?.[0] || "https://via.placeholder.com/80";
  const isLive = isActive !== false;
  const stockInfo = getProductStockInfo(item);
  const displayPrice = getProductDisplayPrice(item) || price;
  const badgeProps = getStockBadgeProps(stockInfo.totalStock);

  return (
    <div
      key={index}
      className="group bg-card rounded-2xl border border-border-subtle shadow-xs hover:border-primary/40 transition-all duration-300 p-4"
    >
      <div className="flex gap-3">
        <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-border-subtle bg-bg-base shrink-0 flex items-center justify-center relative">
          <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-sm sm:text-base text-text-base line-clamp-2" title={title}>
              {title}
            </h3>
            <ToggleButton
              checked={isLive}
              onChange={() => toggleActiveStatus && toggleActiveStatus(item)}
              size="sm"
              color="success"
              onLabel="LIVE"
              offLabel="DRAFT"
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-primary border border-primary/30 text-[10px] font-semibold whitespace-nowrap">
              {category || "General"}
            </span>
            <StatusBadge {...badgeProps} />
            {stockInfo.hasVariants && (
              <VariantStockDropdown
                product={item}
                stockInfo={stockInfo}
                onEditClick={onEditClick}
              />
            )}
            <span className="text-base font-extrabold text-text-base ml-auto">
              ₹{Number(displayPrice || 0).toLocaleString("en-IN")}
            </span>
          </div>

          <p className="mt-2 text-xs text-text-muted">
            Added • {formatProductDate(date, formatDate)}
          </p>
        </div>
      </div>

      <div className="my-4 border-t border-border-subtle" />

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onEditClick && onEditClick(item)}
          className="h-11 rounded-xl bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/20 transition cursor-pointer"
        >
          <FaEdit size={14} /> Edit
        </button>
        <button
          type="button"
          onClick={() => onDeleteClick && onDeleteClick(item)}
          className="h-11 rounded-xl text-rose-500 font-semibold text-sm flex items-center justify-center cursor-pointer gap-2 hover:bg-rose-500/10 transition"
        >
          <FaTrash size={14} /> Delete
        </button>
      </div>
    </div>
  );
}
