import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaBoxes, FaUsers, FaRupeeSign, FaPlus, FaTicketAlt } from 'react-icons/fa';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../context/ThemeContext';
import useAdmin from '../../hooks/auth/useAdmin';
import useProductsQuery from '../../hooks/product/useProductsQuery';
import { dashboardService } from '../../services/dashboard/dashboardService';
import { orderService } from '../../services/order/orderService';
import { activityService } from '../../services/activity/activityService';
import { queryKeys } from '../../utils/queryKeys';

import DashboardCard from './components/DashboardCard';
import DashboardAnalytics from './components/DashboardAnalytics';
import RecentActivityFeed from './components/RecentActivityFeed';
import RecentOrdersTable from './components/RecentOrdersTable';
import DashboardSkeleton from '../../components/loader/SkeletonLoader/DashboardSkeleton';

/**
 * Dashboard Component
 * Renders the main admin management view.
 * Uses Firestore getCountFromServer() aggregation queries for ZERO-DOCUMENT-READ KPI metrics.
 */
function Dashboard() {
    const navigate = useNavigate();
    const { mode } = useTheme();
    const adminHook = useAdmin();

    // 1. Fetch zero-read aggregation counts via TanStack Query
    const { data: stats = { totalProducts: 0, totalOrders: 0, totalUsers: 0 }, isLoading: isStatsLoading } = useQuery({
        queryKey: queryKeys.dashboard.stats,
        queryFn: () => dashboardService.getStats(),
        staleTime: 2 * 60 * 1000, // 2 minutes cache
    });

    // 2. Fetch recent products for catalog distribution chart
    const { products = [] } = useProductsQuery({ pageSize: 50 });

    // 3. Fetch recent 50 orders for revenue and recent orders feed (prevents full collection reads)
    const { data: recentOrdersData, isLoading: isOrdersLoading } = useQuery({
        queryKey: queryKeys.orders.recent,
        queryFn: () => orderService.getPaginatedOrders({ pageSize: 50 }),
        staleTime: 60 * 1000,
    });
    const orders = recentOrdersData?.orders || [];

    // 4. Fetch recent activities for audit feed
    const { data: activities = [] } = useQuery({
        queryKey: ['activities', 'recent'],
        queryFn: () => activityService.getRecentActivities(10),
        staleTime: 60 * 1000,
    });

    // Calculate total revenue from recent valid orders
    const totalRevenue = orders.reduce((acc, allorder) => {
        const status = (allorder.orderStatus || allorder.status || '').toUpperCase();
        const paymentStat = (allorder.paymentStatus || allorder.payment?.status || '').toUpperCase();
        if (status === 'CANCELLED' || status === 'REFUNDED' || status === 'PAYMENT_FAILED' || paymentStat === 'FAILED') {
            return acc;
        }
        const raw = allorder.totalAmount ?? allorder.pricing?.grandTotal ?? allorder.amount ?? allorder.total ?? 0;
        const amt = typeof raw === 'number' ? (isNaN(raw) ? 0 : raw) : (parseFloat(String(raw).replace(/[^0-9.]/g, '')) || 0);
        return acc + amt;
    }, 0);

    const handleAddClick = () => {
        adminHook.resetForm();
        navigate('/addproduct');
    };

    const dashboardMetrics = [
        {
            title: "Total Products",
            value: stats.totalProducts,
            icon: <FaBoxes size={18} />,
        },
        {
            title: "Total Orders",
            value: stats.totalOrders,
            icon: <FaShoppingCart size={18} />,
        },
        {
            title: "Total Users",
            value: stats.totalUsers,
            icon: <FaUsers size={18} />,
        },
        {
            title: "Total Revenue",
            value: `₹${totalRevenue.toLocaleString("en-IN")}`,
            icon: <FaRupeeSign size={18} />,
        },
    ];

    const isOverviewLoading = isStatsLoading && isOrdersLoading;


    return (
        isOverviewLoading ? (
            <DashboardSkeleton />
        ) : (
            <section className="space-y-6 lg:space-y-8 mt-1 px-4 md:px-0">

                {/* Quick Action Buttons Strip */}
                <div className="sm:px-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-base font-black text-text-base flex items-center gap-2">
                                <span>Quick Actions</span>
                            </h2>
                            <p className="text-xs text-text-muted mt-0.5">
                                Fast shortcuts to manage inventory, coupons, orders, and customers
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Add Product Button */}
                            <button
                                onClick={handleAddClick}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-compli rounded-xl font-bold text-xs transition cursor-pointer shadow-xs active:scale-95"
                            >
                                <FaPlus size={12} />
                                <span>Add Product</span>
                            </button>

                            {/* Add Coupon Button */}
                            <button
                                onClick={() => navigate('/coupons/add')}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-xs active:scale-95"
                            >
                                <FaTicketAlt size={12} />
                                <span>Add Coupon</span>
                            </button>

                            {/* See Orders Button */}
                            <button
                                onClick={() => navigate('/orders')}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-xs active:scale-95"
                            >
                                <FaShoppingCart size={12} />
                                <span>See Orders</span>
                            </button>

                            {/* Manage Users Button */}
                            <button
                                onClick={() => navigate('/users')}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-card hover:bg-card-hover text-text-base border border-border-subtle rounded-xl font-bold text-xs transition cursor-pointer shadow-2xs active:scale-95"
                            >
                                <FaUsers size={12} />
                                <span>Users</span>
                            </button>
                        </div>
                    </div>
                </div>
                {/* Top KPI Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {dashboardMetrics.map((metric, index) => (
                        <DashboardCard
                            key={index}
                            title={metric.title}
                            value={metric.value}
                            icon={metric.icon}
                        />
                    ))}
                </div>

                {/* Recharts Analytics Charts (Disabled/Removed per requirement) */}
                {/* <DashboardAnalytics orders={orders} products={products} /> */}

                {/* 2-Column Grid: Recent Orders & Audit Activity Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <div className="lg:col-span-7">
                        <RecentOrdersTable orders={orders} onViewAll={() => navigate("/orders")} />
                    </div>
                    <div className="lg:col-span-5">
                        <RecentActivityFeed activities={activities} />
                    </div>
                </div>
            </section>
        )
    );
}

export default Dashboard;