import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Sidebar Component
 * Fixed left sidebar for desktop and tablet screens (collapsible on tablet).
 */
export default function Sidebar({
    sidebarItems,
    activeView,
    sidebarCollapsed,
    setSidebarCollapsed,
    handleNavClick,
    config,
    handleLogout,
    onOpenChangePassword,
}) {
    const navigate = useNavigate();
    return (
        <aside
            className={`
                hidden md:flex flex-col fixed inset-y-0 left-0 z-40 bg-bg-surface border-r border-border-subtle transition-all duration-300 print:hidden
                ${sidebarCollapsed ? 'w-20' : 'w-[260px]'}
            `}
        >
            {/* Top Header: Logo & Expand/Collapse Button */}
            <div className={`border-b border-border-subtle flex items-center h-16 shrink-0 transition-all ${
                sidebarCollapsed ? 'justify-center px-3' : 'justify-between px-5'
            }`}>
                {!sidebarCollapsed ? (
                    <>
                        <div 
                            onClick={() => navigate('/')} 
                            className="flex items-center gap-3 cursor-pointer overflow-hidden min-w-0 group"
                            title="View Store"
                        >
                            {config.companyLogo ? (
                                <img src={config.companyLogo} alt={config.companyName} className="w-8 h-8 object-contain rounded-lg shrink-0" />
                            ) : (
                                <span className="material-symbols-outlined text-primary text-[28px] shrink-0">settings_suggest</span>
                            )}
                            <span className="font-bold text-[16px] text-text-base uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                                {config.companyName || "Admin Panel"}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setSidebarCollapsed(true)}
                            className="p-1.5 text-text-muted hover:text-primary hover:bg-card-hover rounded-xl transition-colors cursor-pointer shrink-0"
                            title="Collapse sidebar"
                        >
                            <span className="material-symbols-outlined text-[20px]">menu_open</span>
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => setSidebarCollapsed(false)}
                        className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-primary hover:bg-card-hover rounded-xl transition-colors cursor-pointer"
                        title="Expand sidebar"
                    >
                        <span className="material-symbols-outlined text-[22px]">menu</span>
                    </button>
                )}
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const isActive = activeView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            title={sidebarCollapsed ? item.label : undefined}
                            className={`w-full flex items-center ${
                                sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'
                            } rounded-xl transition-all duration-200 cursor-pointer text-sm font-semibold ${
                                isActive 
                                    ? 'bg-primary text-compli font-bold shadow-md shadow-primary/20' 
                                    : 'text-text-muted hover:bg-card-hover hover:text-primary'
                            }`}
                        >
                            <span className={isActive ? 'text-compli shrink-0' : 'text-text-muted group-hover:text-primary shrink-0 transition-colors'}>
                                {item.icon}
                            </span>
                            {!sidebarCollapsed && (
                                <span className="truncate">
                                    {item.label}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-border-subtle space-y-1 shrink-0">
                {/* Change Password for Admin */}
                <button
                    type="button"
                    onClick={onOpenChangePassword}
                    title={sidebarCollapsed ? "Change Password" : undefined}
                    className={`w-full flex items-center ${
                        sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-4 py-2.5'
                    } rounded-xl text-sm font-semibold text-text-muted hover:bg-card-hover hover:text-primary transition-colors cursor-pointer`}
                >
                    <span className="material-symbols-outlined text-[20px] text-amber-500 shrink-0">lock_reset</span>
                    {!sidebarCollapsed && (
                        <span className="truncate">Change Password</span>
                    )}
                </button>

                {/* View Store Link */}
                <a
                    href="/"
                    title={sidebarCollapsed ? "View Store" : undefined}
                    className={`flex items-center ${
                        sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-4 py-2.5'
                    } rounded-xl text-sm font-semibold text-text-muted hover:bg-card-hover hover:text-primary transition-colors`}
                >
                    <span className="material-symbols-outlined text-[20px] shrink-0">storefront</span>
                    {!sidebarCollapsed && (
                        <span className="truncate">View Store</span>
                    )}
                </a>

                {/* Logout Button */}
                <button
                    type="button"
                    onClick={handleLogout}
                    title={sidebarCollapsed ? "Logout" : undefined}
                    className={`w-full flex items-center ${
                        sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-4 py-2.5'
                    } rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-all font-extrabold cursor-pointer`}
                >
                    <span className="material-symbols-outlined text-[20px] shrink-0">logout</span>
                    {!sidebarCollapsed && (
                        <span className="truncate">Logout</span>
                    )}
                </button>
            </div>
        </aside>
    );
}
