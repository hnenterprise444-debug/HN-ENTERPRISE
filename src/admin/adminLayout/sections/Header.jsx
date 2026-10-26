import React from 'react';

/**
 * Header Component
 * Sticky top navigation header (height: 64px) with viewport menu toggles, title, and profile details.
 */
export default function Header({
    setDrawerOpen,
    title
}) {
    return (
        <header className="sticky top-0 z-30 bg-bg-surface/85 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-4 md:px-6 lg:px-8 h-16 shrink-0 print:hidden">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="md:hidden flex items-center justify-center text-text-base cursor-pointer hover:bg-card-hover hover:text-primary p-1.5 rounded-lg transition-colors"
                    title="Open Menu"
                >
                    <span className="material-symbols-outlined text-[24px]">menu</span>
                </button>

                {/* Page Title */}
                <h1 className="text-[20px] md:text-[24px] lg:text-[28px] font-bold text-text-base tracking-tight leading-none">
                    {title}
                </h1>
            </div>

            {/* Right Area: Admin Badge */}
            <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary font-bold text-[10px] md:text-xs uppercase tracking-wider">
                    Admin
                </div>
            </div>
        </header>
    );
}
