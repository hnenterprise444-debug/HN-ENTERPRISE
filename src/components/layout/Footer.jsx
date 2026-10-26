import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useSiteConfig } from '../../context/SiteConfigContext';
import mapPreviewImg from '../../assets/map_preview.png';

const FOOT_LINKS = [
    { title: "Terms & Conditions", path: "/termsconditions" },
    { title: "Privacy Policy",     path: "/privacypolicy" },
    { title: "Return Policy",      path: "/returnpolicy" },
    { title: "About Us",           path: "/aboutus" },
];

/**
 * Footer Component
 * Renders company name, address, contacts, social links, and legal navigation.
 * All data sourced from Firestore via SiteConfigContext.
 * Falls back to placeholder text if config is empty.
 */
function Footer() {
    const { mode } = useTheme();
    const { config } = useSiteConfig();

    const { companyName, address, phones, emails, socialLinks, legal } = config;

    const activeSocials = (socialLinks || []).filter((s) => s.isActive && s.url && s.platform !== "whatsapp");

    const fullAddress = [
        address?.line1,
        address?.line2,
        address?.city,
        address?.state,
        address?.pincode,
    ].filter(Boolean).join(", ");

    const mapUrl = address?.mapUrl || 
        (fullAddress 
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
            : `https://maps.google.com/?q=${encodeURIComponent(companyName || 'Store')}`);

    // Build dynamic legal links — only include documents that are actually uploaded/configured & active
    const fixedMap = [
        { key: "aboutUs",           title: "About Us",           path: "/aboutus" },
        { key: "privacyPolicy",     title: "Privacy Policy",     path: "/privacypolicy" },
        { key: "termsAndConditions", title: "Terms & Conditions", path: "/termsconditions" },
        { key: "returnPolicy",       title: "Return Policy",      path: "/returnpolicy" },
        { key: "shippingPolicy",     title: "Shipping Policy",    path: "/shippingpolicy" },
        { key: "refundPolicy",       title: "Refund Policy",      path: "/refundpolicy" },
    ];

    const fixedPages = legal?.fixedPages || {};
    const activeFixedLinks = fixedMap.filter(item => {
        const page = fixedPages[item.key];
        if (!page) {
            // Check legacy string format if present
            const legacyVal = legal?.[item.key];
            return typeof legacyVal === "string" && legacyVal.trim().length > 0;
        }
        if (page.isActive === false) return false;
        const hasDocUrl = Boolean(page.docUrl || page.pdfUrl);
        const hasContent = Boolean(page.content && page.content.trim());
        return hasDocUrl || hasContent;
    });

    const customPages = Array.isArray(legal?.customPages) ? legal.customPages : [];
    const activeCustomLinks = customPages
        .filter(p => p.isActive !== false && Boolean(p.docUrl || p.pdfUrl || p.content))
        .map(p => ({ title: p.name, path: `/legal/${p.slug}` }));

    const legalLinks = [
        { title: "Meet Our Founder", path: "/founder" },
        ...activeFixedLinks,
        ...activeCustomLinks
    ];

    return (
        <footer className="bg-bg-surface border-t border-border-subtle transition-colors duration-300">
            <div className="px-4 sm:px-6 lg:px-10 pt-6 pb-28 lg:py-6">
                <div className="mt-4 flex flex-col lg:flex-row items-center justify-between gap-6 text-[13px] text-text-muted">

                    {/* Brand and Address */}
                    <div className="space-y-2 text-center max-w-[260px] sm:max-w-[280px] lg:text-left">
                        <Link to="/" className="inline-block">
                            <h2 className="text-2xl font-black tracking-tight text-primary">
                                {companyName || "Company Name"}
                            </h2>
                        </Link>
                        
                        {config.companyTagline && (
                            <div className="my-1">
                                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary font-bold text-xs tracking-wide shadow-2xs">
                                    {config.companyTagline}
                                </span>
                            </div>
                        )}

                        <p className="font-semibold text-xs text-text-muted pt-0.5">
                            © {new Date().getFullYear()} {companyName || "Company Name"}. All rights reserved.
                        </p>

                        {(fullAddress || mapUrl) && (
                            <div className="flex gap-1.5 items-start justify-center lg:justify-start pt-1">
                                <span className="material-symbols-outlined text-sm text-primary shrink-0 mt-0.5">location_on</span>
                                {mapUrl ? (
                                    <a
                                        href={mapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-xs text-text-muted hover:text-primary leading-relaxed inline group transition-colors cursor-pointer text-left"
                                        title="Open Location in Google Maps"
                                    >
                                        <span>{fullAddress}</span>
                                        <span className="inline-flex items-center ml-1 text-primary group-hover:translate-x-0.5 transition-transform align-middle">
                                            <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                                        </span>
                                    </a>
                                ) : (
                                    <span className="font-medium text-xs text-text-muted leading-relaxed text-left">{fullAddress}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Showroom Map Location Card */}
                    {/* <div className="shrink-0 flex justify-center">
                        <a
                            href={mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block w-52 sm:w-60 md:w-64 rounded-xl overflow-hidden border border-border-subtle hover:border-primary/50 shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer"
                            title={`Open ${companyName || 'Store'} on Google Maps`}
                        >
                            <img
                                src={mapPreviewImg}
                                alt="Showroom Map Location"
                                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                            />
                        </a>
                    </div> */}

                    {/* Social Links and Contacts */}
                    <div className="flex flex-col items-center gap-2.5 max-w-[260px] sm:max-w-[280px] text-center">
                        {activeSocials.length > 0 && (
                            <div className="flex gap-2.5">
                                {activeSocials.map((social) => {
                                    let href = (social.url || "").trim();
                                    if (social.platform === "whatsapp") {
                                        if (!href.startsWith("http://") && !href.startsWith("https://")) {
                                            const cleanDigits = href.replace(/[^0-9]/g, "");
                                            href = cleanDigits.length >= 7 ? `https://wa.me/${cleanDigits}` : `https://${href}`;
                                        }
                                    } else if (!href.startsWith("http://") && !href.startsWith("https://")) {
                                        href = `https://${href}`;
                                    }

                                    return (
                                        <a
                                            key={social.platform}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-7 h-7 rounded-full border border-border-subtle flex items-center justify-center text-text-muted hover:text-compli hover:bg-primary hover:border-primary transition-all duration-300 shadow-2xs"
                                            title={social.platform}
                                        >
                                            <i className={`fa-brands ${social.icon} text-[11px]`} />
                                        </a>
                                    );
                                })}
                            </div>
                        )}

                        {/* Contacts Grid: 2 Columns */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-semibold text-text-muted">
                            {/* Phone Numbers */}
                            {(phones || [])
                                .filter((p, index, self) => {
                                    const num = typeof p === 'string' ? p : p?.number;
                                    if (!num) return false;
                                    const clean = num.replace(/\D/g, '');
                                    return self.findIndex(s => (typeof s === 'string' ? s : s?.number)?.replace(/\D/g, '') === clean) === index;
                                })
                                .map((p, i) => {
                                    const num = typeof p === 'string' ? p : p.number;
                                    const label = typeof p === 'object' ? p.label : null;
                                    const cleanDigits = num.replace(/[^0-9+]/g, '');
                                    return (
                                        <a
                                            key={`phone-${i}`}
                                            href={`tel:${cleanDigits}`}
                                            className="flex gap-1.5 items-center hover:text-primary transition cursor-pointer whitespace-nowrap"
                                            title={`Call ${label || 'Us'}`}
                                        >
                                            <span className="material-symbols-outlined text-sm text-primary shrink-0">call</span>
                                            <span className="font-medium text-xs text-text-muted hover:text-primary">
                                                {label ? <span className="font-semibold text-text-base mr-1">{label}:</span> : null}
                                                {num}
                                            </span>
                                        </a>
                                    );
                                })}

                            {/* Email Address */}
                            {(emails || []).map((e, i) => (
                                <a
                                    key={`email-${i}`}
                                    href={`mailto:${e.email}`}
                                    className="flex gap-1.5 items-center hover:text-primary transition cursor-pointer whitespace-nowrap"
                                    title={`Email ${e.label || 'Support'}`}
                                >
                                    <span className="material-symbols-outlined text-sm text-primary shrink-0">mail</span>
                                    <p className="font-medium text-xs text-text-muted hover:text-primary">{e.email}</p>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Legal Links */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex flex-wrap justify-center gap-4 max-w-md">
                            {legalLinks.map((link, i) => (
                                <Link
                                    key={i}
                                    className="underline hover:text-primary transition-colors text-xs font-bold whitespace-nowrap"
                                    to={link.path}
                                >
                                    {link.title}
                                </Link>
                            ))}
                        </div>
                        <p className="text-center text-sm text-white">
                            Design & Develop By{" "}
                            <a href="https://needmet.in" target="_blank" rel="noopener noreferrer" className="font-bold underline text-green-500 hover:text-green-400 transition-colors">
                                NeedMet
                            </a>
                        </p>
                    </div>

                </div>
            </div>
        </footer>
    );
}

export default Footer;