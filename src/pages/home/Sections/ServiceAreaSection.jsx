import React from 'react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { FaWhatsapp } from 'react-icons/fa';

export default function ServiceAreaSection() {
  const { config } = useSiteConfig();

  // If no authentic service areas configured in store settings, do not render static fallback
  const serviceAreas = Array.isArray(config?.serviceAreas) ? config.serviceAreas : [];
  if (serviceAreas.length === 0) {
    return null;
  }

  const extendedAreas = Array.isArray(config?.extendedServiceAreas) ? config.extendedServiceAreas : [];

  // Compute WhatsApp inquiry link
  const getWhatsAppDeliveryUrl = () => {
    const waSocial = config?.socialLinks?.find(
      (s) => s.platform === "whatsapp" && s.isActive && s.url
    );
    if (waSocial?.url) {
      const u = waSocial.url.trim();
      if (u.startsWith("http://") || u.startsWith("https://")) return u;
      const digits = u.replace(/\D/g, "");
      if (digits) {
        return `https://wa.me/${digits}?text=${encodeURIComponent(
          `Hi ${config?.companyName || ""}, I would like to inquire about delivery to my location.`
        )}`;
      }
    }

    const waPhone =
      config?.phones?.find((p) => p.isWhatsapp && p.number) ||
      config?.phones?.[0];

    if (waPhone?.number) {
      const digits = waPhone.number.replace(/\D/g, "");
      if (digits.length >= 10) {
        const fullNumber = digits.length === 10 ? `91${digits}` : digits;
        return `https://wa.me/${fullNumber}?text=${encodeURIComponent(
          `Hi ${config?.companyName || ""}, I would like to inquire about delivery to my location.`
        )}`;
      }
    }

    return "";
  };

  const deliveryWhatsAppUrl = getWhatsAppDeliveryUrl();

  return (
    <section id="service-areas" className="w-full py-4 sm:py-8 lg:py-10">
      <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-4">
        
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">distance</span>
            <span>Delivery & Logistics Network</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-base tracking-tight font-heading">
            Our Service Areas
          </h2>

          <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto font-medium">
            Providing reliable, safe doorstep supply and on-site transport across Purba & Paschim Medinipur.
          </p>
        </div>

        {/* 2-Column Districts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {serviceAreas.map((item, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-3xl bg-card border border-border-subtle shadow-xs hover:shadow-lg transition-all duration-300 p-3 sm:p-4 lg:p-8 flex flex-col justify-between"
            >
              {/* Top district title & badge */}
              <div>
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-border-subtle">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-xl">{item.icon || "location_on"}</span>
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-text-base tracking-tight">
                        {item.district}
                      </h3>
                      {item.subtitle && (
                        <p className="text-xs text-text-muted font-semibold">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {Array.isArray(item.locations) && item.locations.length > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-bg-base border border-border-subtle text-[11px] font-bold text-text-muted shrink-0">
                      {item.locations.length} Locations
                    </span>
                  )}
                </div>

                {/* Locations Grid / Chips */}
                {Array.isArray(item.locations) && item.locations.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {item.locations.map((loc, lIdx) => {
                      const isHub = typeof loc === 'string' && loc.includes("(Showroom)");
                      return (
                        <div
                          key={lIdx}
                          className={`group rounded-xl px-3 py-2.5 text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 border ${
                            isHub
                              ? "bg-primary/10 text-primary border-primary/40 shadow-2xs font-bold"
                              : "bg-bg-base hover:bg-primary/5 text-text-base border-border-subtle hover:border-primary/40 hover:-translate-y-0.5"
                          }`}
                        >
                          <span className={`material-symbols-outlined text-sm shrink-0 transition-colors ${
                            isHub ? "text-primary" : "text-primary/70 group-hover:text-primary"
                          }`}>
                            {isHub ? "star" : "location_on"}
                          </span>
                          <span className="truncate">{loc}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Extended Delivery Coverage ── */}
        {extendedAreas.length > 0 && (
          <div className="mt-8 sm:mt-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">local_shipping</span>
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-text-base tracking-tight font-heading">
                    Also Delivering To
                  </h3>
                  <p className="text-[11px] sm:text-xs text-text-muted font-medium">
                    Direct truckload delivery and scheduled dispatch across neighboring districts
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full w-fit">
                {extendedAreas.length} Extended Districts
              </span>
            </div>

            {/* KPI Card Style Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {extendedAreas.map((district, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl bg-card border border-border-subtle hover:border-primary/50 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-center text-center hover:-translate-y-0.5"
                >
                  <h4 className="text-base sm:text-lg font-black text-text-base group-hover:text-primary transition-colors tracking-tight">
                    {district}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Quick Delivery Callout Bar */}
        <div className="mt-6 sm:mt-8 p-4 md:p-5 rounded-2xl bg-card border border-border-subtle flex flex-col md:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">help</span>
            </span>
            <div>
              <p className="text-sm font-bold text-text-base">
                Need delivery to a location outside these areas?
              </p>
              <p className="text-xs text-text-muted font-medium">
                We coordinate safe shipping and logistics to your destination.
              </p>
            </div>
          </div>

          <a
            href={deliveryWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-compli text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-xs active:scale-95 shrink-0"
          >
            <FaWhatsapp className="text-base" />
            <span>Inquire for Delivery</span>
          </a>
        </div>

      </div>
    </section>
  );
}
