import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../Components/Header';
import FilterBar from '../Components/FilterBar';
import OrderMobileCard from './tableComponents/OrderMobileCard';
import OrderTableRow from './tableComponents/OrderTableRow';
import { normalizeOrder } from './tableComponents/orderHelpers';
import { toast } from 'react-toastify';
import { FaClock } from 'react-icons/fa';
import TableSkeleton from '../../components/loader/SkeletonLoader/TableSkeleton';
import Pagination from '../../components/Common/Pagination';
import CursorPagination from '../../components/Common/CursorPagination';
import ToggleButton from '../../components/Common/ToggleButton';
import useDebounce from '../../hooks/common/useDebounce';
import { dashboardService } from '../../services/dashboard/dashboardService';
import { queryKeys } from '../../utils/queryKeys';

/**
 * OrderDetailTable Component
 * Redesigned clean, informative Admin Orders Table with skeleton loading and pagination.
 */
function OrderDetailTable({ 
    mode, 
    order = [], 
    loading = false, 
    formatDate,
    statusFilter: propStatusFilter,
    setStatusFilter: propSetStatusFilter,
    // Cursor Pagination Props
    pageIndex,
    hasMore,
    isFetching,
    onPrev,
    onNext,
    onRefresh,
    pageSize: propPageSize,
    onPageSizeChange,
}) {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);
    
    // Internal statusFilter state fallback if not controlled by parent
    const [internalStatusFilter, setInternalStatusFilter] = useState('ALL');
    const statusFilter = propStatusFilter !== undefined ? propStatusFilter : internalStatusFilter;
    const setStatusFilter = propSetStatusFilter || setInternalStatusFilter;

    const [paymentFilter, setPaymentFilter] = useState('ALL');
    const [showPendingOrders, setShowPendingOrders] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    // Fetch system-wide aggregation count metrics (0 document reads)
    const { data: stats } = useQuery({
        queryKey: queryKeys.dashboard.stats,
        queryFn: () => dashboardService.getStats(),
        staleTime: 60 * 1000,
    });

    // Internal pagination state fallback
    const [currentPage, setCurrentPage] = useState(1);
    const [internalPageSize, setInternalPageSize] = useState(10);

    const isCursorPaginated = typeof pageIndex === 'number';
    const activePageSize = propPageSize || internalPageSize;

    const handleCopy = (e, text, id) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleNavigate = (targetId) => {
        if (targetId) {
            navigate(`/admin/order/${targetId}`);
        }
    };

    // Helper to check if order is pending payment (incomplete/failed checkout sessions)
    const checkIsPending = (norm) => {
        return norm.orderStatus === 'PAYMENT_PENDING';
    };

    // Real pending count from server stats or fallback to local count
    const localPendingCount = useMemo(() => {
        return order.filter((o) => {
            const norm = normalizeOrder(o);
            return checkIsPending(norm);
        }).length;
    }, [order]);

    const pendingCount = stats?.pendingOrders ?? localPendingCount;
    const isPendingToggleActive = statusFilter === 'PAYMENT_PENDING' || showPendingOrders;

    const handlePendingToggle = (checked) => {
        setShowPendingOrders(checked);
        if (checked) {
            setStatusFilter('PAYMENT_PENDING');
        } else {
            setStatusFilter('ALL');
        }
    };

    // Client-side filtering logic for text search and payment filter
    const filteredOrders = useMemo(() => {
        return order.filter((o) => {
            const norm = normalizeOrder(o);
            const isPending = checkIsPending(norm);

            // Hide incomplete payment pending sessions unless specifically viewing PAYMENT_PENDING
            if (!isPendingToggleActive && isPending && statusFilter !== 'PAYMENT_PENDING') {
                return false;
            }

            const searchLower = debouncedSearch.toLowerCase().trim();
            const matchSearch = !debouncedSearch ||
                norm.displayId.toLowerCase().includes(searchLower) ||
                norm.name.toLowerCase().includes(searchLower) ||
                norm.email.toLowerCase().includes(searchLower) ||
                norm.phone.toLowerCase().includes(searchLower) ||
                norm.paymentId.toLowerCase().includes(searchLower) ||
                norm.items.some((item) => (item.title || item.productName || item.name || '').toLowerCase().includes(searchLower));

            const matchStatus = isCursorPaginated ? true : (statusFilter === 'ALL' || norm.orderStatus === statusFilter);
            const matchPayment = paymentFilter === 'ALL' ||
                (paymentFilter === 'Online' && !norm.isCod) ||
                (paymentFilter === 'COD' && norm.isCod);

            return matchSearch && matchStatus && matchPayment;
        });
    }, [order, isPendingToggleActive, statusFilter, paymentFilter, debouncedSearch, isCursorPaginated]);

    // Reset to page 1 whenever any active filter or search changes
    useEffect(() => {
        if (!isCursorPaginated) {
            setCurrentPage(1);
        }
    }, [debouncedSearch, statusFilter, paymentFilter, showPendingOrders, isCursorPaginated]);

    const filtersConfig = [
        {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
                { value: "ALL", label: "All Status" },
                { value: "PLACED", label: "Placed" },
                { value: "CONFIRMED", label: "Confirmed" },
                { value: "SHIPPED", label: "Shipped" },
                { value: "DELIVERED", label: "Delivered" },
                { value: "PAYMENT_PENDING", label: "Payment Pending" },
                { value: "CANCELLED", label: "Cancelled" }
            ]
        },
        {
            value: paymentFilter,
            onChange: setPaymentFilter,
            options: [
                { value: "ALL", label: "All Payments" },
                { value: "Online", label: "Online Payment" },
                { value: "COD", label: "Cash On Delivery" }
            ]
        }
    ];

    if (loading) {
        return (
            <div className="space-y-5">
                <Header
                    title="Customer Orders Management"
                    description="Monitor customer orders, fulfillment statuses, customer details, and payment receipts."
                />
                <TableSkeleton rows={activePageSize} columns={7} />
            </div>
        );
    }

    // In cursor mode the server already handles page offset;
    // startIndex inside the client-filtered subset is always 0.
    const startIndex = isCursorPaginated ? 0 : (currentPage - 1) * activePageSize;
    const displayOrders = isCursorPaginated
        ? filteredOrders
        : filteredOrders.slice(startIndex, startIndex + activePageSize);

    // Suppress server's hasMore when the client-side filter produces 0 visible results.
    // Without this, the Next button stays enabled even when nothing is shown (e.g.
    // a payment/search filter hides every order on the current server page).
    const effectiveHasMore = isCursorPaginated
        ? (hasMore && filteredOrders.length > 0)
        : undefined;

    return (
        <div className="space-y-5 ">
            <Header
                title="Customer Orders Management"
                description="Monitor customer orders, fulfillment statuses, customer details, and payment receipts."
            />

            {/* Filter Bar & Show Pending Orders Toggle Row */}
            <FilterBar
                search={search}
                setSearch={setSearch}
                searchPlaceholder="Search within this page by Order ID, customer, items, or payment ID..."
                filters={filtersConfig}
            >
                {/* Show Pending Orders Toggle Card */}
                <div
                    className={`flex items-center justify-between gap-3 px-3 py-1.5 h-11 rounded-xl border transition-all duration-300 w-full sm:w-auto shrink-0 shadow-2xs ${
                        isPendingToggleActive
                            ? "border-amber-400/50 bg-amber-500/10 shadow-amber-500/10"
                            : "border-border-subtle bg-bg-base hover:border-primary/40"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-base tracking-tight whitespace-nowrap">
                            Pending Orders
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                            {pendingCount}
                        </span>
                    </div>

                    <ToggleButton
                        checked={isPendingToggleActive}
                        onChange={handlePendingToggle}
                        size="sm"
                        color="primary"
                        onLabel="ON"
                        offLabel="OFF"
                        labelPosition="left"
                    />
                </div>
            </FilterBar>

            {/* Mobile Responsive Cards */}
            <div className="block md:hidden space-y-4">
                {displayOrders.map((allorder, index) => (
                    <OrderMobileCard
                        key={allorder.docId || allorder.id || index}
                        allorder={allorder}
                        index={startIndex + index}
                        copiedId={copiedId}
                        onCopy={handleCopy}
                        onNavigate={handleNavigate}
                    />
                ))}

                {displayOrders.length === 0 && (
                    <div className="bg-card p-8 text-center text-text-muted rounded-2xl border border-border-subtle shadow-xs text-xs font-bold">
                        No orders found matching criteria.
                    </div>
                )}
            </div>

            {/* Desktop Data Table */}
            <div className="hidden md:block bg-card rounded-2xl border border-border-subtle shadow-xs overflow-hidden text-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border-subtle bg-bg-base text-text-muted text-[11px] font-black uppercase tracking-wider">
                                <th className="px-5 py-3.5 w-36">Order ID</th>
                                <th className="px-5 py-3.5 w-36">Customer</th>
                                <th className="px-5 py-3.5 font-black">Items</th>
                                <th className="px-5 py-3.5 w-28">Total Price</th>
                                <th className="px-5 py-3.5 w-32">Status</th>
                                <th className="px-5 py-3.5 w-40">Order Date</th>
                                <th className="px-5 py-3.5 w-16 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle/60 text-text-base">
                            {displayOrders.map((allorder, index) => (
                                <OrderTableRow
                                    key={allorder.docId || allorder.id || index}
                                    allorder={allorder}
                                    index={startIndex + index}
                                    formatDate={formatDate}
                                    copiedId={copiedId}
                                    onCopy={handleCopy}
                                    onNavigate={handleNavigate}
                                />
                            ))}

                            {displayOrders.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-text-muted font-bold text-xs">
                                        No orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {isCursorPaginated ? (
                <CursorPagination
                    pageIndex={pageIndex}
                    hasMore={effectiveHasMore}
                    isFetching={isFetching}
                    onPrev={onPrev}
                    onNext={onNext}
                    onRefresh={onRefresh}
                    pageSize={activePageSize}
                    onPageSizeChange={onPageSizeChange}
                />
            ) : (
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredOrders.length}
                    pageSize={activePageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(newSize) => {
                        setInternalPageSize(newSize);
                        setCurrentPage(1);
                    }}
                />
            )}
        </div>
    );
}

export default OrderDetailTable;

