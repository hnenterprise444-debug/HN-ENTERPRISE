import React from 'react';
import { FaShoppingBag, FaArrowRight } from 'react-icons/fa';
import { normalizeOrder } from '../../orders/tableComponents/orderHelpers';
import StatusBadge from '../../Components/common/StatusBadge';

/**
 * RecentOrdersTable Component
 * Quick preview table of the top 5 most recent orders on the dashboard.
 * Uses shared StatusBadge component for high contrast visibility.
 */
export default function RecentOrdersTable({ orders = [], onViewAll }) {
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="bg-card border border-border-subtle rounded-2xl p-5 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <FaShoppingBag size={14} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-text-base">Recent Orders</h3>
            <p className="text-[10px] text-text-muted">Latest purchases placed in store</p>
          </div>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            <span>View All</span>
            <FaArrowRight size={10} />
          </button>
        )}
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-border-subtle text-[10px] text-text-muted uppercase font-extrabold tracking-wider">
              <th className="py-2.5 px-3">Order ID</th>
              <th className="py-2.5 px-3">Customer</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-semibold">
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-text-muted font-bold">
                  No orders placed yet.
                </td>
              </tr>
            ) : (
              recentOrders.map((ord) => {
                const norm = normalizeOrder(ord);

                return (
                  <tr key={ord.id || norm.targetId} className="hover:bg-card-hover transition-colors">
                    <td className="py-3 px-3 font-mono font-extrabold text-text-base text-xs">
                      #{norm.displayId.slice(0, 10)}
                    </td>
                    <td className="py-3 px-3 max-w-[140px] truncate text-text-base" title={norm.name}>
                      {norm.name}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <StatusBadge status={norm.orderStatus} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right font-black text-text-base">
                      ₹{norm.totalAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
