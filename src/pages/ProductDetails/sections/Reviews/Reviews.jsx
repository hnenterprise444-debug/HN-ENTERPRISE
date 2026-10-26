import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPen, FaTimes, FaStar } from 'react-icons/fa';
import ReviewItem from './ReviewCard';
import { productService } from '../../../../services/product/productService';
import useAuth from '../../../../hooks/auth/useAuth';
import { getFriendlyErrorMessage } from '../../../../utils/firebaseErrorHandler.js';
import Pagination from '../../../../components/Common/Pagination';

// ── Interactive Star Picker ───────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
    const [hovered, setHovered] = useState(0);
    const active = hovered || value;

    const LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        className="text-3xl transition-transform hover:scale-110 active:scale-95 leading-none"
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                        <span className={star <= active ? 'text-amber-400' : 'text-text-subtle/30'}>
                            ★
                        </span>
                    </button>
                ))}
                {active > 0 && (
                    <span className="ml-2 text-xs font-semibold text-amber-400">
                        {LABELS[active]}
                    </span>
                )}
            </div>
            {value === 0 && (
                <p className="text-[11px] text-text-subtle">Click a star to rate</p>
            )}
        </div>
    );
}

// ── Write-a-Review Form ───────────────────────────────────────────────────────
function WriteReviewForm({ productId, onSubmitted }) {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isLoggedIn = !!user?.user?.uid;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLoggedIn) {
            toast.error('Please log in to leave a review.');
            return;
        }
        if (rating === 0) {
            toast.error('Please select a star rating.');
            return;
        }
        if (text.trim().length < 5) {
            toast.error('Review must be at least 5 characters long.');
            return;
        }

        setSubmitting(true);
        try {
            const newReview = await productService.submitRating({
                productId,
                userId: user.user.uid,
                userName: user.user.displayName || user.user.email?.split('@')[0] || 'Anonymous',
                rating,
                review: text,
            });
            toast.success('Your review has been submitted!');
            setRating(0);
            setText('');
            // Optimistically surface the new review immediately
            onSubmitted(newReview);
        } catch (err) {
            toast.error(getFriendlyErrorMessage(err, 'Failed to submit review. Please try again.'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="border border-border-subtle rounded-2xl p-5 bg-card space-y-4 shadow-xs"
        >
            <h4 className="text-sm font-bold text-text-base">Write a Review</h4>

            {/* Star picker */}
            <div>
                <p className="text-xs text-text-muted mb-2 font-medium">Your Rating</p>
                <StarPicker value={rating} onChange={setRating} />
            </div>

            {/* Text area */}
            <div>
                <p className="text-xs text-text-muted mb-1.5 font-medium">Your Review</p>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder="Share your experience — what did you like, what could be better?"
                    disabled={submitting}
                    className="w-full px-3.5 py-3 rounded-xl border border-border-subtle bg-bg-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-text-base resize-none placeholder:text-text-subtle transition-all disabled:opacity-50"
                />
                <p className="text-right text-[10px] text-text-subtle mt-1">{text.length}/1000</p>
            </div>

            {/* Submit */}
            {isLoggedIn ? (
                <button
                    type="submit"
                    disabled={submitting || rating === 0}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-compli text-xs font-bold shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                    {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
            ) : (
                <p className="text-xs text-text-muted italic">
                    <a href="/login" className="text-primary font-semibold hover:underline">Log in</a> to leave a review.
                </p>
            )}
        </form>
    );
}

// ── Reviews Tab ───────────────────────────────────────────────────────────────
function    ReviewsTab({ productId, reviews = [] }) {
    const [sortBy, setSortBy] = useState('Newest');
    const [localReviews, setLocalReviews] = useState([]);
    const [isWriting, setIsWriting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const SORT_OPTIONS = ['Newest', 'Oldest', 'Highest', 'Lowest'];

    // Combine prop reviews + any optimistically added ones
    const allReviews = [...(reviews || []), ...localReviews];

    // Normalize reviews
    const list = allReviews.map((r, i) => ({
        id: r.id || r._id || i,
        userName: r.userName || r.name || 'Anonymous',
        title: r.title || r.headline || '',
        rating: Number(r.rating !== undefined ? r.rating : (r.stars !== undefined ? r.stars : 5)),
        review: r.review || r.comment || '',
        images: Array.isArray(r.images) ? r.images : [],
        createdAt: r.createdAt || null
    }));

    // Sort
    const sorted = [...list].sort((a, b) => {
        if (sortBy === 'Newest') {
            return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        }
        if (sortBy === 'Oldest') {
            return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
        }
        if (sortBy === 'Highest') return b.rating - a.rating;
        if (sortBy === 'Lowest') return a.rating - b.rating;
        return 0;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [sortBy, reviews.length, localReviews.length]);

    // Aggregate stats
    const totalReviews = list.length;
    const avgStars = list.reduce((s, r) => s + r.rating, 0) / totalReviews || 0;
    const distMap = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    list.forEach((r) => {
        if (distMap[r.rating] !== undefined) distMap[r.rating]++;
    });

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedReviews = sorted.slice(startIndex, startIndex + pageSize);

    const handleNewReview = (review) => {
        setLocalReviews(prev => [review, ...prev]);
        setIsWriting(false);
    };

    return (
        <div className="space-y-4 md:space-y-5">
            {/* Top Aggregate Score Overview Banner */}
            {totalReviews > 0 && (
                <div className="bg-card border border-border-subtle rounded-2xl p-4 sm:p-5 shadow-2xs">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
                        {/* Big Score & Stars */}
                        <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-border-subtle pb-4 md:pb-0 md:pr-6">
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-4xl sm:text-5xl font-black text-text-base tracking-tight">{avgStars.toFixed(1)}</span>
                                <span className="text-text-muted text-xs sm:text-sm font-semibold">out of 5</span>
                            </div>
                            <div className="flex gap-1 mb-1.5">
                                {Array(5).fill(null).map((_, i) => (
                                    <span key={i} className={`text-xl ${i < Math.round(avgStars) ? 'text-amber-400' : 'text-text-subtle/30'}`}>★</span>
                                ))}
                            </div>
                            <p className="text-xs text-text-muted font-medium">
                                Based on {totalReviews} verified review{totalReviews !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Star Distribution Progress Bars */}
                        <div className="md:col-span-5 space-y-1.5 border-b md:border-b-0 md:border-r border-border-subtle pb-4 md:pb-0 md:pr-6">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const pct = totalReviews > 0 ? Math.round((distMap[star] / totalReviews) * 100) : 0;
                                return (
                                    <div key={star} className="flex items-center gap-2 text-xs">
                                        <span className="w-3 text-text-muted font-bold text-[11px]">{star}</span>
                                        <span className="text-amber-400 text-xs">★</span>
                                        <div className="flex-1 h-2 bg-bg-surface rounded-full overflow-hidden border border-border-subtle">
                                            <div
                                                className="h-full bg-amber-400 rounded-full transition-all duration-700"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="w-8 text-right text-[11px] font-semibold text-text-muted">{pct}%</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Write Review CTA */}
                        <div className="md:col-span-3 flex flex-col items-center md:items-end justify-center text-center md:text-right gap-1.5">
                            <p className="text-xs font-bold text-text-base">Review this product</p>
                            <p className="text-[11px] text-text-muted">Share your experience with others</p>
                            <button
                                type="button"
                                onClick={() => setIsWriting(prev => !prev)}
                                className={`mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer ${
                                    isWriting
                                        ? 'bg-card border border-border-subtle text-text-base hover:bg-card-hover'
                                        : 'bg-primary text-compli hover:opacity-90 active:scale-95'
                                }`}
                            >
                                {isWriting ? (
                                    <>
                                        <FaTimes className="text-xs" /> Cancel Form
                                    </>
                                ) : (
                                    <>
                                        <FaPen className="text-[10px]" /> Write a Review
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Collapsible Write Review Form */}
            {isWriting && (
                <div className="animate-fadeIn">
                    <WriteReviewForm productId={productId} onSubmitted={handleNewReview} />
                </div>
            )}

            {/* Header Filter & Sort Row */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-border-subtle">
                <p className="text-xs sm:text-sm font-semibold text-text-muted">
                    {totalReviews === 0
                        ? 'No reviews yet'
                        : `Showing ${startIndex + 1}–${Math.min(startIndex + pageSize, sorted.length)} of ${totalReviews} verified review${totalReviews !== 1 ? 's' : ''}`}
                </p>

                <div className="flex items-center gap-3">
                    {/* If 0 reviews, show Write Review here */}
                    {totalReviews === 0 && !isWriting && (
                        <button
                            type="button"
                            onClick={() => setIsWriting(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-compli text-xs font-bold shadow-xs hover:opacity-90 transition-all cursor-pointer"
                        >
                            <FaPen className="text-[10px]" /> Write a Review
                        </button>
                    )}

                    {/* Sort Dropdown */}
                    {totalReviews > 1 && (
                        <div className="flex items-center gap-1.5 text-xs text-text-muted">
                            <span className="font-medium">Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none border border-border-subtle rounded-xl px-2.5 py-1.5 text-xs font-semibold text-text-base bg-bg-base focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* 2-Column Review Cards Grid */}
            {paginatedReviews.length === 0 ? (
                <div className="py-12 px-6 text-center border border-dashed border-border-subtle rounded-2xl bg-card">
                    <span className="material-symbols-outlined text-4xl text-text-subtle/40 mb-2 block">
                        rate_review
                    </span>
                    <p className="text-sm font-bold text-text-base">No reviews yet</p>
                    <p className="text-xs text-text-muted mt-1 max-w-xs mx-auto">
                        Be the first person to share your experience with this product!
                    </p>
                    {!isWriting && (
                        <button
                            type="button"
                            onClick={() => setIsWriting(true)}
                            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-compli text-xs font-bold shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                        >
                            <FaPen className="text-[10px]" /> Write the First Review
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 items-stretch">
                    {paginatedReviews.map((review, index) => (
                        <ReviewItem
                            key={review.id || startIndex + index}
                            review={review}
                            index={startIndex + index}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {sorted.length > pageSize && (
                <div className="pt-4 border-t border-border-subtle">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={sorted.length}
                        pageSize={pageSize}
                        pageSizeOptions={[6, 9, 12, 18]}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(newSize) => {
                            setPageSize(newSize);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default ReviewsTab;