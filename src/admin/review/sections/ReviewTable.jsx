import React, { useState, useEffect } from "react";
import { FaStar, FaRegStar, FaTrash, FaEye } from "react-icons/fa";
import TableSkeleton from "../../../components/loader/SkeletonLoader/TableSkeleton";
import Pagination from "../../../components/Common/Pagination";

function StarRating({ rating = 0 }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) =>
                s <= rating ? (
                    <FaStar key={s} className="text-amber-400 text-xs" />
                ) : (
                    <FaRegStar key={s} className="text-gray-300 text-xs" />
                )
            )}
        </div>
    );
}

function formatDate(timestamp) {
    if (!timestamp) return "—";
    if (typeof timestamp.toDate === "function") {
        return timestamp.toDate().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }
    return String(timestamp);
}

function ReviewTable({ reviews = [], products = {}, loading = false, onDelete, onViewReview }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        setCurrentPage(1);
    }, [reviews.length]);

    if (loading) {
        return <TableSkeleton rows={pageSize} columns={6} />;
    }

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedReviews = reviews.slice(startIndex, startIndex + pageSize);

    return (
        <div className="w-full space-y-4">
            {/* Mobile Cards (Visible only on mobile) */}
            <div className="block md:hidden space-y-4">
                {paginatedReviews.map((review) => {
                    const productName = products[review.productId] || review.productId;
                    return (
                        <div
                            key={review.id}
                            onClick={() => onViewReview?.(review)}
                            className="bg-card p-6 rounded-2xl border border-border-subtle shadow-xs space-y-4 cursor-pointer hover:border-primary/40 transition"
                        >
                            <div className="flex justify-between items-start gap-2">
                                <div className="space-y-1">
                                    <p className="font-bold text-sm text-text-base">
                                        {review.userName || "Anonymous"}
                                    </p>
                                    <StarRating rating={review.rating} />
                                </div>
                                <span className="text-xs text-text-muted font-medium">
                                    {formatDate(review.createdAt)}
                                </span>
                            </div>

                            <div className="bg-bg-base p-3 rounded-xl space-y-1 border border-border-subtle/40">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-text-muted">Product</div>
                                <div className="font-bold text-primary text-xs truncate">
                                    {productName}
                                </div>
                            </div>

                            <p className="text-sm text-text-base leading-relaxed bg-bg-base p-4 rounded-xl border border-border-subtle/50 line-clamp-3">
                                {review.review || "—"}
                            </p>

                            <div className="border-t border-border-subtle my-2"></div>

                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                    type="button"
                                    onClick={() => onViewReview?.(review)}
                                    className="flex-1 h-11 flex items-center justify-center gap-2 text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-xl text-xs font-bold transition duration-150 cursor-pointer"
                                >
                                    <FaEye size={13} />
                                    <span>View Full Review</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(review)}
                                    className="w-11 h-11 flex items-center justify-center text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 rounded-xl transition duration-150 cursor-pointer shrink-0"
                                    title="Delete Review"
                                >
                                    <FaTrash size={12} />
                                </button>
                            </div>
                        </div>
                    );
                })}
                {reviews.length === 0 && (
                    <div className="bg-card p-8 text-center text-text-muted rounded-2xl border border-border-subtle shadow-xs">
                        <div className="flex flex-col items-center gap-2 py-4">
                            <span className="text-3xl">💬</span>
                            <p className="font-bold text-text-base text-sm">No reviews found</p>
                            <p className="text-xs text-text-muted">Try adjusting your filters.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop/Tablet Table (Hidden on mobile) */}
            <div className="hidden md:block bg-card border border-border-subtle rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border-subtle bg-bg-base text-text-muted text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4 w-32">Rating</th>
                                <th className="px-6 py-4 w-44">Reviewer</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Review</th>
                                <th className="px-6 py-4 w-36 hidden lg:table-cell">Date</th>
                                <th className="px-6 py-4 w-32 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border-subtle text-sm text-text-base">
                            {reviews.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-3xl">💬</span>
                                            <p className="font-bold text-text-base">No reviews found</p>
                                            <p className="text-xs text-text-muted">Try adjusting your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {paginatedReviews.map((review) => {
                                const productName = products[review.productId] || review.productId;

                                return (
                                    <tr
                                        key={review.id}
                                        onClick={() => onViewReview?.(review)}
                                        className="hover:bg-card-hover/80 transition-colors cursor-pointer group"
                                        title="Click to view full review details"
                                    >
                                        {/* Rating stars */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <StarRating rating={review.rating} />
                                                <span className="text-xs text-text-muted font-bold">
                                                    {review.rating}/5
                                                </span>
                                            </div>
                                        </td>

                                        {/* Reviewer */}
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-text-base group-hover:text-primary transition-colors">
                                                {review.userName || "Anonymous"}
                                            </p>
                                            <p className="text-xs text-text-muted mt-0.5 font-mono">
                                                {review.userId
                                                    ? review.userId.length > 14
                                                        ? review.userId.slice(0, 14) + "…"
                                                        : review.userId
                                                    : "—"}
                                            </p>
                                        </td>

                                        {/* Product */}
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20 max-w-[200px] truncate">
                                                {productName}
                                            </span>
                                        </td>

                                        {/* Review text */}
                                        <td className="px-6 py-4 max-w-[280px]">
                                            <p className="text-text-base leading-relaxed line-clamp-2" title={review.review}>
                                                {review.review || "—"}
                                            </p>
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-4 text-text-muted hidden lg:table-cell whitespace-nowrap">
                                            {formatDate(review.createdAt)}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    type="button"
                                                    onClick={() => onViewReview?.(review)}
                                                    className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition duration-150 cursor-pointer"
                                                    title="View Full Review"
                                                >
                                                    <FaEye size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete(review)}
                                                    className="w-8 h-8 flex items-center justify-center text-rose-400 hover:text-rose-500 hover:bg-rose-500/15 rounded-xl transition duration-150 cursor-pointer"
                                                    title="Delete Review"
                                                >
                                                    <FaTrash size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Universal Pagination */}
            <Pagination
                currentPage={currentPage}
                totalItems={reviews.length}
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

export default ReviewTable;
