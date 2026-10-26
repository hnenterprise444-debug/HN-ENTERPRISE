import React from 'react';

/**
 * MobileDrawer Component
 * Sliding navigation drawer for mobile viewport sizes.
 */
export default function MobileDrawer({
    drawerOpen,
    setDrawerOpen,
    sidebarItems,
    activeView,
    handleNavClick,
    config,
    handleLogout,
    onOpenChangePassword
}) {
    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-300 md:hidden ${
            drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
            {/* Backdrop overlay */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-xs" 
                onClick={() => setDrawerOpen(false)}
            />
            
            {/* Drawer Panel */}
            <div className={`absolute top-0 bottom-0 left-0 bg-bg-surface w-[280px] border-r border-border-subtle flex flex-col transition-transform duration-300 shadow-xl ${
                drawerOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                {/* Header with Logo */}
                <div className="px-6 py-5 border-b border-border-subtle flex items-center gap-3">
                    {config.companyLogo ? (
                        <img src={config.companyLogo} alt={config.companyName} className="w-8 h-8 object-contain rounded-lg" />
                    ) : (
                        <span className="material-symbols-outlined text-primary text-[28px]">settings_suggest</span>
                    )}
                    <span className="font-bold text-[16px] text-text-base uppercase tracking-tight truncate">
                        {config.companyName || "Admin Panel"}
                    </span>
                </div>
                
                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const isActive = activeView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    handleNavClick(item.id);
                                    setDrawerOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer text-sm font-semibold ${
                                    isActive 
                                        ? 'bg-primary text-compli font-bold shadow-md shadow-primary/20' 
                                        : 'text-text-muted hover:bg-card-hover hover:text-primary'
                                }`}
                            >
                                <span className={isActive ? 'text-compli shrink-0' : 'text-text-muted shrink-0'}>
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-border-subtle space-y-2">
                    <button
                        type="button"
                        onClick={() => {
                            if (typeof onOpenChangePassword === 'function') {
                                onOpenChangePassword();
                            }
                            setDrawerOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-text-muted hover:bg-card-hover hover:text-primary transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px] text-amber-500">lock_reset</span>
                        <span>Change Password</span>
                    </button>

                    <a
                        href="/"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-text-muted hover:bg-card-hover hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">storefront</span>
                        <span>View Store</span>
                    </a>

                    <button
                        onClick={() => {
                            handleLogout();
                            setDrawerOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
