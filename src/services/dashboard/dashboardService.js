import { fireDB } from '../../firebase/FirebaseConfig';
import { getCountFromServer, query, where, collection } from 'firebase/firestore';

/**
 * Dashboard Service
 * Uses Firestore getCountFromServer() aggregation API to fetch metric counts.
 * Costs ZERO document reads for count queries.
 */
export const dashboardService = {
  /**
   * Fetches overall count metrics for Dashboard KPIs
   * Costs 0 document reads (uses server-side aggregation metadata)
   */
  async getStats() {
    try {
      const [
        totalProductsSnap,
        activeProductsSnap,
        totalOrdersSnap,
        pendingOrdersSnap,
        totalUsersSnap
      ] = await Promise.all([
        getCountFromServer(collection(fireDB, 'products')),
        getCountFromServer(query(collection(fireDB, 'products'), where('isActive', '==', true))),
        getCountFromServer(collection(fireDB, 'orders')),
        getCountFromServer(query(collection(fireDB, 'orders'), where('orderStatus', '==', 'PAYMENT_PENDING'))),
        getCountFromServer(collection(fireDB, 'users')),
      ]);

      return {
        totalProducts: totalProductsSnap.data().count,
        activeProducts: activeProductsSnap.data().count,
        totalOrders: totalOrdersSnap.data().count,
        pendingOrders: pendingOrdersSnap.data().count,
        totalUsers: totalUsersSnap.data().count,
      };
    } catch (err) {
      console.warn("Failed to fetch dashboard aggregation stats:", err);
      return {
        totalProducts: 0,
        activeProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalUsers: 0,
      };
    }
  }
};

export default dashboardService;
