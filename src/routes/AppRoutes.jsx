import React, { useEffect, lazy, Suspense } from 'react';
import { Route, Routes, Outlet, useNavigate, Navigate } from "react-router-dom";
import Home from "../pages/home/Home";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import GuestRoute from "./GuestRoute";
import Layout from "../components/layout/Layout";
import Loader from "../components/loader/Loader";

// Lazy-loaded customer & shopping pages
const Allproducts = lazy(() => import('../pages/allproducts/AllProducts'));
const Cart = lazy(() => import("../pages/cart/Cart"));
const ProductDetails = lazy(() => import("../pages/ProductDetails/ProductDetails"));
const CheckoutPage = lazy(() => import('../pages/checkout/CheckoutPage'));
const CustomerOrderDetail = lazy(() => import("../pages/Order/orderDetails/CustomerOrderDetail"));
const User = lazy(() => import('../pages/user/User'));
const VideosPage = lazy(() => import('../pages/videos/VideosPage'));
const NoPage = lazy(() => import("../pages/nopage/NoPage"));

// Lazy-loaded legal & customer service pages
const AboutUs = lazy(() => import('../pages/consumerservice/AboutUs'));
const PrivacyPolicy = lazy(() => import('../pages/consumerservice/PrivacyPolicy'));
const ReturnPolicy = lazy(() => import('../pages/consumerservice/ReturnPolicy'));
const TermsConditions = lazy(() => import('../pages/consumerservice/TermsConditions'));
const ShippingPolicy = lazy(() => import('../pages/consumerservice/ShippingPolicy'));
const RefundPolicy = lazy(() => import('../pages/consumerservice/RefundPolicy'));
const CustomLegalPage = lazy(() => import('../pages/consumerservice/CustomLegalPage'));
const MeetFounder = lazy(() => import('../pages/founder/MeetFounder'));

// Lazy-loaded admin pages
const Admin = lazy(() => import("../admin/Admin"));
const Dashboard = lazy(() => import("../admin/dashboard/Dashboard"));
const Orders = lazy(() => import("../admin/orders/Orders"));
const Products = lazy(() => import("../admin/products/Products"));
const AdminUsersPage = lazy(() => import("../admin/User/AdminUsersPage"));
const AddProduct = lazy(() => import("../admin/products/AddProduct"));
const UpdateProduct = lazy(() => import("../admin/products/UpdateProduct"));
const Coupons = lazy(() => import("../admin/coupons/Coupons"));
const CouponFormPage = lazy(() => import("../admin/coupons/CouponForm/CouponForm"));
const Review = lazy(() => import('../admin/review/Review'));
const AdminVideos = lazy(() => import('../admin/videos/AdminVideos'));
const AdminTeam = lazy(() => import('../admin/team/AdminTeam'));
const Configure = lazy(() => import('../admin/configure/Configure'));
const AdminOrderDetail = lazy(() => import('../admin/orders/AdminOrderDetail'));
const OrderInvoice = lazy(() => import('../admin/orders/OrderInvoice'));

function LoginRedirect() {
  const navigate = useNavigate();
  const { setIsLoginOpen } = useAuth();
  useEffect(() => {
    setIsLoginOpen(true);
    navigate('/', { replace: true });
  }, [setIsLoginOpen, navigate]);
  return null;
}

function SignupRedirect() {
  const navigate = useNavigate();
  const { setIsSignupOpen } = useAuth();
  useEffect(() => {
    setIsSignupOpen(true);
    navigate('/', { replace: true });
  }, [setIsSignupOpen, navigate]);
  return null;
}

function AppLayout() {
  return (
    <Layout>
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>
    </Layout>
  );
}

function SuspenseWrapper({ children }) {
  return (
    <Suspense fallback={<Loader />}>
      {children}
    </Suspense>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Routes wrapped in Global Layout */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/allproducts" element={<Allproducts />} />
        <Route path="/cart" element={<Cart />} />
        <Route path='/productdetails/:id' element={<ProductDetails />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/video" element={<VideosPage />} />
        <Route path="/blog" element={<VideosPage />} />
        <Route path="/blogs" element={<VideosPage />} />
        
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/privacypolicy" element={<PrivacyPolicy />} />
        <Route path="/returnpolicy" element={<ReturnPolicy />} />
        <Route path="/termsconditions" element={<TermsConditions />} />
        <Route path="/shippingpolicy" element={<ShippingPolicy />} />
        <Route path="/refundpolicy" element={<RefundPolicy />} />
        <Route path="/legal/:slug" element={<CustomLegalPage />} />
        <Route path="/founder" element={<MeetFounder />} />
        <Route path="/meet-our-founder" element={<MeetFounder />} />

        {/* User Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order" element={<Navigate to="/profile?tab=orders" replace />} />
          <Route path="/order/:id" element={<CustomerOrderDetail />} />
          <Route path="/profile" element={<User />} />
        </Route>
      </Route>

      {/* Auth Routes (Guest-guarded; redirects to Home + Modal trigger) */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginRedirect />} />
        <Route path="/signup" element={<SignupRedirect />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<SuspenseWrapper><Admin /></SuspenseWrapper>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/products" element={<Products />} />
          <Route path="/users" element={<AdminUsersPage />} />
          <Route path="/addproduct" element={<AddProduct />} />
          <Route path="/updateproduct" element={<UpdateProduct />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/coupons/add" element={<CouponFormPage />} />
          <Route path="/coupons/edit" element={<CouponFormPage />} />
          <Route path="/coupons/edit/:id" element={<CouponFormPage />} />
          <Route path="/reviews" element={<Review />} />
          <Route path="/review" element={<Review />} />
          <Route path="/admin/videos" element={<AdminVideos />} />
          <Route path="/admin/team" element={<AdminTeam />} />
          <Route path="/team" element={<AdminTeam />} />
          <Route path="/admin/showcase" element={<Navigate to="/configure?tab=showcase" replace />} />
          <Route path="/admin/bengal-tiles" element={<Navigate to="/configure?tab=showcase" replace />} />
          <Route path="/admin/bengaltiles" element={<Navigate to="/configure?tab=showcase" replace />} />
          <Route path="/admin/brands" element={<Navigate to="/configure?tab=brands" replace />} />
          <Route path="/configure" element={<Configure />} />
          <Route path="/admin/order/:id" element={<AdminOrderDetail />} />
          <Route path="/admin/order/:id/invoice" element={<OrderInvoice />} />
        </Route>
      </Route>

      <Route path="/*" element={<SuspenseWrapper><NoPage /></SuspenseWrapper>} />
    </Routes>
  );
}
