import React from 'react';
import { FaWhatsapp, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSiteConfig } from '../../../context/SiteConfigContext';

/**
 * BengalTilesSection
 * Showcase hero banner for showroom & dealership with direct WhatsApp CTA or custom link.
 * Dynamically configurable from Admin -> Configure.
 */
export default function BengalTilesSection() {
  const { config } = useSiteConfig();
  const sectionConfig = config?.bengalTilesSection || {};

  // If explicitly hidden by admin or no authentic banner image has been uploaded
  if (sectionConfig.enabled === false || (!sectionConfig.desktopImage && !sectionConfig.mobileImage)) {
    return null;
  }

  const title = sectionConfig.title || config?.companyName || "";
  const subtitle = sectionConfig.subtitle || "";
  const badgeText = sectionConfig.badgeText || "";
  const buttonText = sectionConfig.buttonText || "Contact us";
  const buttonType = sectionConfig.buttonType || "whatsapp";
  const customLink = sectionConfig.buttonLink?.trim() || "";

  // Dynamic background images without dummy fallback
  const desktopImage = sectionConfig.desktopImage || sectionConfig.mobileImage;
  const mobileImage = sectionConfig.mobileImage || sectionConfig.desktopImage;

  // Resolve WhatsApp URL
  const getWhatsAppUrl = () => {
    const inquiryText = sectionConfig.whatsappMessage || 
      (title ? `Hi ${title}, I would like to inquire about your collection.` : "Hi, I would like to inquire about your collection.");

    // 1. Explicit override in section config
    if (sectionConfig.whatsappNumber) {
      const digits = sectionConfig.whatsappNumber.replace(/\D/g, "");
      if (digits) {
        const fullNumber = digits.length === 10 ? `91${digits}` : digits;
        return `https://wa.me/${fullNumber}?text=${encodeURIComponent(inquiryText)}`;
      }
    }

    // 2. Configured WhatsApp social link
    const waSocial = config?.socialLinks?.find(
      (s) => s.platform === "whatsapp" && s.isActive && s.url
    );
    if (waSocial?.url) {
      const u = waSocial.url.trim();
      if (u.startsWith("http://") || u.startsWith("https://")) return u;
      const digits = u.replace(/\D/g, "");
      if (digits) {
        return `https://wa.me/${digits}?text=${encodeURIComponent(inquiryText)}`;
      }
    }

    // 3. Configured phone numbers with WhatsApp enabled
    const waPhone =
      config?.phones?.find((p) => p.isWhatsapp && p.number) ||
      config?.phones?.[0];

    if (waPhone?.number) {
      const digits = waPhone.number.replace(/\D/g, "");
      if (digits.length >= 10) {
        const fullNumber = digits.length === 10 ? `91${digits}` : digits;
        return `https://wa.me/${fullNumber}?text=${encodeURIComponent(inquiryText)}`;
      }
    }

    return "";
  };

  const isCustomLink = buttonType === "custom" && customLink;
  const isExternalCustomLink = isCustomLink && (customLink.startsWith("http://") || customLink.startsWith("https://") || customLink.startsWith("//"));
  const whatsappUrl = getWhatsAppUrl();

  return (
    <section className="relative w-auto -mx-4 sm:-mx-4 md:-mx-6 lg:-mx-10 xl:-mx-20 overflow-hidden rounded-none border-y border-border-subtle shadow-xl group">
      {/* Background Image Container */}
      <div className="relative w-full h-[380px] sm:h-[440px] md:h-[500px] lg:h-[580px] xl:h-[640px] overflow-hidden">
        <picture className="absolute inset-0 w-full h-full">
          <source media="(max-width: 767px)" srcSet={mobileImage} />
          <img
            src={desktopImage}
            alt={title}
            className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
          />
        </picture>

        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/15 pointer-events-none" />

        {/* Content Centered at Bottom Half */}
        <div className="absolute inset-0 flex flex-col justify-end items-center text-center px-4 sm:px-8 pb-10 sm:pb-14 lg:pb-16 z-10">
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
            
            {/* Optional Luxury Eyebrow Badge */}
            {badgeText && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/15 border border-primary/40 text-primary text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-1 shadow-sm backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span>{badgeText}</span>
              </div>
            )}

            {/* Main Title */}
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-text-base tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              {title}
            </h2>

            {/* Tagline / Subtitle */}
            <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold text-text-muted max-w-3xl mx-auto leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] px-2">
              {subtitle}
            </p>

            {/* CTA Button */}
            <div className="pt-2 sm:pt-4 flex justify-center items-center">
              {isCustomLink ? (
                isExternalCustomLink ? (
                  <a
                    href={customLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3 sm:py-3.5 bg-primary hover:bg-primary-hover text-compli font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-black/40 hover:shadow-black/60 active:scale-95 transition-all duration-300 cursor-pointer"
                  >
                    <span>{buttonText}</span>
                    <FaArrowRight className="text-sm text-compli" />
                  </a>
                ) : (
                  <Link
                    to={customLink}
                    className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3 sm:py-3.5 bg-primary hover:bg-primary-hover text-compli font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-black/40 hover:shadow-black/60 active:scale-95 transition-all duration-300 cursor-pointer"
                  >
                    <span>{buttonText}</span>
                    <FaArrowRight className="text-sm text-compli" />
                  </Link>
                )
              ) : (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3 sm:py-3.5 bg-primary hover:bg-primary-hover text-compli font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-black/40 hover:shadow-black/60 active:scale-95 transition-all duration-300 cursor-pointer"
                >
                  <FaWhatsapp className="text-lg sm:text-xl text-compli" />
                  <span>{buttonText}</span>
                </a>
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

