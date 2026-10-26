import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

// ── Individual Review Card (Clean 2-Column Grid Layout) ─────────────
export default function ReviewItem({ review }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayName = review.userName || review.name || 'Anonymous';
  const displayReview = review.review || review.comment || '';
  const displayRating = Number(review.rating ?? review.stars ?? 5);
  const headline = review.title || review.headline || '';
  const reviewImages = Array.isArray(review.images) ? review.images : [];

  const initials = displayName
    ? displayName
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const isLong = displayReview.length > 90 || displayReview.includes('\n');

  let dateStr = 'Recently';
  if (review.createdAt) {
    try {
      if (typeof review.createdAt.toDate === 'function') {
        dateStr = review.createdAt.toDate().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      } else if (review.createdAt.seconds) {
        dateStr = new Date(review.createdAt.seconds * 1000).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      } else if (review.createdAt instanceof Date) {
        dateStr = review.createdAt.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      } else if (typeof review.createdAt === 'string') {
        dateStr = review.createdAt;
      }
    } catch (e) {
      console.error('Error formatting review date:', e);
    }
  }

  return (
    <div className="bg-card border border-border-subtle rounded-2xl p-3 sm:p-5 md:p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between gap-3">
      <div className="space-y-3">
        {/* Top Header Row */}
        <div className="flex items-center gap-3">
          {/* Avatar Box */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm sm:text-base flex items-center justify-center shrink-0 shadow-2xs">
            {initials}
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-xs sm:text-sm text-text-base truncate">
                {displayName}
              </span>
              <span className="text-[11px] sm:text-xs text-text-muted shrink-0">
                {dateStr}
              </span>
            </div>
          </div>
        </div>

        {/* Rating Stars + Headline Row */}
        <div className="flex items-center gap-2 flex-wrap pt-0.5">
          <div className="flex items-center gap-0.5 text-amber-400 text-sm">
            {Array(5)
              .fill(null)
              .map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${
                    i < displayRating ? 'text-amber-400' : 'text-text-subtle/30'
                  }`}
                >
                  ★
                </span>
              ))}
          </div>
          {headline && (
            <span className="text-xs sm:text-sm font-bold text-text-base italic">
              "{headline}"
            </span>
          )}
        </div>

        {/* Review Comment Text */}
        {displayReview && (
          <div>
            <p
              className={`text-xs sm:text-sm text-text-muted leading-relaxed whitespace-pre-line transition-all ${
                !isExpanded && isLong ? 'line-clamp-3 sm:line-clamp-4' : ''
              }`}
            >
              {displayReview}
            </p>
            {isLong && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer focus:outline-none"
              >
                <span>{isExpanded ? 'Show less' : 'More...'}</span>
                {isExpanded ? (
                  <FaChevronUp className="w-2.5 h-2.5 text-[10px]" />
                ) : (
                  <FaChevronDown className="w-2.5 h-2.5 text-[10px]" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Review Images Gallery */}
        {reviewImages.length > 0 && (
          <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
            {reviewImages.map((img, imgIdx) => (
              <img
                key={imgIdx}
                src={img}
                alt={`Review attachment ${imgIdx + 1}`}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border border-border-subtle shadow-2xs hover:scale-105 transition-transform"
                loading="lazy"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}