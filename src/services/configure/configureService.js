import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    writeBatch,
} from "firebase/firestore";
import { fireDB } from "../../firebase/FirebaseConfig";

import { uploadService } from "../upload/uploadService";

const SITE_DOC = () => doc(fireDB, "configure", "site");
const BANNERS_COL = () => collection(fireDB, "configure", "site", "banners");
const COLLECTIONS_COL = () => collection(fireDB, "configure", "site", "collections");

// ─── Default config (used when document doesn't exist yet) ───────────────────
export const DEFAULT_SOCIAL_LINKS = [
    { platform: "facebook",  icon: "fa-facebook-f",  url: "", isActive: false },
    { platform: "instagram", icon: "fa-instagram",   url: "", isActive: false },
    { platform: "twitter",   icon: "fa-x-twitter",   url: "", isActive: false },
    { platform: "youtube",   icon: "fa-youtube",     url: "", isActive: false },
    { platform: "linkedin",  icon: "fa-linkedin-in", url: "", isActive: false },
    { platform: "pinterest", icon: "fa-pinterest-p", url: "", isActive: false },
];

export const DEFAULT_CONFIG = {
    companyName: "",
    companyTagline: "",
    companyLogo: "",
    faviconUrl: "",
    founderName: "",
    founderPhone: "",
    founderPhoto: "",
    invoiceTemplate: "classic",
    address: { line1: "", line2: "", city: "", state: "", pincode: "", country: "India", mapUrl: "" },
    phones: [],
    emails: [],
    whatsappModal: {
        enabled: true,
        phoneNumber: "",
        message: "",
    },
    socialLinks: DEFAULT_SOCIAL_LINKS,
    bannersCount: 0,
    collectionsCount: 0,
    legal: { termsAndConditions: "", privacyPolicy: "", returnPolicy: "", aboutUs: "" },
    seo: { metaTitle: "", metaDescription: "", ogImageUrl: "", keywords: [] },
    /**
     * paymentMethods – controls which payment options appear at checkout.
     * enableOnline: shows Razorpay / UPI / card gateway
     * enableCod:    shows Cash on Delivery option
     */
    paymentMethods: {
        enableOnline: true,
        enableCod: true,
    },
    bengalTilesSection: {
        enabled: false,
        title: "",
        badgeText: "",
        subtitle: "",
        buttonText: "Contact us",
        buttonType: "whatsapp",
        buttonLink: "",
        whatsappNumber: "",
        whatsappMessage: "",
        desktopImage: "",
        mobileImage: "",
    },
    brands: [],
    brandsSection: {
        title: "Brand Partner and Dealer",
        subtitle: "",
        enabled: true,
    },
    updatedAt: null,
    updatedBy: "",
};

