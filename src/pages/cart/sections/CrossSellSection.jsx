import React from 'react';
import RoundedButton from '../../../components/Common/RoundedButton';

/**
 * CrossSellSection
 * Displays recommended items that can be quickly added to the shopping cart.
 */
export default function CrossSellSection({ items = [], onAddToCart, title = "Frequently Bought Together" }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-lg font-bold text-text-base mb-6">{title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="bg-card hover:bg-card-hover p-2.5 rounded-2xl flex gap-4 items-center group cursor-pointer hover:shadow-md transition-all duration-300 border border-border-subtle hover:border-primary/40"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 bg-bg-base rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-border-subtle/50">
              <img className="max-h-full max-w-full object-contain" alt={item.title} src={item.imageUrl} />
            </div>

            {/* Info */}
            <div className="flex-grow min-w-0">
              <h4 className="text-sm font-bold text-text-base group-hover:text-primary transition-colors line-clamp-1">
                {item.title}
              </h4>
              <p className="text-xs text-text-muted mb-2 font-semibold">
                ₹{Number(item.price).toLocaleString('en-IN')}
              </p>
             
            </div>
             <RoundedButton iconClass="icon-sm" onClick={() => onAddToCart(item)} text="Add to Cart" icon="shopping_bag" className="font-bold text-xs bg-primary text-compli hover:bg-primary-hover"/>
          </div>
        ))}
      </div>
    </div>
  );
}