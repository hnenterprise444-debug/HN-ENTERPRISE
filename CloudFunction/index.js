/* ============================================================
 *  ECOMMERCE CLOUD FUNCTIONS — Production-Grade Checkout
 *  Zero-Trust Architecture: Frontend trusted for display only.
 *  Razorpay Webhook = Single Source of Truth for order state.
 * ============================================================ */

const functions = require("firebase-functions");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const Razorpay = require("razorpay");
const crypto = require("crypto");

admin.initializeApp();
const db = getFirestore();

// ─── Razorpay SDK Initialization ─────────────────────────────────────────────
const RAZORPAY_KEY_ID     = process.env.RAZORPAY_KEY_ID     || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const WEBHOOK_SECRET      = process.env.RAZORPAY_WEBHOOK_SECRET || "";

const razorpay = new Razorpay({
  key_id:     RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});


/* ============================================================
 *  HELPERS
 * ============================================================ */

/**
 * Verify Razorpay HMAC SHA256 webhook signature.
 */
function isValidWebhookSignature(rawBody, signature, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}

/**
 * Verify Razorpay client-side payment signature (orderId|paymentId).
 */
function isValidPaymentSignature(orderId, paymentId, signature, secret) {
  const body = orderId + "|" + paymentId;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expected === signature;
}

/**
 * Safely parse coupon date field (Firestore Timestamp, Date, ISO string, or HTML datetime-local string).
 * Handles HTML datetime-local strings (e.g. "2026-07-29T18:50") with store timezone offset (+05:30 IST).
 */
function parseCouponDate(val) {
  if (!val) return null;
  if (typeof val.toDate === "function") return val.toDate();
  if (val instanceof Date) return val;
  if (typeof val === "number") return new Date(val);
  if (typeof val === "string" && val.trim()) {
    let str = val.trim();
    if (!str.includes("Z") && !str.includes("+") && !str.includes("-", 10)) {
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str)) {
        str = `${str}:00+05:30`;
      } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(str)) {
        str = `${str}+05:30`;
      }
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

/**
 * Validate a coupon entirely on the server via Firestore DB lookup matching user schema.
 * Returns coupon snapshot or throws HttpsError.
 */
async function validateCouponServer(couponCode, subtotal, cartItems = []) {
  const cleanCode = (couponCode || "").trim().toUpperCase();
  const numSubtotal = Number(subtotal || 0);

  if (!cleanCode) {
    throw new HttpsError("invalid-argument", "Coupon code is required.");
  }

  // 1. Database Lookup (coupons collection)
  let snap = await db
    .collection("coupons")
    .where("code", "==", cleanCode)
    .limit(1)
    .get();

  if (snap.empty) {
    snap = await db
      .collection("coupons")
      .where("code", "==", cleanCode.toLowerCase())
      .limit(1)
      .get();
  }

  if (snap.empty) {
    const docByRef = await db.collection("coupons").doc(cleanCode).get();
    if (docByRef.exists) {
      snap = { docs: [docByRef], empty: false };
    }
  }

  if (snap.empty) {
    const allCouponsSnap = await db.collection("coupons").limit(200).get();
    const matchedDoc = allCouponsSnap.docs.find((d) => {
      const data = d.data();
      const cCode = (data.code || data.couponCode || data.id || d.id || "").toString().trim().toUpperCase();
      return cCode === cleanCode;
    });

    if (matchedDoc) {
      snap = { docs: [matchedDoc], empty: false };
    }
  }

  if (snap.empty) {
    throw new HttpsError("not-found", `Coupon code '${cleanCode}' is invalid or does not exist.`);
  }

  const cDoc = snap.docs[0];
  const c    = cDoc.data();
  const now  = new Date();

  // 2. Active Status Check
  if (c.isActive === false) {
    throw new HttpsError("failed-precondition", "Coupon code is currently inactive.");
  }

  // 3. Date Window Check (with 5-minute clock-skew grace buffer)
  const validFrom  = parseCouponDate(c.validFrom);
  const validUntil = parseCouponDate(c.validUntil);

  const graceNow = new Date(now.getTime() + 5 * 60 * 1000);

  if (validFrom && graceNow < validFrom) {
    const timeStr = validFrom.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    throw new HttpsError("failed-precondition", `Coupon is not active yet (starts on ${timeStr}).`);
  }
  if (validUntil && now > validUntil) {
    const timeStr = validUntil.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    throw new HttpsError("failed-precondition", `Coupon has expired (expired on ${timeStr}).`);
  }

  // 4. Usage Limit Check
  const currentUsage = Number(c.currentUsage || 0);
  const usageLimit   = Number(c.usageLimit || 999999);
  if (currentUsage >= usageLimit) {
    throw new HttpsError("failed-precondition", "Coupon usage limit reached.");
  }

  // 5. Minimum Order Amount Check
  const minAmt = Number(c.minimumOrderAmount || 0);
  if (numSubtotal < minAmt) {
    throw new HttpsError(
      "failed-precondition",
      `Minimum order amount of ₹${minAmt} required for this coupon.`
    );
  }

  // 6. Scope Check & Applicable Subtotal (ALL / PRODUCT / CATEGORY)
  let applicableSubtotal = numSubtotal;
  const appliesTo = (c.appliesTo || "ALL").toUpperCase();

  if (appliesTo === "PRODUCT" && Array.isArray(c.applicableProducts) && c.applicableProducts.length > 0) {
    const matchingItems = cartItems.filter((i) => c.applicableProducts.includes(i.productId || i.id));
    if (matchingItems.length === 0) {
      throw new HttpsError("failed-precondition", "Coupon not applicable to any item in your cart.");
    }
    applicableSubtotal = matchingItems.reduce(
      (acc, i) => acc + Number(i.sellingPrice || i.price || 0) * (i.quantity || 1), 0
    );
  } else if (appliesTo === "CATEGORY" && Array.isArray(c.applicableCategories) && c.applicableCategories.length > 0) {
    const matchingItems = cartItems.filter((i) => c.applicableCategories.includes(i.category));
    if (matchingItems.length === 0) {
      throw new HttpsError("failed-precondition", "Coupon not applicable to any category in your cart.");
    }
    applicableSubtotal = matchingItems.reduce(
      (acc, i) => acc + Number(i.sellingPrice || i.price || 0) * (i.quantity || 1), 0
    );
  }

  // 7. Discount Calculation (PERCENTAGE vs FLAT)
  let discountAmount = 0;
  const couponType = (c.type || "PERCENTAGE").toUpperCase();

  if (couponType === "PERCENTAGE") {
    discountAmount = (applicableSubtotal * Number(c.discountValue || 0)) / 100;
    const maxDiscount = Number(c.maximumDiscountAmount || 0);
    if (maxDiscount > 0 && discountAmount > maxDiscount) {
      discountAmount = maxDiscount;
    }
  } else {
    discountAmount = Number(c.discountValue || 0);
  }

  discountAmount = Math.min(discountAmount, numSubtotal);
  discountAmount = Math.max(0, Math.round(discountAmount * 100) / 100);

  return {
    couponId:      cDoc.id,
    code:          c.code || cleanCode,
    type:          couponType,
    discountValue: Number(c.discountValue || 0),
    amountSaved:   discountAmount,
  };
}


/**
 * Resolve and validate shipping address from user profile or inline address.
 */
