import React, { useState, useEffect } from "react";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { fireDB } from "../../firebase/FirebaseConfig";
import ReviewCard from "./ReviewCard";

export default function ReviewSection() {
    const [liveReviews, setLiveReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchLiveReviews = async () => {
            try {
                const q = query(
                    collection(fireDB, "ratings"),
                    orderBy("createdAt", "desc"),
                    limit(15)
                );
                const snap = await getDocs(q);
                const fetched = [];
                const colors = ["bg-indigo-600", "bg-pink-600", "bg-teal-600", "bg-amber-600", "bg-purple-600", "bg-emerald-600"];
                let idx = 0;
                snap.forEach((doc) => {
                    const d = doc.data();
                    if (d.review && typeof d.review === "string" && d.review.trim().length > 0) {
                        fetched.push({
                            id: doc.id,
                            name: d.userName || "Verified Customer",
                            role: "Verified Buyer",
                            text: d.review.trim(),
                            bgColor: colors[idx % colors.length]
                        });
                        idx++;
                    }
                });
                if (isMounted) {
                    setLiveReviews(fetched);
                }
            } catch (err) {
                console.warn("Could not fetch reviews:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchLiveReviews();
        return () => { isMounted = false; };
    }, []);

    if (loading || liveReviews.length === 0) {
        return null;
    }

    const reviews = liveReviews;
    return (
        <section id="reviews" className=" scroll-mt-36">
            <style>
                {`
                @keyframes marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(calc(-100% - 1.5rem));
                    }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .group:hover .animate-marquee {
                    animation-play-state: paused;
                }
                `}
            </style>

            <div className="mb-10 text-center ">
                <span className="block text-[11px] font-bold tracking-[0.2em] uppercase text-primary mb-1.5 sm:mb-3 font-primary">
                    TESTIMONIALS
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.02em] leading-[1.15] text-text-base font-heading">
                    Client Reviews
                </h2>
            </div>

            {/* Marquee Container */}
            <div
                className="group relative flex overflow-hidden"
                style={{
                    maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                    WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                }}
            >
                {/* Original Set */}
                <div className="flex shrink-0 gap-6 animate-marquee mr-6">
                    {reviews.map((review) => (
                        <div key={`orig-${review.id}`} className="w-[85vw] sm:w-[350px] md:w-[450px] shrink-0">
                            <ReviewCard
                                name={review.name}
                                role={review.role}
                                review={review.text}
                                bgColor={review.bgColor}
                            />
                        </div>
                    ))}
                </div>

                {/* Duplicated Set for infinite loop */}
                <div className="flex shrink-0 gap-6 animate-marquee mr-6" aria-hidden="true">
                    {reviews.map((review) => (
                        <div key={`dup-${review.id}`} className="w-[85vw] sm:w-[350px] md:w-[450px] shrink-0">
                            <ReviewCard
                                name={review.name}
                                role={review.role}
                                review={review.text}
                                bgColor={review.bgColor}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}