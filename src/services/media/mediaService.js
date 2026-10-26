import { fireDB } from '../../firebase/FirebaseConfig.js';
import { 
  collection, 
  getDocs, 
  query 
} from 'firebase/firestore';

// ─── In-memory cache ────────────────────────────────────────────────────────
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let _cache = null;        // { data: [], timestamp: number } | null
let _uploadedSessionImages = []; // In-memory session images uploaded directly via modal
// ─────────────────────────────────────────────────────────────────────────────

export const mediaService = {
  /** Clears the in-memory cache so the next call to getMediaLibrary() re-fetches. */
  invalidateCache() {
    _cache = null;
  },

  /**
   * Registers newly uploaded image in memory for current session without writing extra Firestore documents.
   */
  async saveMedia(url, name = "Uploaded Image") {
    if (!url) return;
    if (!_uploadedSessionImages.some(item => item.url === url)) {
      _uploadedSessionImages.push({
        id: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        url,
        name,
        source: "Recent Upload",
        createdAt: new Date().toISOString()
      });
    }
    this.invalidateCache();
  },

  /**
   * Fetches all product and variant media dynamically from products catalog.
   * Results are cached for CACHE_TTL_MS (5 min).
   */
  async getMediaLibrary(force = false) {
    if (!force && _cache && (Date.now() - _cache.timestamp < CACHE_TTL_MS)) {
      return _cache.data;
    }
    const mediaSet = new Set();
    const mediaList = [];

    // 1. Include any session-uploaded images first
    _uploadedSessionImages.forEach(item => {
      if (item.url && !mediaSet.has(item.url)) {
        mediaSet.add(item.url);
        mediaList.push(item);
      }
    });

    // 2. Fetch from existing products catalog
    try {
      const prodSnap = await getDocs(query(collection(fireDB, "products")));
      prodSnap.forEach(docSnap => {
        const p = docSnap.data();
        
        // Product primary image
        if (p.imageUrl && !mediaSet.has(p.imageUrl)) {
          mediaSet.add(p.imageUrl);
          mediaList.push({
            id: `prod_${docSnap.id}_main`,
            url: p.imageUrl,
            name: p.title ? `${p.title} (Main)` : "Product Image",
            source: p.title || "Product Catalog"
          });
        }

        // Product gallery images
        if (Array.isArray(p.images)) {
          p.images.forEach((imgUrl, idx) => {
            if (imgUrl && !mediaSet.has(imgUrl)) {
              mediaSet.add(imgUrl);
              mediaList.push({
                id: `prod_${docSnap.id}_img_${idx}`,
                url: imgUrl,
                name: p.title ? `${p.title} #${idx + 1}` : "Gallery Image",
                source: p.title || "Product Catalog"
              });
            }
          });
        }

        // Product variants images
        if (Array.isArray(p.variants)) {
          p.variants.forEach((v, vIdx) => {
            if (Array.isArray(v.images)) {
              v.images.forEach((vImgUrl, imgIdx) => {
                if (vImgUrl && !mediaSet.has(vImgUrl)) {
                  mediaSet.add(vImgUrl);
                  mediaList.push({
                    id: `prod_${docSnap.id}_v_${vIdx}_${imgIdx}`,
                    url: vImgUrl,
                    name: p.title ? `${p.title} Variant` : "Variant Image",
                    source: p.title || "Product Variant"
                  });
                }
              });
            }
          });
        }
      });
    } catch (err) {
      console.warn("Could not fetch product images for media library:", err);
    }

    // Store result in cache
    _cache = { data: mediaList, timestamp: Date.now() };
    return mediaList;
  }
};