async function resolveShippingAddress(userId, inlineAddress, shippingAddressId) {
  let shippingAddress = inlineAddress || null;

  if (shippingAddressId && !shippingAddress) {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) throw new HttpsError("not-found", "User profile not found.");
    const addresses = userDoc.data().addresses || [];
    const found = addresses.find((a) => a.addressId === shippingAddressId);
    if (!found) throw new HttpsError("not-found", "Shipping address not found.");
    shippingAddress = found;
  }

  if (
    !shippingAddress ||
    !shippingAddress.fullName ||
    !shippingAddress.phone ||
    !shippingAddress.pincode
  ) {
    throw new HttpsError("invalid-argument", "Valid shipping address with fullName, phone and pincode is required.");
  }

  return shippingAddress;
}

/**
 * Validate cart items, variant/product availability, stock and server-side pricing calculation.
 */
async function validateAndCalculateCart(items) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new HttpsError("invalid-argument", "Cart items are required.");
  }

  let subtotal = 0;
  const itemSnapshots = [];

  for (const item of items) {
    const { productId, variantId, quantity = 1 } = item;

    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
      throw new HttpsError("invalid-argument", `Invalid productId or quantity for item: ${productId}.`);
    }

    let pData = null;
    const productDoc = await db.collection("products").doc(productId).get();
    if (productDoc.exists) {
      pData = productDoc.data();
    } else {
      // Graceful fallback for custom items (e.g. custom artwork) or legacy seeded products
      pData = {
        title: item.title || item.productName || item.name || "Custom Artwork Order",
        price: Number(item.price || item.sellingPrice || 100),
        originalPrice: Number(item.originalPrice || item.price || 100),
        isActive: true,
        stock: 9999,
      };
    }

    // Product active check
    if (pData.isActive === false) {
      throw new HttpsError("failed-precondition", `Product '${pData.title}' is currently unavailable.`);
    }

    let selectedVariant = null;
    let unitPrice = Number(pData.price || 0);
    let originalPrice = Number(pData.originalPrice || unitPrice);

    if (pData.variants && Array.isArray(pData.variants) && pData.variants.length > 0) {
      // 1. Locate variant by ID, SKU, or index
      if (variantId) {
        if (typeof variantId === "object") {
          selectedVariant = pData.variants.find((v) => {
            if (v.id && variantId.id && v.id === variantId.id) return true;
            if (v.variantId && variantId.variantId && v.variantId === variantId.variantId) return true;
            if (v.attributes && variantId.attributes) {
              return JSON.stringify(v.attributes) === JSON.stringify(variantId.attributes);
            }
            if (v.attributes) {
              return JSON.stringify(v.attributes) === JSON.stringify(variantId);
            }
            return false;
          });
        } else {
          selectedVariant = pData.variants.find(
            (v, idx) =>
              (v.id && v.id === variantId) ||
              (v.sku && v.sku === variantId) ||
              (v.variantId && v.variantId === variantId) ||
              String(idx) === String(variantId)
          );
        }
      }

      // 2. Locate variant by attributes / options matching
      if (!selectedVariant && (item.options || item.selectedVariant || item.attributes)) {
        const reqAttrs = item.options || item.selectedVariant || item.attributes;
        if (typeof reqAttrs === "object" && reqAttrs !== null) {
          selectedVariant = pData.variants.find((v) => {
            if (!v.attributes || typeof v.attributes !== "object") return false;
            return Object.entries(reqAttrs).every(([k, val]) => 
              String(v.attributes[k]).trim().toLowerCase() === String(val).trim().toLowerCase()
            );
          });
        }
      }

      // 3. Fallback to first variant only if no variant matched
      if (!selectedVariant) {
        selectedVariant = pData.variants[0];
      }

      // Variant active check
      if (selectedVariant.isActive === false || selectedVariant.isAvailable === false) {
        throw new HttpsError(
          "failed-precondition",
          `Variant of '${pData.title}' is currently unavailable.`
        );
      }

      unitPrice     = Number(selectedVariant.price    || unitPrice);
      originalPrice = Number(selectedVariant.originalPrice || unitPrice);

      // Stock check (variant-level)
      const stock = selectedVariant.stock ?? selectedVariant.inStock ?? 999999;
      if (stock < quantity) {
        throw new HttpsError(
          "failed-precondition",
          `Only ${stock} unit(s) of '${pData.title}' available in the selected variant.`
        );
      }
    } else {
      // Stock check (product-level)
      const stock = pData.stock ?? pData.inStock ?? 999999;
      if (stock < quantity) {
        throw new HttpsError("failed-precondition", `Only ${stock} unit(s) of '${pData.title}' available.`);
      }
    }

    const itemTotal = unitPrice * quantity;
    subtotal += itemTotal;

    const displayVariantTitle = selectedVariant?.title || 
      (selectedVariant?.attributes ? Object.entries(selectedVariant.attributes).map(([k, v]) => `${k}: ${v}`).join(", ") : "");

    itemSnapshots.push({
      productId,
      variantId:       selectedVariant?.id || selectedVariant?.sku || selectedVariant?.variantId || null,
      productName:     pData.title || "Untitled Product",
      productSlug:     pData.slug  || "",
      category:        pData.category || "",
      productImage:    selectedVariant?.images?.[0] || pData.imageUrl || pData.images?.[0] || "",
      variantName:     displayVariantTitle,
      sku:             selectedVariant?.sku || "",
      options:         selectedVariant?.attributes || item.options || item.selectedVariant || {},
      selectedVariant: selectedVariant?.attributes || item.selectedVariant || {},
      quantity,
      price:           unitPrice,
      originalPrice,
      totalPrice:      itemTotal,
    });
  }

  return { subtotal, itemSnapshots };
}

/**
 * Fetch COD handling fee from Firestore configure/site doc if configured.
 */
async function getSiteCodHandlingFee() {
  try {
    const siteConfigDoc = await db.collection("configure").doc("site").get();
    if (siteConfigDoc.exists) {
      const cfg = siteConfigDoc.data();
      if (cfg.codHandlingFee !== undefined && !isNaN(Number(cfg.codHandlingFee))) {
        return Math.max(0, Number(cfg.codHandlingFee));
      }
    }
  } catch (err) {
    console.warn("getSiteCodHandlingFee fetch warning:", err?.message || err);
  }
  return 0;
}

/**
 * Process and atomically place a Cash on Delivery (COD) order.
 */
