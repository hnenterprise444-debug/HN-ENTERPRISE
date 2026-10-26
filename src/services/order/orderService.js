import { fireDB } from '../../firebase/FirebaseConfig.js';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';

export const orderService = {
  /**
   * Validates whether an order status transition is allowed according to lifecycle rules.
   */
  validateStatusTransition(currentOrder, targetStatus) {
    if (!currentOrder || !targetStatus) {
      throw new Error("Order and target status are required for validation.");
    }

    const currentStatus = (currentOrder.orderStatus || currentOrder.status || "PLACED").toUpperCase();
    const target = targetStatus.toUpperCase();
    const paymentStat = String(currentOrder.paymentStatus || currentOrder.payment?.status || "").toUpperCase();

    const isPaymentSuccess = paymentStat.includes("PAID") || paymentStat.includes("SUCCESS");

    const paidOrAdvancedStatuses = [
      "CONFIRMED",
      "PROCESSING",
      "PACKED",
      "SHIPPED",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ];

    const isPaidOrAdvanced = isPaymentSuccess || paidOrAdvancedStatuses.includes(currentStatus);

    // Rule 1: Once payment is completed or order reaches Confirmed/beyond, cannot revert to PAYMENT_PENDING or PLACED
    if (isPaidOrAdvanced && (target === "PAYMENT_PENDING" || target === "PLACED")) {
      throw new Error("Invalid status transition: A paid or confirmed order cannot be moved back to Payment Pending or Placed.");
    }

    // Rule 2: Delivered orders cannot revert to pre-fulfillment states
    if (currentStatus === "DELIVERED" && ["PAYMENT_PENDING", "PLACED", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(target)) {
      throw new Error("Invalid status transition: Delivered orders cannot revert to earlier fulfillment states.");
    }

    // Rule 3: Cancelled orders cannot transition to active fulfillment states
    if (currentStatus === "CANCELLED" && target !== "CANCELLED" && target !== "REFUNDED") {
      throw new Error("Invalid status transition: Cancelled orders cannot be moved to active fulfillment states.");
    }

    return true;
  },

  /**
   * Updates an order's status in Firestore with backend workflow validation
   */
  async updateOrderStatus(orderId, newStatus, updatedBy = "ADMIN") {
    if (!orderId || !newStatus) throw new Error("Order ID and new status are required.");

    const docRef = doc(fireDB, "orders", orderId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Order not found in database.");
    }

    const currentOrder = { id: docSnap.id, ...docSnap.data() };
    
    // Backend validation (Source of Truth)
    this.validateStatusTransition(currentOrder, newStatus);

    const now = Timestamp.now();
    const historyEntry = {
      status: newStatus,
      timestamp: now,
      updatedBy: updatedBy || "ADMIN",
    };

    const updatePayload = {
      orderStatus: newStatus,
      status: newStatus,
      updatedAt: now,
      statusHistory: arrayUnion(historyEntry),
    };

    if (newStatus === "DELIVERED") {
      updatePayload.deliveredAt = now;
      updatePayload["paymentStatus"] = "Success";
      updatePayload["payment.status"] = "Success";
    } else if (newStatus === "CANCELLED") {
      updatePayload.cancelledAt = now;
    }

    await updateDoc(docRef, updatePayload);
    return updatePayload;
  },

  /**
   * Records cash payment collection for COD orders
   */
  async recordCashPayment(orderId, updatedBy = "ADMIN") {
    if (!orderId) throw new Error("Order ID is required.");
    const docRef = doc(fireDB, "orders", orderId);
    const now = Timestamp.now();
    await updateDoc(docRef, {
      paymentStatus: "PAID",
      "payment.status": "PAID",
      updatedAt: now,
      statusHistory: arrayUnion({
        status: "PAYMENT_COLLECTED",
        note: "Cash on delivery payment collected.",
        timestamp: now,
        updatedBy: updatedBy || "ADMIN",
      }),
    });
  },

  /**
   * Fetches personal customer orders from Firestore for the client panel.
   * Scoped strictly to the authenticated user's ID and Email across schema variations.
   */
  async getOrders(userId, email) {
    if (!userId && !email) return [];
    
    const ordersMap = new Map();
    const queries = [];

    if (userId) {
      queries.push(getDocs(query(collection(fireDB, "orders"), where("userId", "==", userId))));
      queries.push(getDocs(query(collection(fireDB, "orders"), where("userid", "==", userId))));
      queries.push(getDocs(query(collection(fireDB, "orders"), where("customerId", "==", userId))));
    }
    if (email) {
      queries.push(getDocs(query(collection(fireDB, "orders"), where("userEmail", "==", email))));
      queries.push(getDocs(query(collection(fireDB, "orders"), where("email", "==", email))));
      queries.push(getDocs(query(collection(fireDB, "orders"), where("customerEmail", "==", email))));
    }
    
    const snaps = await Promise.allSettled(queries);
    snaps.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        result.value.forEach((doc) => ordersMap.set(doc.id, { docId: doc.id, id: doc.id, ...doc.data() }));
      }
    });
    
    const ordersArray = Array.from(ordersMap.values());
    
    // Sort descending by date / createdAt (newest orders first)
    ordersArray.sort((a, b) => {
      const getMs = (o) => {
        if (!o) return 0;
        const val = o.createdAt || o.date || o.updatedAt;
        if (!val) return 0;
        if (typeof val?.toMillis === "function") return val.toMillis();
        if (typeof val?.toDate === "function") return val.toDate().getTime();
        if (val?.seconds !== undefined) return val.seconds * 1000 + (val.nanoseconds || 0) / 1000000;
        if (typeof val === "number") return val;
        if (typeof val === "string") {
          const parsed = new Date(val).getTime();
          return isNaN(parsed) ? 0 : parsed;
        }
        if (val instanceof Date) return val.getTime();
        return 0;
      };
      return getMs(b) - getMs(a);
    });
    
    return ordersArray;
  },

  /**
   * Fetches a single order document by its ID (docId, orderId, or paymentId)
   */
  async getOrderById(id) {
    if (!id) return null;
    try {
      // 1. Direct document lookup by Firestore ID
      const docRef = doc(fireDB, "orders", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { docId: snap.id, id: snap.id, ...snap.data() };
      }

      // 2. Lookup by custom orderId field
      const q1 = query(collection(fireDB, "orders"), where("orderId", "==", id));
      const snap1 = await getDocs(q1);
      if (!snap1.empty) {
        const d = snap1.docs[0];
        return { docId: d.id, id: d.id, ...d.data() };
      }

      // 3. Lookup by paymentId field
      const q2 = query(collection(fireDB, "orders"), where("paymentId", "==", id));
      const snap2 = await getDocs(q2);
      if (!snap2.empty) {
        const d = snap2.docs[0];
        return { docId: d.id, id: d.id, ...d.data() };
      }

      return null;
    } catch (err) {
      console.error("Error fetching order by ID:", err);
      throw err;
    }
  },

  /**
   * Creates a new order in Firestore
   */
  async createOrder(orderInfo) {
    const docRef = await addDoc(collection(fireDB, "orders"), orderInfo);
    return docRef;
  },

  /**
   * Fetches orders using Firestore cursor-based pagination with resilient filter fallbacks
   */
  async getPaginatedOrders({ pageSize = 10, lastDoc = null, statusFilter = null }) {
    const { limit, startAfter, orderBy } = await import('firebase/firestore');
    const whereConstraints = [];

    if (statusFilter && statusFilter !== 'ALL') {
      whereConstraints.push(where("orderStatus", "==", statusFilter));
    }
    
    const fullConstraints = [
      ...whereConstraints,
      orderBy("createdAt", "desc"),
      limit(pageSize + 1)
    ];

    if (lastDoc) {
      fullConstraints.push(startAfter(lastDoc));
    }

    let snap;
    try {
      const q = query(collection(fireDB, "orders"), ...fullConstraints);
      snap = await getDocs(q);
    } catch (err) {
      console.warn("Order query index notice. Falling back to filter-preserving query:", err);
      try {
        const simpleQ = query(collection(fireDB, "orders"), ...whereConstraints, limit(pageSize + 1));
        snap = await getDocs(simpleQ);
      } catch (err2) {
        snap = await getDocs(query(collection(fireDB, "orders"), limit(100)));
      }
    }

    const docs = snap.docs;

    let orders = docs.map((docSnap) => ({
      docId: docSnap.id,
      id: docSnap.id,
      ...docSnap.data(),
      docSnap
    }));

    if (statusFilter && statusFilter !== 'ALL') {
      orders = orders.filter(o => (o.orderStatus || o.status) === statusFilter);
    }

    const hasMore = orders.length > pageSize;
    const pageOrders = hasMore ? orders.slice(0, pageSize) : orders;
    const lastVisible = pageOrders.length > 0 ? pageOrders[pageOrders.length - 1].docSnap : null;
    const cleanOrders = pageOrders.map(({ docSnap: _docSnap, ...rest }) => rest);

    return { orders: cleanOrders, lastDoc: lastVisible, hasMore };
  },

  /**
   * Fetches orders matching user ID and executes callback if provided
   */
  async getOrdersByUser(userId, callbackOrEmail, callback) {
    let email = null;
    let cb = null;
    if (typeof callbackOrEmail === 'function') {
      cb = callbackOrEmail;
    } else {
      email = callbackOrEmail;
      cb = callback;
    }
    const orders = await this.getOrders(userId, email);
    if (typeof cb === 'function') {
      cb(orders);
    }
    return orders;
  }
};
