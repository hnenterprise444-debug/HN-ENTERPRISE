import React from 'react';

/**
 * AllProductsBanner
 * Renders the top title banner of the collections listing page.
 */
export default function AllProductsBanner() {
  return (
    <div className="bg-bg-surface border-b border-border-subtle py-12 px-6">
      <div className="max-w-[1280px] mx-auto text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-text-base font-h1">
          All Collection
        </h1>
        <p className="text-text-muted text-sm max-w-md mx-auto font-medium">
          Explore our premium selected items crafted with exceptional quality and attention to detail.
        </p>
      </div>
    </div>
  );
}
