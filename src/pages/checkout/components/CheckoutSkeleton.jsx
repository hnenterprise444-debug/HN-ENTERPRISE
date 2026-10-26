import React from "react";

const Bone = ({ className = "" }) => (
  <div className={`bg-card-hover animate-pulse rounded-xl ${className}`} />
);

export default function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-bg-base px-4 py-8">
      <div className="max-w-8xl mx-auto">
        <Bone className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border-subtle space-y-4">
                <Bone className="h-5 w-32" />
                <Bone className="h-20 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Bone className="h-12" />
                  <Bone className="h-12" />
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-4">
            <div className="bg-card rounded-2xl p-6 border border-border-subtle space-y-4 sticky top-4">
              <Bone className="h-5 w-32" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between">
                  <Bone className="h-4 w-28" />
                  <Bone className="h-4 w-16" />
                </div>
              ))}
              <Bone className="h-14 w-full mt-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
