import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminLayout from './adminLayout/AdminLayout';
import Loader from '../components/loader/Loader';

function Admin() {
    const location = useLocation();

    // Determine the active view to highlight on the sidebar based on exact route path
    const getActiveView = () => {
        const path = location.pathname;
        if (path === '/dashboard') return 'overview';
        if (path === '/products' || path === '/addproduct' || path === '/updateproduct') return 'products';
        if (path === '/orders' || path.startsWith('/admin/order')) return 'orders';
        if (path === '/users') return 'users';
        if (path.startsWith('/coupons')) return 'coupons';
        if (path === '/reviews' || path === '/review') return 'reviews';
        if (path === '/admin/videos') return 'videos';
        if (path === '/admin/team' || path === '/team') return 'team';
        if (path === '/admin/brands' || (path === '/configure' && location.search.includes('tab=brands'))) return 'brands';
        if (path === '/configure') return 'configure';
        return 'overview';
    };

    return (
        <AdminLayout activeView={getActiveView()}>
            <Suspense fallback={<Loader />}>
                <Outlet />
            </Suspense>
        </AdminLayout>
    );
}

export default Admin;