import React from 'react';

/**
 * FeatureCard Component
 * Displays a value proposition card.
 * Uses layout CSS variables to automatically support light/dark theme shifts.
 */
function FeatureCard({ feature }) {
    return (
        <div className="w-full ">
            <div className="px-4 py-6 space-y-3 rounded-3xl bg-card border border-border-subtle hover:bg-card-hover transition-all duration-300 hover:-translate-y-2 hover:border-primary hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)]">
                {/* Icon wrapper */}
                <div className="flex items-start text-primary">
                    <span className="material-symbols-outlined">
                        {feature.icon}
                    </span>
                </div>

                {/* Title */}
                <h3 className=" text-xl font-bold text-text-base">
                    {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm leading-5 text-text-muted font-medium">
                    {feature.description}
                </p>
            </div>
        </div>
    );
}

export default FeatureCard;