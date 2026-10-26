import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import useAuth from "../../hooks/auth/useAuth";
import useOrders from "../../hooks/order/useOrders";
import { userService } from "../../services/user/userService";
import { getFriendlyErrorMessage } from "../../utils/firebaseErrorHandler.js";
import {
    FaUser, FaMapMarkerAlt, FaShoppingBag, FaWallet,
    FaSpinner, FaShieldAlt, FaChevronRight
} from "react-icons/fa";
import ProfileTab from "./tabs/ProfileTab";
import AddressTab from "./tabs/AddressTab";
import OrdersTab from "./tabs/OrdersTab";
import UserProfileSkeleton from "../../components/loader/SkeletonLoader/UserProfileSkeleton";
import WarningModal from "../../components/modal/WarningModal";

const MENU_ITEMS = [
    { id: "profile", label: "Profile Information", shortLabel: "Profile", icon: <FaUser size={14} /> },
    { id: "address", label: "Manage Addresses", shortLabel: "Addresses", icon: <FaMapMarkerAlt size={14} /> },
    { id: "orders", label: "My Orders", shortLabel: "Orders", icon: <FaShoppingBag size={14} /> },
];

const fmt = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('en-IN', {
        minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
        maximumFractionDigits: 2,
    });
};

function getInitials(name, email) {
    const target = (name && name.trim()) || email || "";
    if (!target) return "U";
    const parts = target.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return target.slice(0, 2).toUpperCase();
}

