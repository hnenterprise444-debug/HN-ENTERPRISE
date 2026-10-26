import { functions } from "../../firebase/FirebaseConfig";
import { httpsCallable } from "firebase/functions";
import { loadRazorpayScript } from "../../utils/loadRazorpay";

export const paymentService = {
  /**
   * Validates a coupon code and calculates potential savings.
   */
  async validateCoupon(couponCode, subtotal) {
    if (!couponCode || !couponCode.trim()) {
      return { valid: false, message: "Please enter a valid coupon code." };
    }
    const numSubtotal = Number(subtotal) || 0;
    if (numSubtotal <= 0) {
      return { valid: false, message: "Cart order value must be greater than zero to apply a coupon." };
    }
    try {
      const validateFn = httpsCallable(functions, "validateCoupon");
      const res = await validateFn({ couponCode: couponCode.trim(), subtotal: numSubtotal });
      return res.data;
    } catch (err) {
      console.error("Error validating coupon:", err);
      throw err;
    }
  },

  /**
   * Initializes server-side payment order via createPaymentOrder Cloud Function.
   * Input:
   *   - items: [{ productId, variantId, quantity }]
   *   - couponCode: string (optional)
   *   - shippingAddressId: string (preferred — Firestore saved address ID)
   *   - shippingAddress: object (optional fallback for inline addresses)
   */
  async createPaymentOrder({ items, couponCode, shippingAddressId, shippingAddress, paymentMethod, userEmail }) {
    try {
      const createOrderFn = httpsCallable(functions, "createPaymentOrder");
      const res = await createOrderFn({ items, couponCode, shippingAddressId, shippingAddress, paymentMethod, userEmail });
      const data = res.data;
      // Normalize key field: Cloud Function returns razorpayKeyId
      return {
        ...data,
        keyId: data.razorpayKeyId || data.keyId,
      };
    } catch (err) {
      console.error("Error creating payment order:", err);
      throw err;
    }
  },

  /**
   * Places a Cash on Delivery (COD) order via createCodOrder Cloud Function,
   * with automatic fallback to createPaymentOrder with COD method.
   */
  async createCodOrder({ items, couponCode, shippingAddressId, shippingAddress, userEmail }) {
    try {
      const createCodFn = httpsCallable(functions, "createCodOrder");
      const res = await createCodFn({ items, couponCode, shippingAddressId, shippingAddress, userEmail });
      return res.data;
    } catch (err) {
      console.warn("createCodOrder callable failed, attempting createPaymentOrder fallback:", err?.message || err);
      try {
        const createOrderFn = httpsCallable(functions, "createPaymentOrder");
        const res = await createOrderFn({
          items,
          couponCode,
          shippingAddressId,
          shippingAddress,
          userEmail,
          paymentMethod: "COD",
        });
        return res.data;
      } catch (fallbackErr) {
        console.error("Error placing Cash on Delivery order:", fallbackErr || err);
        throw fallbackErr || err;
      }
    }
  },

  /**
   * Verifies Razorpay payment via verifyPayment Cloud Function.
   */
  async verifyPayment({ razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId }) {
    try {
      const verifyFn = httpsCallable(functions, "verifyPayment");
      const res = await verifyFn({
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        orderId,
      });
      return res.data;
    } catch (err) {
      console.error("Error verifying payment:", err);
      throw err;
    }
  },

  /**
   * Opens Razorpay Checkout Modal and hooks up payment handler.
   */
  async openRazorpayCheckout({
    paymentId,
    gatewayOrderId,
    amount,
    currency = "INR",
    keyId,
    userProfile = {},
    onSuccess,
    onFailure,
  }) {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error("Razorpay SDK failed to load. Please check your network connection.");
    }

    return new Promise((resolve) => {
      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_samplekeyid",
        amount, // in paise
        currency,
        name: "NeedMate Ecommerce",
        description: `Order Payment (${paymentId})`,
        order_id: gatewayOrderId,
        prefill: {
          name: userProfile.name || "",
          email: userProfile.email || "",
          contact: userProfile.phone || "",
        },
        theme: {
          color: "#4f46e5", // Primary theme color
        },
        modal: {
          ondismiss: () => {
            if (onFailure) onFailure("Payment cancelled by user.");
            resolve({ success: false, cancelled: true });
          },
        },
        handler: async (response) => {
          // Note: Payment verification & fulfillment happens on Webhook!
          // We pass response details to callback for UI notification.
          if (onSuccess) onSuccess(response);
          resolve({
            success: true,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", (resp) => {
        console.error("Payment failed:", resp.error);
        if (onFailure) onFailure(resp.error?.description || "Payment failed.");
        resolve({ success: false, error: resp.error });
      });

      razorpayInstance.open();
    });
  },

  /**
   * Cancels an order and requests a refund.
   */
  async cancelOrder(orderId, reason = "") {
    try {
      const cancelFn = httpsCallable(functions, "cancelOrder");
      const res = await cancelFn({ orderId, reason });
      return res.data;
    } catch (err) {
      console.error("Error cancelling order:", err);
      throw err;
    }
  },
};
