import { FaRandom } from "react-icons/fa";

function CouponBasicInfo({
    coupon,
    setCoupon,
}) {
    const generateCouponCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(
                Math.floor(Math.random() * chars.length)
            );
        }
        setCoupon((prev) => ({
            ...prev,
            code,
        }));
    };

    return (
        <div className="bg-card border border-border-subtle rounded-xl text-xs shadow-xs">

            {/* Header */}
            <div className="border-b border-border-subtle px-3 py-2">
                <h3 className="font-bold text-text-base">
                    Basic Information
                </h3>
                <p className="text-[10px] text-text-muted mt-0.5">
                    Configure the coupon code and discount type.
                </p>
            </div>

            {/* Body */}
            <div className="p-3 space-y-3">

                {/* Coupon Code */}
                <div>
                    <label className="block font-semibold mb-1 text-text-base">
                        Coupon Code
                    </label>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={coupon.code}
                            onChange={(e) =>
                                setCoupon((prev) => ({
                                    ...prev,
                                    code: e.target.value.toUpperCase(),
                                }))
                            }
                            placeholder="SAVE20"
                            className="flex-1 px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-primary uppercase text-xs"
                        />

                        <button
                            type="button"
                            onClick={generateCouponCode}
                            className="px-3 rounded-lg bg-primary text-compli hover:bg-primary-hover flex items-center gap-1.5 font-bold text-xs transition shadow-sm cursor-pointer"
                        >
                            <FaRandom className="text-[10px]" />
                            Generate
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {/* Discount Type */}
                    <div>
                        <label className="block font-semibold mb-1 text-text-base">
                            Discount Type
                        </label>
                        <select
                            value={coupon.type}
                            onChange={(e) =>
                                setCoupon((prev) => ({
                                    ...prev,
                                    type: e.target.value,
                                }))
                            }
                            className="w-full px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-base text-text-base focus:outline-none focus:ring-1 focus:ring-primary text-xs cursor-pointer"
                        >
                            <option value="PERCENTAGE" className="bg-card text-text-base">Percentage</option>
                            <option value="FIXED" className="bg-card text-text-base">Fixed Amount</option>
                        </select>
                    </div>

                    {/* Discount Value */}
                    <div>
                        <label className="block font-semibold mb-1 text-text-base">
                            Discount Value
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-bold">
                                {coupon.type === "PERCENTAGE" ? "%" : "₹"}
                            </span>
                            <input
                                type="text"
                                value={coupon.discountValue}
                                onChange={(e) =>
                                    setCoupon((prev) => ({
                                        ...prev,
                                        discountValue: Number(e.target.value),
                                    }))
                                }
                                className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-border-subtle bg-bg-base text-text-base focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                            />
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default CouponBasicInfo;