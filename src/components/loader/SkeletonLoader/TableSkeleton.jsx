import React from 'react';

/**
 * Reusable TableSkeleton loader
 * Renders pulse placeholders for desktop tables and mobile card items.
 */
function TableSkeleton({ rows = 6, columns = 5 }) {
    return (
        <div className="space-y-4">
            {/* Mobile Cards Skeleton */}
            <div className="block md:hidden space-y-3">
                {Array.from({ length: Math.min(rows, 4) }).map((_, idx) => (
                    <div
                        key={idx}
                        className="bg-bg-surface p-4 rounded-2xl border border-border-base/60 shadow-xs animate-pulse space-y-3"
                    >
                        <div className="flex justify-between items-center">
                            <div className="h-4 w-24 bg-border-base/40 rounded-md" />
                            <div className="h-4 w-16 bg-border-base/30 rounded-full" />
                        </div>
                        <div className="flex gap-3 items-center">
                            <div className="w-12 h-12 rounded-xl bg-border-base/40 shrink-0" />
                            <div className="space-y-2 flex-1">
                                <div className="h-4 w-3/4 bg-border-base/40 rounded-md" />
                                <div className="h-3 w-1/2 bg-border-base/30 rounded-md" />
                            </div>
                        </div>
                        <div className="pt-2 border-t border-border-base/30 flex justify-between items-center">
                            <div className="h-4 w-20 bg-border-base/30 rounded-md" />
                            <div className="h-5 w-16 bg-border-base/40 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table Skeleton */}
            <div className="hidden md:block bg-bg-surface rounded-2xl border border-border-base/60 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border-base/60 bg-bg-base/50">
                                {Array.from({ length: columns }).map((_, colIdx) => (
                                    <th key={colIdx} className="px-6 py-4">
                                        <div className="h-3.5 w-20 bg-border-base/50 rounded-md animate-pulse" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-base/40">
                            {Array.from({ length: rows }).map((_, rowIdx) => (
                                <tr key={rowIdx} className="animate-pulse">
                                    {Array.from({ length: columns }).map((_, colIdx) => (
                                        <td key={colIdx} className="px-6 py-4">
                                            {colIdx === 0 ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-border-base/40 shrink-0" />
                                                    <div className="space-y-1.5 flex-1">
                                                        <div className="h-3.5 w-28 bg-border-base/40 rounded-md" />
                                                        <div className="h-2.5 w-16 bg-border-base/30 rounded-md" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-3.5 w-20 bg-border-base/30 rounded-md" />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default TableSkeleton;