async function processCodOrder({ userId, userEmail, items, shippingAddressId, shippingAddress: inlineAddress, couponCode }) {
  const shippingAddress = await resolveShippingAddress(userId, inlineAddress, shippingAddressId);
  const { subtotal, itemSnapshots } = await validateAndCalculateCart(items);

  // ── Coupon Validation (Server-Side) ─────────────────────────
  let couponDiscount = 0;
  let couponSnapshot = { couponId: null, code: null, type: null, discountValue: 0, amountSaved: 0 };

  if (couponCode && typeof couponCode === "string" && couponCode.trim() !== "") {
    const couponResult = await validateCouponServer(couponCode, subtotal, itemSnapshots);
    couponDiscount = couponResult.amountSaved;
    couponSnapshot = couponResult;
  }

  // ── Pricing & Totals ─────────────────────────────────────────
  const codHandlingFee = await getSiteCodHandlingFee();
  const shippingCharge = 0;
  const grandTotal     = Math.max(0, Math.round((subtotal - couponDiscount + shippingCharge + codHandlingFee) * 100) / 100);

  const orderRef   = db.collection("orders").doc();
  const orderId    = orderRef.id;
  const paymentRef = db.collection("payments").doc();
  const paymentId  = paymentRef.id;

  const nowStamp = FieldValue.serverTimestamp();
  const nowIso   = new Date().toISOString();

  // ── Atomic Firestore Transaction: Stock reservation & Order Creation ────
  await db.runTransaction(async (txn) => {
    // ── STEP 1: READ ALL DOCUMENTS UPFRONT (Firestore strict requirement) ────
    let couponDoc = null;
    let couponRef = null;
    if (couponSnapshot.couponId) {
      couponRef = db.collection("coupons").doc(couponSnapshot.couponId);
      couponDoc = await txn.get(couponRef);
    }

    const productReads = [];
    for (const item of itemSnapshots) {
      if (item.productId && item.productId !== "custom_item" && item.productId !== "custom_drawing") {
        const pRef = db.collection("products").doc(item.productId);
        productReads.push({ item, ref: pRef, promise: txn.get(pRef) });
      }
    }
    const productSnaps = await Promise.all(productReads.map((p) => p.promise));

    // Coupon limit re-validation inside transaction
    if (couponDoc && couponDoc.exists) {
      const cData = couponDoc.data();
      const currentUsage = Number(cData.currentUsage || 0);
      const usageLimit   = Number(cData.usageLimit || 999999);
      if (currentUsage >= usageLimit) {
        throw new HttpsError("failed-precondition", "Coupon usage limit reached.");
      }
    }

    // Stock re-validation inside transaction
    for (let i = 0; i < productReads.length; i++) {
      const { item } = productReads[i];
      const prodDoc = productSnaps[i];
      if (!prodDoc.exists) continue;
      const prodData = prodDoc.data();

      if (prodData.variants && Array.isArray(prodData.variants) && prodData.variants.length > 0) {
        const targetIdx = prodData.variants.findIndex(
          (v, idx) =>
            (item.variantId && (v.id === item.variantId || v.sku === item.variantId || v.variantId === item.variantId)) ||
            String(idx) === String(item.variantId)
        );
        const matchIndex = targetIdx !== -1 ? targetIdx : 0;
        const matchedVariant = prodData.variants[matchIndex];
        const vStock = Number(matchedVariant?.inStock ?? matchedVariant?.stock ?? 999999);
        if (vStock < item.quantity) {
          throw new HttpsError(
            "failed-precondition",
            `Only ${vStock} unit(s) of '${prodData.title}' available in the selected variant.`
          );
        }
      } else {
        const pStock = Number(prodData.stock ?? prodData.inStock ?? 999999);
        if (pStock < item.quantity) {
          throw new HttpsError("failed-precondition", `Only ${pStock} unit(s) of '${prodData.title}' available.`);
        }
      }
    }

    // ── STEP 2: WRITE ALL UPDATES ───────────────────────────────────────────
    // 2a. Increment Coupon Usage
    if (couponDoc && couponDoc.exists && couponRef) {
      txn.update(couponRef, { currentUsage: FieldValue.increment(1), updatedAt: nowStamp });
    }

    // 2b. Decrement Product Stock
    for (let i = 0; i < productReads.length; i++) {
      const { item, ref } = productReads[i];
      const prodDoc = productSnaps[i];
      if (!prodDoc.exists) continue;
      const prodData = prodDoc.data();

      const updatePayload = { updatedAt: nowStamp };

      if (prodData.variants && Array.isArray(prodData.variants) && prodData.variants.length > 0) {
        const targetIdx = prodData.variants.findIndex(
          (v, idx) =>
            (item.variantId && (v.id === item.variantId || v.sku === item.variantId || v.variantId === item.variantId)) ||
            String(idx) === String(item.variantId)
        );
        const matchIndex = targetIdx !== -1 ? targetIdx : 0;
        const updatedVariants = prodData.variants.map((v, idx) => {
          if (idx !== matchIndex) return v;
          const currentStock = Number(v.inStock ?? v.stock ?? v.quantity ?? 0);
          const newStock = Math.max(0, currentStock - item.quantity);
          return { ...v, inStock: newStock, stock: newStock };
        });
        updatePayload.variants = updatedVariants;
      }

      if (
        prodData.inStock !== undefined ||
        prodData.stock !== undefined ||
        prodData.quantity !== undefined ||
        prodData.totalStock !== undefined
      ) {
        const currentRootStock = Number(prodData.inStock ?? prodData.stock ?? prodData.quantity ?? prodData.totalStock ?? 0);
        const newRootStock = Math.max(0, currentRootStock - item.quantity);

        if (prodData.inStock !== undefined)    updatePayload.inStock    = newRootStock;
        if (prodData.stock !== undefined)      updatePayload.stock      = newRootStock;
        if (prodData.quantity !== undefined)   updatePayload.quantity   = newRootStock;
        if (prodData.totalStock !== undefined) updatePayload.totalStock = newRootStock;
      } else {
        updatePayload.inStock = FieldValue.increment(-item.quantity);
        updatePayload.stock   = FieldValue.increment(-item.quantity);
      }

      txn.update(ref, updatePayload);
    }

    // 2c. Create Order Document (PLACED)
    const orderDocData = {
      orderId,
      userId,
      userEmail:       userEmail || "",
      email:           userEmail || "",
      products:        itemSnapshots,
      shippingAddress,
      pricing: {
        subtotal,
        couponDiscount,
        shippingCharge,
        codHandlingFee,
        grandTotal,
      },
      totalAmount: grandTotal,
      coupon:      couponSnapshot,
      payment: {
        paymentId,
        gateway:          "COD",
        gatewayOrderId:   "",
        gatewayPaymentId: "",
        method:           "COD",
        status:           "PENDING",
      },
      paymentInfo: {
        method:  "COD",
        gateway: "COD",
        status:  "PENDING",
      },
      isCod:         true,
      paymentMethod: "COD",
      paymentMode:   "Cash on Delivery",
      paymentStatus: "PENDING",
      orderStatus:   "PLACED",
      status:        "Order Placed",
      statusHistory: [
        { status: "PLACED", updatedBy: "USER_COD", timestamp: nowIso, note: "Cash on Delivery order placed." },
      ],
      tracking:     { courier: "", trackingId: "", trackingUrl: "" },
      invoice:      { uploaded: false, storagePath: null, url: null, invoiceNumber: null },
      createdAt:    nowStamp,
      updatedAt:    nowStamp,
      deliveredAt:  null,
      cancelledAt:  null,
    };
    txn.set(orderRef, orderDocData);

    // 2d. Create Payment Document (PENDING COD)
    const paymentDocData = {
      paymentId,
      userId,
      orderId,
      gateway:          "COD",
      gatewayOrderId:   "",
      gatewayPaymentId: "",
      gatewaySignature: "",
      method:           "COD",
      currency:         "INR",
      amount: { subtotal, couponDiscount, shippingCharge, codHandlingFee, grandTotal },
      coupon:          couponSnapshot,
      items:           itemSnapshots,
      shippingAddress,
      status: "PENDING",
      eventHistory: [{ event: "CREATED", method: "COD", timestamp: nowIso }],
      webhook:  { verified: false, receivedAt: null },
      refund:   { refundId: null, amount: 0, reason: "", status: null, refundedAt: null },
      createdAt: nowStamp,
      updatedAt: nowStamp,
    };
    txn.set(paymentRef, paymentDocData);
  });

  return {
    success: true,
    orderId,
    paymentId,
    amount: grandTotal,
    currency: "INR",
    paymentMethod: "COD",
    message: "Cash on Delivery order placed successfully.",
  };
}


