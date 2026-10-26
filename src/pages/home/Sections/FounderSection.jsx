import React from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';
import { useSiteConfig } from '../../../context/SiteConfigContext';

export default function FounderSection() {
  const { config } = useSiteConfig();
  
  // Do not render section if founder details are not configured or section is disabled
  if (!config?.founderName || config?.founderSection?.enabled === false) {
    return null;
  }

  const companyName = config?.companyName || "";
  const founderName = config?.founderName;
  const founderPhone = config?.founderPhone || config?.phones?.[0]?.number || "";
  const founderPhoneClean = founderPhone.replace(/[^0-9+]/g, '');
  const founderPhoneDigits = founderPhone.replace(/\D/g, '');
  const founderPhoto = config?.founderPhoto || "";

  return (
    <section className="max-w-5xl mx-auto px-1 sm:px-2 lg:px-8 py-3 sm:py-6">
      <div className="relative overflow-hidden rounded-3xl bg-card border border-border-subtle shadow-lg shadow-black/20 hover:border-primary/40 p-6 sm:p-10 lg:p-12 transition-all duration-300">
        
        {/* Soft Ambient Background Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Founder Portrait (if photo configured) */}
          {founderPhoto && (
            <div className="md:col-span-5 flex justify-center">
              <div className="relative group/portrait w-full max-w-[280px] sm:max-w-[320px] md:max-w-none">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.4)] border border-primary/30 bg-bg-base">
                  <img
                    src={founderPhoto}
                    alt={founderName}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/portrait:scale-105"
                    loading="lazy"
                  />
                </div>
                {/* Subtle Ambient Frame Glow on Hover */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/20 pointer-events-none transition-all duration-300 group-hover/portrait:ring-primary/40" />
              </div>
            </div>
          )}

          {/* Typography & Refined Minimal CTA */}
          <div className={`${founderPhoto ? "md:col-span-7" : "md:col-span-12 max-w-2xl mx-auto"} flex flex-col justify-center space-y-4 text-center md:text-left`}>
            
            {/* Eyebrow Accent */}
            {/* <div className="inline-flex items-center justify-center md:justify-start gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              <span className="w-5 h-[1.5px] bg-primary/60 rounded-full" />
              <span>Leadership & Vision</span>
            </div> */}

            {/* Founder Name & Title */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-base tracking-tight font-h1 leading-tight">
                {founderName}
              </h2>
              <p className="text-sm sm:text-base font-semibold text-primary/90">
                Founder, {companyName}
              </p>
            </div>

            {/* Concise Vision Statement */}
            <p className="text-sm sm:text-base text-text-muted leading-relaxed font-normal max-w-lg mx-auto md:mx-0">
              "Great spaces are built around people, uncompromising quality, and relationships anchored in long-term trust."
            </p>

            {/* Founder Contact & Direct Phone */}
            {founderPhone && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
                <a
                  href={`tel:${founderPhoneClean}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border-subtle hover:border-primary/50 text-xs font-bold text-text-base hover:text-primary transition-all duration-200 shadow-2xs group cursor-pointer"
                  title={`Call ${founderName}`}
                >
                  <span className="w-5 h-5 rounded-md bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-200">
                    <FaPhoneAlt size={9} className="text-primary group-hover:text-[#090909] transition-colors duration-200" />
                  </span>
                  <span>{founderPhone}</span>
                </a>

                <a
                  href={`https://wa.me/${founderPhoneDigits}?text=${encodeURIComponent(`Hello ${founderName}, I would like to connect with you regarding ${companyName || 'your store'}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  title={`Chat with ${founderName} on WhatsApp`}
                >
                  <FaWhatsapp className="text-xs text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              </div>
            )}

            {/* Refined Minimal CTA with Smooth Arrow Slide */}
            <div className="pt-2 flex justify-center md:justify-start">
              <Link
                to="/founder"
                className="group/cta inline-flex items-center gap-3 text-xs sm:text-sm font-bold text-text-base hover:text-primary transition-colors duration-300 cursor-pointer"
              >
                <span className="relative pb-0.5">
                  Meet Our Founder
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-primary transition-all duration-300 group-hover/cta:w-full" />
                </span>
                <span className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover/cta:bg-primary group-hover/cta:border-primary group-hover/cta:translate-x-1.5 transition-all duration-300 shadow-2xs">
                  <span className="material-symbols-outlined text-[18px] text-primary group-hover/cta:text-[#090909] transition-colors duration-200">arrow_forward</span>
                </span>
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
