import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { doc, onSnapshot } from "firebase/firestore";
import { fireDB } from "../../firebase/FirebaseConfig";
import { clearCart } from "../../redux/cartSlice.jsx";
import { paymentService } from "../../services/payment/paymentService";
import { productService } from "../../services/product/productService";
import { userService } from "../../services/user/userService";
import useAuth from "../auth/useAuth";
import { useSiteConfig } from "../../context/SiteConfigContext";
import { getFriendlyErrorMessage } from "../../utils/firebaseErrorHandler.js";

/**
 * Checkout State Machine Stages:
 *  idle -> loading -> ready -> submitting -> payment_modal -> processing -> success | error
 */
export function useCheckout() {
  const { user } = useAuth();
  const { config } = useSiteConfig();
  const cart = useSelector((s) => s.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Admin-configured payment methods
  const enableOnline = config?.paymentMethods?.enableOnline !== false;
  const enableCod = config?.paymentMethods?.enableCod !== false;

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Payment State (defaults to whichever method is available)
  const [paymentMethod, setPaymentMethod] = useState(() => {
    if (!enableOnline && enableCod) return "COD";
    return "ONLINE";
  });

  // Automatically adjust payment method if current selection becomes disabled by config
  useEffect(() => {
    if (!enableOnline && enableCod && paymentMethod !== "COD") {
      setPaymentMethod("COD");
    } else if (enableOnline && !enableCod && paymentMethod !== "ONLINE") {
      setPaymentMethod("ONLINE");
    }
  }, [enableOnline, enableCod, paymentMethod]);

  // Checkout Flow State
  const [stage, setStage] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [placedOrderId, setPlacedOrderId] = useState(null);

  const unsubscribeRef = useRef(null);
  const hasHandledSuccessRef = useRef(false);

  const [codHandlingFee, setCodHandlingFee] = useState(0);

  useEffect(() => {
    if (config?.codHandlingFee !== undefined && !isNaN(Number(config.codHandlingFee))) {
      setCodHandlingFee(Math.max(0, Number(config.codHandlingFee)));
    } else {
      try {
        const raw = localStorage.getItem("cached_site_config") || sessionStorage.getItem("cached_site_config");
        if (raw) {
          const cfg = JSON.parse(raw);
          if (cfg.codHandlingFee !== undefined && !isNaN(Number(cfg.codHandlingFee))) {
            setCodHandlingFee(Math.max(0, Number(cfg.codHandlingFee)));
          }
        }
      } catch {
        // Silently ignore corrupted cache
      }
    }
  }, [config]);

  // Derived calculations (display only)
  const subtotal = cart.reduce((acc, item) => acc + Number(item.price || 0) * item.quantity, 0);
  const productDiscount = cart.reduce(
    (acc, item) => acc + (Number(item.originalPrice || item.price || 0) - Number(item.price || 0)) * item.quantity,
    0
  );
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const shippingCharge = 0;
  const estimatedTotal = Math.max(0, subtotal - couponDiscount + shippingCharge);
  const finalTotal = paymentMethod === "COD" ? estimatedTotal + codHandlingFee : estimatedTotal;
  const selectedAddress = addresses.find((a) => a.addressId === selectedAddressId) || null;

  // Load Addresses
  const loadAddresses = useCallback(async () => {
    const uid = user?.user?.uid || user?.uid;
    if (!uid) {
      setAddressLoading(false);
      
      return;
    }
    setAddressLoading(true);
    try {
      const addrs = await userService.getAddresses(uid);
      setAddresses(addrs);
      if (addrs.length > 0) {
        const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
        setSelectedAddressId(defaultAddr.addressId);
      } else {
        // Auto prompt to add address if no addresses exist
        setAddressFormOpen(true);
      }
    } catch (err) {
      console.error("Error loading addresses:", err);
    } finally {
      setAddressLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleAddAddress = useCallback(async (formData) => {
    const uid = user?.user?.uid || user?.uid;
    if (!uid) return;
    const res = await userService.addAddress(uid, formData);
    const updatedList = res?.addresses || (await userService.getAddresses(uid));
    setAddresses(updatedList);
    const addedAddr = res?.newAddress || updatedList.find(a => a.isDefault) || updatedList[0];
    if (addedAddr) setSelectedAddressId(addedAddr.addressId);
    setAddressFormOpen(false);
    toast.success("Address saved!");
  }, [user]);

  const handleUpdateAddress = useCallback(async (addressId, formData) => {
    const uid = user?.user?.uid || user?.uid;
    if (!uid) return;
    const res = await userService.updateAddress(uid, addressId, formData);
    const updatedList = res?.addresses || (await userService.getAddresses(uid));
    setAddresses(updatedList);
    setAddressFormOpen(false);
    setEditingAddress(null);
    toast.success("Address updated!");
  }, [user]);

  const handleSetDefaultAddress = useCallback(async (addressId) => {
    const uid = user?.user?.uid || user?.uid;
    if (!uid) return;
    const updatedList = await userService.setDefaultAddress(uid, addressId);
    setAddresses(updatedList);
    setSelectedAddressId(addressId);
    toast.success("Default address updated!");
  }, [user]);

  const handleDeleteAddress = useCallback(async (addressId) => {
    const uid = user?.user?.uid || user?.uid;
    if (!uid) return;
    const updatedList = await userService.deleteAddress(uid, addressId);
    const finalAddrs = updatedList || (await userService.getAddresses(uid));
    setAddresses(finalAddrs);
    if (finalAddrs.length === 0) setAddressFormOpen(true);
    if (selectedAddressId === addressId) {
      const defaultAddr = finalAddrs.find((a) => a.isDefault) || finalAddrs[0];
      setSelectedAddressId(defaultAddr ? defaultAddr.addressId : null);
    }
    toast.success("Address removed.");
  }, [user, selectedAddressId]);

  const openEditAddress = useCallback((address) => {
    setEditingAddress(address);
    setAddressFormOpen(true);
  }, []);

  const closeAddressForm = useCallback(() => {
    setAddressFormOpen(false);
    setEditingAddress(null);
  }, []);

  const location = useLocation();

  // Load and auto-sync saved coupon on mount
  useEffect(() => {
    const initialCoupon = location.state?.appliedCoupon || (() => {
      try {
        const saved = sessionStorage.getItem('appliedCoupon');
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        return null;
      }
    })();

    const numSubtotal = Number(subtotal) || 0;

    if (initialCoupon && initialCoupon.code && numSubtotal > 0) {
      setCouponCode(initialCoupon.code);
      setAppliedCoupon(initialCoupon);
      // Auto-validate against current subtotal
      paymentService.validateCoupon(initialCoupon.code, numSubtotal)
        .then((res) => {
          if (res && res.valid) {
            const couponObj = {
              code: res.code,
              type: res.type,
              discountValue: res.discountValue,
              discountAmount: res.discountAmount
            };
            setAppliedCoupon(couponObj);
            sessionStorage.setItem('appliedCoupon', JSON.stringify(couponObj));
          } else {
            setAppliedCoupon(null);
            sessionStorage.removeItem('appliedCoupon');
          }
        })
        .catch((err) => {
          console.warn("Auto-validating initial checkout coupon warning:", err);
        });
    } else if (numSubtotal <= 0) {
      setAppliedCoupon(null);
      sessionStorage.removeItem('appliedCoupon');
    }
  }, [subtotal, location.state?.appliedCoupon]);

  // Coupon Actions
  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    const currentSubtotal = Number(subtotal) || 0;
    if (currentSubtotal <= 0 || cart.length === 0) {
      const errorMsg = "Add items to your cart before applying a coupon.";
      setCouponError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await paymentService.validateCoupon(couponCode.trim(), currentSubtotal);
      if (res?.valid) {
        const couponObj = {
          code: res.code,
          type: res.type,
          discountValue: res.discountValue,
          discountAmount: res.discountAmount
        };
        setAppliedCoupon(couponObj);
        setCouponError("");
        sessionStorage.setItem('appliedCoupon', JSON.stringify(couponObj));
        toast.success(`Coupon "${res.code}" applied! You save ₹${Number(res.discountAmount).toFixed(2)}`);
      } else {
        const errorMsg = getFriendlyErrorMessage(res?.message, "Invalid or expired coupon code.");
        setCouponError(errorMsg);
        toast.error(errorMsg);
        setAppliedCoupon(null);
        sessionStorage.removeItem('appliedCoupon');
      }
    } catch (err) {
      const errorMsg = getFriendlyErrorMessage(err, "Invalid or expired coupon code.");
      setCouponError(errorMsg);
      toast.error(errorMsg);
      setAppliedCoupon(null);
      sessionStorage.removeItem('appliedCoupon');
    } finally {
      setCouponLoading(false);
    }
  }, [couponCode, subtotal, cart.length]);

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    sessionStorage.removeItem('appliedCoupon');
  }, []);

  // Firestore Order Listener
  const listenForOrderPlaced = useCallback((orderId) => {
    setPlacedOrderId(orderId);
    setStage("processing");
    const orderRef = doc(fireDB, "orders", orderId);
    const unsub = onSnapshot(orderRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      if (data.orderStatus === "PLACED") {
        if (unsubscribeRef.current) unsubscribeRef.current();
        sessionStorage.removeItem('appliedCoupon');
        dispatch(clearCart());
        setStage("success");
        if (!hasHandledSuccessRef.current) {
          hasHandledSuccessRef.current = true;
          toast.success("Order placed successfully!");
        }
        navigate("/profile?tab=orders");
      } else if (data.orderStatus === "PAYMENT_FAILED") {
        if (unsubscribeRef.current) unsubscribeRef.current();
        setStage("error");
        setErrorMessage("Payment failed. Please try again.");
        toast.error("Payment failed. Please try again.");
      }
    }, (err) => {
      console.error("Order listener error:", err);
    });
    unsubscribeRef.current = unsub;
    setTimeout(() => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    }, 180000);
  }, [dispatch, navigate]);

  useEffect(() => {
    return () => { if (unsubscribeRef.current) unsubscribeRef.current(); };
  }, []);

  // Main Checkout Submit
  const handleProceedToPayment = useCallback(async () => {
    if (cart.length === 0) { toast.error("Your cart is empty."); return; }
    if (!selectedAddress) { toast.error("Please select a shipping address."); return; }

    // Verify live stock before submitting order
    for (const item of cart) {
      const prodId = item.id || item.productId;
      if (prodId) {
        try {
          const freshProd = await productService.getProductById(prodId);
          if (!freshProd || freshProd.isActive === false) {
            toast.error(`"${item.title || 'An item'}" is currently unavailable.`);
            return;
          }

          let availableStock = 0;
          if (item.selectedVariant && Array.isArray(freshProd.variants) && freshProd.variants.length > 0) {
            const matchedVariant = freshProd.variants.find(v => {
              const vAttrs = v.attributes || v.selectedVariant || v;
              return item.selectedVariant && Object.keys(item.selectedVariant).every(k => vAttrs[k] === item.selectedVariant[k]);
            });
            availableStock = matchedVariant ? Number(matchedVariant.inStock ?? matchedVariant.stock ?? 0) : 0;
          } else {
            availableStock = Number(freshProd.inStock ?? freshProd.stock ?? 0);
          }

          if (availableStock <= 0) {
            toast.error(`"${item.title || 'Product'}" is currently out of stock.`);
            return;
          }
          if (Number(item.quantity || 1) > availableStock) {
            toast.error(`Only ${availableStock} units of "${item.title || 'Product'}" are available in stock.`);
            return;
          }
        } catch (e) {
          console.warn("Stock pre-check warning:", e);
        }
      }
    }

    hasHandledSuccessRef.current = false;
    setStage("submitting");
    setErrorMessage("");
    try {
      const itemsPayload = cart.map((item) => {
        const vId = item.variantId ||
          item.selectedVariantObj?.variantId ||
          item.selectedVariantObj?.id ||
          item.selectedVariantObj?.sku ||
          (item.selectedVariant ? (item.selectedVariant.variantId || item.selectedVariant.sku || item.selectedVariant.id || null) : null) ||
          null;

        const vOptions = item.selectedVariant || item.selectedVariantObj?.attributes || null;
        const rawQty = item.quantity ?? 1;
        const qtyNum = Math.max(1, parseInt(rawQty, 10) || 1);

        return {
          productId: item.id || item.productId || "custom_item",
          variantId: vId,
          options: vOptions,
          selectedVariant: vOptions,
          quantity: qtyNum,
          title: item.title || item.productName || "Product Item",
          price: Number(item.price || 0),
          originalPrice: Number(item.originalPrice || item.price || 0),
          imageUrl: item.imageUrl || item.image || item.productImage || (Array.isArray(item.images) ? item.images[0] : null) || "",
          image: item.imageUrl || item.image || item.productImage || (Array.isArray(item.images) ? item.images[0] : null) || "",
          productImage: item.imageUrl || item.image || item.productImage || (Array.isArray(item.images) ? item.images[0] : null) || "",
        };
      });

      const userEmail = user?.user?.email || user?.email || user?.userProfile?.email || selectedAddress?.email || "";
      const normalizedAddress = selectedAddress ? {
        ...selectedAddress,
        fullName: selectedAddress.fullName || selectedAddress.name || "",
        phone: selectedAddress.phone || selectedAddress.phoneNumber || selectedAddress.mobile || "",
        pincode: selectedAddress.pincode || selectedAddress.pinCode || selectedAddress.postalCode || "",
      } : null;

      if (paymentMethod === "ONLINE") {
        const payOrder = await paymentService.createPaymentOrder({
          items: itemsPayload,
          shippingAddressId: selectedAddress?.addressId || selectedAddressId,
          shippingAddress: normalizedAddress,
          couponCode: appliedCoupon?.code || "",
          userEmail: userEmail,
          paymentMethod: "ONLINE",
        });
        setStage("payment_modal");
        const result = await paymentService.openRazorpayCheckout({
          paymentId: payOrder.paymentId,
          gatewayOrderId: payOrder.gatewayOrderId,
          amount: payOrder.amount,
          currency: payOrder.currency,
          keyId: payOrder.keyId,
          userProfile: { name: normalizedAddress.fullName, phone: normalizedAddress.phone, email: userEmail },

          onSuccess: async (razorpayResponse) => {
            setStage("processing");
            try {
              // Instant client-side verification
              await paymentService.verifyPayment({
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                orderId: payOrder.orderId,
              });
              sessionStorage.removeItem('appliedCoupon');
              dispatch(clearCart());
              await queryClient.invalidateQueries({ queryKey: ['orders'] });
              setStage("success");
              if (!hasHandledSuccessRef.current) {
                hasHandledSuccessRef.current = true;
                toast.success("Order placed successfully!");
              }
              navigate("/profile?tab=orders");
            } catch (vErr) {
              console.error("Client verify error:", vErr);
              // Fallback to Firestore order status listener with 5s timeout
              listenForOrderPlaced(payOrder.orderId);
              setTimeout(async () => {
                dispatch(clearCart());
                await queryClient.invalidateQueries({ queryKey: ['orders'] });
                if (!hasHandledSuccessRef.current) {
                  hasHandledSuccessRef.current = true;
                  toast.info("Payment completed. Redirecting to your orders...");
                }
                navigate("/profile?tab=orders");
              }, 5000);
            }
          },
          onFailure: (errMsg) => {
            const cleanMsg = getFriendlyErrorMessage(errMsg, "Payment cancelled or failed.");
            setStage("error");
            setErrorMessage(cleanMsg);
            toast.error(cleanMsg);
          },
        });
        if (!result.success && result.cancelled) setStage("ready");
      } else if (paymentMethod === "COD") {
        await paymentService.createCodOrder({
          items: itemsPayload,
          shippingAddressId: selectedAddress?.addressId || selectedAddressId,
          shippingAddress: normalizedAddress,
          couponCode: appliedCoupon?.code || "",
          userEmail: userEmail,
        });

        sessionStorage.removeItem('appliedCoupon');
        dispatch(clearCart());
        await queryClient.invalidateQueries({ queryKey: ['orders'] });
        setStage("success");
        toast.success("Cash on Delivery order placed successfully!");
        navigate("/profile?tab=orders");
      }
    } catch (err) {
      const msg = getFriendlyErrorMessage(err, "Something went wrong during checkout. Please try again.");
      setStage("error");
      setErrorMessage(msg);
      toast.error(msg);
    }
  }, [cart, selectedAddress, selectedAddressId, paymentMethod, appliedCoupon, user, listenForOrderPlaced, dispatch, navigate, queryClient]);

  const handleRetry = useCallback(() => { setStage("ready"); setErrorMessage(""); }, []);

  return {
    addresses, selectedAddressId, selectedAddress, addressLoading, addressFormOpen, editingAddress,
    couponCode, appliedCoupon, couponLoading, couponError,
    paymentMethod, stage, errorMessage, placedOrderId, cart,
    subtotal, productDiscount, couponDiscount, shippingCharge, estimatedTotal, codHandlingFee, finalTotal,
    setSelectedAddressId, setAddressFormOpen, setCouponCode, setPaymentMethod,
    handleAddAddress, handleUpdateAddress, handleDeleteAddress, handleSetDefaultAddress, openEditAddress, closeAddressForm,
    handleApplyCoupon, handleRemoveCoupon, handleProceedToPayment, handleRetry,
  };
}
