import React from "react";
import { FaArrowLeft, FaSave } from "react-icons/fa";

function ProductActions({
    uploading,
    handleCancel,
    addProduct
}) {
    return (
       <>
    {/* Desktop / Tablet */}
    <div className="hidden md:block sticky bottom-0 z-40">
        <div className="bg-card/95 backdrop-blur-xl border border-border-subtle rounded-2xl shadow-md">
            <div className="px-6 py-3 flex items-center justify-between">

                <div>
                    <h3 className="text-sm font-bold text-text-base">
                        Publish Product
                    </h3>

                    <p className="text-xs text-text-muted">
                        Review your information before saving this product.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 rounded-xl border border-border-subtle bg-bg-base hover:bg-card-hover text-text-muted hover:text-text-base transition font-semibold flex items-center gap-2 cursor-pointer"
                    >
                        <FaArrowLeft />
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={uploading}
                        onClick={addProduct}
                        className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-compli font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-md transition active:scale-95"
                    >
                        <FaSave />
                        {uploading ? "Saving..." : "Save Product"}
                    </button>
                </div>

            </div>
        </div>
    </div>

    {/* Mobile */}
    <div className="md:hidden bottom-16 left-0 right-0 z-40">
        <div className="p-3 grid grid-cols-2 gap-4">

            <button
                type="button"
                onClick={handleCancel}
                className="flex-1 h-9 rounded-xl border border-border-subtle bg-bg-base text-text-muted hover:text-text-base font-semibold cursor-pointer"
            >
                Cancel
            </button>

            <button
                type="button"
                disabled={uploading}
                onClick={addProduct}
                className="flex-[2] h-9 rounded-xl bg-primary hover:bg-primary-hover text-compli font-bold disabled:opacity-50 cursor-pointer shadow-md"
            >
                {uploading ? "Saving..." : "Save Product"}
            </button>

        </div>
    </div>

    {/* Mobile Spacer */}
    <div className="h-20 md:hidden" />
</>
    );
}

export default ProductActions;