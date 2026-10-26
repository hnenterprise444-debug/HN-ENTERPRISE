import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { fireDB } from "../../firebase/FirebaseConfig";

const COUPONS_COL = () => collection(fireDB, "coupons");

export const couponService = {
  /** Fetch all coupons from Firestore */
  async getCoupons() {
    const snap = await getDocs(COUPONS_COL());
    return snap.docs.map((d) => ({
      couponId: d.id,
      id: d.id,
      ...d.data(),
    }));
  },

  /** Fetch single coupon by ID */
  async getCouponById(couponId) {
    if (!couponId) return null;
    const snap = await getDoc(doc(fireDB, "coupons", couponId));
    if (!snap.exists()) return null;
    return { couponId: snap.id, id: snap.id, ...snap.data() };
  },

  /** Fetch single coupon by code */
  async getCouponByCode(code) {
    if (!code) return null;
    const q = query(COUPONS_COL(), where("code", "==", code.trim().toUpperCase()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docData = snap.docs[0];
    return { couponId: docData.id, id: docData.id, ...docData.data() };
  },

  /** Create a new coupon */
  async addCoupon(data) {
    const cleanCode = (data.code || "").trim().toUpperCase();
    const docRef = await addDoc(COUPONS_COL(), {
      code: cleanCode,
      type: data.type || "PERCENTAGE",
      discountValue: Number(data.discountValue) || 0,
      minimumOrderAmount: Number(data.minimumOrderAmount) || 0,
      maximumDiscountAmount: data.maximumDiscountAmount ? Number(data.maximumDiscountAmount) : null,
      usageLimit: Number(data.usageLimit) || 100,
      usagePerUser: Number(data.usagePerUser) || 1,
      currentUsage: 0,
      validFrom: data.validFrom || "",
      validUntil: data.validUntil || "",
      isActive: data.isActive ?? true,
      appliesTo: data.appliesTo || "ALL",
      applicableProducts: Array.isArray(data.applicableProducts) ? data.applicableProducts : [],
      applicableCategories: Array.isArray(data.applicableCategories) ? data.applicableCategories : [],
      createdAt: serverTimestamp(),
    });
    return { couponId: docRef.id, id: docRef.id, ...data, code: cleanCode };
  },

  /** Update an existing coupon */
  async updateCoupon(couponId, data) {
    const docRef = doc(fireDB, "coupons", couponId);
    const updateData = {
      code: (data.code || "").trim().toUpperCase(),
      type: data.type || "PERCENTAGE",
      discountValue: Number(data.discountValue) || 0,
      minimumOrderAmount: Number(data.minimumOrderAmount) || 0,
      maximumDiscountAmount: data.maximumDiscountAmount ? Number(data.maximumDiscountAmount) : null,
      usageLimit: Number(data.usageLimit) || 100,
      usagePerUser: Number(data.usagePerUser) || 1,
      validFrom: data.validFrom || "",
      validUntil: data.validUntil || "",
      isActive: data.isActive ?? true,
      appliesTo: data.appliesTo || "ALL",
      applicableProducts: Array.isArray(data.applicableProducts) ? data.applicableProducts : [],
      applicableCategories: Array.isArray(data.applicableCategories) ? data.applicableCategories : [],
      updatedAt: serverTimestamp(),
    };
    await updateDoc(docRef, updateData);
    return { couponId, id: couponId, ...updateData };
  },

  /** Toggle coupon active/inactive status */
  async toggleCouponStatus(couponId, isActive) {
    const docRef = doc(fireDB, "coupons", couponId);
    await updateDoc(docRef, {
      isActive: Boolean(isActive),
      updatedAt: serverTimestamp(),
    });
  },

  /** Delete a coupon */
  async deleteCoupon(couponId) {
    await deleteDoc(doc(fireDB, "coupons", couponId));
  },
};
