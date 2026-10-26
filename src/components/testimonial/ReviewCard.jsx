import React, { useState } from "react";
import { createPortal } from "react-dom";

/**
 * ReviewCard Component
 * Displays client testimonial reviews.
 * Leverages theme variables to automatically support light/dark transitions.
 */
export default function ReviewCard({ name, role, review, bgColor }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            <div className="rounded-3xl border border-border-subtle bg-card hover:bg-card-hover hover:border-primary/40 p-6 text-text-base transition-all duration-300 hover:-translate-y-2 hover:shadow-xl h-[230px] flex flex-col justify-between">
                <div>
                    <div className="mb-5 flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-full shrink-0 flex items-center justify-center text-lg font-black text-compli shadow-2xs select-none ${bgColor || "bg-primary"}`}>
                                {name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 className="font-bold text-text-base line-clamp-1">{name}</h4>
                                <p className="text-xs text-text-muted font-semibold line-clamp-1">{role}</p>
                            </div>
                        </div>
                        
                        {/* Rating Stars - aligned with catalog cards */}
                        <div className="flex text-amber-500 shrink-0">
                            {[...Array(5)].map((_, i) => (
                                <span
                                    key={i}
                                    className="material-symbols-outlined text-[18px]"
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                    star
                                </span>
                            ))}
                        </div>
                    </div>

                    <p className="italic text-text-muted text-xs leading-relaxed font-semibold line-clamp-4">
                        "{review}"
                    </p>
                </div>

                <button
                    onClick={() => setIsExpanded(true)}
                    className="mt-4 flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors self-start cursor-pointer"
                >
                    Expand review
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </button>
            </div>

            {/* Expanded Modal Review */}
            {isExpanded &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                        onClick={() => setIsExpanded(false)}
                    >
                        <div
                            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border-subtle text-text-base p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-bg-base border border-border-subtle text-text-muted transition-colors hover:bg-card-hover hover:text-text-base cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>

                            <div className="mb-6 flex items-center gap-4 pr-8">
                                <div className={`h-14 w-14 rounded-full shrink-0 flex items-center justify-center text-2xl font-black text-compli shadow-2xs select-none ${bgColor || "bg-primary"}`}>
                                    {name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-text-base">{name}</h4>
                                    <p className="text-xs text-text-muted font-semibold">{role}</p>
                                </div>
                            </div>
                            
                            <div className="mb-6 flex text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                    <span
                                        key={i}
                                        className="material-symbols-outlined text-[20px]"
                                        style={{ fontVariationSettings: "'FILL' 1" }}
                                    >
                                        star
                                    </span>
                                ))}
                            </div>

                            <p className="text-sm italic text-text-muted leading-relaxed font-semibold">
                                "{review}"
                            </p>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}