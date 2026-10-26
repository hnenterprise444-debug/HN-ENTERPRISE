import React from 'react';
import DescriptionTab from './DescriptionTab';
import ReviewsTab from './Reviews/Reviews';

/**
 * ProductTabSection
 * Renders Product Details / Specifications and Customer Reviews as distinct,
 * naturally stacked page sections (out of tabs) for a clean, cohesive mobile
 * and desktop e-commerce experience.
 */
export default function ProductTabSection({
  productId,
  description,
  specifications,
  reviews = [],
  onReviewAdded,
}) {
  const reviewCount = Array.isArray(reviews) ? reviews.length : 0;
  const avgStars =
    reviewCount > 0
      ? (
          reviews.reduce(
            (sum, r) => sum + Number(r.rating ?? r.stars ?? 5),
            0
          ) / reviewCount
        ).toFixed(1)
      : null;

  return (
    <div className="space-y-6 md:space-y-8 w-full">
      {/* ── Section 1: Product Details & Specifications ── */}
      <section className="bg-card border border-border-subtle rounded-2xl p-2.5 sm:p-5 md:p-6 shadow-xs space-y-3 sm:space-y-4">
        <div className="border-b border-border-subtle pb-2.5">
          <h2 className="text-lg sm:text-xl font-bold text-text-base tracking-tight">
            Product Details & Specifications
          </h2>
        </div>
        <DescriptionTab
          description={description}
          specifications={specifications}
        />
      </section>

      {/* ── Section 2: Customer Reviews (Full Width) ── */}
      <section
        id="customer-reviews"
        className="w-full space-y-4 md:space-y-5 pt-5 md:pt-6 border-t border-border-subtle"
      >
        <div className="border-b border-border-subtle pb-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-text-base tracking-tight">
              Customer Reviews
            </h2>
            {reviewCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                ★ {avgStars}
                <span className="text-text-muted font-normal">({reviewCount})</span>
              </span>
            )}
          </div>
        </div>
        <ReviewsTab
          productId={productId}
          reviews={reviews}
          onSubmitted={onReviewAdded}
        />
      </section>
    </div>
  );
}