export const configureService = {

    // ─── Root Config Document ─────────────────────────────────────────────────

    /** Fetch the site config document */
    async getSiteConfig() {
        const snap = await getDoc(SITE_DOC());
        if (!snap.exists()) return { ...DEFAULT_CONFIG };
        const rawData = snap.data();
        // Exclude fields managed by independent services (videos, teamMembers)
        // so that draft store settings never cache or overwrite them
        const { videos, teamMembers, videosInitialized, ...cleanConfig } = rawData;
        const isDummyBrand = (b) => {
            if (!b) return true;
            const id = String(b.id || "");
            const name = String(b.name || "").trim().toLowerCase();
            const logo = String(b.logo || "");
            if (id.startsWith("brand-") || id.startsWith("brand_default_")) return true;
            if (/^brand partner/i.test(name)) return true;
            if (logo.includes("/assets/brands/") || logo.includes("brand (") || logo.includes("brand%20(")) return true;
            return false;
        };
        if (Array.isArray(cleanConfig.brands)) {
            const sanitizedBrands = cleanConfig.brands.filter((b) => !isDummyBrand(b));
            if (sanitizedBrands.length !== cleanConfig.brands.length) {
                cleanConfig.brands = sanitizedBrands;
                try {
                    setDoc(SITE_DOC(), { brands: sanitizedBrands }, { merge: true });
                } catch (e) {}
            }
        }
        return { ...DEFAULT_CONFIG, ...cleanConfig };
    },

    /** Partially update the site config (merge) */
    async saveSiteConfig(data, adminUid = "") {
        // Strip out independent collections/docs managed by their own services
        // so that saving site settings never accidentally overwrites videos or team members!
        const cleanData = { ...data };
        delete cleanData.videos;
        delete cleanData.teamMembers;
        delete cleanData.videosInitialized;

        await setDoc(
            SITE_DOC(),
            { ...cleanData, updatedAt: serverTimestamp(), updatedBy: adminUid },
            { merge: true }
        );
    },

    // ─── Banners Sub-collection ───────────────────────────────────────────────

    /** Fetch all banners ordered by their display order */
    async getBanners() {
        const snap = await getDocs(query(BANNERS_COL(), orderBy("order", "asc")));
        return snap.docs.map((d) => ({ bannerId: d.id, ...d.data() }));
    },

    /**
     * Upload a banner image to the active provider, then write a banner doc.
     * @param {File} file - The image file to upload
     * @param {object} meta - { title, subtitle, ctaLabel, ctaUrl, order, isActive }
     * @param {function} onProgress - Optional (0-100) progress callback
     */
    async addBanner(file, meta = {}, onProgress) {
        const imageUrl = await uploadService.uploadBannerImage(file, onProgress);

        const bannerDoc = await addDoc(BANNERS_COL(), {
            imageUrl,
            title: meta.title || "",
            subtitle: meta.subtitle || "",
            ctaLabel: meta.ctaLabel || "",
            ctaUrl: meta.ctaUrl || "",
            order: meta.order ?? 99,
            isActive: meta.isActive ?? true,
            createdAt: serverTimestamp(),
        });

        // Keep root count in sync
        const config = await this.getSiteConfig();
        await this.saveSiteConfig({ bannersCount: (config.bannersCount || 0) + 1 });

        return { bannerId: bannerDoc.id, imageUrl, ...meta };
    },

    /** Update banner metadata (no image change) */
    async updateBanner(bannerId, data) {
        await updateDoc(doc(BANNERS_COL(), bannerId), data);
    },

    /** Delete a banner — removes Firestore doc and Storage image */
    async deleteBanner(bannerId, imageUrl) {
        await deleteDoc(doc(BANNERS_COL(), bannerId));
        if (imageUrl) {
            try {
                await uploadService.deleteFile(imageUrl);
            } catch (e) {
                console.warn("Could not delete banner image from storage:", e);
            }
        }
        const config = await this.getSiteConfig();
        await this.saveSiteConfig({ bannersCount: Math.max(0, (config.bannersCount || 1) - 1) });
    },

    /** Batch-update the `order` field for all banners (for drag-to-reorder) */
    async updateBannerOrders(banners) {
        const batch = writeBatch(fireDB);
        banners.forEach((b, i) => {
            batch.update(doc(BANNERS_COL(), b.bannerId), { order: i });
        });
        await batch.commit();
    },

    // ─── Home Collections Sub-collection ────────────────────────────────────

    /** Fetch all home-page collections ordered by display order */
    async getCollections() {
        const snap = await getDocs(query(COLLECTIONS_COL(), orderBy("order", "asc")));
        return snap.docs.map((d) => ({ collectionId: d.id, ...d.data() }));
    },

    /** Create a new home-page product collection section */
    async addCollection(data) {
        const docRef = await addDoc(COLLECTIONS_COL(), {
            title: data.title || "New Collection",
            subtitle: data.subtitle || "",
            productIds: data.productIds || [],
            layout: data.layout || "grid",
            order: data.order ?? 99,
            isActive: data.isActive ?? true,
            createdAt: serverTimestamp(),
        });
        const config = await this.getSiteConfig();
        await this.saveSiteConfig({ collectionsCount: (config.collectionsCount || 0) + 1 });
        return { collectionId: docRef.id, ...data };
    },

    /** Update a home-page collection */
    async updateCollection(collectionId, data) {
        await updateDoc(doc(COLLECTIONS_COL(), collectionId), {
            ...data,
            updatedAt: serverTimestamp(),
        });
    },

    /** Delete a home-page collection */
    async deleteCollection(collectionId) {
        await deleteDoc(doc(COLLECTIONS_COL(), collectionId));
        const config = await this.getSiteConfig();
        await this.saveSiteConfig({ collectionsCount: Math.max(0, (config.collectionsCount || 1) - 1) });
    },

    /** Batch-update the `order` field for all collections (for drag/button reordering) */
    async updateCollectionOrders(collections) {
        const batch = writeBatch(fireDB);
        collections.forEach((c, i) => {
            batch.update(doc(COLLECTIONS_COL(), c.collectionId), { order: i });
        });
        await batch.commit();
    },
};
