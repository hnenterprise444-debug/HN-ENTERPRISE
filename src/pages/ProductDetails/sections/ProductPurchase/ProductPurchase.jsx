import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuantitySelector from '../../../../components/Common/QuantitySelector';

/**
 * ProductPurchase
 * Renders quantity selections and main checkout call-to-actions (Add to Cart, Buy Now, WhatsApp).
 * Buttons are designed to stretch to match the container width for a balanced, premium layout.
 */
export default function ProductPurchase({
  product,
  selectedVariant,
  selectedOptions,
  isComplete,
  addProductToCart
}) {
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  // Determine availability and stock states
  const hasVariants = product.hasVariants ?? (product.variantTypes && product.variantTypes.length > 0);
  const isOutOfStock = hasVariants
    ? (isComplete && selectedVariant && (selectedVariant.inStock <= 0 || selectedVariant.isActive === false || selectedVariant.isAvailable === false))
    : (Number(product.inStock ?? 1) <= 0);

  const isButtonDisabled = hasVariants ? (!isComplete || isOutOfStock) : isOutOfStock;

  const handleAddToCart = () => {
    if (isButtonDisabled) return;
    addProductToCart(product, selectedVariant, quantity);
  };

  const handleBuyNow = () => {
    if (isButtonDisabled) return;
    addProductToCart(product, selectedVariant, quantity);
    navigate('/cart');
  };

  // Prefill WhatsApp text query details
  const selectionString = Object.entries(selectedOptions)
    .map(([key, val]) => `${key}: ${val}`)
    .join(', ');

  const whatsappText = `Hi, I am interested in purchasing "${product.title}"${selectionString ? ` (${selectionString})` : ''}.`;

  return (
    <div className="space-y-6 w-full">
      <div className="space-y-4">

        {/* Quantity and Actions row */}
        <div className="flex  gap-4 items-end">
          {/* Quantity Selector Section */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">
              Quantity:
            </span>
            <QuantitySelector
              quantity={quantity}
              onChange={setQuantity}
              disabled={isButtonDisabled}
              max={selectedVariant ? selectedVariant.inStock : Infinity}
              className="py-2 px-1"
            />
          </div>

          {/* Add to Cart Action */}
          <button
            onClick={handleAddToCart}
            disabled={isButtonDisabled}
            className={`flex-grow py-2 px-4 rounded-full font-extrabold text-xs flex items-center justify-center gap-2 hover:shadow-md transition-all active:scale-[0.98] ${isButtonDisabled
                ? 'bg-bg-base border border-border-subtle/50 text-text-subtle cursor-not-allowed hover:shadow-none opacity-50'
                : 'bg-bg-surface border border-border-subtle text-text-base hover:bg-card-hover hover:border-primary/50 cursor-pointer'
              }`}
          >
            <span className="material-symbols-outlined text-lg">shopping_bag</span>
            ADD TO CART
          </button>
        </div>

        {/* Buy Now Action */}
        <button
          onClick={handleBuyNow}
          disabled={isButtonDisabled}
          className={`w-full h-12 rounded-full font-extrabold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-primary/10 ${isButtonDisabled
              ? 'bg-bg-base border border-border-subtle/50 text-text-subtle cursor-not-allowed hover:shadow-none opacity-50'
              : 'bg-primary hover:bg-primary-hover text-compli cursor-pointer font-black'
            }`}
        >
          BUY NOW
        </button>
      </div>
    </div>
  );
}
