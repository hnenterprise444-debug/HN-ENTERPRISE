import React from "react";
import { FaCreditCard, FaMoneyBillWave, FaInfoCircle } from "react-icons/fa";
import ToggleButton from "../../Components/common/ToggleButton";

/**
 * PaymentTab
 * Admin Configure → Payment tab.
 * Controls which payment methods customers see on the checkout page.
 *
 * Persisted under configure/site → paymentMethods.{ enableOnline, enableCod }
 */
export default function PaymentTab({ draft, updateDraft }) {
    const pm = draft?.paymentMethods ?? { enableOnline: true, enableCod: true };

    const setField = (key, value) => {
        updateDraft({
            paymentMethods: {
                ...pm,
                [key]: value,
            },
        });
    };

    const noneEnabled = !pm.enableOnline && !pm.enableCod;

    return (
        <div className="max-w-2xl space-y-8">
            {/* Section heading */}
            <div className="space-y-1">
                <h3 className="text-sm font-black text-text-base tracking-tight">
                    Checkout Payment Methods
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                    Choose which payment options customers can select when placing an order.
                    At least one method must be enabled — customers will only see the enabled options.
                </p>
            </div>

            {/* Warning — no method enabled */}
            {noneEnabled && (
                <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400">
                    <FaInfoCircle className="mt-0.5 shrink-0 text-rose-400" size={14} />
                    <span className="font-semibold">
                        At least one payment method must be enabled, otherwise customers
                        won't be able to place orders. Please enable Online Payment, Cash
                        on Delivery, or both.
                    </span>
                </div>
            )}

            {/* Toggle Cards */}
            <div className="grid gap-4">

                {/* ── Online Payment ─────────────────────────────────── */}
                <div
                    className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-200 ${
                        pm.enableOnline
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border-subtle bg-card"
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                pm.enableOnline
                                    ? "bg-primary text-compli font-bold shadow-sm"
                                    : "bg-bg-base text-text-muted border border-border-subtle"
                            }`}
                        >
                            <FaCreditCard size={18} />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-black text-text-base">
                                Online Payment
                            </p>
                            <p className="text-xs text-text-muted leading-snug">
                                UPI, Credit / Debit Cards, Net Banking, Wallets (via Razorpay)
                            </p>
                        </div>
                    </div>

                    {/* Toggle switch */}
                    <ToggleButton
                        checked={pm.enableOnline}
                        onChange={(val) => setField("enableOnline", val)}
                        color="primary"
                        size="md"
                    />
                </div>

                {/* ── Cash on Delivery ───────────────────────────────── */}
                <div
                    className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-200 ${
                        pm.enableCod
                            ? "border-primary/80 bg-primary/10 shadow-sm"
                            : "border-border-subtle bg-card"
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                pm.enableCod
                                    ? "bg-primary text-compli font-bold shadow-sm"
                                    : "bg-bg-base text-text-muted border border-border-subtle"
                            }`}
                        >
                            <FaMoneyBillWave size={18} />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-black text-text-base">
                                Cash on Delivery (COD)
                            </p>
                            <p className="text-xs text-text-muted leading-snug">
                                Customer pays in cash when the order is delivered
                            </p>
                        </div>
                    </div>

                    {/* Toggle switch */}
                    <ToggleButton
                        checked={pm.enableCod}
                        onChange={(val) => setField("enableCod", val)}
                        color="primary"
                        size="md"
                    />
                </div>
            </div>

            {/* Status summary */}
            <div className="p-4 bg-bg-base border border-border-subtle rounded-2xl text-xs space-y-2">
                <p className="font-bold text-text-base uppercase tracking-wider text-[10px]">
                    Current Checkout Preview
                </p>
                {pm.enableOnline && pm.enableCod ? (
                    <p className="text-text-muted">
                        Customers will see <strong className="text-text-base">both</strong>{" "}
                        Online Payment and Cash on Delivery options.
                    </p>
                ) : pm.enableOnline ? (
                    <p className="text-text-muted">
                        Customers will see <strong className="text-text-base">Online Payment only</strong>.
                        Cash on Delivery is disabled.
                    </p>
                ) : pm.enableCod ? (
                    <p className="text-text-muted">
                        Customers will see <strong className="text-primary font-bold">Cash on Delivery only</strong>.
                        Online payment is disabled.
                    </p>
                ) : (
                    <p className="text-rose-400 font-semibold">
                        ⚠ No payment methods enabled — customers cannot checkout.
                    </p>
                )}
                <p className="text-text-muted/70 text-[10px]">
                    Click <span className="font-bold text-text-base">Save Changes</span> to apply.
                </p>
            </div>
        </div>
    );
}