function User() {
    const { user, logout } = useAuth();
    const { orders = [] } = useOrders();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const location = useLocation();
    const queryTab = new URLSearchParams(location.search).get("tab");
    const initialTab = location.state?.tab || queryTab || "profile";
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        const tab = location.state?.tab || new URLSearchParams(location.search).get("tab");
        if (tab && (tab === "profile" || tab === "address" || tab === "orders")) {
            setActiveTab(tab);
        }
    }, [location]);

    const [saving, setSaving] = useState(false);
    const uid = user?.user?.uid;

    // TanStack Query for User Profile — Cached in memory for zero-reload navigation
    const { data: userProfileData, isLoading: profileLoading } = useQuery({
        queryKey: ['user', 'profile', uid],
        queryFn: () => userService.getUserProfile(uid),
        enabled: Boolean(uid),
        staleTime: 5 * 60 * 1000, // 5 minutes stale time
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const loading = Boolean(uid) && profileLoading && !userProfileData;

    // Profile State
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        role: "USER",
        emailVerified: false,
        phoneVerified: false,
        address: {
            street: "",
            city: "",
            state: "",
            pincode: "",
            country: "India",
        },
    });

    useEffect(() => {
        if (userProfileData) {
            setProfile({
                name: userProfileData.name || user?.user?.displayName || "",
                email: userProfileData.email || user?.user?.email || "",
                phone: userProfileData.phone || user?.user?.phoneNumber || "",
                role: userProfileData.role || "USER",
                emailVerified: user?.user?.emailVerified || false,
                phoneVerified: userProfileData.phoneVerified || false,
                address: {
                    street: userProfileData.address?.street || "",
                    city: userProfileData.address?.city || "",
                    state: userProfileData.address?.state || "",
                    pincode: userProfileData.address?.pincode || "",
                    country: userProfileData.address?.country || "India",
                },
            });
        } else if (user?.user) {
            setProfile((prev) => ({
                ...prev,
                name: user?.user?.displayName || "",
                email: user?.user?.email || "",
                phone: user?.user?.phoneNumber || "",
                emailVerified: user?.user?.emailVerified || false,
            }));
        }
    }, [userProfileData, user]);

    const handleSaveProfile = async () => {
        if (!uid) return;
        setSaving(true);
        try {
            await userService.updateUserProfile(uid, profile);
            toast.success("Profile updated successfully!");
        } catch (err) {
            toast.error(getFriendlyErrorMessage(err, "Failed to update profile. Please try again."));
        } finally {
            setSaving(false);
        }
    };

    const handleAddressChange = (field, value) => {
        setProfile((prev) => ({
            ...prev,
            address: {
                ...prev.address,
                [field]: value,
            },
        }));
    };

    const validOrders = orders.filter((o) => {
        const status = (o.orderStatus || o.status || '').toUpperCase();
        const paymentStat = (o.paymentStatus || o.payment?.status || '').toUpperCase();
        return status !== 'CANCELLED' && status !== 'REFUNDED' && status !== 'PAYMENT_FAILED' && paymentStat !== 'FAILED';
    });

    const totalSpent = validOrders.reduce((acc, o) => {
        const raw = o.totalAmount ?? o.pricing?.grandTotal ?? o.amount ?? o.total ?? 0;
        const amt = typeof raw === 'number' ? (isNaN(raw) ? 0 : raw) : (parseFloat(String(raw).replace(/[^0-9.]/g, '')) || 0);
        return acc + amt;
    }, 0);

    if (loading) {
        return <UserProfileSkeleton />;
    }

    return (
        <div className="min-h-screen bg-bg-base py-4 sm:py-6 px-3 sm:px-4 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* ─── DESKTOP LAYOUT ─────────────────────────────────────────── */}
                <div className="hidden lg:grid grid-cols-12 gap-5 items-start relative">

                    {/* ── Left Sidebar (Sticky/Fixed on Scroll) ── */}
                    <div className="col-span-3 space-y-4 sticky top-20 self-start">

                        {/* Profile Card */}
                        <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border-subtle">
                            <div className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-base text-primary shrink-0">
                                        {getInitials(profile.name, profile.email)}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-sm text-text-base truncate">{profile.name || "Customer"}</h3>
                                        <p className="text-[11px] text-text-muted truncate mt-0.5">{profile.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Mini Metric Row */}
                            <div className="grid grid-cols-2 border-t border-border-subtle divide-x divide-border-subtle">
                                <div className="flex flex-col items-center py-3 gap-0.5">
                                    <p className="text-base font-black text-text-base">{orders.length}</p>
                                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Orders</p>
                                </div>
                                <div className="flex flex-col items-center py-3 gap-0.5 px-1">
                                    <p className="text-base font-black text-text-base truncate w-full text-center"
                                       title={`₹${fmt(totalSpent)}`}>
                                        ₹{fmt(totalSpent)}
                                    </p>
                                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Spent</p>
                                </div>
                            </div>
                        </div>

                        {/* Nav Menu Card */}
                        <div className="bg-card rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
                            {MENU_ITEMS.map((item) => {
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs transition-all duration-150 group cursor-pointer ${
                                            isActive
                                                ? "bg-primary/10 text-primary font-bold "
                                                : "text-text-base hover:bg-card-hover font-semibold"
                                        } border-b border-border-subtle last:border-b-0`}
                                    >
                                        <span className={`shrink-0 transition-colors ${isActive ? "text-primary" : "text-text-muted group-hover:text-primary"}`}>
                                            {item.icon}
                                        </span>
                                        <span className="flex-1 text-left">{item.label}</span>
                                        <FaChevronRight size={10} className={`shrink-0 transition-colors ${isActive ? "text-primary" : "text-text-subtle group-hover:text-primary"}`} />
                                    </button>
                                );
                            })}

                            {/* Desktop Logout Option */}
                            <button
                                onClick={() => setIsLogoutModalOpen(true)}
                                className="w-full flex items-center gap-3 px-4 py-3.5 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-150 group cursor-pointer border-t border-border-subtle"
                            >
                                <span className="material-symbols-outlined text-[18px] text-red-400">logout</span>
                                <span className="flex-1 text-left">Log Out</span>
                                <FaChevronRight size={10} className="shrink-0 text-red-400/50 group-hover:text-red-400 transition-colors" />
                            </button>
                        </div>
                    </div>

                    {/* ── Right Content Area ── */}
                    <div className="col-span-9 space-y-4">
                        {/* Active Tab Content Card */}
                        <div className="bg-card rounded-2xl border border-border-subtle shadow-sm p-5 sm:p-6">
                            {activeTab === "profile" && (
                                <ProfileTab profile={profile} setProfile={setProfile} handleSaveProfile={handleSaveProfile} saving={saving} />
                            )}
                            {activeTab === "address" && (
                                <AddressTab uid={uid} profile={profile} handleAddressChange={handleAddressChange} handleSaveProfile={handleSaveProfile} saving={saving} />
                            )}
                            {activeTab === "orders" && (
                                <OrdersTab orders={orders} />
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── MOBILE / TABLET LAYOUT ─────────────────────────────────── */}
                <div className="lg:hidden space-y-3">

                    {/* Mobile Profile Hero Card */}
                    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border-subtle">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-base text-primary shrink-0">
                                {getInitials(profile.name, profile.email)}
                            </div>
                            <div className="min-w-0">
                                <h2 className="font-black text-sm text-text-base truncate">{profile.name || "Customer"}</h2>
                                <p className="text-[10px] text-text-muted truncate">{profile.email}</p>
                            </div>
                        </div>

                        {/* Mobile Metric Row */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-bg-surface border border-border-subtle">
                                <div className="w-7 h-7 rounded-lg text-primary flex items-center justify-center shrink-0">
                                    <FaShoppingBag size={12} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wide">Orders</p>
                                    <p className="text-sm font-black text-text-base">{orders.length}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-bg-surface border border-border-subtle">
                                <div className="w-7 h-7 rounded-lg text-primary flex items-center justify-center shrink-0">
                                    <FaWallet size={12} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wide">Spent</p>
                                    <p className="text-sm font-black text-text-base truncate" title={`₹${fmt(totalSpent)}`}>
                                        ₹{fmt(totalSpent)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Tab Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                        {MENU_ITEMS.map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                                        isActive
                                            ? "bg-primary text-compli font-bold shadow-sm"
                                            : "bg-card text-text-muted border border-border-subtle hover:text-text-base"
                                    }`}
                                >
                                    {item.icon}
                                    <span>{item.shortLabel}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Mobile Tab Content */}
                    <div className="bg-card rounded-2xl border border-border-subtle shadow-sm p-4">
                        {activeTab === "profile" && (
                            <ProfileTab profile={profile} setProfile={setProfile} handleSaveProfile={handleSaveProfile} saving={saving} />
                        )}
                        {activeTab === "address" && (
                            <AddressTab uid={uid} profile={profile} handleAddressChange={handleAddressChange} handleSaveProfile={handleSaveProfile} saving={saving} />
                        )}
                        {activeTab === "orders" && (
                            <OrdersTab orders={orders} />
                        )}
                    </div>

                    {/* Mobile Bottom Logout Card */}
                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs transition active:scale-98 shadow-xs cursor-pointer mt-4"
                    >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        <span>Log Out of Account</span>
                    </button>
                </div>

            </div>

            {/* Logout Confirmation Warning Modal */}
            <WarningModal
                isOpen={isLogoutModalOpen}
                message="Are you sure you want to log out of your account?"
                onConfirm={logout}
                onCancel={() => setIsLogoutModalOpen(false)}
                confirmText="Log Out"
                cancelText="Cancel"
            />
        </div>
    );
}

export default User;