import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { orderService } from "../../services/order/orderService";
import { queryKeys } from "../../utils/queryKeys";
import useAuth from "../auth/useAuth";
import { addToCart } from "../../redux/cartSlice";

/**
 * useCustomerOrderDetail Hook
 * Fetches, caches, and manages customer order detail interactions.
 * Features instant cached display, authorization check, cancel order handling,
 * and seamless "Buy Again" integration.
 */
export default function useCustomerOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const currentUserId = user?.user?.uid || user?.uid || "";
  const currentUserEmail = user?.user?.email || user?.email || "";
  const currentUserRole = user?.user?.role || user?.role || "USER";
  const isAdmin = currentUserRole === 'ADMIN' || currentUserRole === 'SUPERADMIN';

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // ── 1. TanStack Query with Instant Cache Re-use ────────────────────────
  const {
    data: order = null,
    isLoading,
    isFetching,
    error,
    refetch
  } = useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => orderService.getOrderById(id),
    enabled: Boolean(id),
    initialData: () => {
      if (!id) return undefined;
      // Pre-check navigation state if passed directly from order card
      if (location.state?.order) {
        return location.state.order;
      }
      // Search all cached orders in TanStack Query memory
      const cachedQueries = queryClient.getQueriesData({ queryKey: queryKeys.orders.all });
      for (const [, queryData] of cachedQueries) {
        if (!queryData) continue;
        if (Array.isArray(queryData)) {
          const found = queryData.find((o) => (o.id || o.docId || o.orderId) === id);
          if (found) return found;
        }
        if (Array.isArray(queryData?.orders)) {
          const found = queryData.orders.find((o) => (o.id || o.docId || o.orderId) === id);
          if (found) return found;
        }
      }
      return undefined;
    },
    staleTime: 5 * 1000, // 5 seconds stale time for live order updates
    gcTime: 15 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // ── 2. Authorization Verification ──────────────────────────────────────
  const orderOwnerId = order?.userId || order?.userid || "";
  const orderOwnerEmail = order?.addressInfo?.email || order?.address?.email || order?.email || "";
  
  const isAuthorized = !order
    ? true
    : isAdmin ||
      (currentUserId && orderOwnerId && orderOwnerId === currentUserId) ||
      (currentUserEmail && orderOwnerEmail && orderOwnerEmail.toLowerCase() === currentUserEmail.toLowerCase());

  // ── 3. Cancellation Helper ─────────────────────────────────────────────
  const rawStatus = (order?.orderStatus || order?.status || "PLACED").toUpperCase();
  const canCancel = ["PLACED", "PAYMENT_PENDING", "CONFIRMED"].includes(rawStatus);

  const handleCancelOrder = async (_reason = "Customer cancelled order") => {
    if (!order || !canCancel) {
      toast.error("This order is no longer eligible for cancellation.");
      return;
    }

    const targetId = order.docId || order.id || id;
    setCancelling(true);
    try {
      await orderService.updateOrderStatus(targetId, "CANCELLED", "CUSTOMER");
      toast.success("Order has been cancelled successfully.");
      setIsCancelModalOpen(false);
      
      // Invalidate both detail and list caches
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      await refetch();
    } catch (err) {
      console.error("Failed to cancel order:", err);
      toast.error(err?.message || "Failed to cancel order. Please contact support.");
    } finally {
      setCancelling(false);
    }
  };

  // ── 4. Buy Again (Re-add items to cart) ─────────────────────────────────
  const handleBuyAgain = (item = null) => {
    const itemsToAdd = item
      ? [item]
      : (Array.isArray(order?.products) ? order.products : (Array.isArray(order?.items) ? order.items : []));

    if (itemsToAdd.length === 0) {
      toast.error("No items found to re-order.");
      return;
    }

    itemsToAdd.forEach((it) => {
      const cartItem = {
        id: it.productId || it.id || `reorder_${Date.now()}`,
        title: it.productName || it.title || it.name || "Product Item",
        price: it.price || it.unitPrice || it.sellingPrice || 0,
        originalPrice: it.originalPrice || it.mrp || it.price || 0,
        imageUrl: it.productImage || it.imageUrl || it.images?.[0] || "",
        selectedVariant: it.selectedVariant || null,
        quantity: Number(it.quantity || it.qty || 1) || 1,
      };
      dispatch(addToCart(cartItem));
    });

    toast.success("Items added to your cart!");
    navigate("/cart");
  };

  // ── 5. Helper Copy ─────────────────────────────────────────────────────
  const copyToClipboard = (text, label = "Copied to clipboard!") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(label);
  };

  return {
    order,
    orderId: order?.orderId || order?.docId || order?.id || id,
    rawStatus,
    canCancel,
    isAuthorized,
    isLoading: isLoading && !order,
    isFetching,
    error,
    isCancelModalOpen,
    setIsCancelModalOpen,
    cancelling,
    handleCancelOrder,
    handleBuyAgain,
    copyToClipboard,
    refetch,
  };
}
