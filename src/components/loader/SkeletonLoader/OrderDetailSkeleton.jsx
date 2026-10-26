import React from "react";

/**
 * OrderDetailSkeleton
 * Comprehensive, realistic skeleton loader matching AdminOrderDetail.jsx layout.
 * Features animated pulse placeholders for header banner, fulfillment tracker,
 * items list, logistics, audit timeline, invoice card, customer details, and payment summary.
 */
export default function OrderDetailSkeleton() {
  return (
    <div className="p-4 sm:p-3 max-w-8xl mx-auto space-y-6 animate-pulse">
      {/* 1. Header Section Skeleton */}
      <div className="space-y-4">
        {/* Top Navigation & Action Row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="h-9 w-32 bg-border-base/50 rounded-xl" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 bg-border-base/50 rounded-xl" />
            <div className="h-9 w-28 bg-border-base/50 rounded-xl" />
          </div>
        </div>

        {/* Order Info Banner */}
        <div className="bg-bg-surface p-5 rounded-2xl border border-border-base/70 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="h-6 w-48 bg-border-base/60 rounded-lg" />
                <div className="h-5 w-20 bg-border-base/40 rounded-md" />
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="h-3.5 w-36 bg-border-base/40 rounded" />
                <div className="h-3.5 w-40 bg-border-base/30 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-24 bg-border-base/50 rounded-lg" />
              <div className="h-7 w-20 bg-border-base/50 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (70%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Fulfillment & Tracker Card */}
          <div className="bg-bg-surface p-5 sm:p-6 rounded-2xl border border-border-base/70 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-4 w-36 bg-border-base/60 rounded" />
                <div className="h-3 w-56 bg-border-base/30 rounded" />
              </div>
              <div className="h-8 w-32 bg-border-base/50 rounded-xl" />
            </div>

            {/* Stepper Progress Bar */}
            <div className="pt-3 pb-2">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-border-base/40 -translate-y-1/2 -z-0" />
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-border-base/60 border-2 border-bg-surface" />
                    <div className="h-2.5 w-14 bg-border-base/40 rounded hidden sm:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Purchased Items Card */}
          <div className="bg-bg-surface p-5 sm:p-6 rounded-2xl border border-border-base/70 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-base/50">
              <div className="h-4 w-32 bg-border-base/60 rounded" />
              <div className="h-3.5 w-16 bg-border-base/40 rounded" />
            </div>

            <div className="divide-y divide-border-base/40">
              {[1, 2, 3].map((item) => (
                <div key={item} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-xl bg-border-base/50 shrink-0" />
                    <div className="space-y-2">
                      <div className="h-4 w-44 bg-border-base/60 rounded" />
                      <div className="h-3 w-28 bg-border-base/30 rounded" />
                    </div>
                  </div>
                  <div className="text-right space-y-1.5 shrink-0">
                    <div className="h-4 w-16 bg-border-base/60 rounded ml-auto" />
                    <div className="h-3 w-10 bg-border-base/40 rounded ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics & Tracking Card */}
          <div className="bg-bg-surface p-5 rounded-2xl border border-border-base/70 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-4 w-36 bg-border-base/60 rounded" />
                <div className="h-3 w-48 bg-border-base/30 rounded" />
              </div>
              <div className="h-8 w-28 bg-border-base/50 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-bg-base/60 border border-border-base/40 space-y-1.5">
                <div className="h-2.5 w-14 bg-border-base/30 rounded" />
                <div className="h-4 w-24 bg-border-base/50 rounded" />
              </div>
              <div className="p-3 rounded-xl bg-bg-base/60 border border-border-base/40 space-y-1.5">
                <div className="h-2.5 w-16 bg-border-base/30 rounded" />
                <div className="h-4 w-28 bg-border-base/50 rounded" />
              </div>
              <div className="p-3 rounded-xl bg-bg-base/60 border border-border-base/40 space-y-1.5">
                <div className="h-2.5 w-20 bg-border-base/30 rounded" />
                <div className="h-4 w-20 bg-border-base/50 rounded" />
              </div>
            </div>
          </div>

          {/* Order History / Audit Trail Card */}
          <div className="bg-bg-surface p-5 rounded-2xl border border-border-base/70 shadow-xs space-y-4">
            <div className="h-4 w-32 bg-border-base/60 rounded" />
            <div className="space-y-3 pl-2">
              {[1, 2, 3].map((entry) => (
                <div key={entry} className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-border-base/60 mt-1.5 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-36 bg-border-base/50 rounded" />
                    <div className="h-2.5 w-24 bg-border-base/30 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sticky Sidebar (30%) */}
        <div className="space-y-6">
          {/* Invoice Admin Card */}
          <div className="bg-bg-surface p-5 rounded-2xl border border-border-base/70 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-border-base/60 rounded" />
              <div className="h-6 w-20 bg-border-base/40 rounded-md" />
            </div>
            <div className="h-9 w-full bg-border-base/50 rounded-xl" />
          </div>

          {/* Customer Details Card */}
          <div className="bg-bg-surface p-5 rounded-2xl border border-border-base/70 shadow-xs space-y-4">
            <div className="h-4 w-32 bg-border-base/60 rounded" />
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-border-base/50 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-28 bg-border-base/60 rounded" />
                  <div className="h-3 w-40 bg-border-base/40 rounded" />
                </div>
              </div>
              <div className="pt-2 border-t border-border-base/50 space-y-2">
                <div className="h-3 w-20 bg-border-base/40 rounded" />
                <div className="h-3 w-48 bg-border-base/30 rounded" />
                <div className="h-3 w-36 bg-border-base/30 rounded" />
              </div>
            </div>
          </div>

          {/* Payment & Pricing Summary Card */}
          <div className="bg-bg-surface p-5 rounded-2xl border border-border-base/70 shadow-xs space-y-4">
            <div className="h-4 w-32 bg-border-base/60 rounded" />
            <div className="space-y-2.5 pt-1">
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-border-base/40 rounded" />
                <div className="h-3 w-16 bg-border-base/50 rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-border-base/40 rounded" />
                <div className="h-3 w-12 bg-border-base/50 rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-border-base/40 rounded" />
                <div className="h-3 w-12 bg-border-base/50 rounded" />
              </div>
              <div className="pt-3 border-t border-border-base/60 flex justify-between items-center">
                <div className="h-4 w-24 bg-border-base/60 rounded" />
                <div className="h-5 w-24 bg-border-base/70 rounded-lg" />
              </div>
            </div>
            <div className="p-3 rounded-xl bg-bg-base/60 border border-border-base/40 space-y-1.5 mt-2">
              <div className="h-3 w-28 bg-border-base/40 rounded" />
              <div className="h-3 w-36 bg-border-base/30 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
