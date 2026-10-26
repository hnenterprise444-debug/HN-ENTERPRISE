import React from 'react';

/**
 * DashboardCard Component
 * Displays summary analytics metrics.
 * Uses design system classes and animations for high visual fidelity.
 */
function DashboardCard({ title, value, icon }) {
    return (
        <div className="group bg-card hover:bg-card-hover rounded-2xl border border-border-subtle hover:border-primary/40 shadow-xs hover:shadow-md transition-all duration-300 p-4 sm:p-3 lg:p-3">
            <div className="flex items-center justify-between gap-4">
                {/* Left */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-compli shrink-0">
                        {icon}
                    </div>

                    <span className="text-xs sm:text-sm font-extrabold text-text-muted truncate">
                        {title}
                    </span>
                </div>
                {/* Right */}
                <h2 className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-text-base whitespace-nowrap">{value}</h2>
            </div>
        </div>
    );
}

export default DashboardCard;
