import React from 'react';

/**
 * QuantitySelector
 * Reusable quantity counter component with increment/decrement control actions.
 * Perfect for cart line-items and product purchase flows.
 */
export default function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = Infinity,
  disabled = false,
  className
}) {
  const handleDecrease = () => {
    if (disabled) return;
    onChange(Math.max(min, quantity - 1));
  };

  const handleIncrease = () => {
    if (disabled) return;
    onChange(Math.min(max, quantity + 1));
  };

  return (
    <div className={`flex items-center bg-bg-base border border-border-subtle rounded-full ${className || ''}`}>
      <button
        type="button"
        disabled={disabled || quantity <= min}
        onClick={handleDecrease}
        className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-text-base hover:bg-card-hover transition-colors active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Decrease quantity"
      >
        <span className="material-symbols-outlined text-[16px]">remove</span>
      </button>

      <span className="px-3 text-xs font-bold text-text-base w-7 text-center select-none">
        {quantity}
      </span>

      <button
        type="button"
        disabled={disabled || quantity >= max}
        onClick={handleIncrease}
        className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-text-base hover:bg-card-hover transition-colors active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Increase quantity"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
      </button>
    </div>
  );
}
