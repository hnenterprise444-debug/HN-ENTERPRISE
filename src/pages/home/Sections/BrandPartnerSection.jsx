import React from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';

/**
 * BrandPartnerSection
 * Infinite scrolling marquee showcasing authorized brand partners and dealers.
 * Dynamically configurable from Admin Panel.
 */
export default function BrandPartnerSection() {
  const { config } = useSiteConfig();

  const sectionConfig = {
    title: 'Brand Partner and Dealer',
    subtitle: '',
    enabled: true,
    ...(config?.brandsSection || {}),
  };

  // If hidden by admin
  if (sectionConfig.enabled === false) {
    return null;
  }

  const rawBrands = Array.isArray(config?.brands) ? config.brands : [];

  // Filter active brands
  const activeBrands = rawBrands.filter((b) => b.isActive !== false);

  if (activeBrands.length === 0) {
    return null;
  }

  // Double list for seamless continuous infinite marquee scroll
  const marqueeList = [...activeBrands, ...activeBrands];

  return (
    <section className="w-full py-4 sm:py-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center mb-5 sm:mb-8">
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-text-base tracking-tight">
            {sectionConfig.title || 'Brand Partner and Dealer'}
          </h2>
          {sectionConfig.subtitle && (
            <p className="text-xs sm:text-sm text-text-muted mt-1 font-medium max-w-xl mx-auto">
              {sectionConfig.subtitle}
            </p>
          )}
          <div className="w-12 h-1 bg-primary/70 rounded-full mx-auto mt-2" />
        </div>

        {/* Marquee Wrapper with soft edge fades */}
        <div className="relative w-full overflow-hidden group">
          
          {/* Subtle Left and Right Vignette Fade */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-bg-base via-bg-base/60 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-bg-base via-bg-base/60 to-transparent z-10" />

          {/* Marquee Track */}
          <div className="flex w-max animate-brand-marquee group-hover:[animation-play-state:paused] py-2 gap-3 sm:gap-4 select-none">
            {marqueeList.map((brand, index) => {
              const content = (
                <div
                  className="w-[130px] sm:w-[160px] md:w-[175px] h-[72px] sm:h-[84px] md:h-[90px] rounded-xl sm:rounded-2xl bg-card border border-border-subtle shadow-2xs hover:shadow-md transition-all duration-300 flex items-center justify-center p-3 sm:p-4 shrink-0 hover:scale-105"
                  title={brand.name}
                >
                  <img
                    src={brand.logo || brand.img}
                    alt={brand.name || 'Brand Logo'}
                    className="max-h-full max-w-full object-contain filter contrast-105"
                    loading="lazy"
                  />
                </div>
              );

              return brand.website ? (
                <a
                  key={`${brand.id || index}-${index}`}
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                >
                  {content}
                </a>
              ) : (
                <div key={`${brand.id || index}-${index}`}>
                  {content}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}

