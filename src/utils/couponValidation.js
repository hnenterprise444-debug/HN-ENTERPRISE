/**
 * Coupon Validation Utility
 * Validates promotional coupon codes against current cart state and scope rules.
 */
export function validateAndCalculateCoupon(coupon, subtotal, cartItems = []) {
  if (!coupon) {
    return { valid: false, message: "Invalid coupon code" };
  }

  const numSubtotal = Number(subtotal) || 0;
  if (numSubtotal <= 0) {
    return { valid: false, message: "Cart order value must be greater than zero to apply a coupon" };
  }

  if (coupon.isActive === false) {
    return { valid: false, message: "This coupon is currently inactive" };
  }

  // Expiration check
  if (coupon.validUntil) {
    const expiryDate = new Date(coupon.validUntil);
    // Set to end of day if date only string
    if (coupon.validUntil.length === 10) {
      expiryDate.setHours(23, 59, 59, 999);
    }
    if (new Date() > expiryDate) {
      return { valid: false, message: "This coupon has expired" };
    }
  }

  // Minimum Order Amount Check
  const minAmount = Number(coupon.minimumOrderAmount) || 0;
  if (subtotal < minAmount) {
    return {
      valid: false,
      message: `Minimum order amount of ₹${minAmount.toLocaleString("en-IN")} required for this coupon`
    };
  }

  // Scope Check
  let applicableSubtotal = subtotal;

  if (coupon.appliesTo === "PRODUCT") {
    const appProducts = coupon.applicableProducts || [];
    const matchingItems = cartItems.filter(item => appProducts.includes(item.id || item.productId));
    if (matchingItems.length === 0) {
      return { valid: false, message: "This coupon is not applicable to any products in your cart" };
    }
    applicableSubtotal = matchingItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  } else if (coupon.appliesTo === "CATEGORY") {
    const appCategories = coupon.applicableCategories || [];
    const matchingItems = cartItems.filter(item => appCategories.includes(item.category));
    if (matchingItems.length === 0) {
      return { valid: false, message: "This coupon is not applicable to any product categories in your cart" };
    }
    applicableSubtotal = matchingItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  }

  // Calculate Discount Amount
  let discountAmount = 0;
  if (coupon.type === "PERCENTAGE") {
    const pct = Number(coupon.discountValue) || 0;
    discountAmount = (applicableSubtotal * pct) / 100;
    if (coupon.maximumDiscountAmount && discountAmount > Number(coupon.maximumDiscountAmount)) {
      discountAmount = Number(coupon.maximumDiscountAmount);
    }
  } else {
    // FIXED amount
    discountAmount = Number(coupon.discountValue) || 0;
  }

  // Ensure discount does not exceed subtotal
  discountAmount = Math.min(discountAmount, subtotal);
  discountAmount = Math.max(0, Number(discountAmount.toFixed(2)));

  const formattedSaved = discountAmount.toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(discountAmount) ? 0 : 2,
    maximumFractionDigits: 2,
  });

  return {
    valid: true,
    discountAmount,
    coupon,
    message: `Coupon applied! You saved ₹${formattedSaved}`
  };
}
