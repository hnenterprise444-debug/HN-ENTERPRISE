import React from 'react';

/**
 * Header Component
 * Shared page header section.
 */
function Header({ title, description, icon, buttonText, clickhandler, disabled }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="">
                <h2 className="text-lg font-bold text-text-base tracking-tight leading-tight">
                    {title}
                </h2>
                <p className="mt-1 text-xs text-text-muted hidden md:block">
                    {description}
                </p>
            </div>
            {buttonText && (
                <button
                    onClick={clickhandler}
                    disabled={disabled}
                    className="py-1.5 px-3 bg-primary hover:bg-primary-hover text-compli font-bold text-xs rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                >
                    {icon}
                    <span>{buttonText}</span>
                </button>
            )}
        </div>
    );
}

export default Header;