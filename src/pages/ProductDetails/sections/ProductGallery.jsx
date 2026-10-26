import React from 'react';

/**
 * ProductGallery
 * Props:
 *  - images: string[]       — array of extra image URLs (Firestore `images` field)
 *  - imageUrl: string       — primary/fallback image URL
 *  - title: string          — product title for alt text
 *  - selectedImage: string  — currently displayed image URL
 *  - setSelectedImage: fn   — setter to change displayed image
 */
export default function ProductGallery({
  images = [],
  imageUrl = '',
  title = 'Product Image',
  selectedImage,
  setSelectedImage,
}) {
  // Merge primary image with extra images, deduplicate
  const allImages = imageUrl
    ? [imageUrl, ...images.filter((img) => img !== imageUrl)]
    : images;

  const displaySrc = selectedImage || imageUrl;
  const activeIndex = allImages.indexOf(displaySrc);
  const displayIndex = activeIndex !== -1 ? activeIndex + 1 : 1;

  return (
    <div className="flex gap-3 sm:gap-4 lg:flex-row flex-col-reverse items-start w-full">
      {/* Thumbnail Strip (Image Preview) — Dedicated scrollbar on previews only */}
      {allImages.length > 1 && (
        <div className="flex lg:flex-col gap-2.5 w-full lg:w-20 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden max-h-[360px] sm:max-h-[440px] lg:max-h-[500px] pb-2 lg:pb-0 pr-0 lg:pr-1.5 shrink-0 scroll-smooth [scrollbar-width:thin] [scrollbar-color:var(--color-primary)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/50 hover:[&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb]:rounded-full">
          {allImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(img)}
              className={`w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 flex-shrink-0 rounded-xl border-2 overflow-hidden cursor-pointer transition-all bg-card shadow-2xs ${
                displaySrc === img
                  ? 'border-primary ring-2 ring-primary/20 scale-[0.98]'
                  : 'border-border-subtle hover:border-primary/50'
              }`}
            >
              <img
                className="w-full h-full object-contain p-1.5 hover:scale-105 transition-transform duration-300"
                src={img}
                alt={`${title} thumbnail ${index + 1}`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Display Image — Flexible height without fixed pixels */}
      <div className="relative flex-1 w-full bg-card border border-border-subtle rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center shadow-xs aspect-square">
        <img
          src={displaySrc}
          alt={title}
          className="absolute inset-0 w-full h-full object-contain p-4 sm:p-6 lg:p-8 transition-all duration-300 ease-out"
        />

        {allImages.length > 0 && (
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-bg-surface/90 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-xs border border-border-subtle text-text-muted z-10">
            {displayIndex}/{allImages.length}
          </div>
        )}
      </div>
    </div>
  );
}
