import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaCalendarAlt, FaChartBar, FaExternalLinkAlt, FaTimes } from "react-icons/fa";
import CouponStats from "./sections/CouponsStats";
import CouponTable from "./sections/CouponTable";
import DeleteCoupon from "./sections/DeleteCoupon";
import { toast } from "react-toastify";
import Header from "../Components/Header";
import FilterBar from "../Components/FilterBar";
import { couponService } from "../../services/coupon/couponService";
import useCouponsQuery from "../../hooks/coupon/useCouponsQuery";

/**
 * Determines the reason(s) a coupon is expired.
 * Returns an array of { type, message, fix } objects.
 */
function getExpiredReasons(coupon) {
    const reasons = [];
    const now = new Date();

    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
        reasons.push({
            type: "DATE",
            icon: "📅",
            label: "Validity date has passed",
            detail: `This coupon expired on ${new Date(coupon.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}.`,
            fix: "Extend the end date to a future date.",
        });
    }

    if (
        coupon.usageLimit != null &&
        coupon.currentUsage != null &&
        Number(coupon.currentUsage) >= Number(coupon.usageLimit)
    ) {
        reasons.push({
            type: "USAGE",
            icon: "📊",
            label: "Usage limit reached",
            detail: `This coupon has been redeemed ${coupon.currentUsage} / ${coupon.usageLimit} times.`,
            fix: "Increase the total usage limit.",
        });
    }

    return reasons;
}

