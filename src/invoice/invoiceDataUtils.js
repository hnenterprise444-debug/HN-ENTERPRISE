/**
 * invoiceDataUtils.js
 * Centralized invoice data normalization utility.
 * Transforms trusted Firestore order snapshots and siteConfig into a standardized, generic invoice object.
 */

export function normalizeInvoiceData(order = {}, siteConfig = {}) {
  const orderId = order.orderId || order.docId || order.id || "N/A";
  
  // Deterministic Invoice Number
  const invoiceNumber = order.invoiceNumber || 
    order.invoice?.invoiceNumber || 
    `INV-${String(orderId).replace(/[^a-zA-Z0-9]/g, "").slice(0, 14).toUpperCase()}`;

  // Formatted Order Date
  let formattedDate = "--";
  if (order.createdAt?.seconds) {
    formattedDate = new Date(order.createdAt.seconds * 1000).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } else if (order.date) {
    formattedDate = typeof order.date === "string" ? order.date : new Date(order.date).toLocaleDateString("en-IN");
  } else {
    formattedDate = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  // Company Details
  const companyName = siteConfig?.companyName?.trim() || "Ecommerce Store";
  const companyTagline = siteConfig?.companyTagline || "";
  const companyLogo = siteConfig?.companyLogo || "";
  const storeAddressObj = siteConfig?.address || {};
  const companyAddress = [
    storeAddressObj.line1,
    storeAddressObj.line2,
    storeAddressObj.city,
    storeAddressObj.state,
    storeAddressObj.pincode
  ].filter(Boolean).join(", ") || "N/A";

  const rawPhoneObj = siteConfig?.phones?.[0];
  const companyPhone = typeof rawPhoneObj === "object" && rawPhoneObj !== null
    ? (rawPhoneObj.number || rawPhoneObj.phone || "")
    : (typeof rawPhoneObj === "string" ? rawPhoneObj : "");

  const companyEmail = siteConfig?.emails?.[0] || siteConfig?.email || "";
  const companyGstin = siteConfig?.gstin || siteConfig?.gstNumber || siteConfig?.gst || "";

  // Customer & Shipping Address Details
  const addressInfo = order.addressInfo || order.address || order.shippingAddress || {};
  const customerName = addressInfo.name || addressInfo.fullName || order.userName || "Valued Customer";
  const streetAddress = addressInfo.address || addressInfo.street || "";
  const city = addressInfo.city || "";
  const state = addressInfo.state || "";
  const pincode = addressInfo.pincode || "";
  const fullCustomerAddress = [streetAddress, city, state, pincode].filter(Boolean).join(", ") || "N/A";
  const customerPhone = addressInfo.mobileNumber || addressInfo.phoneNumber || addressInfo.phone || order.userPhone || "--";
  const customerEmail = addressInfo.email || order.userEmail || order.email || "--";

  // Line Items with Generic Variant Support
  const rawItems = Array.isArray(order.products) && order.products.length > 0
    ? order.products
    : (Array.isArray(order.items) && order.items.length > 0
        ? order.items
        : (Array.isArray(order.cart) && order.cart.length > 0
            ? order.cart
            : (Array.isArray(order.cartItems) ? order.cartItems : [])));

  const lineItems = [];

  if (order.isCustom || order.itemInfo) {
    // Custom Artwork Commission Item
    const drawingType = order.itemInfo?.selectedDrawingType || "Handmade Custom Portrait";
    const sheetType = order.itemInfo?.selectedSheetType || "Standard";
    const customPrice = Number(order.pricing?.grandTotal || order.totalAmount || 0);

    lineItems.push({
      id: "custom_1",
      name: drawingType,
      imageUrl: order.image || "",
      sku: "CUSTOM-ART",
      qty: 1,
      unitPrice: customPrice,
      totalPrice: customPrice,
      variants: [
        { label: "Commission Type", value: "Custom Artwork" },
        { label: "Sheet Type", value: sheetType }
      ]
    });
  } else {
    // Standard Product Items
    rawItems.forEach((item, idx) => {
      const name = item.productName || item.title || item.name || `Product #${idx + 1}`;
      const qty = Number(item.qty || item.quantity || 1) || 1;
      
      let price = Number(
        item.price ??
        item.sellingPrice ??
        item.unitPrice ??
        item.offerPrice ??
        item.discountPrice ??
        item.salePrice ??
        item.finalPrice ??
        item.productPrice ??
        item.priceAtPurchase ??
        item.selectedVariant?.price ??
        0
      );

      let mrp = Number(
        item.originalPrice ??
        item.mrp ??
        item.basePrice ??
        item.selectedVariant?.originalPrice ??
        item.selectedVariant?.mrp ??
        price
      );

      if (mrp < price) {
        mrp = price;
      }

      let lineTotal = Number(item.totalPrice ?? item.total ?? item.amount ?? (price * qty));

      if (!price && lineTotal) {
        price = lineTotal / qty;
        if (mrp < price) mrp = price;
      } else if (!lineTotal && price) {
        lineTotal = price * qty;
      }

      const unitDiscount = Math.max(0, mrp - price);
      const itemDiscount = unitDiscount * qty;

      const itemGst = Number(item.gst ?? item.tax ?? 0);
      const itemCess = Number(item.cess ?? 0);

      // Extract Generic Variants / Attributes
      const variants = [];
      if (item.size) variants.push({ label: "Size", value: item.size });
      if (item.color) variants.push({ label: "Color", value: item.color });
      if (item.selectedVariant) {
        if (typeof item.selectedVariant === "object") {
          Object.entries(item.selectedVariant).forEach(([key, val]) => {
            if (
              key !== "price" && 
              key !== "id" && 
              key !== "originalPrice" && 
              key !== "mrp" && 
              typeof val !== "object"
            ) {
              variants.push({ label: key, value: String(val) });
            }
          });
        } else {
          variants.push({ label: "Variant", value: String(item.selectedVariant) });
        }
      }
      if (item.attributes && typeof item.attributes === "object") {
        Object.entries(item.attributes).forEach(([key, val]) => {
          variants.push({ label: key, value: String(val) });
        });
      }

      lineItems.push({
        id: item.id || item.productId || `item_${idx}`,
        name,
        imageUrl: item.productImage || item.imageUrl || item.images?.[0] || "",
        qty,
        mrp,
        unitPrice: price,
        discount: itemDiscount,
        gst: itemGst,
        cess: itemCess,
        totalPrice: lineTotal,
        variants
      });
    });
  }

  // Pricing & Tax Summary
  const rawPricing = order.pricing || {};

  const totalMrpSubtotal = lineItems.reduce((acc, curr) => acc + ((curr.mrp || curr.unitPrice) * curr.qty), 0);
  const totalSellingSubtotal = lineItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const totalMrpDiscount = lineItems.reduce((acc, curr) => acc + (curr.discount || 0), 0);

  const couponDiscount = Number(rawPricing.discountAmount ?? rawPricing.couponDiscount ?? order.couponDiscount ?? 0);
  const shippingCharge = Number(rawPricing.shippingFee ?? rawPricing.shippingCharge ?? order.shippingCharge ?? 0);
  const tax = Number(rawPricing.tax ?? order.tax ?? 0);

  // Subtotal is MRP total if MRP discount exists, otherwise selling price subtotal
  const subtotal = totalMrpDiscount > 0 ? totalMrpSubtotal : totalSellingSubtotal;

  let grandTotal = Number(rawPricing.grandTotal ?? order.totalAmount ?? order.amount ?? 0);
  if (!grandTotal) {
    grandTotal = Math.max(0, totalSellingSubtotal - couponDiscount + shippingCharge + tax);
  }

  // Payment Details
  const isCod = Boolean(
    order.isCod === true ||
    Number(order.pricing?.codHandlingFee || order.codHandlingFee || 0) > 0 ||
    String(order.paymentMode || order.paymentMethod || order.payment?.gateway || order.payment?.method || "").toUpperCase().includes("COD") ||
    String(order.paymentMode || order.paymentMethod || "").toUpperCase().includes("CASH")
  );

  const paymentMode = isCod
    ? "Cash on Delivery"
    : (order.paymentMode || order.paymentMethod || order.paymentInfo?.method || order.payment?.gateway || "Online Payment");

  const paymentId = order.paymentId || order.payment?.paymentId || order.gatewayOrderId || "N/A";
  const paymentStatus = isCod 
    ? (order.orderStatus === "DELIVERED" ? "PAID" : "PENDING (ON DELIVERY)")
    : (order.paymentStatus || (order.orderStatus === "DELIVERED" ? "PAID" : "COMPLETED"));

  // QR Code URL Redirect Path
  const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";
  const qrUrl = origin ? `${origin}/profile?tab=orders` : "/profile?tab=orders";

  return {
    orderId,
    invoiceNumber,
    date: formattedDate,
    qrUrl,
    company: {
      name: companyName,
      tagline: companyTagline,
      logo: companyLogo,
      address: companyAddress,
      phone: companyPhone,
      email: companyEmail,
      gstin: companyGstin
    },
    customer: {
      name: customerName,
      address: fullCustomerAddress,
      city,
      state,
      pincode,
      phone: customerPhone,
      email: customerEmail
    },
    items: lineItems,
    pricing: {
      subtotal,
      mrpSubtotal: totalMrpSubtotal,
      sellingSubtotal: totalSellingSubtotal,
      mrpDiscount: totalMrpDiscount,
      couponDiscount,
      shippingCharge,
      tax,
      grandTotal
    },
    payment: {
      mode: paymentMode,
      paymentId,
      status: paymentStatus
    },
    siteConfig: siteConfig || {},
    rawOrder: order
  };
}