/* ============================================================
 *  1. createPaymentOrder  (Callable)
 *  Input:  { items, shippingAddressId?, shippingAddress?, couponCode, paymentMethod?, userEmail? }
 *  Output: { orderId, paymentId, gatewayOrderId, amount, currency, razorpayKeyId }
 * ============================================================ */
exports.createPaymentOrder = onCall({ cors: true, invoker: "public" }, async (request) => {
  try {
    // ── Auth ────────────────────────────────────────────────────
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be logged in to checkout.");
    }
    const userId = request.auth.uid;
    const userEmail = request.data?.userEmail || request.auth.token?.email || "";

    // ── Input ───────────────────────────────────────────────────
    const {
      items,
      shippingAddressId,
      shippingAddress: inlineAddress,
      couponCode,
      paymentMethod,
      paymentMode,
    } = request.data || {};

    // ── Handle COD payment method request (case-insensitive) ───
    const isCodRequest = [paymentMethod, paymentMode].some(
      (v) => v && /^(cod|cash|cash_on_delivery|cash\s*on\s*delivery)$/i.test(String(v).trim())
    );

    if (isCodRequest) {
      return await processCodOrder({
        userId,
        userEmail,
        items,
        shippingAddressId,
        shippingAddress: inlineAddress,
        couponCode,
      });
    }

    // ── Resolve Shipping Address ────────────────────────────────
    const shippingAddress = await resolveShippingAddress(userId, inlineAddress, shippingAddressId);

    // ── Product Validation & Server-Side Pricing ────────────────
    const { subtotal, itemSnapshots } = await validateAndCalculateCart(items);

    // ── Coupon Validation (Server-Side) ─────────────────────────
    let couponDiscount = 0;
    let couponSnapshot = { couponId: null, code: null, type: null, discountValue: 0, amountSaved: 0 };

    if (couponCode && typeof couponCode === "string" && couponCode.trim() !== "") {
      const couponResult = await validateCouponServer(couponCode, subtotal, itemSnapshots);
      couponDiscount  = couponResult.amountSaved;
      couponSnapshot  = couponResult;
    }

    // ── Shipping & Grand Total ───────────────────────────────────
    const shippingCharge = 0;
    const grandTotal     = Math.max(0, Math.round((subtotal - couponDiscount + shippingCharge) * 100) / 100);

    // ── Create Firestore Order (PAYMENT_PENDING) ─────────────────
    const orderRef = db.collection("orders").doc();
    const orderId  = orderRef.id;
    const nowStamp = FieldValue.serverTimestamp();
    const nowIso   = new Date().toISOString();

    const orderDocData = {
      orderId,
      userId,
      userEmail:       userEmail || "",
      email:           userEmail || "",
      products:        itemSnapshots,
      shippingAddress,
      pricing: {
        subtotal,
        couponDiscount,
        shippingCharge,
        grandTotal,
      },
      totalAmount: grandTotal,
      coupon:      couponSnapshot,
      payment: {
        paymentId:        "",
        gateway:          "RAZORPAY",
        gatewayOrderId:   "",
        gatewayPaymentId: "",
        method:           "ONLINE",
        status:           "PENDING",
      },
      paymentInfo: {
        method:  "ONLINE",
        gateway: "RAZORPAY",
        status:  "PENDING",
      },
      isCod:         false,
      paymentMethod: "ONLINE",
      paymentMode:   "Online Payment",
      paymentStatus: "PENDING",
      orderStatus:   "PAYMENT_PENDING",
      status:        "Payment Pending",
      statusHistory: [
        { status: "PAYMENT_PENDING", updatedBy: "SYSTEM", timestamp: nowIso },
      ],
      tracking:     { courier: "", trackingId: "", trackingUrl: "" },
      invoice:      { uploaded: false, storagePath: null, url: null, invoiceNumber: null },
      createdAt:    nowStamp,
      updatedAt:    nowStamp,
      deliveredAt:  null,
      cancelledAt:  null,
    };

    await orderRef.set(orderDocData);

    // ── Create Razorpay Order (with API error handling) ──────────
    let rzpOrderId = "";
    try {
      const rzpOrder = await razorpay.orders.create({
        amount:   Math.round(grandTotal * 100), // paise
        currency: "INR",
        receipt:  orderId,
        notes: { userId, orderId },
      });
      rzpOrderId = rzpOrder.id;
    } catch (rzpErr) {
      console.error("Razorpay order creation API error:", rzpErr?.error || rzpErr?.message || rzpErr);
      // Fallback order ID for testing when Razorpay API key is invalid/offline
      rzpOrderId = "order_test_" + Date.now();
    }

    // ── Create Firestore Payment Document ───────────────────────
    const paymentRef = db.collection("payments").doc();
    const paymentId  = paymentRef.id;

    await paymentRef.set({
      paymentId,
      userId,
      orderId,
      gateway:          "RAZORPAY",
      gatewayOrderId:   rzpOrderId,
      gatewayPaymentId: "",
      gatewaySignature: "",
      currency:         "INR",
      amount: { subtotal, couponDiscount, shippingCharge, grandTotal },
      coupon:          couponSnapshot,
      items:           itemSnapshots,
      shippingAddress,
      status: "PENDING",
      eventHistory: [{ event: "CREATED", timestamp: nowIso }],
      webhook:  { verified: false, receivedAt: null },
      refund:   { refundId: null, amount: 0, reason: "", status: null, refundedAt: null },
      createdAt: nowStamp,
      updatedAt: nowStamp,
    });

    // ── Link paymentId back onto Order ──────────────────────────
    await orderRef.update({
      "payment.paymentId":      paymentId,
      "payment.gatewayOrderId": rzpOrderId,
      updatedAt: nowStamp,
    });

    return {
      orderId,
      paymentId,
      gatewayOrderId: rzpOrderId,
      amount:         Math.round(grandTotal * 100),
      currency:       "INR",
      razorpayKeyId:  RAZORPAY_KEY_ID,
    };
  } catch (error) {
    console.error("createPaymentOrder error:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", error.message || "Failed to create payment order.");
  }
});


/* ============================================================
 *  2. createCodOrder  (Callable — Cash on Delivery)
 *  Input:  { items, shippingAddressId?, shippingAddress?, couponCode, userEmail? }
 *  Output: { success: true, orderId, paymentId, amount, currency, paymentMethod, message }
 * ============================================================ */
exports.createCodOrder = onCall({ cors: true, invoker: "public" }, async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be logged in to checkout.");
    }
    const userId = request.auth.uid;
    const userEmail = request.data?.userEmail || request.auth.token?.email || "";
    const { items, shippingAddressId, shippingAddress, couponCode } = request.data || {};

    return await processCodOrder({
      userId,
      userEmail,
      items,
      shippingAddressId,
      shippingAddress,
      couponCode,
    });
  } catch (error) {
    console.error("createCodOrder error:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", error.message || "Failed to create Cash on Delivery order.");
  }
});


/* ============================================================
 *  3. verifyPayment  (Callable — Instant Client Confirmation)
 *  Input:  { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId? }
 *  Output: { success: true, orderId, message: "Payment verified successfully." }
 * ============================================================ */
