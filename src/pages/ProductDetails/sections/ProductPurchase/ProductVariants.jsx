import React from 'react';

/**
 * ProductVariants
 * Dynamically displays variant selection button groups.
 * Renders selection indicators, normal available options, 
 * and struck-through disabled options with reduced opacity.
 */
export default function ProductVariants({
  product,
  selectedOptions,
  isOptionEnabled,
  selectOption
}) {
  if (!product?.variantTypes || product.variantTypes.length === 0) return null;

  return (
    <div className="space-y-6">
      {product.variantTypes.map((type, idx) => {
        const selectedValue = selectedOptions[type.name];
        
        return (
          <div key={idx} className="space-y-2">
            <p className="text-xs font-bold text-text-base uppercase tracking-wider">
              Select {type.name}:
            </p>
            
            <div className="flex flex-wrap gap-3">
              {type.values.map((val, valIdx) => {
                const isSelected = selectedValue === val;
                const isEnabled = isOptionEnabled(type.name, val);

                return (
                  <button
                    key={valIdx}
                    disabled={!isEnabled && !isSelected}
                    onClick={() => selectOption(type.name, val)}
                    className={`px-5 py-2 border rounded-full text-xs font-semibold transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary text-compli font-bold ring-2 ring-primary/20 cursor-default'
                        : isEnabled
                          ? 'border-border-subtle bg-bg-surface text-text-base hover:bg-card-hover hover:text-primary hover:border-primary/50 cursor-pointer'
                          : 'border-border-subtle/50 bg-bg-base text-text-subtle opacity-40 cursor-not-allowed line-through'
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
