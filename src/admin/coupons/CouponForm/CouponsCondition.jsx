import React from "react";

function CouponConditions({
    coupon,
    setCoupon,
}) {
    return (
        <div className="bg-card border border-border-subtle rounded-xl text-xs shadow-xs">

            {/* Header */}
            <div className="border-b border-border-subtle px-3 py-2">
                <h3 className="font-bold text-text-base">
                    Discount Conditions
                </h3>
                <p className="text-[10px] text-text-muted mt-0.5">
                    Configure minimum order value and discount limits.
                </p>
            </div>

            {/* Body */}
            <div className="p-3">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {/* Minimum Order */}
                    <div>
                        <label className="block font-semibold mb-1 text-text-base">
                            Minimum Order Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                                ₹
                            </span>
                            <input
                                type="text"
                                min={0}
                                value={coupon.minimumOrderAmount}
                                onChange={(e) =>
                                    setCoupon((prev) => ({
                                        ...prev,
                                        minimumOrderAmount: Number(e.target.value),
                                    }))
                                }
                                className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-border-subtle bg-bg-base text-text-base focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                                placeholder="500"
                            />
                        </div>
                    </div>

                    {/* Maximum Discount */}
                    {coupon.type === "PERCENTAGE" && (
                        <div>
                            <label className="block font-semibold mb-1 text-text-base">
                                Maximum Discount
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                                    ₹
                                </span>
                                <input
                                    type="text"
                                    min={0}
                                    value={coupon.maximumDiscountAmount ?? ""}
                                    onChange={(e) =>
                                        setCoupon((prev) => ({
                                            ...prev,
                                            maximumDiscountAmount:
                                                e.target.value === ""
                                                    ? null
                                                    : Number(e.target.value),
                                        }))
                                    }
                                    className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-border-subtle bg-bg-base text-text-base focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                                    placeholder="300"
                                />
                            </div>
                            <p className="text-[9px] text-text-muted mt-1">
                                Leave empty for unlimited discount.
                            </p>
                        </div>
                    )}

                </div>

                {/* Preview Banner */}
                <div className="mt-4 rounded-lg border border-dashed border-primary/40 bg-primary/10 p-3.5">
                    <h4 className="font-semibold text-primary mb-2 text-xs">
                        Coupon Preview
                    </h4>

                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div>
                            <span className="text-text-muted">Discount</span>
                            <p className="font-bold text-text-base mt-0.5">
                                {coupon.type === "PERCENTAGE"
                                    ? `${coupon.discountValue}% OFF`
                                    : `₹${coupon.discountValue} OFF`}
                            </p>
                        </div>

                        <div>
                            <span className="text-text-muted">Min Order</span>
                            <p className="font-bold text-text-base mt-0.5">
                                ₹{coupon.minimumOrderAmount}
                            </p>
                        </div>

                        {coupon.type === "PERCENTAGE" && (
                            <div>
                                <span className="text-text-muted">Max Discount</span>
                                <p className="font-bold text-text-base mt-0.5">
                                    {coupon.maximumDiscountAmount
                                        ? `₹${coupon.maximumDiscountAmount}`
                                        : "Unlimited"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}

export default CouponConditions;