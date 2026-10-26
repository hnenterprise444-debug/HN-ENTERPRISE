import React, { useState, useMemo } from "react";
import useOrders from "../../hooks/order/useOrders";
import OrderHeader from "./components/OrderHeader";
import OrderFilterBar from "./components/OrderFilterBar";
import OrderCard from "./components/OrderCard";
import OrderDetailsModal from "./components/OrderDetailsModal";
import EmptyOrdersState from "./components/EmptyOrdersState";

function Order() {
  const { orders, loading, refetch } = useOrders();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedModalOrder, setSelectedModalOrder] = useState(null);

  // Helper status normalizer
  const getNormalizedStatus = (order) => {
    const st = (order.orderStatus || order.status || "PLACED").toUpperCase();
    if (st === "DELIVERED") return "DELIVERED";
    if (st === "SHIPPED" || st === "IN_TRANSIT") return "SHIPPED";
    if (st === "CANCELLED") return "CANCELLED";
    return "PROCESSING";
  };

  // Compute tab counts
  const tabCounts = useMemo(() => {
    const counts = { ALL: orders.length, PROCESSING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 };
    orders.forEach((ord) => {
      const norm = getNormalizedStatus(ord);
      if (counts[norm] !== undefined) {
        counts[norm] += 1;
      }
    });
    return counts;
  }, [orders]);

  // Filter orders by search & tab
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const normStatus = getNormalizedStatus(ord);
      const matchTab = activeTab === "ALL" || normStatus === activeTab;

      if (!matchTab) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const orderId = (ord.orderId || ord.docId || ord.id || "").toLowerCase();
      const statusStr = normStatus.toLowerCase();

      const items = Array.isArray(ord.products) ? ord.products : (Array.isArray(ord.items) ? ord.items : []);
      const itemTitleMatch = items.some((it) =>
        (it.productName || it.title || it.name || "").toLowerCase().includes(q)
      );

      const customTitleMatch = ord.itemInfo?.selectedDrawingType?.toLowerCase().includes(q);

      return orderId.includes(q) || statusStr.includes(q) || itemTitleMatch || customTitleMatch;
    });
  }, [orders, activeTab, searchQuery]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6 min-h-[75vh]">
      {/* Header */}
      <OrderHeader totalOrders={orders.length} />

      {/* Filters & Search */}
      {orders.length > 0 && (
        <OrderFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabCounts={tabCounts}
        />
      )}

      {/* Main Content Area */}
      {loading ? (
        /* Skeleton Loaders */
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-44 rounded-2xl bg-card border border-border-subtle p-6 animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-32 bg-border-subtle/50 rounded" />
                <div className="h-6 w-20 bg-border-subtle/50 rounded-full" />
              </div>
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-border-subtle/50 rounded-lg" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-2/3 bg-border-subtle/50 rounded" />
                  <div className="h-3 w-1/3 bg-border-subtle/50 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        /* No Orders At All */
        <EmptyOrdersState isSearch={false} />
      ) : filteredOrders.length === 0 ? (
        /* No Orders Matching Filter/Search */
        <EmptyOrdersState
          isSearch={true}
          onClearSearch={() => {
            setSearchQuery("");
            setActiveTab("ALL");
          }}
        />
      ) : (
        /* Orders List */
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.orderId || order.docId || order.id || Math.random()}
              order={order}
              onViewDetails={(ord) => setSelectedModalOrder(ord)}
            />
          ))}
        </div>
      )}

      {/* Order Details Modal Popup */}
      <OrderDetailsModal
        open={Boolean(selectedModalOrder)}
        onClose={() => setSelectedModalOrder(null)}
        order={selectedModalOrder}
      />
    </div>
  );
}

export default Order;