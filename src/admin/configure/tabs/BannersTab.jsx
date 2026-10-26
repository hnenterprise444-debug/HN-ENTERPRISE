import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { configureService } from "../../../services/configure/configureService";
import { FaTrash, FaPlus, FaTimes, FaDesktop, FaMobileAlt, FaInfoCircle } from "react-icons/fa";
import { toast } from "react-toastify";

// ─── Banner Dimensions (must match HeroSection.jsx) ─────────────────────────
// h-[180px] on mobile, h-[500px] on desktop, w-full (fills the container width)
// Container max-width: 7xl = 80rem = 1280px. Aspect ratio ≈ 1280:500 = 2.56:1
const BANNER_ASPECT = {
    desktop: { label: "Desktop", widthRatio: 1.0, heightPx: 500, totalWidthPx: 1280 },
    mobile:  { label: "Mobile",  widthRatio: 1.0, heightPx: 180, totalWidthPx: 390  },
};

// ─── YouTube-style Banner Preview ────────────────────────────────────────────
function BannerSafeZonePreview({ src }) {
    const [mode, setMode] = useState("desktop");
    const containerRef = useRef(null);
    const [containerW, setContainerW] = useState(0);

    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver(([entry]) => {
            setContainerW(entry.contentRect.width);
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    const spec = BANNER_ASPECT[mode];
    // Scale the banner proportionally to fit the preview container
    const scale = containerW > 0 ? containerW / spec.totalWidthPx : 1;
    const previewH = Math.round(spec.heightPx * scale);

    // Mobile safe zone on desktop view:
    // Desktop aspect ratio = 1280 / 500 = 2.56
    // Mobile aspect ratio = 390 / 180 = 2.1667
    // Mobile visible width fraction on desktop banner = (390/180) / (1280/500) ≈ 84.64%
    const desktopAspect = BANNER_ASPECT.desktop.totalWidthPx / BANNER_ASPECT.desktop.heightPx;
    const mobileAspect = BANNER_ASPECT.mobile.totalWidthPx / BANNER_ASPECT.mobile.heightPx;
    const mobileSafePct = Math.min(100, (mobileAspect / desktopAspect) * 100);
    const outerCropPct = (100 - mobileSafePct) / 2;

    return (
        <div className="space-y-3">
            {/* Mode Toggle */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Preview</span>
                <div className="flex gap-1 bg-bg-base border border-border-subtle rounded-lg p-0.5">
                    {[
                        { id: "desktop", icon: <FaDesktop size={11} />, label: "Desktop" },
                        { id: "mobile",  icon: <FaMobileAlt size={11} />, label: "Mobile"  },
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => setMode(btn.id)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                                mode === btn.id
                                    ? "bg-primary text-compli shadow-sm"
                                    : "text-text-muted hover:text-text-base"
                            }`}
                        >
                            {btn.icon}
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Preview Frame */}
            <div
                ref={containerRef}
                className="relative rounded-xl overflow-hidden border-2 border-primary/30 bg-bg-base transition-all duration-300"
                style={{ height: `${previewH}px` }}
            >
                {/* Banner image */}
                {src ? (
                    <img src={src} alt="Banner preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-bg-base">
                        <span className="text-text-muted text-xs">No image selected</span>
                    </div>
                )}

                {/* Desktop mode: show full desktop view with mobile safe zone guide lines */}
                {mode === "desktop" && containerW > 0 && (
                    <>
                        {/* Left cropped zone (outside mobile viewport on smaller screens) */}
                        <div
                            className="absolute inset-y-0 left-0 bg-black/35 pointer-events-none transition-all"
                            style={{ width: `${outerCropPct}%` }}
                        />
                        {/* Right cropped zone */}
                        <div
                            className="absolute inset-y-0 right-0 bg-black/35 pointer-events-none transition-all"
                            style={{ width: `${outerCropPct}%` }}
                        />
                        {/* Mobile safe zone border */}
                        <div
                            className="absolute inset-y-0 border-x-2 border-dashed border-white/80 pointer-events-none"
                            style={{
                                left: `${outerCropPct}%`,
                                right: `${outerCropPct}%`,
                            }}
                        />
                        {/* Mobile safe zone label */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/65 backdrop-blur text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 shadow-xs">
                            <FaMobileAlt size={8} /> Mobile Safe Zone ({Math.round(mobileSafePct)}% center)
                        </div>
                    </>
                )}

                {/* Mobile mode: show mobile view indicator */}
                {mode === "mobile" && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/65 backdrop-blur text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 shadow-xs">
                        <FaMobileAlt size={8} /> Mobile Viewport (180px height)
                    </div>
                )}

                {/* Dimension label */}
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">
                    {mode === "desktop" ? "Desktop: 1280×500px" : "Mobile: 390×180px"}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-start gap-1.5 text-[10px] text-text-muted">
                <FaInfoCircle size={10} className="mt-0.5 shrink-0 text-primary/70" />
                <span>
                    {mode === "desktop"
                        ? "Desktop View (1280×500px). Outer edges outside the dashed box are cropped on mobile screens. Keep key text in the mobile safe zone."
                        : "Mobile View (390×180px). Shows how the banner image is centered and displayed on mobile screens."
                    }
                </span>
            </div>
        </div>
    );
}

// ─── Single Queue Item ─────────────────────────────────────────────────────
function QueueItem({ item, onRemove, onChange, uploading }) {
    const [previewOpen, setPreviewOpen] = useState(false);

    return (
        <div className="rounded-xl border border-border-subtle bg-bg-base/30 overflow-hidden">
            {/* Thumbnail Row */}
            <div className="flex gap-3 p-3">
                {/* Thumbnail */}
                <div className="relative w-28 h-16 rounded-lg overflow-hidden border border-border-subtle bg-bg-base flex-shrink-0">
                    <img src={item.preview} alt="preview" className="w-full h-full object-cover" />
                    {item.status !== "uploading" && item.status !== "success" && (
                        <button
                            onClick={() => onRemove(item.id)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600/80 text-white flex items-center justify-center hover:bg-red-700 transition cursor-pointer"
                            title="Remove"
                        >
                            <FaTimes size={8} />
                        </button>
                    )}
                    {(item.status === "uploading" || item.status === "success") && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1">
                            {item.status === "uploading" ? (
                                <>
                                    <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                    <span>{item.progress}%</span>
                                </>
                            ) : (
                                <span className="text-green-400 text-xs">✓</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Fields */}
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                    <input
                        value={item.title}
                        onChange={(e) => onChange(item.id, "title", e.target.value)}
                        placeholder="Banner Title (optional)"
                        disabled={uploading || item.status === "success"}
                        className="h-8 px-2.5 rounded-lg border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-semibold disabled:opacity-50"
                    />
                    <input
                        value={item.subtitle}
                        onChange={(e) => onChange(item.id, "subtitle", e.target.value)}
                        placeholder="Subtitle (optional)"
                        disabled={uploading || item.status === "success"}
                        className="h-8 px-2.5 rounded-lg border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs disabled:opacity-50"
                    />
                </div>
            </div>

            {/* Preview Toggle */}
            {item.status === "pending" && (
                <div className="border-t border-border-subtle/50">
                    <button
                        onClick={() => setPreviewOpen((v) => !v)}
                        className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold text-text-muted hover:text-text-base hover:bg-bg-base/40 transition"
                    >
                        <span className="flex items-center gap-1.5">
                            <FaDesktop size={10} />
                            Safe-zone preview
                        </span>
                        <span>{previewOpen ? "▲" : "▼"}</span>
                    </button>
                    {previewOpen && (
                        <div className="px-3 pb-3">
                            <BannerSafeZonePreview src={item.preview} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Existing Banner Card ──────────────────────────────────────────────────
function BannerCard({ banner, onDelete, deleting }) {
    return (
        <div className="relative rounded-2xl overflow-hidden border border-border-subtle group bg-bg-surface hover:shadow-xs transition-all duration-200">
            <img
                src={banner.imageUrl}
                alt={banner.title || "Banner"}
                className="w-full h-36 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <button
                    onClick={() => onDelete(banner)}
                    disabled={deleting === banner.bannerId}
                    className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                    <FaTrash />
                    {deleting === banner.bannerId ? "Deleting..." : "Delete"}
                </button>
            </div>
            <div className="px-4 py-3 bg-card border-t border-border-subtle">
                <p className="font-extrabold text-text-base text-xs truncate">{banner.title || "Untitled Banner"}</p>
                <p className="text-[10px] text-text-muted truncate mt-0.5 font-bold">{banner.ctaUrl || "/"}</p>
            </div>
        </div>
    );
}

// ─── Main BannersTab ──────────────────────────────────────────────────────
export default function BannersTab() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [queue, setQueue] = useState([]);

    useEffect(() => {
        configureService.getBanners()
            .then(setBanners)
            .catch(() => toast.error("Failed to load banners"))
            .finally(() => setLoading(false));
    }, []);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const newQueueItems = files.map((file, idx) => ({
            id: `${Date.now()}-${idx}-${file.name}`,
            file,
            preview: URL.createObjectURL(file),
            title: "",
            subtitle: "",
            ctaLabel: "",
            ctaUrl: "",
            progress: 0,
            status: "pending",
        }));
        setQueue((prev) => [...prev, ...newQueueItems]);
        e.target.value = "";
    };

    const handleQueueFieldChange = (id, field, value) => {
        setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    };

    const removeFromQueue = (id) => {
        setQueue((prev) => {
            const item = prev.find((i) => i.id === id);
            if (item?.preview) URL.revokeObjectURL(item.preview);
            return prev.filter((i) => i.id !== id);
        });
    };

    const clearQueue = () => {
        queue.forEach((item) => { if (item.preview) URL.revokeObjectURL(item.preview); });
        setQueue([]);
    };

    const handleUploadAll = async () => {
        if (queue.length === 0) return;
        setUploading(true);

        const pendingItems = queue.filter((item) => item.status === "pending" || item.status === "error");
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < pendingItems.length; i++) {
            const item = pendingItems[i];
            setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: "uploading" } : q)));

            try {
                const newBanner = await configureService.addBanner(
                    item.file,
                    {
                        title: item.title,
                        subtitle: item.subtitle,
                        ctaLabel: item.ctaLabel,
                        ctaUrl: item.ctaUrl,
                        order: banners.length + successCount,
                    },
                    (p) => {
                        setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, progress: p } : q)));
                    }
                );

                setBanners((prev) => [...prev, newBanner]);
                setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: "success", progress: 100 } : q)));
                successCount++;
            } catch (err) {
                console.error("Failed to upload", item.file.name, err);
                setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: "error" } : q)));
                failCount++;
            }
        }

        setUploading(false);

        if (successCount > 0) {
            toast.success(`Successfully uploaded ${successCount} banner(s)`);
            setQueue((prev) => {
                const succeeded = prev.filter((q) => q.status === "success");
                succeeded.forEach((item) => { if (item.preview) URL.revokeObjectURL(item.preview); });
                return prev.filter((q) => q.status !== "success");
            });
        }
        if (failCount > 0) {
            toast.error(`Failed to upload ${failCount} banner(s)`);
        }
    };

    const handleDelete = async (banner) => {
        setDeleting(banner.bannerId);
        try {
            await configureService.deleteBanner(banner.bannerId, banner.imageUrl);
            setBanners((prev) => prev.filter((b) => b.bannerId !== banner.bannerId));
            toast.success("Banner deleted");
        } catch (err) {
            toast.error("Failed to delete banner");
        } finally {
            setDeleting(null);
        }
    };

    if (loading) return <div className="py-8 text-center text-text-muted text-xs font-bold">Loading banners...</div>;

    return (
        <div className="max-w-3xl space-y-6">

            {/* Hero Showcase Section Callout */}
            <div className="bg-gradient-to-r from-primary/10 via-bg-surface to-bg-surface border border-primary/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-xl">storefront</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-text-base">Hero Showcase Section</h4>
                        <p className="text-xs text-text-muted mt-0.5">
                            Configure the storefront hero showcase banner imagery, headlines, subtitle, and call-to-action button.
                        </p>
                    </div>
                </div>
                <Link
                    to="/configure?tab=showcase"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-compli text-xs font-bold rounded-xl transition shadow-xs whitespace-nowrap self-start sm:self-center"
                >
                    <span>Manage Showcase</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
            </div>

            {/* Upload Section */}
            <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 sm:p-5 space-y-4">
                <h3 className="font-bold text-text-base text-sm">Upload Banners</h3>

                {/* Dimension Guide */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { icon: <FaDesktop size={12} />, label: "Desktop", dim: "Any width × up to 500px tall", note: "Full width, landscape" },
                        { icon: <FaMobileAlt size={12} />, label: "Mobile",  dim: "Full width × 180px visible", note: "Centre content for mobile" },
                    ].map((d) => (
                        <div key={d.label} className="flex items-start gap-2 bg-bg-base rounded-xl border border-border-subtle p-2.5">
                            <span className="text-primary mt-0.5">{d.icon}</span>
                            <div>
                                <p className="text-[10px] font-bold text-text-base">{d.label}</p>
                                <p className="text-[9px] text-text-muted">{d.dim}</p>
                                <p className="text-[9px] text-text-muted/70 italic mt-0.5">{d.note}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* File picker */}
                <label className="block cursor-pointer">
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-subtle hover:border-primary/50 py-7 px-4 transition bg-bg-base text-center gap-2">
                        <FaPlus className="text-text-muted/50 text-lg" />
                        <p className="text-xs font-semibold text-text-muted">Click to select banner images</p>
                        <p className="text-[10px] text-text-muted/60">Recommended: 1280×500px (desktop) · PNG or JPG</p>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={uploading}
                    />
                </label>
            </div>

            {/* Upload Queue */}
            {queue.length > 0 && (
                <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                        <span className="font-bold text-text-base text-xs uppercase tracking-wider">
                            Queue — {queue.length} item{queue.length !== 1 ? "s" : ""}
                        </span>
                        <button
                            onClick={clearQueue}
                            disabled={uploading}
                            className="text-[11px] font-bold text-rose-400 hover:text-rose-300 disabled:opacity-50 cursor-pointer"
                        >
                            Clear All
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border-subtle [&::-webkit-scrollbar-thumb]:rounded-full">
                        {queue.map((item) => (
                            <QueueItem
                                key={item.id}
                                item={item}
                                onRemove={removeFromQueue}
                                onChange={handleQueueFieldChange}
                                uploading={uploading}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleUploadAll}
                        disabled={uploading || queue.length === 0}
                        className="w-full h-11 rounded-xl bg-primary text-compli font-bold text-sm transition hover:bg-primary-hover disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20"
                    >
                        <FaPlus className="text-xs" />
                        {uploading ? "Uploading Banners..." : `Upload ${queue.length} Banner${queue.length !== 1 ? "s" : ""}`}
                    </button>
                </div>
            )}

            {/* Existing Banners */}
            <div className="space-y-4">
                <p className="text-xs text-text-muted font-extrabold">
                    {banners.length} banner{banners.length !== 1 ? "s" : ""} configured
                </p>
                {banners.length === 0 && (
                    <div className="text-center py-12 text-text-muted text-sm border border-dashed border-border-subtle rounded-2xl bg-bg-surface font-bold">
                        No banners yet. Upload one above.
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {banners.map((b) => (
                        <BannerCard key={b.bannerId} banner={b} onDelete={handleDelete} deleting={deleting} />
                    ))}
                </div>
            </div>

        </div>
    );
}

export { BannersTab };
