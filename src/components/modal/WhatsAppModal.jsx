import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useSiteConfig } from "../../context/SiteConfigContext";

/**
 * WhatsAppFloatingButton
 * Clean floating WhatsApp button that directly redirects to WhatsApp chat.
 */
export default function WhatsAppModal() {
  const { config } = useSiteConfig();
  const companyName = config?.companyName || "";

  // Check if WhatsApp modal is explicitly disabled
  if (config?.whatsappModal?.enabled === false) {
    return null;
  }

  // Resolve WhatsApp number from site configuration
  const getWhatsAppUrl = () => {
    const defaultMsg = companyName
      ? `Hi ${companyName}, I would like to inquire about your products.`
      : "Hi, I would like to inquire about your products.";
    const targetMsg = config?.whatsappModal?.message?.trim() || defaultMsg;

    // 0. Dedicated WhatsApp Modal form configuration (Highest Priority)
    const modalPhone = config?.whatsappModal?.phoneNumber?.trim();
    if (modalPhone) {
      const digits = modalPhone.replace(/\D/g, "");
      if (digits.length >= 10) {
        const fullNumber = digits.length === 10 ? `91${digits}` : digits;
        return `https://wa.me/${fullNumber}?text=${encodeURIComponent(targetMsg)}`;
      }
    }

    // 1. Configured WhatsApp social link (fallback)
    const waSocial = config?.socialLinks?.find(
      (s) => s.platform === "whatsapp" && s.isActive && s.url
    );
    if (waSocial?.url) {
      const u = waSocial.url.trim();
      if (u.startsWith("http://") || u.startsWith("https://")) return u;
      const digits = u.replace(/\D/g, "");
      if (digits) {
        return `https://wa.me/${digits}?text=${encodeURIComponent(targetMsg)}`;
      }
    }

    // 2. Configured phone numbers with WhatsApp enabled (fallback)
    const waPhone =
      config?.phones?.find((p) => p.isWhatsapp && p.number) ||
      config?.phones?.[0];

    if (waPhone?.number) {
      const digits = waPhone.number.replace(/\D/g, "");
      if (digits.length >= 10) {
        const fullNumber = digits.length === 10 ? `91${digits}` : digits;
        return `https://wa.me/${fullNumber}?text=${encodeURIComponent(targetMsg)}`;
      }
    }

    // 3. Fallback
    return `https://wa.me/?text=${encodeURIComponent(targetMsg)}`;
  };

  const whatsappUrl = getWhatsAppUrl();

  return (
    <div className="fixed bottom-20 sm:bottom-20 lg:bottom-7 right-4 sm:right-6 z-40">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us on WhatsApp"
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl shadow-emerald-700/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer relative"
      >
        <FaWhatsapp className="text-3xl transition-transform duration-300 group-hover:scale-105" />
        
        {/* Pulsating live status ping */}
        <span className="absolute top-1 right-1 flex h-3.5 w-3.5 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-70"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300 border-2 border-white"></span>
        </span>
      </a>
    </div>
  );
}
