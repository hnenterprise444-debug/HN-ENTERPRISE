import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from "firebase/firestore";
import { fireDB } from "../../firebase/FirebaseConfig";

/**
 * Activity & Audit Logging Service
 * Tracks essential admin logs: Product Added, Admin Added, Order Updated, Coupon Created.
 */
export const activityService = {
  /**
   * Log an event into the activity_logs collection
   */
  async logActivity({ type, title, description, userEmail = "Admin" }) {
    try {
      await addDoc(collection(fireDB, "activity_logs"), {
        type: type || "GENERAL_ACTION",
        title: title || "Admin Action",
        description: description || "",
        userEmail: userEmail || "Admin",
        createdAt: Timestamp.now(),
      });
    } catch (err) {
      console.warn("Failed to record activity log:", err);
    }
  },

  /**
   * Fetch recent activity logs sorted by timestamp descending
   */
  async getRecentActivities(maxCount = 10) {
    try {
      const q = query(
        collection(fireDB, "activity_logs"),
        orderBy("createdAt", "desc"),
        limit(maxCount)
      );
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
    } catch (err) {
      console.warn("Failed to fetch recent activity logs:", err);
      return [];
    }
  }
};
