import React, { useEffect } from 'react';
import LoadingSkeleton from '../../components/loader/SkeletonLoader/ProductDetailsSkltn';
import useProductDetails from '../../hooks/product/useProductDetails';
import useProductVariant from '../../hooks/product/useProductVariant';
import ProductGallery from './sections/ProductGallery.jsx';
import ProductInfo from './sections/ProductInfo.jsx';
import ProductPurchase from './sections/ProductPurchase/ProductPurchase.jsx';
import ProductTabSection from './sections/ProductTabSection.jsx';
import RelatedProducts from './sections/RelatedProducts.jsx';
import ErrorState from '../../components/Error';

// ── Main Page ─────────────────────────────────────────────────────
export default function ProductDetails() {
  const {
    product,
    selectedImage,
    setSelectedImage,
    ratings,
    averageRating,
    reviewCount,
    refetchRatings,
    isLoading,
    error,
    addProductToCart,
  } = useProductDetails();

  // Initialize the production-grade variant selection system
  const {
    selectedOptions,
    selectedVariant,
    isComplete,
    priceInfo,
    isOptionEnabled,
    selectOption
  } = useProductVariant(product);

  // Sync selected gallery image when selected variant changes
  useEffect(() => {
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      setSelectedImage(selectedVariant.images[0]);
    } else if (product?.imageUrl) {
      setSelectedImage(product.imageUrl);
    }
  }, [selectedVariant, product, setSelectedImage]);

  if (isLoading || !product) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!product) return null;

  // Determine active images (combine variant-specific images with common product images, deduplicated)
  const commonImages = (product.images && product.images.length > 0)
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : []);
  const variantImages = (selectedVariant?.images && selectedVariant.images.length > 0)
    ? selectedVariant.images
    : [];

  const activeImages = Array.from(new Set([...variantImages, ...commonImages]));

  return (
    <main className="max-w-7xl mx-auto px-0 md:px-4 lg:px-8 py-3 sm:py-6 space-y-5 md:space-y-8">
      {/* ── Two-column hero section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-8 items-start">

        {/* Left: Sticky Gallery */}
        <div className="lg:col-span-7 lg:sticky lg:top-28 flex flex-col gap-3">
          <ProductGallery
            images={activeImages}
            imageUrl={product.imageUrl}
            title={product.title}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
          />
        </div>

        {/* Right: Info, Purchase, Highlights Card */}
        <div className="lg:col-span-5 space-y-4 md:space-y-5 bg-card border border-border-subtle rounded-2xl md:rounded-3xl p-3 sm:p-5 md:p-6 shadow-xs">
          <ProductInfo
            product={product}
            rating={averageRating}
            reviewCount={reviewCount}
            selectedVariant={selectedVariant}
            priceInfo={priceInfo}
            isComplete={isComplete}
            selectedOptions={selectedOptions}
            isOptionEnabled={isOptionEnabled}
            selectOption={selectOption}
          />
          
          <ProductPurchase
            product={product}
            selectedVariant={selectedVariant}
            selectedOptions={selectedOptions}
            isComplete={isComplete}
            addProductToCart={addProductToCart}
          />
        </div>

      </div>

      {/* ── Full-width Tab Section: Details / Reviews / Warranty ── */}
      <ProductTabSection
        productId={product.id}
        description={product.description}
        specifications={product.specifications}
        reviews={ratings}
        onReviewAdded={refetchRatings}
      />

      {/* ── Related Products ── */}
      <RelatedProducts
        category={product.category}
        currentProductId={product.id}
      />
    </main>
  );
}
