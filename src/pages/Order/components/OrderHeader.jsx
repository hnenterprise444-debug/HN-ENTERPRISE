import React from "react";
import { FaShoppingBag } from "react-icons/fa";

function OrderHeader({ totalOrders = 0 }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xl shadow-xs shrink-0">
          <FaShoppingBag />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-text-base tracking-tight">
              My Orders
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black">
              {totalOrders} {totalOrders === 1 ? "Order" : "Orders"}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Track active shipments, view order history details, and manage your purchases.
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrderHeader;
