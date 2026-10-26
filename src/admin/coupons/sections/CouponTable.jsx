import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaClock } from "react-icons/fa";
import TableSkeleton from "../../../components/loader/SkeletonLoader/TableSkeleton";
import Pagination from "../../../components/Common/Pagination";
import DataTable from '../../Components/common/DataTable';
import ToggleButton from '../../../components/Common/ToggleButton';

function CouponTable({
    coupons = [],
    loading = false,
    onEdit,
    onDelete,
    onToggleStatus,
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        setCurrentPage(1);
    }, [coupons.length]);

    /**
     * Returns "EXPIRED" | "INACTIVE" | "ACTIVE"
     * EXPIRED takes priority — an expired coupon must never appear as ACTIVE even if isActive=true.
     */
    const getCouponStatusKey = (coupon) => {
        if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) return "EXPIRED";
        if (coupon.isActive === false) return "INACTIVE";
        return "ACTIVE";
    };

    if (loading) {
        return <TableSkeleton rows={pageSize} columns={7} />;
    }

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedCoupons = coupons.slice(startIndex, startIndex + pageSize);

    const columns = [
        {
            key: "coupon",
            header: "Coupon Code",
            render: (coupon) => (
                <div>
                    <p className="font-bold text-text-base">{coupon.code}</p>
                    <p className="text-xs text-text-muted mt-0.5">Applies to: {coupon.appliesTo}</p>
                </div>
            ),
        },
        {
            key: "discount",
            header: "Discount",
            cellClassName: "font-bold",
            render: (coupon) =>
                coupon.type === "PERCENTAGE"
                    ? `${coupon.discountValue}% OFF`
                    : `₹${coupon.discountValue} OFF`,
        },
        {
            key: "minOrder",
            header: "Min Order",
            className: "hidden lg:table-cell",
            cellClassName: "text-text-muted hidden lg:table-cell",
            render: (coupon) => `₹${coupon.minimumOrderAmount}`,
        },
        {
            key: "usage",
            header: "Usage",
            cellClassName: "text-text-muted font-medium",
            render: (coupon) => `${coupon.currentUsage} / ${coupon.usageLimit}`,
        },
        {
            key: "validity",
            header: "Validity",
            render: (coupon) => {
                const isExpired = coupon.validUntil && new Date(coupon.validUntil) < new Date();
                return (
                    <div className="text-xs space-y-0.5">
                        <div>
                            From: <span className="font-semibold text-text-base">
                                {coupon.validFrom ? new Date(coupon.validFrom).toLocaleDateString() : "--"}
                            </span>
                        </div>
                        <div className={isExpired ? "text-rose-500" : "text-text-muted"}>
                            Until: <span className={`font-semibold ${isExpired ? "text-rose-600" : "text-text-base"}`}>
                                {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : "--"}
                                {isExpired && <span className="ml-1 text-[9px] font-black uppercase tracking-wide">(Expired)</span>}
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            key: "status",
            header: "Status",
            render: (coupon) => {
                const statusKey = getCouponStatusKey(coupon);

                if (statusKey === "EXPIRED") {
                    return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-black uppercase tracking-wider">
                            <FaClock size={9} />
                            EXPIRED
                        </span>
                    );
                }

                return (
                    <ToggleButton
                        checked={coupon.isActive !== false}
                        onChange={() => onToggleStatus && onToggleStatus(coupon)}
                        size="sm"
                        color="success"
                        onLabel="ACTIVE"
                        offLabel="INACTIVE"
                    />
                );
            },
        },
        {
            key: "actions",
            header: "Actions",
            align: "center",
            className: "text-center",
            cellClassName: "text-center",
            render: (coupon) => (
                <div className="flex items-center justify-center gap-1">
                    <button
                        onClick={() => onEdit(coupon)}
                        className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/10 rounded-xl transition cursor-pointer"
                        title="Edit Coupon"
                    >
                        <FaEdit size={15} />
                    </button>
                    <button
                        onClick={() => onDelete(coupon)}
                        className="w-8 h-8 flex items-center justify-center text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        title="Delete Coupon"
                        type="button"
                    >
                        <FaTrash size={13} />
                    </button>
                </div>
            ),
        },
    ];

    const mobileCardRender = (coupon) => {
        const statusKey = getCouponStatusKey(coupon);
        const isExpired = statusKey === "EXPIRED";

        return (
            <div key={coupon.couponId || coupon.id} className="bg-card p-5 rounded-2xl border border-border-subtle shadow-xs space-y-4">
                <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-sm text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                        {coupon.code}
                    </span>

                    {isExpired ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-wider">
                            <FaClock size={9} />
                            EXPIRED
                        </span>
                    ) : (
                        <ToggleButton
                            checked={coupon.isActive !== false}
                            onChange={() => onToggleStatus && onToggleStatus(coupon)}
                            size="sm"
                            color="success"
                            onLabel="ACTIVE"
                            offLabel="INACTIVE"
                        />
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 bg-bg-base p-3.5 rounded-xl text-xs border border-border-subtle/40">
                    <div>
                        <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Discount</span>
                        <span className="font-bold text-text-base text-sm mt-0.5 block">
                            {coupon.type === "PERCENTAGE" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                        </span>
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Min Order</span>
                        <span className="font-bold text-text-base text-sm mt-0.5 block">₹{coupon.minimumOrderAmount}</span>
                    </div>
                    <div className="mt-2">
                        <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Usage</span>
                        <span className="font-bold text-text-base mt-0.5 block">{coupon.currentUsage} / {coupon.usageLimit}</span>
                    </div>
                    <div className="mt-2">
                        <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">Applies To</span>
                        <span className="font-bold text-text-base mt-0.5 block truncate">{coupon.appliesTo}</span>
                    </div>
                </div>

                <div className="text-xs text-text-muted flex justify-between gap-2 pl-1">
                    <div>From: <span className="font-semibold text-text-base">{coupon.validFrom ? new Date(coupon.validFrom).toLocaleDateString() : "--"}</span></div>
                    <div className={isExpired ? "text-rose-400" : ""}>
                        Until: <span className={`font-semibold ${isExpired ? "text-rose-400" : "text-text-base"}`}>
                            {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : "--"}
                        </span>
                    </div>
                </div>

                <div className="border-t border-border-subtle my-2"></div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onEdit(coupon)}
                        className="flex-1 h-10 flex items-center justify-center gap-2 text-primary bg-primary/10 hover:bg-primary/20 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                        <FaEdit size={14} />
                        <span>Edit</span>
                    </button>
                    <button
                        onClick={() => onDelete(coupon)}
                        className="flex-1 h-10 flex items-center justify-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                        <FaTrash size={12} />
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full space-y-4">
            <DataTable
                columns={columns}
                data={paginatedCoupons}
                emptyMessage="No Coupons Found"
                mobileCardRender={mobileCardRender}
            />

            <Pagination
                currentPage={currentPage}
                totalItems={coupons.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setCurrentPage(1);
                }}
            />
        </div>
    );
}

export default CouponTable;