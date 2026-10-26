import React from 'react';

/**
 * ProductCardSkeleton
 * Renders a placeholder skeleton matching the layout, dimensions, and aspect ratio of ProductCard.
 */
export default function ProductCardSkeleton({ count = 1 }) {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col h-full overflow-hidden rounded-2xl bg-card border border-border-subtle shadow-xs p-2.5 animate-pulse"
        >
          {/* Image Container Skeleton */}
          <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-bg-base/60 rounded-xl flex items-center justify-center p-2">
            {/* Tag Badges Skeleton */}
            <div className="absolute top-2 left-2 h-4 w-16 bg-border-subtle/50 rounded-md" />
            <div className="absolute top-2 right-2 h-4 w-10 bg-border-subtle/50 rounded-md" />
          </div>

          {/* Content Container Skeleton */}
          <div className="flex flex-col flex-1 justify-between pt-2.5 space-y-2">
            <div className="space-y-2">
              {/* Title Lines Skeleton */}
              <div className="h-4 w-5/6 bg-border-subtle/60 rounded-md" />
              <div className="h-3.5 w-3/4 bg-border-subtle/40 rounded-md" />

              {/* Description Line Skeleton */}
              <div className="h-3 w-full bg-border-subtle/30 rounded-md mt-1" />
            </div>

            {/* Price and Cart Button Skeleton */}
            <div className="flex items-center justify-between pt-2.5 mt-auto border-t border-border-subtle shrink-0">
              <div className="space-y-1">
                <div className="h-2.5 w-10 bg-border-subtle/40 rounded-sm" />
                <div className="h-4 w-16 bg-border-subtle/60 rounded-md" />
              </div>

              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-border-subtle/50 shrink-0" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
