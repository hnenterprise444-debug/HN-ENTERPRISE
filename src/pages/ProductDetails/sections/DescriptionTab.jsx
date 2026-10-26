import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

/**
 * DescriptionTab
 * Clean editorial presentation of product details, overview, and specifications.
 * Uses natural key-value dividers instead of rigid boxed tables to ensure
 * clean rendering across all screen sizes without awkward horizontal compression.
 */
export default function DescriptionTab({ description, specifications }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!description && (!specifications || specifications.length === 0)) {
        return (
            <div className="py-6 text-center text-text-muted text-sm italic font-medium">
                No details available for this product.
            </div>
        );
    }

    // Legacy Markdown String Fallback
    if (typeof description === "string") {
        return (
            <div className="py-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {description}
                </ReactMarkdown>
            </div>
        );
    }

    const shortOverview = description?.short || "";
    const sections = Array.isArray(description?.sections) ? description.sections : [];
    const isLongText = shortOverview.length > 100 || shortOverview.includes("\n");

    return (
        <div className="space-y-4 md:space-y-5">
            {/* Short Overview Summary */}
            {shortOverview && (
                <div className="space-y-2">
                    <p
                        className={`text-sm sm:text-base text-text-base leading-relaxed whitespace-pre-line transition-all ${
                            !isExpanded && isLongText ? "line-clamp-2 sm:line-clamp-3" : ""
                        }`}
                    >
                        {shortOverview}
                    </p>

                    {isLongText && (
                        <button
                            type="button"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline transition-colors cursor-pointer focus:outline-none"
                            aria-expanded={isExpanded}
                        >
                            <span>{isExpanded ? "Show less" : "Read more..."}</span>
                            {isExpanded ? (
                                <FaChevronUp className="w-2.5 h-2.5 text-[10px]" />
                            ) : (
                                <FaChevronDown className="w-2.5 h-2.5 text-[10px]" />
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* Structured Specifications Sections */}
            {sections.map((section, sIdx) => {
                const cols = section.columns || [];
                const isTwoCols = cols.length === 2;
                const rows = section.rows || [];

                return (
                    <div key={sIdx} className="space-y-3">
                        {section.title && (
                            <h3 className="text-base sm:text-lg font-bold text-text-base pb-2 border-b border-border-subtle">
                                {section.title}
                            </h3>
                        )}

                        {/* TEXT Section */}
                        {section.type === "TEXT" && section.content && (
                            <div className="text-xs sm:text-sm text-text-muted leading-relaxed whitespace-pre-line">
                                {section.content}
                            </div>
                        )}

                        {/* TABLE / SPECIFICATION LIST Section */}
                        {section.type === "TABLE" && (
                            <div className="pt-1">
                                {isTwoCols ? (
                                    /* Clean Key-Value Specification Grid (No cramped borders on mobile) */
                                    <div className="divide-y divide-border-subtle border-t border-b border-border-subtle">
                                        {rows.map((row, rIdx) => {
                                            const cells = Array.isArray(row)
                                                ? row
                                                : row && typeof row === "object" && Array.isArray(row.cells)
                                                ? row.cells
                                                : [];
                                            const label = cells[0] || "";
                                            const val = cells.slice(1).join(" • ");

                                            return (
                                                <div
                                                    key={rIdx}
                                                    className="py-3 sm:py-3.5 grid grid-cols-12 gap-3 sm:gap-6 items-baseline hover:bg-bg-surface/50 transition-colors"
                                                >
                                                    <span className="col-span-5 sm:col-span-4 text-xs sm:text-sm font-semibold text-text-muted">
                                                        {label}
                                                    </span>
                                                    <span className="col-span-7 sm:col-span-8 text-xs sm:text-sm font-medium text-text-base leading-snug">
                                                        {val}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    /* Multi-column clean table */
                                    <div className="overflow-x-auto border-t border-b border-border-subtle">
                                        <table className="w-full text-left text-xs sm:text-sm border-collapse">
                                            <thead>
                                                <tr className="border-b border-border-subtle">
                                                    {cols.map((col, cIdx) => (
                                                        <th
                                                            key={cIdx}
                                                            className="py-2.5 px-3 font-bold text-text-muted uppercase tracking-wider text-[11px]"
                                                        >
                                                            {col}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border-subtle">
                                                {rows.map((row, rIdx) => {
                                                    const cells = Array.isArray(row)
                                                        ? row
                                                        : row && typeof row === "object" && Array.isArray(row.cells)
                                                        ? row.cells
                                                        : [];
                                                    return (
                                                        <tr key={rIdx} className="hover:bg-bg-surface/50 transition-colors">
                                                            {cells.map((cell, cIdx) => (
                                                                <td
                                                                    key={cIdx}
                                                                    className={`py-2.5 px-3 text-xs sm:text-sm ${
                                                                        cIdx === 0
                                                                            ? "font-semibold text-text-base"
                                                                            : "text-text-muted"
                                                                    }`}
                                                                >
                                                                    {cell}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}