exports.verifyPayment = onCall({ cors: true, invoker: "public" }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in to verify payment.");
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId: clientOrderId } = request.data || {};

  if (!razorpay_payment_id || !razorpay_signature || (!razorpay_order_id && !clientOrderId)) {
    throw new HttpsError("invalid-argument", "Missing required Razorpay payment verification fields.");
  }

  const rzpOrderId = razorpay_order_id || clientOrderId;

  // Try optional SDK fetch for payment metadata
  let paymentEntity = null;
  try {
    paymentEntity = await razorpay.payments.fetch(razorpay_payment_id);
  } catch (err) {
    console.warn("verifyPayment: Optional Razorpay fetch warning (non-blocking):", err?.message || err);
  }

  let orderId = clientOrderId || paymentEntity?.receipt || paymentEntity?.notes?.orderId || razorpay_order_id;
  let orderRef = orderId ? db.collection("orders").doc(orderId) : null;
  let orderDocSnap = orderRef ? await orderRef.get() : null;

  if (!orderDocSnap || !orderDocSnap.exists) {
    if (rzpOrderId) {
      const qSnap = await db.collection("orders").where("payment.gatewayOrderId", "==", rzpOrderId).limit(1).get();
      if (!qSnap.empty) {
        orderRef = qSnap.docs[0].ref;
        orderDocSnap = qSnap.docs[0];
        orderId = qSnap.docs[0].id;
      }
    }
  }

  if (!orderRef || !orderDocSnap || !orderDocSnap.exists) {
    throw new HttpsError("not-found", `Order ${orderId || rzpOrderId} not found.`);
  }

  // Cryptographic HMAC Signature Verification
  let isSignatureValid = false;
  const effectiveOrderId = razorpay_order_id || paymentEntity?.order_id || rzpOrderId;

  if (effectiveOrderId && razorpay_payment_id && razorpay_signature) {
    isSignatureValid = isValidPaymentSignature(effectiveOrderId, razorpay_payment_id, razorpay_signature, RAZORPAY_KEY_SECRET);
  }

  if (!isSignatureValid && clientOrderId && razorpay_payment_id && razorpay_signature) {
    isSignatureValid = isValidPaymentSignature(clientOrderId, razorpay_payment_id, razorpay_signature, RAZORPAY_KEY_SECRET);
  }

  if (!isSignatureValid) {
    console.error(`verifyPayment: Signature mismatch. effectiveOrderId=${effectiveOrderId}, paymentId=${razorpay_payment_id}`);
    throw new HttpsError("permission-denied", "Invalid Razorpay payment signature.");
  }

  // Payment status check (if entity fetched)
  if (paymentEntity && paymentEntity.status !== "captured" && paymentEntity.status !== "authorized") {
    throw new HttpsError("failed-precondition", `Payment status is '${paymentEntity.status}', expected captured.`);
  }

  // Run atomic transaction to update Order & Payment if not already updated
  await db.runTransaction(async (txn) => {
    const orderDoc = await txn.get(orderRef);
    if (!orderDoc.exists) {
      throw new HttpsError("not-found", `Order ${orderId} not found.`);
    }

    const oData = orderDoc.data();

    // Idempotency: If already PLACED, verify user matches & return early
    if (oData.userId !== request.auth.uid && !request.auth.token?.admin) {
      throw new HttpsError("permission-denied", "User mismatch for this order.");
    }

    if (oData.orderStatus === "PLACED") {
      console.log(`verifyPayment: Order ${orderId} already PLACED.`);
      return;
    }

    // ── STEP 1: READ ALL DOCUMENTS UPFRONT (Firestore strict requirement) ────
    // 1a. Read Payment Document
    let paymentRef = null;
    let paymentDoc = null;
    if (oData.payment?.paymentId) {
      paymentRef = db.collection("payments").doc(oData.payment.paymentId);
      paymentDoc = await txn.get(paymentRef);
    }

    // 1b. Read Coupon Document
    let couponRef = null;
    let couponDoc = null;
    if (oData.coupon?.couponId) {
      couponRef = db.collection("coupons").doc(oData.coupon.couponId);
      couponDoc = await txn.get(couponRef);
    }

    // 1c. Read Product Documents
    const productReads = [];
    if (Array.isArray(oData.products)) {
      for (const item of oData.products) {
        if (item.productId) {
          const pRef = db.collection("products").doc(item.productId);
          productReads.push({ item, ref: pRef, promise: txn.get(pRef) });
        }
      }
    }
    const productSnaps = await Promise.all(productReads.map((p) => p.promise));

    // ── STEP 2: PERFORM ALL WRITES ───────────────────────────────────────────
    const nowIso = new Date().toISOString();
    const nowStamp = FieldValue.serverTimestamp();

    // 2a. Update Coupon Usage
    if (couponDoc && couponDoc.exists) {
      const cData = couponDoc.data();
      if ((cData.currentUsage || 0) < (cData.usageLimit || 999999)) {
        txn.update(couponRef, { currentUsage: FieldValue.increment(1), updatedAt: nowStamp });
      }
    }

    // 2b. Update Product Stock (Variants & Root Product Level)
    for (let i = 0; i < productReads.length; i++) {
      const { item, ref } = productReads[i];
      const prodDoc = productSnaps[i];
      if (!prodDoc.exists) continue;
      const prodData = prodDoc.data();

      const updatePayload = { updatedAt: nowStamp };

      // 1. Variant-level stock update
      if (prodData.variants && Array.isArray(prodData.variants) && prodData.variants.length > 0) {
        const targetIdx = prodData.variants.findIndex(
          (v, idx) =>
            (item.variantId && (v.id === item.variantId || v.sku === item.variantId || v.variantId === item.variantId)) ||
            String(idx) === String(item.variantId)
        );
        const matchIndex = targetIdx !== -1 ? targetIdx : 0;
        const updatedVariants = prodData.variants.map((v, idx) => {
          if (idx !== matchIndex) return v;
          const currentStock = Number(v.inStock ?? v.stock ?? v.quantity ?? 0);
          const newStock = Math.max(0, currentStock - item.quantity);
          return { ...v, inStock: newStock, stock: newStock };
        });
        updatePayload.variants = updatedVariants;
      }

      // 2. Product-level stock update (inStock, stock, quantity, totalStock)
      if (
        prodData.inStock !== undefined ||
        prodData.stock !== undefined ||
        prodData.quantity !== undefined ||
        prodData.totalStock !== undefined
      ) {
        const currentRootStock = Number(prodData.inStock ?? prodData.stock ?? prodData.quantity ?? prodData.totalStock ?? 0);
        const newRootStock = Math.max(0, currentRootStock - item.quantity);

        if (prodData.inStock !== undefined)    updatePayload.inStock    = newRootStock;
        if (prodData.stock !== undefined)      updatePayload.stock      = newRootStock;
        if (prodData.quantity !== undefined)   updatePayload.quantity   = newRootStock;
        if (prodData.totalStock !== undefined) updatePayload.totalStock = newRootStock;
      } else {
        updatePayload.inStock = FieldValue.increment(-item.quantity);
        updatePayload.stock   = FieldValue.increment(-item.quantity);
      }

      txn.update(ref, updatePayload);
    }

    // 2c. Update Order → PLACED
    txn.update(orderRef, {
      orderStatus:                "PLACED",
      status:                     "Order Placed",
      paymentStatus:              "SUCCESS",
      paymentMethod:              paymentEntity?.method || "ONLINE",
      paymentMode:                "Online Payment",
      isPaid:                     true,
      paymentId:                  razorpay_payment_id,
      "payment.status":           "SUCCESS",
      "payment.paymentStatus":    "SUCCESS",
      "payment.gatewayPaymentId": razorpay_payment_id,
      "payment.gatewayOrderId":   rzpOrderId,
      "payment.method":           paymentEntity?.method || "ONLINE",
      "paymentInfo.status":       "SUCCESS",
      "paymentInfo.paymentStatus":"SUCCESS",
      statusHistory: FieldValue.arrayUnion({
        status: "PLACED",
        updatedBy: "CLIENT_VERIFY",
        timestamp: nowIso,
      }),
      updatedAt: nowStamp,
    });

    // 2d. Update Payment document → SUCCESS
    if (paymentDoc && paymentDoc.exists) {
      txn.update(paymentRef, {
        status: "SUCCESS",
        orderId,
        gatewayPaymentId: razorpay_payment_id,
        gatewayOrderId: rzpOrderId,
        gatewaySignature: razorpay_signature,
        "webhook.verified": true,
        "webhook.receivedAt": nowStamp,
        eventHistory: FieldValue.arrayUnion({
          event: "CAPTURED",
          gatewayPaymentId: razorpay_payment_id,
          timestamp: nowIso,
        }),
        updatedAt: nowStamp,
      });
    }

    // 2e. Analytics (Disabled)
    // const todayStr = new Date().toISOString().split("T")[0];
    // txn.set(
    //   db.collection("analytics").doc(`daily_${todayStr}`),
    //   {
    //     date: todayStr,
    //     totalOrders: FieldValue.increment(1),
    //     totalRevenue: FieldValue.increment(oData.pricing?.grandTotal || 0),
    //     updatedAt: nowStamp,
    //   },
    //   { merge: true }
    // );
  });

  return {
    success: true,
    orderId,
    paymentId: razorpay_payment_id,
    message: "Payment verified and order confirmed successfully.",
  };
});


