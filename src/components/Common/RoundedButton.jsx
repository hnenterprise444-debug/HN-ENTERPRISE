import React from 'react'

function RoundedButton({ icon, text, onClick, className, iconClass }) {
    return (
        <div>   <div className="relative group/tooltip">
            <button
                onClick={onClick}
                className={`px-[8px] py-[6px] bg-primary text-compli rounded-full font-bold text-sm hover:shadow-lg transition-all active:scale-[0.98] ${className}`}
            >
                <span className={`material-symbols-outlined ${iconClass || ''}`}>{icon}</span>
            </button>
            <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:block bg-bg-surface border border-border-subtle text-text-base text-[10px] font-bold rounded-md px-2 py-1 whitespace-nowrap shadow-md pointer-events-none z-10">
               {text}
            </span>
        </div></div>
    )
}

export default RoundedButton