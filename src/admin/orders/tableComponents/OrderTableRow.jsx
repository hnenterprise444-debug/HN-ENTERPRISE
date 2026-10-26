import React from "react";
import { FaCopy, FaCheck, FaArrowRight } from "react-icons/fa";
import { normalizeOrder, formatTableDateTime, formatItemsSummary } from "./orderHelpers";
import StatusBadge from "../../Components/common/StatusBadge";

function OrderTableRow({ allorder, index, formatDate, copiedId, onCopy, onNavigate }) {
  const norm = normalizeOrder(allorder);
  const formattedDateTime = formatTableDateTime(norm.dateVal);
  const itemsSummary = formatItemsSummary(norm.items, norm.isCustom, norm.itemInfo);

  return (
    <tr
      onClick={() => norm.targetId && onNavigate(norm.targetId)}
      className="hover:bg-card-hover transition-all duration-150 align-middle cursor-pointer group text-xs text-text-base border-b border-border-subtle/60 last:border-b-0"
    >
      {/* Order ID */}
      <td className="px-5 py-4 font-mono font-black text-text-base">
        <div className="flex items-center gap-1.5 group-hover:text-primary transition-colors">
          <span>#{norm.displayId}</span>
          <button
            type="button"
            onClick={(e) => onCopy(e, norm.displayId, `desk-${index}`)}
            className="text-text-muted hover:text-primary transition p-1 cursor-pointer"
            title="Copy Order ID"
          >
            {copiedId === `desk-${index}` ? (
              <FaCheck className="text-emerald-500" size={11} />
            ) : (
              <FaCopy size={11} />
            )}
          </button>
        </div>
      </td>

      {/* Customer Name */}
      <td className="px-5 py-4 font-extrabold text-text-base whitespace-nowrap">
        {norm.name}
      </td>

      {/* Items Summary (e.g. T-Shirt (+2)) */}
      <td className="px-5 py-4 font-bold text-text-base">
        <div className="flex items-center gap-2">
          <span className="truncate max-w-[220px]">{itemsSummary}</span>
        </div>
      </td>

      {/* Total Price */}
      <td className="px-5 py-4 font-black text-sm text-primary whitespace-nowrap">
        ₹{norm.totalAmount.toLocaleString("en-IN")}
      </td>

      {/* Status Badge */}
      <td className="px-5 py-4 whitespace-nowrap">
        <StatusBadge status={norm.orderStatus} />
      </td>

      {/* Order Date & Time (e.g. Aug 2, 6:16 PM) */}
      <td className="px-5 py-4 text-text-muted font-bold whitespace-nowrap text-xs">
        {formattedDateTime}
      </td>

      {/* Action Arrow */}
      <td className="px-5 py-4 text-center whitespace-nowrap">
        <button
          type="button"
          onClick={() => norm.targetId && onNavigate(norm.targetId)}
          className="w-8 h-8 rounded-full bg-card hover:bg-primary hover:text-compli border border-border-subtle flex items-center justify-center text-text-muted transition-all duration-200 group-hover:translate-x-0.5 shadow-2xs mx-auto cursor-pointer"
          title="View Order Details"
        >
          <FaArrowRight size={11} />
        </button>
      </td>
    </tr>
  );
}

export default OrderTableRow;