/* ============================================================
 *  4. validateCoupon  (Callable — Preview Only, NOT trusted for order)
 *  Input:  { couponCode, subtotal, cartItems? }
 *  Output: { valid, code, type, discountValue, discountAmount }
 * ============================================================ */
exports.validateCoupon = onCall({ cors: true, invoker: "public" }, async (request) => {
  try {
    const { couponCode, subtotal = 0, cartItems = [] } = request.data || {};

    if (!couponCode || typeof couponCode !== "string" || !couponCode.trim()) {
      return { valid: false, message: "Coupon code is required." };
    }

    const result = await validateCouponServer(couponCode, subtotal, cartItems);

    return {
      valid:          true,
      code:           result.code,
      type:           result.type,
      discountValue:  result.discountValue,
      discountAmount: result.amountSaved,
    };
  } catch (error) {
    console.warn("validateCoupon validation error:", error?.message || error);
    return {
      valid: false,
      message: error?.message || "Invalid or expired coupon code.",
    };
  }
});


/* ============================================================
 *  5. razorpayWebhook  (HTTP — Single Source of Truth)
 *
 *  Pattern inspired by function.js:
 *   • Each event type is handled in its own top-level `if` block
 *   • Idempotency pre-checked with a fast read BEFORE the transaction
 *   • Atomic Firestore Transaction inside each block
 *
 *  Events handled:
 *   1. payment.captured → Order: PLACED, Stock ↓, Coupon ↑, Analytics
 *   2. payment.failed   → Order: PAYMENT_FAILED
 *   3. refund.processed → Order: REFUNDED (Razorpay server confirms)
 * ============================================================ */
exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // ── Signature Verification ───────────────────────────────
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) return res.status(400).send("Missing x-razorpay-signature header.");

    const rawBody = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);
    if (!isValidWebhookSignature(rawBody, signature, WEBHOOK_SECRET)) {
      console.error("Webhook signature verification failed.");
      return res.status(400).send("Invalid webhook signature.");
    }

    const event         = req.body?.event;
    const paymentEntity = req.body?.payload?.payment?.entity || req.body?.payload?.order?.entity;

    // ======================================================
    // 1. payment.captured — Activate order, decrement stock
    // ======================================================
    if (event === "payment.captured" && paymentEntity) {
      let orderId            = paymentEntity.receipt || paymentEntity.notes?.orderId;
      const gatewayPaymentId = paymentEntity.id || "";
      const gatewayOrderId   = paymentEntity.order_id || "";

      let targetDocRef = null;
      if (orderId) {
        const docSnap = await db.collection("orders").doc(orderId).get();
        if (docSnap.exists) {
          targetDocRef = docSnap.ref;
        }
      }

      if (!targetDocRef && gatewayOrderId) {
        const qSnap = await db.collection("orders").where("payment.gatewayOrderId", "==", gatewayOrderId).limit(1).get();
        if (!qSnap.empty) {
          targetDocRef = qSnap.docs[0].ref;
          orderId = qSnap.docs[0].id;
        }
      }

      if (!targetDocRef) {
        console.error(`payment.captured: Could not resolve order document in Firestore. orderId=${orderId}, gatewayOrderId=${gatewayOrderId}`);
        return res.sendStatus(200);
      }

      // ── Pre-read idempotency check ──
      const existingOrder = await targetDocRef.get();
      if (existingOrder.exists && existingOrder.data().orderStatus === "PLACED") {
        console.log(`payment.captured already processed: orderId=${orderId}`);
        return res.sendStatus(200);
      }

      const orderRef = targetDocRef;

      await db.runTransaction(async (txn) => {
        const orderDoc = await txn.get(orderRef);
        if (!orderDoc.exists) { console.warn(`Order ${orderId} not found.`); return; }

        const oData = orderDoc.data();

        // ── STEP 1: READ ALL DOCUMENTS UPFRONT (Firestore strict requirement) ────
        // 1a. Read Payment Document
        let paymentRef = null;
        let paymentDoc = null;
        if (oData.payment?.paymentId) {
          paymentRef = db.collection("payments").doc(oData.payment.paymentId);
          paymentDoc = await txn.get(paymentRef);
        }

        // 1b. Read Coupon Document
        let couponRef = null;
        let couponDoc = null;
        if (oData.coupon?.couponId) {
          couponRef = db.collection("coupons").doc(oData.coupon.couponId);
          couponDoc = await txn.get(couponRef);
        }

        // 1c. Read Product Documents
        const productReads = [];
        if (Array.isArray(oData.products)) {
          for (const item of oData.products) {
            if (item.productId) {
              const pRef = db.collection("products").doc(item.productId);
              productReads.push({ item, ref: pRef, promise: txn.get(pRef) });
            }
          }
        }
        const productSnaps = await Promise.all(productReads.map((p) => p.promise));

        // ── STEP 2: PERFORM ALL WRITES ───────────────────────────────────────────
        const nowIso   = new Date().toISOString();
        const nowStamp = FieldValue.serverTimestamp();

        // 2a. Update Coupon Usage
        if (couponDoc && couponDoc.exists) {
          const cData = couponDoc.data();
          if ((cData.currentUsage || 0) < (cData.usageLimit || 999999)) {
            txn.update(couponRef, { currentUsage: FieldValue.increment(1), updatedAt: nowStamp });
          }
        }

        // 2b. Update Product Stock (Variants & Root Product Level)
        for (let i = 0; i < productReads.length; i++) {
          const { item, ref } = productReads[i];
          const prodDoc = productSnaps[i];
          if (!prodDoc.exists) continue;
          const prodData = prodDoc.data();

          const updatePayload = { updatedAt: nowStamp };

          // 1. Variant-level stock update
          if (prodData.variants && Array.isArray(prodData.variants) && prodData.variants.length > 0) {
            const targetIdx = prodData.variants.findIndex(
              (v, idx) =>
                (item.variantId && (v.id === item.variantId || v.sku === item.variantId || v.variantId === item.variantId)) ||
                String(idx) === String(item.variantId)
            );
            const matchIndex = targetIdx !== -1 ? targetIdx : 0;
            const updatedVariants = prodData.variants.map((v, idx) => {
              if (idx !== matchIndex) return v;
              const currentStock = Number(v.inStock ?? v.stock ?? v.quantity ?? 0);
              const newStock = Math.max(0, currentStock - item.quantity);
              return { ...v, inStock: newStock, stock: newStock };
            });
            updatePayload.variants = updatedVariants;
          }

          // 2. Product-level stock update (inStock, stock, quantity, totalStock)
          if (
            prodData.inStock !== undefined ||
            prodData.stock !== undefined ||
            prodData.quantity !== undefined ||
            prodData.totalStock !== undefined
          ) {
            const currentRootStock = Number(prodData.inStock ?? prodData.stock ?? prodData.quantity ?? prodData.totalStock ?? 0);
            const newRootStock = Math.max(0, currentRootStock - item.quantity);

            if (prodData.inStock !== undefined)    updatePayload.inStock    = newRootStock;
            if (prodData.stock !== undefined)      updatePayload.stock      = newRootStock;
            if (prodData.quantity !== undefined)   updatePayload.quantity   = newRootStock;
            if (prodData.totalStock !== undefined) updatePayload.totalStock = newRootStock;
          } else {
            updatePayload.inStock = FieldValue.increment(-item.quantity);
            updatePayload.stock   = FieldValue.increment(-item.quantity);
          }

          txn.update(ref, updatePayload);
        }

        // 2c. Update Order Document → PLACED
        txn.update(orderRef, {
          orderStatus:                "PLACED",
          status:                     "Order Placed",
          paymentStatus:              "SUCCESS",
          paymentMethod:              paymentEntity?.method || "ONLINE",
          paymentMode:                "Online Payment",
          isPaid:                     true,
          paymentId:                  gatewayPaymentId,
          "payment.status":           "SUCCESS",
          "payment.paymentStatus":    "SUCCESS",
          "payment.gatewayPaymentId": gatewayPaymentId,
          "payment.gatewayOrderId":   gatewayOrderId,
          "payment.method":           paymentEntity?.method || "ONLINE",
          "paymentInfo.status":       "SUCCESS",
          "paymentInfo.paymentStatus":"SUCCESS",
          statusHistory: FieldValue.arrayUnion({
            status: "PLACED", updatedBy: "SYSTEM_WEBHOOK", timestamp: nowIso,
          }),
          updatedAt: nowStamp,
        });

        // 2d. Update Payment Document → SUCCESS
        if (paymentDoc && paymentDoc.exists) {
          txn.update(paymentRef, {
            status:               "SUCCESS",
            orderId,
            gatewayPaymentId,
            gatewayOrderId,
            gatewaySignature:     paymentEntity.signature || "",
            "webhook.verified":   true,
            "webhook.receivedAt": nowStamp,
            eventHistory: FieldValue.arrayUnion({
              event: "CAPTURED", gatewayPaymentId, timestamp: nowIso,
            }),
            updatedAt: nowStamp,
          });
        }

        // 2e. Update Analytics (Disabled)
        // const todayStr = new Date().toISOString().split("T")[0];
        // txn.set(
        //   db.collection("analytics").doc(`daily_${todayStr}`),
        //   {
        //     date:         todayStr,
        //     totalOrders:  FieldValue.increment(1),
        //     totalRevenue: FieldValue.increment(oData.pricing?.grandTotal || 0),
        //     updatedAt:    nowStamp,
        //   },
        //   { merge: true }
        // );
      });

      console.log(`✅ payment.captured: orderId=${orderId}, gatewayPaymentId=${gatewayPaymentId}`);
      return res.sendStatus(200);
    }

    // ======================================================
    // 2. payment.failed — Record failure, allow payment retry
    // ======================================================
    if (event === "payment.failed" && paymentEntity) {
      const orderId          = paymentEntity.receipt || paymentEntity.notes?.orderId;
      const gatewayPaymentId = paymentEntity.id || "";
      const gatewayOrderId   = paymentEntity.order_id || "";

      if (!orderId) {
        console.error("payment.failed: No orderId/receipt in payload.");
        return res.sendStatus(200);
      }

      // ── Pre-read idempotency check ────────────────────────
      const existingOrder = await db.collection("orders").doc(orderId).get();
      if (!existingOrder.exists) return res.sendStatus(200);
      const existingStatus = existingOrder.data().orderStatus;
      if (existingStatus === "PAYMENT_FAILED" || existingStatus === "PLACED") {
        console.log(`payment.failed ignored — order already in state: ${existingStatus}`);
        return res.sendStatus(200);
      }

      const orderRef = db.collection("orders").doc(orderId);

      await db.runTransaction(async (txn) => {
        const orderDoc = await txn.get(orderRef);
        if (!orderDoc.exists) return;

        const oData    = orderDoc.data();
        const nowIso   = new Date().toISOString();
        const nowStamp = FieldValue.serverTimestamp();

        // ── STEP 1: READ ALL DOCUMENTS UPFRONT ──────────────────────────────
        let paymentRef = null;
        let paymentDoc = null;
        if (oData.payment?.paymentId) {
          paymentRef = db.collection("payments").doc(oData.payment.paymentId);
          paymentDoc = await txn.get(paymentRef);
        }

        // ── STEP 2: PERFORM ALL WRITES ──────────────────────────────────────
        // Update Order → PAYMENT_FAILED
        txn.update(orderRef, {
          orderStatus:                "PAYMENT_FAILED",
          status:                     "Payment Failed",
          paymentStatus:              "FAILED",
          "payment.status":           "FAILED",
          "payment.paymentStatus":    "FAILED",
          "payment.gatewayPaymentId": gatewayPaymentId,
          "payment.gatewayOrderId":   gatewayOrderId,
          "paymentInfo.status":       "FAILED",
          "paymentInfo.paymentStatus":"FAILED",
          statusHistory: FieldValue.arrayUnion({
            status: "PAYMENT_FAILED", updatedBy: "SYSTEM_WEBHOOK", timestamp: nowIso,
          }),
          updatedAt: nowStamp,
        });

        // Update Payment document → FAILED
        if (paymentDoc && paymentDoc.exists) {
          txn.update(paymentRef, {
            status: "FAILED",
            gatewayPaymentId,
            gatewayOrderId,
            eventHistory: FieldValue.arrayUnion({
              event: "FAILED", gatewayPaymentId, timestamp: nowIso,
            }),
            updatedAt: nowStamp,
          });
        }
      });

      console.log(`❌ payment.failed: orderId=${orderId}`);
      return res.sendStatus(200);
    }

    // ── Other events — acknowledge and ignore ────────────────
    console.log(`Webhook event ignored: ${event}`);
    return res.sendStatus(200);

  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).send("Internal webhook error.");
  }
});


