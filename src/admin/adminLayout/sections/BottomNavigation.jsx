import React from 'react';
import { FaBoxes, FaShoppingCart, FaBandcamp,FaStore } from 'react-icons/fa';
import { RiCoupon2Fill } from 'react-icons/ri';

/**
 * BottomNavigation Component
 * Mobile-only bottom sticky navigation bar (height: 64px).
 */
export default function BottomNavigation({ activeView, handleNavClick }) {
    const bottomNavItems = [
        { id: 'products', label: 'Products', icon: <FaBoxes size={18} /> },
        { id: 'orders', label: 'Orders', icon: <FaShoppingCart size={18} /> },
        { id: 'store', label: 'Store', icon: <FaStore  size={18} /> },
        { id: 'coupons', label: 'Coupons', icon: <RiCoupon2Fill size={18} /> },
        { id: 'configure', label: 'Configure', icon: <FaBandcamp size={18} /> }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-bg-surface border-t border-border-subtle h-16 rounded-t-2xl shadow-[0_-4px_12px_rgba(0,0,0,0.03)] flex justify-around items-center px-2 md:hidden print:hidden">
            {bottomNavItems.map((item) => {
                const isActive = activeView === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors cursor-pointer ${
                            isActive ? 'text-primary font-bold' : 'text-text-muted hover:text-text-base'
                        }`}
                    >
                        {item.icon}
                        <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
