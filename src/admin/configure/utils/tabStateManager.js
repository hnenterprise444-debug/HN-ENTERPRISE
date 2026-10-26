import { DEFAULT_CONFIG, DEFAULT_SOCIAL_LINKS } from "../../../services/configure/configureService";

export const DEFAULT_SHOWCASE = {
  enabled: true,
  title: "Store Showcase",
  badgeText: "PREMIUM SHOWROOM & STORE",
  subtitle: "Explore our premium collection and visit our showroom",
  buttonText: "Contact us",
  buttonType: "whatsapp",
  buttonLink: "",
  whatsappNumber: "",
  whatsappMessage: "Hi, I would like to inquire about your products and collection.",
  desktopImage: "",
  mobileImage: "",
};

/**
 * Deep clone for JSON-serializable objects
 */
export function cloneDeep(obj) {
  if (obj === null || obj === undefined) return obj;
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj;
  }
}

/**
 * Structural deep equality check
 */
export function isDeepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;

  if (typeof a !== 'object') {
    return a === b;
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isDeepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a).filter(k => a[k] !== undefined);
  const keysB = Object.keys(b).filter(k => b[k] !== undefined);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!isDeepEqual(a[key], b[key])) return false;
  }

  return true;
}

/**
 * Extract initial state for each tab from the root config document
 */
export function getTabInitialData(tabId, config = {}) {
  switch (tabId) {
    case "company":
      return {
        companyName: config?.companyName || "Store",
        companyTagline: config?.companyTagline || "",
        founderName: config?.founderName || "",
        founderPhone: config?.founderPhone || "",
        founderPhoto: config?.founderPhoto || "",
        companyLogo: config?.companyLogo || "",
        faviconUrl: config?.faviconUrl || "",
      };

    case "contact":
      return {
        address: {
          line1: config?.address?.line1 || "",
          line2: config?.address?.line2 || "",
          city: config?.address?.city || "",
          state: config?.address?.state || "",
          pincode: config?.address?.pincode || "",
          country: config?.address?.country || "India",
          mapUrl: config?.address?.mapUrl || "",
        },
        phones: Array.isArray(config?.phones) ? cloneDeep(config.phones) : [],
        emails: Array.isArray(config?.emails) ? cloneDeep(config.emails) : [],
        whatsappModal: {
          enabled: config?.whatsappModal?.enabled ?? true,
          phoneNumber: config?.whatsappModal?.phoneNumber || "",
          message: config?.whatsappModal?.message || "",
        },
      };

    case "social":
      return {
        socialLinks: DEFAULT_SOCIAL_LINKS.map((def) => {
          const match = (config?.socialLinks || []).find((s) => s.platform === def.platform);
          return match ? { ...def, ...match } : { ...def };
        }),
      };

    case "showcase":
    case "bengaltiles":
      return {
        bengalTilesSection: {
          ...DEFAULT_SHOWCASE,
          ...(config?.bengalTilesSection || {}),
        },
      };

    case "brands": {
      const rawBrands = Array.isArray(config?.brands) ? config.brands : [];
      const cleanBrands = rawBrands.filter((b) => {
        if (!b) return false;
        const id = String(b.id || "");
        const name = String(b.name || "").trim().toLowerCase();
        const logo = String(b.logo || "");
        if (id.startsWith("brand-") || id.startsWith("brand_default_")) return false;
        if (/^brand partner/i.test(name)) return false;
        if (logo.includes("/assets/brands/") || logo.includes("brand (") || logo.includes("brand%20(")) return false;
        return true;
      });
      return {
        brands: cloneDeep(cleanBrands),
        brandsSection: {
          title: config?.brandsSection?.title || "Brand Partner and Dealer",
          subtitle: config?.brandsSection?.subtitle || "",
          enabled: config?.brandsSection?.enabled ?? true,
        },
      };
    }

    case "legal":
      return {
        legal: config?.legal ? cloneDeep(config.legal) : {},
      };

    case "seo":
      return {
        seo: {
          metaTitle: config?.seo?.metaTitle || "",
          metaDescription: config?.seo?.metaDescription || "",
          ogImageUrl: config?.seo?.ogImageUrl || "",
          keywords: Array.isArray(config?.seo?.keywords) ? cloneDeep(config.seo.keywords) : [],
        },
      };

    case "payment":
      return {
        paymentMethods: {
          enableOnline: config?.paymentMethods?.enableOnline ?? true,
          enableCod: config?.paymentMethods?.enableCod ?? true,
        },
      };

    default:
      return {};
  }
}

/**
 * Filter payload to only include fields belonging to this tab
 */
export function getTabSavePayload(tabId, data) {
  switch (tabId) {
    case "company":
      return {
        companyTagline: data?.companyTagline || "",
        founderName: data?.founderName || "",
        founderPhone: data?.founderPhone || "",
        founderPhoto: data?.founderPhoto || "",
        companyLogo: data?.companyLogo || "",
        faviconUrl: data?.faviconUrl || "",
      };

    case "contact":
      return {
        address: data?.address || {},
        phones: Array.isArray(data?.phones) ? data.phones : [],
        emails: Array.isArray(data?.emails) ? data.emails : [],
        whatsappModal: {
          enabled: data?.whatsappModal?.enabled ?? true,
          phoneNumber: data?.whatsappModal?.phoneNumber || "",
          message: data?.whatsappModal?.message || "",
        },
      };

    case "social":
      return {
        socialLinks: Array.isArray(data?.socialLinks) ? data.socialLinks : [],
      };

    case "showcase":
    case "bengaltiles":
      return {
        bengalTilesSection: data?.bengalTilesSection || DEFAULT_SHOWCASE,
      };

    case "brands":
      return {
        brands: Array.isArray(data?.brands) ? data.brands : [],
        brandsSection: data?.brandsSection || {},
      };

    case "legal":
      return {
        legal: data?.legal || {},
      };

    case "seo":
      return {
        seo: data?.seo || {},
      };

    case "payment":
      return {
        paymentMethods: data?.paymentMethods || { enableOnline: true, enableCod: true },
      };

    default:
      return data;
  }
}