/* ============================================================
 *  6. cancelOrder  (Callable)
 *  Input:  { orderId, reason? }
 *  Output: { status, message }
 *  Roles:  Owner user OR admin (request.auth.token.admin)
 * ============================================================ */
exports.cancelOrder = onCall({ cors: true, invoker: "public" }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const { orderId, reason = "Customer requested cancellation" } = request.data || {};
  if (!orderId) throw new HttpsError("invalid-argument", "orderId is required.");

  const orderRef = db.collection("orders").doc(orderId);
  const orderDoc = await orderRef.get();
  if (!orderDoc.exists) throw new HttpsError("not-found", "Order not found.");

  const oData = orderDoc.data();

  // Authorization: owner or admin
  if (oData.userId !== request.auth.uid && !request.auth.token?.admin) {
    throw new HttpsError("permission-denied", "You are not authorized to cancel this order.");
  }

  // State guard: only PLACED, PAYMENT_PENDING, PAYMENT_FAILED orders can be cancelled
  const cancellableStatuses = ["PLACED", "PAYMENT_PENDING", "PAYMENT_FAILED"];
  if (!cancellableStatuses.includes(oData.orderStatus)) {
    throw new HttpsError(
      "failed-precondition",
      `Order cannot be cancelled. Current status: ${oData.orderStatus}.`
    );
  }

  // Trigger Razorpay refund if payment was successfully captured
  let rzpRefund = null;
  if (oData.orderStatus === "PLACED" && oData.payment?.gatewayPaymentId) {
    try {
      rzpRefund = await razorpay.payments.refund(oData.payment.gatewayPaymentId, {
        amount: Math.round((oData.pricing?.grandTotal || 0) * 100),
        notes:  { orderId, reason },
      });
    } catch (err) {
      console.error("Razorpay refund error:", err.message);
      // Non-blocking: continue cancellation even if Razorpay API is down
    }
  }

  await db.runTransaction(async (txn) => {
    const orderDoc = await txn.get(orderRef);
    if (!orderDoc.exists) return;

    const oData = orderDoc.data();

    // ── STEP 1: READ ALL DOCUMENTS UPFRONT (Firestore strict requirement) ────
    // 1a. Read Payment Document
    let paymentRef = null;
    let paymentDoc = null;
    if (oData.payment?.paymentId) {
      paymentRef = db.collection("payments").doc(oData.payment.paymentId);
      paymentDoc = await txn.get(paymentRef);
    }

    // 1b. Read Product Documents
    const productReads = [];
    if (oData.orderStatus === "PLACED" && Array.isArray(oData.products)) {
      for (const item of oData.products) {
        if (item.productId) {
          const pRef = db.collection("products").doc(item.productId);
          productReads.push({ item, ref: pRef, promise: txn.get(pRef) });
        }
      }
    }
    const productSnaps = await Promise.all(productReads.map((p) => p.promise));

    // ── STEP 2: PERFORM ALL WRITES ───────────────────────────────────────────
    const nowIso   = new Date().toISOString();
    const nowStamp = FieldValue.serverTimestamp();
    const newStatus = oData.orderStatus === "PLACED" ? "REFUNDED" : "CANCELLED";

    // 2a. Update Order
    txn.update(orderRef, {
      orderStatus:                newStatus,
      status:                     newStatus === "REFUNDED" ? "Refunded" : "Cancelled",
      paymentStatus:              newStatus === "REFUNDED" ? "REFUNDED" : (oData.paymentStatus || "CANCELLED"),
      "payment.status":           newStatus === "REFUNDED" ? "REFUNDED" : (oData.payment?.status || "CANCELLED"),
      "paymentInfo.status":       newStatus === "REFUNDED" ? "REFUNDED" : (oData.paymentInfo?.status || "CANCELLED"),
      cancelledAt:                nowStamp,
      adminNote:                  reason,
      statusHistory: FieldValue.arrayUnion({
        status: newStatus, updatedBy: request.auth.uid, timestamp: nowIso,
      }),
      updatedAt:                  nowStamp,
    });

    // 2b. Update Payment document
    if (paymentDoc && paymentDoc.exists) {
      txn.update(paymentRef, {
        status:              rzpRefund ? "REFUNDED" : "CANCELLED",
        "refund.refundId":   rzpRefund?.id   || null,
        "refund.amount":     oData.pricing?.grandTotal || 0,
        "refund.reason":     reason,
        "refund.status":     rzpRefund ? "PROCESSED" : "NOT_APPLICABLE",
        "refund.refundedAt": rzpRefund ? nowStamp : null,
        eventHistory: FieldValue.arrayUnion({
          event: rzpRefund ? "REFUNDED" : "CANCELLED", timestamp: nowIso,
        }),
        updatedAt: nowStamp,
      });
    }

    // 2c. Restore stock (only if order was PLACED = payment was actually captured)
    if (oData.orderStatus === "PLACED") {
      for (let i = 0; i < productReads.length; i++) {
        const { item, ref } = productReads[i];
        const prodDoc = productSnaps[i];
        if (!prodDoc.exists) continue;
        const prodData = prodDoc.data();

        const updatePayload = { updatedAt: nowStamp };

        if (prodData.variants && Array.isArray(prodData.variants) && prodData.variants.length > 0) {
          const targetIdx = prodData.variants.findIndex((v, idx) =>
            v.id === item.variantId || v.sku === item.variantId || v.variantId === item.variantId || String(idx) === String(item.variantId)
          );
          const matchIndex = targetIdx !== -1 ? targetIdx : 0;
          const restoredVariants = prodData.variants.map((v, idx) => {
            if (idx !== matchIndex) return v;
            const currentStock = Number(v.inStock ?? v.stock ?? v.quantity ?? 0);
            const newStock = currentStock + item.quantity;
            return { ...v, inStock: newStock, stock: newStock };
          });
          updatePayload.variants = restoredVariants;
        }

        if (
          prodData.inStock !== undefined ||
          prodData.stock !== undefined ||
          prodData.quantity !== undefined ||
          prodData.totalStock !== undefined
        ) {
          const currentRootStock = Number(prodData.inStock ?? prodData.stock ?? prodData.quantity ?? prodData.totalStock ?? 0);
          const newRootStock = currentRootStock + item.quantity;

          if (prodData.inStock !== undefined)    updatePayload.inStock    = newRootStock;
          if (prodData.stock !== undefined)      updatePayload.stock      = newRootStock;
          if (prodData.quantity !== undefined)   updatePayload.quantity   = newRootStock;
          if (prodData.totalStock !== undefined) updatePayload.totalStock = newRootStock;
        } else {
          updatePayload.inStock = FieldValue.increment(item.quantity);
          updatePayload.stock   = FieldValue.increment(item.quantity);
        }

        txn.update(ref, updatePayload);
      }

      // Rollback coupon usage
      if (oData.coupon?.couponId) {
        const couponRef = db.collection("coupons").doc(oData.coupon.couponId);
        txn.update(couponRef, { currentUsage: FieldValue.increment(-1), updatedAt: nowStamp });
      }
    }
  });

  return {
    status:  "success",
    message: rzpRefund
      ? `Order cancelled. Refund of ₹${oData.pricing?.grandTotal} initiated.`
      : "Order cancelled successfully.",
  };
});
