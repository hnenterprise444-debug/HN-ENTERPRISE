/**
 * Configure Model
 *
 * Firestore Path: configure/site
 *   → A single document (singleton) for all site-wide settings.
 *
 * Sub-collections:
 *   configure/site/banners/{bannerId}      → hero banner slides
 *   configure/site/collections/{id}        → home-page product collection sections
 */

const configure = {

  // ─── Company Identity ──────────────────────────────────────────────────────
  companyName: "Company Name",
  companyTagline: "Quality you can trust.",
  companyLogo: "",   // Firebase Storage URL
  faviconUrl: "",    // Firebase Storage URL
  invoiceTemplate: "classic",
  founderName: "",
  founderPhone: "",

  // ─── Contact Information ───────────────────────────────────────────────────
  address: {
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    mapUrl: "",
  },

  phones: [
    { label: "Support", number: "+91 98765 43210", isWhatsapp: true }
  ],

  emails: [
    { label: "Support", email: "support@example.com" }
  ],

  // ─── WhatsApp Modal / Floating Button ──────────────────────────────────────
  whatsappModal: {
    enabled: true,
    phoneNumber: "+91 98765 43210",
    message: "Hi, I would like to inquire about your products.",
  },

  // ─── Social Links ──────────────────────────────────────────────────────────
  socialLinks: [
    { platform: "facebook",  icon: "fa-facebook-f",  url: "", isActive: false },
    { platform: "instagram", icon: "fa-instagram",   url: "", isActive: false },
    { platform: "twitter",   icon: "fa-x-twitter",   url: "", isActive: false },
    { platform: "youtube",   icon: "fa-youtube",     url: "", isActive: false },
    { platform: "linkedin",  icon: "fa-linkedin-in", url: "", isActive: false },
    { platform: "pinterest", icon: "fa-pinterest-p", url: "", isActive: false },
  ],

  // ─── Banners (Sub-collection: configure/site/banners/{bannerId}) ───────────
  // {
  //   bannerId: "",
  //   imageUrl: "",      // Firebase Storage URL
  //   title: "",
  //   subtitle: "",
  //   ctaLabel: "Shop Now",
  //   ctaUrl: "/allproducts",
  //   order: 0,
  //   isActive: true,
  // }
  bannersCount: 0,

  // ─── Home Collections (Sub-collection: configure/site/collections/{id}) ────
  // {
  //   collectionId: "",
  //   title: "Featured Products",
  //   subtitle: "",
  //   productIds: [],    // ordered list of product doc IDs
  //   layout: "grid",   // "grid" | "horizontal-scroll"
  //   order: 0,
  //   isActive: true,
  // }
  collectionsCount: 0,

  // ─── Company & Legal Documents (Embedded in configure/site) ────────────────
  legal: {
    fixedPages: {
      aboutUs: {
        title: "About Us",
        docUrl: "", // PDF or document storage URL
        pdfUrl: "",
        isActive: true,
      },
      privacyPolicy: {
        title: "Privacy Policy",
        docUrl: "",
        pdfUrl: "",
        isActive: true,
      },
      termsAndConditions: {
        title: "Terms & Conditions",
        docUrl: "",
        pdfUrl: "",
        isActive: true,
      },
      returnPolicy: {
        title: "Return Policy",
        docUrl: "",
        pdfUrl: "",
        isActive: true,
      },
      shippingPolicy: {
        title: "Shipping Policy",
        docUrl: "",
        pdfUrl: "",
        isActive: true,
      },
      refundPolicy: {
        title: "Refund Policy",
        docUrl: "",
        pdfUrl: "",
        isActive: true,
      },
    },
    customPages: [
      // { id: "1", name: "Custom Page", slug: "custom-page", docUrl: "", pdfUrl: "", isActive: true }
    ],
  },

  // ─── SEO Defaults ──────────────────────────────────────────────────────────
  seo: {
    metaTitle: "",
    metaDescription: "",
    ogImageUrl: "",
    keywords: [],
  },

  // ─── Metadata ──────────────────────────────────────────────────────────────
  updatedAt: null,
  updatedBy: "",
};

export default configure;
