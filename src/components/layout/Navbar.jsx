import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTheme } from '../../context/ThemeContext'
import useAuth from '../../hooks/auth/useAuth'
import { useFilter } from '../../context/FilterContext'
import SearchBar from '../Common/SearchBar'
import WarningModal from '../modal/WarningModal'
import { useSiteConfig } from '../../context/SiteConfigContext'


function getInitials(name, email) {
  const target = (name && name.trim()) || email || "";
  if (!target) return "U";
  const parts = target.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return target.slice(0, 2).toUpperCase();
}

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { mode } = useTheme()
  const { user, userName, logout: authLogout, setIsLoginOpen } = useAuth()
  const { searchkey, setSearchkey } = useFilter()
  const { config, loading: isConfigLoading } = useSiteConfig()
  const [logoImageLoaded, setLogoImageLoaded] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const handleSearchChange = (val) => {
    setSearchkey(val)
    if (location.pathname !== '/allproducts') {
      navigate('/allproducts')
    }
  }

  const isLinkActive = (path) => {
    if (!path) return false;
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path === '/allproducts') {
      return location.pathname === '/allproducts' || location.pathname.startsWith('/productdetails');
    }
    if (path === '/videos' || path === '/blog' || path === '/blogs') {
      return location.pathname === '/videos' || location.pathname === '/blog' || location.pathname === '/blogs';
    }
    if (path.includes('/profile?tab=orders')) {
      return location.pathname === '/profile' && location.search.includes('tab=orders');
    }
    if (path === '/dashboard') {
      return (
        location.pathname === '/dashboard' ||
        location.pathname.startsWith('/admin') ||
        ['/products', '/orders', '/users', '/coupons', '/reviews', '/configure', '/addproduct', '/updateproduct'].includes(location.pathname)
      );
    }
    if (path === '/cart') {
      return location.pathname === '/cart';
    }
    if (path === '/profile') {
      return location.pathname === '/profile' && !location.search.includes('tab=orders');
    }
    return location.pathname === path;
  };

  const isAdmin = user?.user?.role === 'ADMIN' || user?.user?.role === 'SUPERADMIN';

  const navlinks = [
    { title: "Home", path: "/" },
    { title: "Products", path: "/allproducts" },
    { title: "Videos", path: "/videos" },
    { title: "Orders", path: "/profile?tab=orders" },
  ];

  const mobiliLinks = [
    { label: "Home", path: "/", icon: "home" },
    { label: "Products", path: "/allproducts", icon: "package_2" },
    { label: "Videos", path: "/videos", icon: "smart_display" },
    ...(isAdmin ? [{ label: "Admin", path: "/dashboard", icon: "admin_panel_settings" }] : []),
    { label: "Cart", path: "/cart", icon: "shopping_bag", isCart: true },
    { label: user ? "Profile" : "Login", path: user ? "/profile" : null, onClick: user ? null : () => setIsLoginOpen(true), icon: user ? "person" : "login" }
  ];

  // Subscribe to Redux store state for real-time cart updates
  const cartItems = useSelector((state) => state.cart) || [];
  const cartLength = cartItems.length;

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    authLogout();
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-bg-surface/95 bg-bg-base border-b border-border-subtle shadow-xs">

        {/* Top Navbar */}
        <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo & Company Name */}
          {isConfigLoading ? (
            <div className="flex items-center gap-2.5 py-1" aria-label="Loading logo and brand">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-card animate-pulse shrink-0 border border-border-subtle" />
              <div className="hidden sm:block h-6 sm:h-7 w-28 sm:w-36 rounded-lg bg-card animate-pulse border border-border-subtle" />
            </div>
          ) : (
            <Link to="/" className="flex items-center gap-2 group">
              {config.companyLogo && (
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
                  {!logoImageLoaded && (
                    <div className="absolute inset-0 rounded-xl bg-card animate-pulse border border-border-subtle" />
                  )}
                  <img
                    src={config.companyLogo}
                    onLoad={() => setLogoImageLoaded(true)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 object-contain transition-opacity duration-200 ${
                      logoImageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    alt={config.companyName || "Logo"}
                  />
                </div>
              )}

              {config.companyName && (
                <h1
                  className="hidden sm:block text-xl lg:text-2xl font-extrabold tracking-tight text-logo"
                  style={{ fontFamily: "Pirou" }}
                >
                  {config.companyName}
                </h1>
              )}
            </Link>
          )}

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6 2xl:gap-8 shrink-0">
            {navlinks.map((navlink, idx) => {
              const active = isLinkActive(navlink.path);
              return (
                <Link
                  key={idx}
                  to={navlink.path}
                  className={`text-xs xl:text-sm whitespace-nowrap transition relative py-1 ${active
                      ? "font-bold text-primary"
                      : "font-semibold text-text-muted hover:text-primary"
                    }`}
                >
                  {navlink.title}
                  {active && (
                    <span className="absolute -bottom-1.5 left-0 right-0 h-[2.5px] bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/dashboard"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border whitespace-nowrap shadow-2xs ${
                  isLinkActive('/dashboard')
                    ? "bg-primary text-compli border-primary shadow-xs"
                    : "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                }`}
                title="Admin Dashboard"
              >
                <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">

            {/* Desktop Search Bar */}
            <div className="hidden lg:block w-36 xl:w-52 2xl:w-64 transition-all">
              <SearchBar
                searchkey={searchkey}
                setSearchkey={handleSearchChange}
                searchClass="px-3 py-1 bg-bg-base border border-border-subtle"
              />
            </div>

            {/* Mobile Actions: Search & Admin */}
            <div className="flex items-center gap-1.5 lg:hidden">
              {isAdmin && (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-bold active:scale-95 transition"
                  title="Admin Dashboard"
                >
                  <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                  <span className="hidden xs:inline text-[11px]">Admin</span>
                </Link>
              )}
              <button
                onClick={() => setIsMobileSearchOpen((prev) => !prev)}
                className="text-text-muted hover:text-primary transition p-1.5 rounded-lg active:scale-95"
                aria-label="Search"
              >
                <span className="material-symbols-outlined text-2xl">search</span>
              </button>
            </div>

            {/* Cart & Profile Area (Desktop Only) */}
            <div className="hidden lg:flex items-center gap-5">
              <Link to="/cart" className="relative text-text-muted hover:text-primary transition-colors flex items-center justify-center p-1">
                <span className="material-symbols-outlined">
                  shopping_bag
                </span>

                {cartLength > 0 && (
                  <span className="absolute -top-1 -right-2 bg-primary text-compli font-bold text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                    {cartLength}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link
                    to="/profile"
                    className="w-8 h-8 sm:w-9 h-9 rounded-full bg-primary/10 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs hover:bg-primary/20 transition-all"
                    title={userName || user?.user?.email || "Profile"}
                  >
                    {getInitials(userName, user?.user?.email)}
                  </Link>

                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="text-text-muted hover:text-red-400 cursor-pointer transition-colors p-1"
                    title="Log Out"
                  >
                    <span className="material-symbols-outlined icon-xl">
                      logout
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-3 py-1.5 sm:px-5 sm:py-2 rounded-full bg-primary hover:bg-primary-hover text-compli font-bold text-[10px] sm:text-xs transition cursor-pointer shadow-xs"
                >
                  Login
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Search Overlay Panel */}
        {isMobileSearchOpen && (
          <div className="lg:hidden px-4 py-2.5 bg-bg-surface border-t border-border-subtle flex items-center gap-3 animate-in slide-in-from-top duration-200">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchkey} 
                onChange={(e) => handleSearchChange(e.target.value)} 
                className="w-full pl-9 pr-3 py-1.5 rounded-full border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-primary text-xs" 
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                search
              </span>
            </div>
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className="text-xs font-semibold text-text-muted hover:text-text-base transition"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-border-subtle lg:hidden z-50">
          <div className="grid h-16" style={{ gridTemplateColumns: `repeat(${mobiliLinks.length}, minmax(0, 1fr))` }}>
            {mobiliLinks.map((item, index) => {
              const active = item.path ? isLinkActive(item.path) : false;
              const innerContent = (
                <div className={`flex flex-col items-center justify-center relative transition-colors w-full px-0.5 ${active ? "text-primary font-bold" : "text-text-muted hover:text-primary"
                  }`}>
                  <span className="material-symbols-outlined text-[20px] sm:text-[22px]">{item.icon}</span>
                  {item.isCart && cartLength > 0 && (
                    <span className="absolute -top-1 right-1.5 sm:right-3 bg-primary text-compli text-[10px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center font-bold px-0.5">
                      {cartLength}
                    </span>
                  )}
                  <span className="text-[10px] sm:text-[11px] mt-0.5 leading-tight truncate max-w-full text-center">{item.label}</span>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
                  )}
                </div>
              );

              if (item.path) {
                return (
                  <Link
                    key={index}
                    to={item.path}
                    className="flex flex-col items-center justify-center transition"
                  >
                    {innerContent}
                  </Link>
                );
              }

              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="flex flex-col items-center justify-center text-text-muted hover:text-primary transition cursor-pointer"
                >
                  {innerContent}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Logout Confirmation Warning Modal */}
      <WarningModal
        isOpen={isLogoutModalOpen}
        message="Are you sure you want to log out of your account?"
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
        confirmText="Log Out"
        cancelText="Cancel"
      />
    </>
  )
}