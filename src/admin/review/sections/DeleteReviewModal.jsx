import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaStar, FaRegStar, FaExclamationTriangle } from "react-icons/fa";

function StarRating({ rating = 0 }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) =>
                s <= rating ? (
                    <FaStar key={s} className="text-amber-400 text-[11px]" />
                ) : (
                    <FaRegStar key={s} className="text-border-base text-[11px]" />
                )
            )}
        </div>
    );
}

function DeleteReviewModal({ open, review, products = {}, deleting, onClose, onDelete }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!open || !mounted || typeof document === "undefined" || !document.body) return null;

    const productName = review?.productId
        ? products[review.productId] || review.productId
        : "—";

    return createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md p-4" role="dialog" aria-modal="true">
            <div className="min-h-full flex items-center justify-center py-6">
                <div
                    className="w-full max-w-sm bg-card border border-border-subtle rounded-2xl shadow-xl text-xs overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >

                {/* Icon + Title */}
                <div className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
                        <FaExclamationTriangle size={20} />
                    </div>
                    <h2 className="text-base font-bold text-text-base mt-3">Delete Review?</h2>
                    <p className="text-[11px] text-text-muted mt-2 leading-relaxed">
                        This will permanently remove the review by
                        <span className="font-bold text-text-base"> {review?.userName}</span>.
                        This cannot be undone.
                    </p>
                </div>

                {/* Review Preview Card */}
                {review && (
                    <div className="mx-4 mb-4 rounded-xl border border-border-subtle bg-bg-base p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-text-base">{review.userName}</p>
                            <StarRating rating={review.rating} />
                        </div>

                        <p className="text-[10px] text-primary font-semibold truncate">
                            {productName}
                        </p>

                        <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                            "{review.review}"
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="border-t border-border-subtle p-4 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={deleting}
                        className="flex-1 py-2 rounded-xl border border-border-subtle bg-bg-base hover:bg-card-hover text-text-base font-bold transition disabled:opacity-50 text-xs cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={deleting}
                        className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition disabled:opacity-50 text-xs cursor-pointer"
                    >
                        {deleting ? "Deleting..." : "Delete Review"}
                    </button>
                </div>

            </div>
        </div>
    </div>,
    document.body
    );
}

export default DeleteReviewModal;
