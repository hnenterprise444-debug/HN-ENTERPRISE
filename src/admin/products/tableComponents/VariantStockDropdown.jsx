import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FaExclamationTriangle, 
  FaChevronDown, 
  FaTimes, 
  FaEdit, 
  FaCheckCircle 
} from 'react-icons/fa';

/**
 * VariantStockDropdown Component
 * Provides an inline trigger chip and floating portal dropdown showing real-time variant stock health.
 * Prevents table clipping issues by portaling into document.body with smart viewport positioning.
 */
export default function VariantStockDropdown({
  product,
  stockInfo,
  onEditClick,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 330, placement: 'bottom' });

  // Calculate exact floating coordinates relative to trigger button
  const calculatePosition = () => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownWidth = Math.min(330, Math.max(280, window.innerWidth - 24));
    const dropdownHeight = 340; // estimated max height

    let top = rect.bottom + 6;
    let placement = 'bottom';

    // If near bottom of viewport, flip to top
    if (rect.bottom + dropdownHeight > window.innerHeight && rect.top - dropdownHeight > 0) {
      top = rect.top - dropdownHeight - 6;
      placement = 'top';
    }

    // Horizontal positioning: center relative to trigger button
    let left = rect.left + rect.width / 2 - dropdownWidth / 2;

    // Viewport bounds clamp
    const minLeft = 12;
    const maxLeft = window.innerWidth - dropdownWidth - 12;
    left = Math.max(minLeft, Math.min(left, maxLeft));

    return { top, left, width: dropdownWidth, placement };
  };

  const updatePosition = () => {
    const pos = calculatePosition();
    if (pos) setCoords(pos);
  };

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    const handleClickOutside = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!stockInfo || !stockInfo.hasVariants) {
    return null;
  }

  const {
    variantCount,
    variants = [],
    outOfStockVariants = [],
    lowStockVariants = [],
    hasOutOfStockVariant,
    hasLowStockVariant,
    totalStock,
  } = stockInfo;

  const toggleDropdown = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      const pos = calculatePosition();
      if (pos) setCoords(pos);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    if (typeof onEditClick === 'function') {
      onEditClick(product);
    }
  };

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* Dropdown Trigger Chip */}
      {hasOutOfStockVariant ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={toggleDropdown}
          className="group/chip inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600  border border-rose-500/30 hover:bg-rose-500/20 active:scale-95 transition cursor-pointer shadow-xs"
          title={`Click to view variant statuses. ${outOfStockVariants.length} of ${variantCount} variants are out of stock.`}
        >
          <FaExclamationTriangle size={9} className="shrink-0 text-rose-500 group-hover/chip:animate-bounce" />
          <span>{outOfStockVariants.length} variant{outOfStockVariants.length > 1 ? 's' : ''} OOS</span>
          <FaChevronDown
            size={7}
            className={`opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      ) : hasLowStockVariant ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={toggleDropdown}
          className="group/chip inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600  border border-amber-500/30 hover:bg-amber-500/20 active:scale-95 transition cursor-pointer shadow-xs"
          title={`Click to view variant statuses. ${lowStockVariants.length} of ${variantCount} variants have low stock.`}
        >
          <FaExclamationTriangle size={9} className="shrink-0 text-amber-500" />
          <span>{lowStockVariants.length} variant{lowStockVariants.length > 1 ? 's' : ''} low</span>
          <FaChevronDown
            size={7}
            className={`opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={toggleDropdown}
          className="group/chip inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-text-muted hover:text-text-base border border-border-subtle hover:border-primary/40 bg-bg-base hover:bg-card-hover active:scale-95 transition cursor-pointer"
          title="Click to view all variant stock levels"
        >
          <span>{variantCount} variants</span>
          <FaChevronDown
            size={7}
            className={`opacity-60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      )}

      {/* Floating Dropdown via Portal */}
      {isOpen &&
        createPortal(
          <>
            {/* Backdrop overlay for clean click-away */}
            <div
              className="fixed inset-0 z-[99998] bg-transparent"
              onClick={() => setIsOpen(false)}
            />

            {/* Scale Center In Animation Style */}
            <style>{`
              @keyframes scaleFromCenter {
                0% {
                  opacity: 0;
                  transform: scale(0.85);
                }
                100% {
                  opacity: 1;
                  transform: scale(1);
                }
              }
              .animate-scale-from-center {
                animation: scaleFromCenter 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                transform-origin: center center;
              }
            `}</style>

            <div
              ref={dropdownRef}
              style={{
                position: 'fixed',
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                zIndex: 99999,
                width: `${coords.width || 330}px`,
              }}
              onClick={(e) => e.stopPropagation()}
              className="animate-scale-from-center rounded-2xl border border-border-subtle bg-card text-text-base shadow-2xl overflow-hidden backdrop-blur-md"
            >
            {/* Header */}
            <div className="p-3 bg-bg-base border-b border-border-subtle flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-text-base truncate" title={product.title}>
                  {product.title}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-text-muted">
                    {variantCount} Variant{variantCount > 1 ? 's' : ''}
                  </span>
                  <span className="text-border-subtle">•</span>
                  <span className="text-[10px] font-bold text-text-base">
                    Total: {totalStock} in stock
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-base hover:bg-card-hover transition cursor-pointer"
                title="Close"
              >
                <FaTimes size={11} />
              </button>
            </div>

            {/* Health Alert Banner */}
            {hasOutOfStockVariant ? (
              <div className="px-3 py-2 bg-rose-500/10 border-b border-rose-500/20 text-rose-400 flex items-center gap-2 text-[11px] font-bold">
                <FaExclamationTriangle size={12} className="shrink-0 text-rose-500" />
                <span>
                  {outOfStockVariants.length} of {variantCount} variant{variantCount > 1 ? 's are' : ' is'} out of stock!
                </span>
              </div>
            ) : hasLowStockVariant ? (
              <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-400 flex items-center gap-2 text-[11px] font-bold">
                <FaExclamationTriangle size={12} className="shrink-0 text-amber-500" />
                <span>
                  {lowStockVariants.length} variant{lowStockVariants.length > 1 ? 's have' : ' has'} low stock (&le; 5 units).
                </span>
              </div>
            ) : (
              <div className="px-3 py-1.5 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 flex items-center gap-1.5 text-[10px] font-semibold">
                <FaCheckCircle size={10} className="text-emerald-500" />
                <span>All {variantCount} variants are in stock</span>
              </div>
            )}

            {/* Variant List */}
            <div className="max-h-56 overflow-y-auto divide-y divide-border-subtle/50 text-xs">
              {variants.map((v, index) => {
                const isOutOfStock = v.stock <= 0;
                const isLowStock = !isOutOfStock && v.stock <= 5;

                return (
                  <div
                    key={index}
                    className={`p-2.5 flex items-center justify-between gap-3 hover:bg-card-hover transition-colors ${
                      isOutOfStock ? 'bg-rose-500/[0.03]' : isLowStock ? 'bg-amber-500/[0.03]' : ''
                    }`}
                  >
                    {/* Attributes & Price */}
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[11px] text-text-base truncate" title={v.label}>
                        {v.label}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted mt-0.5">
                        <span>₹{Number(v.price || 0).toLocaleString('en-IN')}</span>
                        {v.isActive === false && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-white/10 text-text-muted font-semibold">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock Status Badge */}
                    <div className="shrink-0 text-right">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30 whitespace-nowrap">
                          0 stock (OOS)
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                          {v.stock} left (Low)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                          {v.stock} in stock
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-bg-base border-t border-border-subtle flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-border-subtle bg-card hover:bg-card-hover text-text-muted text-[11px] font-semibold transition cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleEdit}
                className="px-3 py-1.5 rounded-xl bg-primary text-compli hover:bg-primary-hover text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
              >
                <FaEdit size={10} />
                <span>Edit / Restock</span>
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
