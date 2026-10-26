import React, { useState } from "react";
import OrderDetailTable from "./OrderDetailTable";
import useOrdersQuery from "../../hooks/order/useOrdersQuery";

/**
 * Orders Component (Admin Orders Page)
 * Container component for admin orders management using TanStack Query + Firestore cursor pagination.
 * Zero duplicate reads and zero onSnapshot collection streams.
 */
function Orders({ mode, formatDate }) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pageSize, setPageSize] = useState(10);

  const {
    orders,
    hasMore,
    isLoading,
    isFetching,
    pageIndex,
    goNext,
    goPrev,
    refetch
  } = useOrdersQuery({
    statusFilter,
    pageSize,
  });

  return (
    <div className="space-y-4 px-4 md:px-0">
      <OrderDetailTable
        mode={mode}
        order={orders}
        loading={isLoading}
        formatDate={formatDate}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        pageIndex={pageIndex}
        hasMore={hasMore}
        isFetching={isFetching}
        onPrev={goPrev}
        onNext={goNext}
        onRefresh={refetch}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}

export default Orders;

