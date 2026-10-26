/**
 * Order Data Model Schema
 * Represents customer orders in the `orders` collection.
 */
export const orderModel = {
  // Identity
  orderId: "",
  userId: "",
  userEmail: "",
  email: "",

  // Purchased Products Snapshot (Immutable)
  products: [
    {
      productId: "",
      variantId: null,
      productName: "",
      productSlug: "",
      productImage: "",
      variantName: "",
      sku: "",
      options: {},
      selectedVariant: {},
      quantity: 1,
      price: 0,
      originalPrice: 0,
      totalPrice: 0,
    },
  ],

  // Shipping Address Snapshot (Immutable)
  shippingAddress: {
    fullName: "",
    phone: "",
    houseNo: "",
    buildingName: "",
    street: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    landmark: "",
    type: "HOME", // HOME | WORK | OTHER
  },

  // Pricing Breakdown Summary
  pricing: {
    subtotal: 0,
    productDiscount: 0,
    couponDiscount: 0,
    shippingCharge: 0,
    grandTotal: 0,
  },
  totalAmount: 0,

  // Applied Coupon Snapshot
  coupon: {
    couponId: null,
    code: null,
    discount: 0,
    amountSaved: 0,
  },

  // Payment Details
  payment: {
    paymentId: "",
    gateway: "RAZORPAY", // RAZORPAY | COD
    gatewayPaymentId: "",
    gatewayOrderId: "",
    method: "UPI", // UPI | CARD | NETBANKING | COD
    status: "PENDING", // PENDING | SUCCESS | FAILED | REFUNDED
  },
  paymentMode: "Online Payment",
  paymentStatus: "PENDING",
  paymentId: null,

  // Order Lifecycle Status
  orderStatus: "PLACED",
  // Status flow: PAYMENT_PENDING | PLACED | CONFIRMED | PROCESSING | PACKED | SHIPPED | OUT_FOR_DELIVERY | DELIVERED | CANCELLED | REFUNDED
  status: "Order Placed",
  statusHistory: [
    {
      status: "PLACED",
      updatedBy: "CLIENT",
      timestamp: null,
      note: "",
    },
  ],

  // Logistics Tracking
  tracking: {
    courier: "",
    trackingId: "",
    trackingUrl: "",
    updatedAt: null,
  },

  // Invoice Details
  invoice: {
    uploaded: false,
    storagePath: null,
    url: null,
    invoiceNumber: null,
  },
  invoiceUrl: null,

  // Notes & Cancellation
  customerNote: "",
  adminNote: "",
  cancelReason: null,
  cancelledAt: null,
  deliveredAt: null,

  // Timestamps
  createdAt: null,
  updatedAt: null,
};

export default orderModel;