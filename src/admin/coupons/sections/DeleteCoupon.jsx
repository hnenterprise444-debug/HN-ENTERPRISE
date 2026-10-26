import { FaExclamationTriangle } from "react-icons/fa";

function DeleteCoupon({
    open,
    coupon,
    deleting = false,
    onClose,
    onDelete,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">

            <div className="w-full max-w-sm bg-card border border-border-subtle rounded-2xl shadow-xl text-xs overflow-hidden">

                {/* Header */}
                <div className="p-6 text-center">

                    <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
                        <FaExclamationTriangle size={20} />
                    </div>

                    <h2 className="text-base font-bold text-text-base mt-3">
                        Delete Coupon?
                    </h2>

                    <p className="text-[11px] text-text-muted mt-2 leading-relaxed">
                        Are you sure you want to permanently delete
                        <span className="font-bold text-text-base">
                            {" "}
                            {coupon?.code}
                        </span>
                        ?
                        <br />
                        This action cannot be undone.
                    </p>

                </div>

                {/* Coupon Info */}
                {coupon && (
                    <div className="mx-4 mb-4 rounded-xl border border-border-subtle bg-bg-base p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-text-base">
                                    {coupon.code}
                                </h4>
                                <p className="text-[10px] text-text-muted mt-0.5">
                                    {coupon.type === "PERCENTAGE"
                                        ? `${coupon.discountValue}% OFF`
                                        : `₹${coupon.discountValue} OFF`}
                                </p>
                            </div>

                            <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                    coupon.isActive
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : "bg-bg-surface text-text-subtle border-border-subtle"
                                }`}
                            >
                                {coupon.isActive
                                    ? "Active"
                                    : "Inactive"}
                            </span>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="border-t border-border-subtle p-4 flex gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={deleting}
                        className="flex-1 py-2 rounded-xl border border-border-subtle bg-bg-base hover:bg-card-hover text-text-base transition font-bold disabled:opacity-50 text-xs cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={deleting}
                        className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition disabled:opacity-50 text-xs cursor-pointer"
                    >
                        {deleting ? "Deleting..." : "Delete"}
                    </button>
                </div>

            </div>

        </div>
    );
}

export default DeleteCoupon;