import React from 'react';

/**
 * UserProfileSkeleton
 * Renders a full responsive skeleton matching the layout of User.jsx (profile card, metric stats, navigation tabs, form fields).
 */
export default function UserProfileSkeleton() {
  return (
    <div className="min-h-screen bg-bg-base py-4 sm:py-6 px-3 sm:px-5 lg:px-8 font-sans animate-pulse">
      <div className="max-w-6xl mx-auto">
        
        {/* DESKTOP LAYOUT SKELETON */}
        <div className="hidden lg:grid grid-cols-12 gap-5 items-start">
          
          {/* Left Sidebar Skeleton */}
          <div className="col-span-3 space-y-4">
            {/* Profile Card */}
            <div className="bg-card rounded-2xl overflow-hidden border border-border-subtle p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-card-hover shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-card-hover rounded" />
                  <div className="h-3 w-full bg-card-hover/60 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 pt-3 border-t border-border-subtle gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-5 w-8 bg-card-hover rounded" />
                  <div className="h-2.5 w-12 bg-card-hover/60 rounded" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-5 w-12 bg-card-hover rounded" />
                  <div className="h-2.5 w-10 bg-card-hover/60 rounded" />
                </div>
              </div>
            </div>

            {/* Menu Items Card Skeleton */}
            <div className="bg-card rounded-2xl border border-border-subtle overflow-hidden divide-y divide-border-subtle">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-4 h-4 rounded bg-card-hover shrink-0" />
                  <div className="h-3.5 w-32 bg-card-hover/60 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Content Area Skeleton */}
          <div className="col-span-9">
            <div className="bg-card rounded-2xl border border-border-subtle p-6 space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-border-subtle">
                <div className="w-16 h-16 rounded-full bg-card-hover shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-40 bg-card-hover rounded" />
                  <div className="h-3.5 w-56 bg-card-hover/60 rounded" />
                </div>
              </div>

              {/* Form Input Skeletons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-20 bg-card-hover/60 rounded" />
                    <div className="h-10 w-full bg-bg-base rounded-xl border border-border-subtle" />
                  </div>
                ))}
              </div>

              {/* Save Button Skeleton */}
              <div className="flex justify-end pt-4">
                <div className="h-10 w-32 bg-card-hover rounded-xl" />
              </div>
            </div>
          </div>

        </div>

        {/* MOBILE / TABLET LAYOUT SKELETON */}
        <div className="lg:hidden space-y-3">
          {/* Profile Hero Card */}
          <div className="bg-card rounded-2xl p-4 border border-border-subtle space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-card-hover shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-32 bg-card-hover rounded" />
                <div className="h-3 w-44 bg-card-hover/60 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-12 bg-card-hover/60 rounded-xl" />
              <div className="h-12 bg-card-hover/60 rounded-xl" />
            </div>
          </div>

          {/* Tab Pills Skeleton */}
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-24 bg-card-hover/60 rounded-full shrink-0" />
            ))}
          </div>

          {/* Tab Content Skeleton */}
          <div className="bg-card rounded-2xl border border-border-subtle p-4 space-y-4">
            <div className="h-5 w-36 bg-card-hover rounded" />
            <div className="space-y-3">
              <div className="h-10 w-full bg-bg-base rounded-xl border border-border-subtle" />
              <div className="h-10 w-full bg-bg-base rounded-xl border border-border-subtle" />
              <div className="h-10 w-full bg-bg-base rounded-xl border border-border-subtle" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
