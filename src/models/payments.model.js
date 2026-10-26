/**
 * Payment Model Schema
 * Document ID: paymentId (used as Razorpay receipt for direct document lookup)
 */
const payment = {
  // Identity & References
  paymentId: "", // Document ID (used as Razorpay receipt)
  userId: "",
  orderId: "", // Set after payment success when order doc is created

  // Payment Provider Details
  gateway: "RAZORPAY", // RAZORPAY | STRIPE | CASH
  method: "UPI",        // UPI | CARD | NETBANKING | WALLET | EMI | COD
  gatewayOrderId: "",   // Razorpay Order ID (order_...)
  gatewayPaymentId: "", // Razorpay Payment ID (pay_...)
  gatewaySignature: "", // Razorpay Signature

  // Currency & Amounts
  currency: "INR",
  amount: {
    subtotal: 0,
    couponDiscount: 0,
    shippingCharge: 0,
    grandTotal: 0,
  },

  // Immutable Coupon Snapshot
  coupon: {
    couponId: null,
    code: null,
    type: null, // PERCENTAGE | FIXED
    discountValue: 0,
    amountSaved: 0,
  },

  // Status
  status: "PENDING", // PENDING | SUCCESS | FAILED | REFUNDED

  // Payment Audit History
  eventHistory: [
    {
      event: "CREATED", // CREATED | AUTHORIZED | CAPTURED | FAILED | REFUNDED
      gatewayPaymentId: "",
      timestamp: null,
    },
  ],

  // Webhook Status
  webhook: {
    verified: false,
    receivedAt: null,
  },

  // Refund (if any)
  refund: {
    refundId: null,
    amount: 0,
    reason: "",
    status: null, // PENDING | PROCESSED | FAILED
    refundedAt: null,
  },

  // Metadata
  createdAt: null,
  updatedAt: null,
};

export default payment;