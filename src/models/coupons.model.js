/**
 * Coupon Model Schema
 */
const coupon = {
  // Identity
  couponId: "",
  code: "",

  // Discount Configuration
  type: "PERCENTAGE", // PERCENTAGE | FIXED
  discountValue: 0,

  // Conditions & Caps
  minimumOrderAmount: 0,
  maximumDiscountAmount: null, // Cap for percentage coupons (null if no cap)

  // Usage Limits
  usageLimit: 100,          // Total uses allowed
  currentUsage: 0,          // Current total usage count
  usagePerUser: 1,          // Max uses per user

  // Validity
  validFrom: null,
  validUntil: null,

  // Scope Filtering
  appliesTo: "ALL",         // ALL | PRODUCT | CATEGORY
  applicableProducts: [],   // ["productId1", "productId2"]
  applicableCategories: [], // ["categoryId1"]
  excludedProducts: [],     // ["productId3"]
  excludedCategories: [],   // ["categoryId2"]

  // Status
  isActive: true,

  // Metadata
  createdBy: "", // Admin UID
  createdAt: null,
  updatedAt: null,
};

export default coupon;