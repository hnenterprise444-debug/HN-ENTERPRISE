import React from 'react';
import { Link } from 'react-router-dom';
import QuantitySelector from '../../../components/Common/QuantitySelector';

/**
 * CartItem
 * Displays individual cart items with variant specifications, quantity counters,
 * and remove controls.
 */
export default function CartItem({ item, onUpdateQuantity, onRemove, stockInfo = { inStock: true, availableStock: 999 } }) {
  const displayName = item.title || 'Product';
  const displayImage = item.imageUrl || '';
  const displayVariant = item.selectedVariant 
    ? Object.entries(item.selectedVariant).map(([k, v]) => `${k}: ${v}`).join(' | ') 
    : 'Standard';

  const isOutOfStock = stockInfo.inStock === false || Number(stockInfo.availableStock || 0) <= 0;
  const isExceedingStock = !isOutOfStock && stockInfo.availableStock < item.quantity;

  return (
    <div className={`group bg-card p-3.5 shadow-sm rounded-2xl flex flex-col sm:flex-row gap-5 items-center transition-all duration-300 border ${
      isOutOfStock 
        ? "border-rose-500/40 bg-rose-500/10" 
        : "border-border-subtle hover:border-primary/40 hover:shadow-md"
    }`}>
      {/* Product Thumbnail */}
      <div className="relative w-24 h-24 flex-shrink-0 bg-bg-base rounded-xl overflow-hidden flex items-center justify-center p-2 border border-border-subtle/50">
        <Link to={`/productdetails/${item.id}`} className="w-full h-full flex items-center justify-center">
          <img 
            className={`max-h-full max-w-full object-contain ${isOutOfStock ? "grayscale-50 opacity-70" : ""}`} 
            alt={displayName} 
            src={displayImage} 
          />
        </Link>
        {isOutOfStock && (
          <span className="absolute bottom-1 left-1 right-1 bg-rose-600/90 text-white text-[8px] font-black uppercase tracking-wider text-center py-0.5 rounded shadow-xs">
            Out of Stock
          </span>
        )}
      </div>

      {/* Product info and actions */}
      <div className="flex-grow w-full">
        <div className="flex justify-between items-start gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-text-subtle uppercase tracking-wider block font-bold">
                {item.category || 'ReadyMade'}
              </span>
              {isOutOfStock && (
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Out of Stock
                </span>
              )}
            </div>
            
            <Link to={`/productdetails/${item.id}`} className="text-sm sm:text-base font-bold text-text-base hover:text-primary transition cursor-pointer line-clamp-1 mt-0.5">
              {displayName}
            </Link>
            <p className="text-xs text-text-muted mt-0.5 font-medium">Variant: {displayVariant}</p>

            {isOutOfStock && (
              <p className="text-xs text-rose-400 font-bold mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm font-bold">error</span>
                <span>Currently out of stock. Please remove to proceed.</span>
              </p>
            )}

            {isExceedingStock && (
              <p className="text-xs text-amber-400 font-bold mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm font-bold">warning</span>
                <span>Only {stockInfo.availableStock} available in stock.</span>
              </p>
            )}
          </div>
          
          <button 
            onClick={() => onRemove(item)}
            className="text-text-muted hover:text-rose-400 transition-all p-1.5 rounded-full hover:bg-rose-500/10 active:scale-95 cursor-pointer shrink-0"
            aria-label="Remove item"
            title="Remove item"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>

        <div className="flex justify-between items-end mt-4 pt-2 border-t border-border-subtle">
          {/* Quantity selector */}
          <QuantitySelector
            quantity={item.quantity}
            max={isOutOfStock ? 0 : Number(stockInfo.availableStock || Infinity)}
            disabled={isOutOfStock}
            onChange={(newQty) => onUpdateQuantity(item, newQty)}
          />

          <span className={`text-base font-black ${isOutOfStock ? "text-text-subtle line-through" : "text-primary"}`}>
            ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
}