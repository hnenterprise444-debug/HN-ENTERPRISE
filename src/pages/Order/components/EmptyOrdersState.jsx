import React from "react";
import { Link } from "react-router-dom";
import { FaShoppingBag, FaArrowRight } from "react-icons/fa";

function EmptyOrdersState({ isSearch = false, onClearSearch }) {
  if (isSearch) {
    return (
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-12 text-center shadow-xs max-w-lg mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-2xl mx-auto">
          <FaShoppingBag />
        </div>
        <div>
          <h3 className="text-base font-black text-text-base">No Matching Orders</h3>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            We couldn't find any orders matching your search or status filter criteria.
          </p>
        </div>
        {onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="px-4 py-2 rounded-xl bg-primary text-compli font-bold text-xs hover:bg-primary-hover transition cursor-pointer"
          >
            Clear Filters & View All
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-3xl p-10 sm:p-16 text-center shadow-xs max-w-xl mx-auto my-8 space-y-5">
      <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-3xl mx-auto shadow-xs animate-bounce">
        <FaShoppingBag />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-black text-text-base tracking-tight">
          No Orders Placed Yet
        </h2>
        <p className="text-xs text-text-muted leading-relaxed max-w-md mx-auto">
          You haven't placed any orders yet. Explore our latest product collections or request a custom artwork commission today!
        </p>
      </div>

      <div className="pt-2">
        <Link
          to="/allproducts"
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-primary text-compli font-black text-xs hover:bg-primary-hover transition-all duration-200 shadow-md shadow-primary/25 cursor-pointer active:scale-95"
        >
          <span>Explore Catalog & Buy Now</span>
          <FaArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

export default EmptyOrdersState;
