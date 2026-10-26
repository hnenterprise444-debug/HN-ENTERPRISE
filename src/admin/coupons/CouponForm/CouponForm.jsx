import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { fireDB } from "../../../firebase/FirebaseConfig";
import { couponService } from "../../../services/coupon/couponService";
import { toast } from "react-toastify";
import { getFriendlyErrorMessage } from "../../../utils/firebaseErrorHandler.js";

import CouponBasicInfo from "./CouponBasicinfo";
import CouponConditions from "./CouponsCondition";
import CouponUsage from "./CouponUsage";
import CouponValidity from "./CouponValidity";
import CouponScope from "./CouponScope";
import CouponActions from "./CouponAction";
import ToggleButton from "../../../components/Common/ToggleButton";

import { useFormAutoSave } from "../../../hooks/common/useFormAutoSave";

const initBlankCoupon = () => ({
    code: "",
    type: "PERCENTAGE",
    discountValue: 0,
    minimumOrderAmount: 0,
    maximumDiscountAmount: null,
    usageLimit: 100,
    usagePerUser: 1,
    currentUsage: 0,
    validFrom: "",
    validUntil: "",
    isActive: true,
    appliesTo: "ALL",
    applicableProducts: [],
    applicableCategories: [],
});

/**
 * CouponFormPage
 * Dedicated full-page form for creating or editing a coupon.
 * Fetches product catalog and categories dynamically for CouponScope.
 */
function CouponFormPage() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const existingCoupon = location.state?.coupon ?? null;
    const [fetchedCoupon, setFetchedCoupon] = useState(null);
    const activeCoupon = existingCoupon || fetchedCoupon;
    const isEditing = Boolean(id || activeCoupon?.couponId || activeCoupon?.id);

    const [coupon, setCoupon, clearCouponDraft, resetCouponForm] = useFormAutoSave(
        isEditing ? null : 'draft_coupon_form',
        activeCoupon ?? initBlankCoupon(),
        { debounceMs: 400 }
    );

    useEffect(() => {
        if (!existingCoupon && id) {
            couponService.getCouponById(id)
                .then((c) => {
                    if (c) {
                        setFetchedCoupon(c);
                        setCoupon(c);
                    }
                })
                .catch((err) => console.error("Error fetching coupon by ID:", err));
        }
    }, [existingCoupon, id]);

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getDocs(collection(fireDB, "products"))
            .then((snap) => {
                const fetchedProds = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                setProducts(fetchedProds);

                const uniqueCats = Array.from(
                    new Set(fetchedProds.map((p) => p.category).filter(Boolean))
                );
                setCategories(uniqueCats);
            })
            .catch((err) => {
                console.error("Error loading products for scope:", err);
            });
    }, []);

    const handleSave = async () => {
        // Form Validation
        const code = (coupon.code || "").trim();
        if (!code) {
            toast.error("Please enter a valid coupon code");
            return;
        }

        const discVal = Number(coupon.discountValue);
        if (isNaN(discVal) || discVal <= 0) {
            toast.error("Discount value must be greater than 0");
            return;
        }

        if (coupon.type === "PERCENTAGE" && discVal > 100) {
            toast.error("Percentage discount cannot exceed 100%");
            return;
        }

        if (coupon.appliesTo === "PRODUCT" && (!coupon.applicableProducts || coupon.applicableProducts.length === 0)) {
            toast.error("Please select at least one applicable product");
            return;
        }

        if (coupon.appliesTo === "CATEGORY" && (!coupon.applicableCategories || coupon.applicableCategories.length === 0)) {
            toast.error("Please select at least one applicable category");
            return;
        }

        if (coupon.validFrom && coupon.validUntil && new Date(coupon.validUntil) < new Date(coupon.validFrom)) {
            toast.error("Valid Until date must be after Valid From date");
            return;
        }

        setSaving(true);
        try {
            if (isEditing) {
                const targetId = coupon.couponId || coupon.id;
                await couponService.updateCoupon(targetId, coupon);
                toast.success("Coupon updated successfully");
            } else {
                await couponService.addCoupon(coupon);
                toast.success("Coupon created successfully");
            }
            clearCouponDraft();
            navigate("/coupons");
        } catch (err) {
            toast.error(getFriendlyErrorMessage(err, "Failed to save coupon. Please try again."));
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        clearCouponDraft();
        navigate("/coupons");
    };

    return (
        <div className="min-h-screen bg-bg-base text-xs py-4">
            <div className="max-w-7xl mx-auto px-4 space-y-4">

                {/* Page Header */}
                <div className="space-y-1.5">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-text-base">
                                {isEditing ? `Edit: ${coupon.code}` : "Create Coupon"}
                            </h2>
                            <p className="text-xs text-text-muted mt-0.5">
                                {isEditing
                                    ? "Update the coupon configuration and conditions."
                                    : "Configure a new promotional discount coupon."}
                            </p>
                        </div>

                        {/* Top Interactive Status Toggle Button */}
                        {(() => {
                            const isExpiredByDate = coupon.validUntil && new Date(coupon.validUntil) < new Date();
                            const isExpiredByUsage =
                                coupon.usageLimit != null &&
                                coupon.currentUsage != null &&
                                Number(coupon.currentUsage) >= Number(coupon.usageLimit);
                            const isExpired = isExpiredByDate || isExpiredByUsage;

                            const expiredReason = [
                                isExpiredByDate && "Validity date passed",
                                isExpiredByUsage && "Usage limit reached",
                            ].filter(Boolean).join(" · ");

                            if (isExpired) {
                                return (
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-bold text-text-muted hidden sm:inline">Coupon Status:</span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-[11px] font-black uppercase tracking-wider">
                                                ⏱ EXPIRED
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-rose-500 font-semibold">{expiredReason} — fix below to re-activate</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-text-muted hidden sm:inline">Coupon Status:</span>
                                    <ToggleButton
                                        checked={coupon.isActive !== false}
                                        onChange={(checked) => setCoupon((prev) => ({ ...prev, isActive: checked }))}
                                        size="sm"
                                        color="success"
                                        onLabel="ACTIVE"
                                        offLabel="INACTIVE"
                                    />
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* Form Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <CouponBasicInfo coupon={coupon} setCoupon={setCoupon} />
                    <CouponConditions coupon={coupon} setCoupon={setCoupon} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <CouponUsage coupon={coupon} setCoupon={setCoupon} />
                    <CouponValidity coupon={coupon} setCoupon={setCoupon} />
                </div>
                <CouponScope
                    coupon={coupon}
                    setCoupon={setCoupon}
                    products={products}
                    categories={categories}
                />

                {/* Actions */}
                <CouponActions
                    saving={saving}
                    onCancel={handleCancel}
                    onSave={handleSave}
                />

            </div>
        </div>
    );
}

export default CouponFormPage;