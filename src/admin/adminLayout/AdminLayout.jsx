import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/auth/useAuth';
import { FaShoppingCart, FaBoxes, FaUsers, FaChartBar, FaStar, FaBandcamp, FaYoutube, FaUserTie, FaAward } from 'react-icons/fa';
import { RiCoupon2Fill } from "react-icons/ri";
import { useSiteConfig } from '../../context/SiteConfigContext';
import WarningModal from '../../components/modal/WarningModal';
import ChangePasswordModal from '../Components/common/ChangePasswordModal';

// Import Layout Sections
import Sidebar from './sections/Sidebar';
import MobileDrawer from './sections/MobileDrawer';
import Header from './sections/Header';
import BottomNavigation from './sections/BottomNavigation';
import MainContent from './sections/MainContent';

/**
 * AdminLayout Component
 * A restructured, highly responsive, production-ready SaaS administration dashboard template.
 * Composes subcomponents: Sidebar, MobileDrawer, Header, BottomNavigation, and MainContent.
 */
export default function AdminLayout({ children, activeView = 'products', onViewChange }) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { config } = useSiteConfig();
    
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    
    const sidebarItems = [
        { id: 'overview', label: 'Dashboard', icon: <FaChartBar size={16} /> },
        { id: 'products', label: 'Products', icon: <FaBoxes size={16} /> },
        { id: 'orders', label: 'Orders', icon: <FaShoppingCart size={16} /> },
        { id: 'users', label: 'Users', icon: <FaUsers size={16} /> },
        { id: 'coupons', label: 'Coupons', icon: <RiCoupon2Fill size={16} /> },
        { id: 'reviews', label: 'Reviews', icon: <FaStar size={16} /> },
        { id: 'videos', label: 'Videos', icon: <FaYoutube size={16} /> },
        { id: 'team', label: 'Team', icon: <FaUserTie size={16} /> },
        { id: 'brands', label: 'Brands', icon: <FaAward size={16} /> },
        { id: 'configure', label: 'Configure', icon: <FaBandcamp size={16} /> }
    ];

    const handleNavClick = (id) => {
        switch (id) {
            case 'overview':
                navigate('/dashboard');
                break;
            case 'products':
                navigate('/products');
                break;
            case 'orders':
                navigate('/orders');
                break;
            case 'users':
                navigate('/users');
                break;
            case 'coupons':
                navigate('/coupons');
                break;
            case 'reviews':
                navigate('/reviews');
                break;
            case 'videos':
                navigate('/admin/videos');
                break;
            case 'team':
                navigate('/admin/team');
                break;
            case 'brands':
                navigate('/configure?tab=brands');
                break;
            case 'configure':
                navigate('/configure');
                break;
            case 'store':
                navigate('/');
                break;
            default:
                navigate('/dashboard');
                break;
        }
    };

    const handleConfirmLogout = async () => {
        setIsLogoutModalOpen(false);
        try {
            await logout();
            navigate('/');
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    const getHeaderTitle = () => {
        if (location.pathname === '/addproduct') return 'Add New Product';
        if (location.pathname === '/updateproduct') return 'Update Product Details';
        if (location.pathname === '/admin/videos') return 'Content → Videos';
        if (activeView === 'overview') return 'Dashboard';
        return `${activeView.charAt(0).toUpperCase() + activeView.slice(1)}`;
    };

    return (
        <div className="h-screen overflow-hidden bg-bg-base text-text-base flex print:h-auto print:overflow-visible print:bg-white">
            {/* 1. Mobile Drawer Navigation */}
            <MobileDrawer
                drawerOpen={drawerOpen}
                setDrawerOpen={setDrawerOpen}
                sidebarItems={sidebarItems}
                activeView={activeView}
                handleNavClick={handleNavClick}
                config={config}
                handleLogout={() => setIsLogoutModalOpen(true)}
                onOpenChangePassword={() => setIsChangePasswordModalOpen(true)}
            />

            {/* 2. Mobile Bottom Navigation */}
            <BottomNavigation
                activeView={activeView}
                handleNavClick={handleNavClick}
            />

            {/* 3. Desktop/Tablet Sidebar */}
            <Sidebar
                sidebarItems={sidebarItems}
                activeView={activeView}
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                handleNavClick={handleNavClick}
                config={config}
                handleLogout={() => setIsLogoutModalOpen(true)}
                onOpenChangePassword={() => setIsChangePasswordModalOpen(true)}
            />

            {/* 4. Main Panel Workspace */}
            <div
                className={`
                    flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ml-0 print:ml-0 print:h-auto print:overflow-visible
                    ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-[260px]'}
                `}
            >
                {/* Fixed Top Header (never scrolls) */}
                <Header
                    setDrawerOpen={setDrawerOpen}
                    title={getHeaderTitle()}
                />

                {/* Scrollable Main Content Container */}
                <div className="flex-1 overflow-y-auto print:overflow-visible">
                    <MainContent>
                        {children}
                    </MainContent>
                </div>
            </div>

            {/* Admin Logout Confirmation Warning Modal */}
            <WarningModal
                isOpen={isLogoutModalOpen}
                message="Are you sure you want to log out of the Admin Portal?"
                onConfirm={handleConfirmLogout}
                onCancel={() => setIsLogoutModalOpen(false)}
                confirmText="Log Out"
                cancelText="Cancel"
            />

            {/* Admin Self Change Password Modal */}
            <ChangePasswordModal
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
            />
        </div>
    );
}
