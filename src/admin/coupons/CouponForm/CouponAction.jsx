import React from "react";

function CouponActions({
    saving = false,
    onCancel,
    onSave,
}) {
    return (
        <div className="sticky bottom-0 bg-bg-surface border-t border-border-subtle text-xs">

            <div className="px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-bg-surface/95 backdrop-blur-xl">

                <div className="text-center sm:text-left">
                    <h3 className="font-bold text-text-base text-xs">
                        Ready to Save?
                    </h3>
                    <p className="text-[10px] text-text-muted mt-0.5">
                        Review the coupon configuration before saving.
                    </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg border border-border-subtle bg-bg-base text-text-base hover:bg-card-hover hover:border-primary/40 transition font-semibold text-xs"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={saving}
                        onClick={onSave}
                        className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-compli font-bold transition disabled:opacity-50 disabled:cursor-not-allowed text-xs shadow-sm"
                    >
                        {saving ? "Saving..." : "Save Coupon"}
                    </button>
                </div>

            </div>

        </div>
    );
}

export default CouponActions;