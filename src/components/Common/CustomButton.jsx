import React from 'react'

function customButton({ onClick, text, className }) {
    return (
        <div>
            <button
                onClick={onClick}
                className={`px-[8px] py-[6px] bg-gray-400 rounded-full font-bold text-sm hover:shadow-lg transition-all active:scale-[0.98] ${className}`}
            >
                {text}
            </button>
        </div>
    )
}

export default customButton