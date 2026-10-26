import React from 'react';

/**
 * HeroSkeleton
 * Placeholder skeleton matching the dimensions and layout of the Home Hero banner slider.
 */
export default function HeroSkeleton() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl lg:rounded-3xl border border-border-subtle bg-bg-surface animate-pulse">
      <div className="relative h-[180px] sm:h-[260px] md:h-[340px] lg:h-[420px] xl:h-[500px] w-full bg-bg-base/60 flex items-center">
        
        {/* Banner Content Placeholder */}
        <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="max-w-xs sm:max-w-md lg:max-w-2xl space-y-3 sm:space-y-4">
            {/* Title Line Skeleton */}
            <div className="h-6 sm:h-10 md:h-12 lg:h-14 w-3/4 bg-border-subtle/50 rounded-xl" />
            <div className="h-5 sm:h-8 md:h-10 lg:h-12 w-1/2 bg-border-subtle/40 rounded-xl" />

            {/* Subtitle Skeleton */}
            <div className="h-3 sm:h-4 md:h-5 w-2/3 bg-border-subtle/30 rounded-lg mt-2" />

            {/* CTA Button Skeleton */}
            <div className="h-8 sm:h-11 w-28 sm:w-36 bg-border-subtle/50 rounded-full mt-4" />
          </div>
        </div>

        {/* Bottom Dot Indicators Skeleton */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-full">
          <div className="w-8 h-2 bg-border-subtle/60 rounded-full" />
          <div className="w-2 h-2 bg-border-subtle/40 rounded-full" />
          <div className="w-2 h-2 bg-border-subtle/40 rounded-full" />
        </div>

      </div>
    </div>
  );
}
