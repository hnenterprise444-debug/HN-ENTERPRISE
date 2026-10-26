import React from 'react';

/**
 * Reusable DashboardSkeleton loader for Admin Overview page
 */
function DashboardSkeleton() {
    return (
        <section className="space-y-6 lg:space-y-8 animate-pulse">
            {/* Quick Actions Skeleton */}
            <div className="bg-bg-surface border border-border-base/60 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-5 w-32 bg-border-base/40 rounded-md" />
                    <div className="h-3 w-64 bg-border-base/30 rounded-md" />
                </div>
                <div className="flex gap-2.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-9 w-24 bg-border-base/40 rounded-xl" />
                    ))}
                </div>
            </div>

            {/* KPI Metric Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-bg-surface border border-border-base/60 rounded-2xl p-5 shadow-xs space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="h-3.5 w-24 bg-border-base/40 rounded-md" />
                            <div className="w-10 h-10 rounded-xl bg-border-base/40 shrink-0" />
                        </div>
                        <div className="h-7 w-28 bg-border-base/50 rounded-lg" />
                    </div>
                ))}
            </div>

            {/* Analytics Chart Block Skeleton (Disabled) */}
            {/* <div className="bg-bg-surface border border-border-base/60 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                    <div className="h-5 w-40 bg-border-base/40 rounded-md" />
                    <div className="h-8 w-28 bg-border-base/30 rounded-xl" />
                </div>
                <div className="h-64 bg-border-base/20 rounded-xl flex items-end p-4 gap-3 justify-between">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="w-full bg-border-base/30 rounded-t-md" style={{ height: `${20 + (i % 5) * 15}%` }} />
                    ))}
                </div>
            </div> */}

            {/* Bottom 2-Column Tables Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-bg-surface border border-border-base/60 rounded-2xl p-5 space-y-3">
                    <div className="h-5 w-36 bg-border-base/40 rounded-md" />
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-10 w-full bg-border-base/20 rounded-lg" />
                    ))}
                </div>
                <div className="lg:col-span-5 bg-bg-surface border border-border-base/60 rounded-2xl p-5 space-y-3">
                    <div className="h-5 w-32 bg-border-base/40 rounded-md" />
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-10 w-full bg-border-base/20 rounded-lg" />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default DashboardSkeleton;
