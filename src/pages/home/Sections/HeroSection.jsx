import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import HeroSkeleton from '../../../components/loader/SkeletonLoader/HeroSkeleton';

function HeroSection() {
    const { banners, loading } = useSiteConfig();
    const [currentSlide, setCurrentSlide] = useState(0);
    const sliderRef = useRef(null);

    if (loading) {
        return <HeroSkeleton />;
    }

    if (!banners || banners.length === 0) {
        return null;
    }

    const displayBanners = banners;

    const settings = {
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        swipe: true,
        afterChange: (current) => setCurrentSlide(current),
    };

    return (
        <div className="relative w-full overflow-hidden rounded-2xl lg:rounded-3xl border border-border-subtle group">

            <Slider ref={sliderRef} {...settings}>
                {displayBanners.map((banner, index) => (
                    <div key={banner.bannerId || index}>

                        <div className="relative h-[180px] sm:h-[260px] md:h-[340px] lg:h-[420px] xl:h-[500px]">

                            {/* Banner Image */}
                            <img
                                src={banner.imageUrl}
                                alt={banner.title || `Slide ${index + 1}`}
                                className="absolute inset-0 w-full h-full object-cover"
                            />

                            {/* Content */}
                            {(banner.title || banner.subtitle || banner.ctaLabel) && (
                                <div className="absolute inset-0 flex items-center">

                                    <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">

                                        <div className="max-w-xs sm:max-w-md lg:max-w-2xl">

                                            {banner.title && (
                                                <h2 className="text-white font-black leading-tight text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl drop-shadow-lg">
                                                    {banner.title}
                                                </h2>
                                            )}

                                            {banner.subtitle && (
                                                <p className="mt-3 text-white/90 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed">
                                                    {banner.subtitle}
                                                </p>
                                            )}

                                            {banner.ctaLabel && banner.ctaUrl && (
                                                <Link
                                                    to={banner.ctaUrl}
                                                    className="inline-flex mt-5 px-5 py-2.5 sm:px-7 sm:py-3 rounded-full bg-primary text-compli font-bold text-sm sm:text-base hover:bg-primary-hover transition"
                                                >
                                                    {banner.ctaLabel}
                                                </Link>
                                            )}

                                        </div>

                                    </div>

                                </div>
                            )}

                        </div>

                    </div>
                ))}
            </Slider>

            {/* Left & Right Sliding Arrow Buttons */}
            {displayBanners.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => sliderRef.current?.slickPrev()}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg active:scale-95"
                        title="Previous Banner"
                    >
                        <FaChevronLeft size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={() => sliderRef.current?.slickNext()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg active:scale-95"
                        title="Next Banner"
                    >
                        <FaChevronRight size={14} />
                    </button>
                </>
            )}

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/35 backdrop-blur-md px-3 py-2 rounded-full">

                {displayBanners.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => sliderRef.current?.slickGoTo(i)}
                        className={`transition-all duration-300 rounded-full cursor-pointer ${i === currentSlide
                                ? "w-8 h-2 bg-primary shadow-xs"
                                : "w-2 h-2 bg-white/40 hover:bg-white/70"
                            }`}
                    />
                ))}

            </div>

        </div>
    );
}

export default HeroSection;