function Coupons() {
    const navigate = useNavigate();

    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Expired-reason modal state
    const [expiredModalCoupon, setExpiredModalCoupon] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");

    const { coupons, isLoading: loading, invalidate } = useCouponsQuery();

    const handleToggleStatus = async (couponToToggle) => {
        if (!couponToToggle) return;
        const targetId = couponToToggle.couponId || couponToToggle.id;
        if (!targetId) return;

        const isCurrentlyExpiredByDate =
            couponToToggle.validUntil && new Date(couponToToggle.validUntil) < new Date();
        const isCurrentlyExpiredByUsage =
            couponToToggle.usageLimit != null &&
            couponToToggle.currentUsage != null &&
            Number(couponToToggle.currentUsage) >= Number(couponToToggle.usageLimit);

        // If the coupon is expired (by date or usage), block the toggle and
        // show the reason modal so admin can fix the root cause first.
        if (isCurrentlyExpiredByDate || isCurrentlyExpiredByUsage) {
            setExpiredModalCoupon(couponToToggle);
            return;
        }

        const newStatus = !(couponToToggle.isActive !== false);
        try {
            await couponService.toggleCouponStatus(targetId, newStatus);
            toast.success(`Coupon "${couponToToggle.code}" marked as ${newStatus ? "Active" : "Inactive"}!`);
            invalidate();
        } catch (err) {
            console.error("Failed to toggle coupon status:", err);
            toast.error("Failed to update status");
        }
    };

    const handleDeleteClick = (coupon) => {
        setSelectedCoupon(coupon);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedCoupon) return;
        setDeleting(true);
        const targetId = selectedCoupon.couponId || selectedCoupon.id;
        try {
            await couponService.deleteCoupon(targetId);
            toast.success("Coupon deleted successfully!");
            setIsDeleteModalOpen(false);
            setSelectedCoupon(null);
            invalidate();
        } catch (err) {
            console.error("Error deleting coupon:", err);
            toast.error("Failed to delete coupon");
        } finally {
            setDeleting(false);
        }
    };

    const filteredCoupons = coupons.filter((coupon) => {
        const searchLower = search.toLowerCase();
        const matchesSearch =
            !search ||
            coupon.code?.toLowerCase().includes(searchLower) ||
            coupon.appliesTo?.toLowerCase().includes(searchLower);

        const isExpired =
            (coupon.validUntil && new Date(coupon.validUntil) < new Date()) ||
            (coupon.usageLimit != null &&
                coupon.currentUsage != null &&
                Number(coupon.currentUsage) >= Number(coupon.usageLimit));

        const matchesStatus =
            statusFilter === "ALL" ||
            (statusFilter === "EXPIRED" && isExpired) ||
            (statusFilter === "ACTIVE" && !isExpired && coupon.isActive !== false) ||
            (statusFilter === "INACTIVE" && !isExpired && coupon.isActive === false);

        const matchesType = typeFilter === "ALL" || coupon.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    const filterConfig = [
        {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
                { value: "ALL", label: "All Status" },
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
                { value: "EXPIRED", label: "Expired" },
            ],
        },
        {
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
                { value: "ALL", label: "All Types" },
                { value: "PERCENTAGE", label: "Percentage" },
                { value: "FIXED", label: "Fixed Amount" },
            ],
        },
    ];

    const expiredReasons = expiredModalCoupon ? getExpiredReasons(expiredModalCoupon) : [];

    return (
        <div className="space-y-6 lg:space-y-5 px-4 md:px-0">
            <Header
                title="Coupon & Discount Management"
                description="Create promo codes, manage usage caps, set discount values, and monitor active campaigns."
                icon={<FaPlus size={14} />}
                buttonText="Add Coupon"
                clickhandler={() => navigate("/coupons/add")}
            />

            <CouponStats coupons={coupons} />

            <FilterBar
                search={search}
                setSearch={setSearch}
                searchPlaceholder="Search coupons by promo code, target item..."
                filters={filterConfig}
            />

            <CouponTable
                coupons={filteredCoupons}
                loading={loading}
                onEdit={(coupon) =>
                    navigate(`/coupons/edit/${coupon.couponId || coupon.id}`, {
                        state: { coupon },
                    })
                }
                onDelete={handleDeleteClick}
                onToggleStatus={handleToggleStatus}
            />

            <DeleteCoupon
                open={isDeleteModalOpen}
                coupon={selectedCoupon}
                deleting={deleting}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedCoupon(null);
                }}
                onDelete={handleConfirmDelete}
            />

            {/* ── Expired Coupon Reason Modal ───────────────────────────────────── */}
            {expiredModalCoupon && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-2xl border border-border-subtle shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                        {/* Header */}
                        <div className="flex items-start justify-between p-5 border-b border-border-subtle bg-rose-500/10">
                            <div>
                                <h2 className="text-sm font-black text-rose-400 flex items-center gap-2">
                                    ⚠️ Coupon Cannot Be Activated
                                </h2>
                                <p className="text-[11px] text-text-muted mt-0.5">
                                    <span className="font-black text-text-base">{expiredModalCoupon.code}</span> is expired. Fix the issue(s) below before re-activating.
                                </p>
                            </div>
                            <button
                                onClick={() => setExpiredModalCoupon(null)}
                                className="p-1.5 rounded-xl text-text-muted hover:bg-card-hover transition cursor-pointer ml-4"
                            >
                                <FaTimes size={13} />
                            </button>
                        </div>

                        {/* Reasons */}
                        <div className="p-5 space-y-3">
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                                Why is it expired?
                            </p>

                            {expiredReasons.map((reason, i) => (
                                <div
                                    key={i}
                                    className="flex gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20"
                                >
                                    <span className="text-xl leading-none mt-0.5">{reason.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-rose-400">{reason.label}</p>
                                        <p className="text-[11px] text-text-muted mt-0.5">{reason.detail}</p>
                                        <p className="text-[11px] font-semibold text-primary mt-1.5">
                                            👉 {reason.fix}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {expiredReasons.length === 0 && (
                                <p className="text-xs text-text-muted">No specific expiry reason detected.</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="px-5 pb-5 flex items-center gap-3">
                            <button
                                onClick={() => setExpiredModalCoupon(null)}
                                className="flex-1 h-10 rounded-xl border border-border-subtle font-bold text-xs text-text-base hover:bg-card-hover transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const id = expiredModalCoupon.couponId || expiredModalCoupon.id;
                                    setExpiredModalCoupon(null);
                                    navigate(`/coupons/edit/${id}`, { state: { coupon: expiredModalCoupon } });
                                }}
                                className="flex-1 h-10 rounded-xl bg-primary text-compli font-extrabold text-xs hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                            >
                                <FaExternalLinkAlt size={11} />
                                Edit Coupon to Fix
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Coupons;