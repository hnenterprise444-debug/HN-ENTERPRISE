import React from "react";
import { FaStar, FaThumbsUp } from "react-icons/fa";
import { MdOutlineRateReview } from "react-icons/md";

function ReviewStats({ reviews = [] }) {
    const total = reviews.length;

    const avg =
        total > 0
            ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total).toFixed(1)
            : "0.0";

    const fiveStars = reviews.filter((r) => r.rating === 5).length;

    // Distribution
    const dist = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => r.rating === star).length,
        pct: total > 0 ? Math.round((reviews.filter((r) => r.rating === star).length / total) * 100) : 0,
    }));

    const cards = [
        {
            title: "Total Reviews",
            value: total,
            icon: "reviews",
            color: "text-blue-600 bg-blue-50 border-blue-100",
        },
        {
            title: "Average Rating",
            value: avg,
            icon: "star",
            color: "text-amber-500 bg-amber-50 border-amber-100",
            suffix: "/ 5",
        },
        {
            title: "5-Star Reviews",
            value: fiveStars,
            icon: "thumb_up",
            color: "text-primary bg-primary/10 border-primary/20",
        },
    ];

    return (
        <div className="flex flex-col xl:flex-row gap-4">
            <div className="flex-[5]">
                <div className="grid grid-cols-1 gap-3">
                    {cards.map((card, i) => (
                        <div
                            key={i}
                            className="bg-card border border-border-subtle rounded-2xl shadow-xs py-2.5 px-4 hover:border-primary/40 transition-colors duration-150"
                        >
                            <div className="flex items-center justify-between">

                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${card.color}`}
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            {card.icon}
                                        </span>
                                    </div>

                                    <span className="text-sm font-semibold text-text-muted">
                                        {card.title}
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold tracking-tight text-text-base">
                                    {card.value}

                                    {card.suffix && (
                                        <span className="ml-1 text-sm font-semibold text-text-muted">
                                            {card.suffix}
                                        </span>
                                    )}
                                </h2>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-[5]">
                <div className="bg-card border border-border-subtle rounded-2xl shadow-xs py-2.5 px-4 h-full hover:border-primary/40 transition-colors duration-150">

                    <span className="text-base font-bold text-text-base block mb-2">
                        Rating Distribution
                    </span>

                    <div className="space-y-2.5">
                        {dist.map((d) => (
                            <div
                                key={d.star}
                                className="flex items-center gap-3"
                            >
                                <span className="w-4 text-sm font-semibold text-right text-text-base">
                                    {d.star}
                                </span>

                                <FaStar className="text-primary text-sm shrink-0" />

                                <div className="flex-1 bg-bg-base border border-border-subtle/50 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all duration-300"
                                        style={{ width: `${d.pct}%` }}
                                    />
                                </div>

                                <span className="w-8 text-right text-xs font-medium text-text-muted">
                                    {d.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}

export default ReviewStats;
