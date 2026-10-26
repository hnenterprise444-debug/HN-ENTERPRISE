import React, { useState } from "react";
import { FaDesktop, FaMobileAlt, FaWhatsapp, FaUpload, FaUndo, FaLink, FaEye, FaSave } from "react-icons/fa";
import { uploadService } from "../../../services/upload/uploadService";
import { configureService } from "../../../services/configure/configureService";
import { useSiteConfig } from "../../../context/SiteConfigContext";
import useAuth from "../../../hooks/auth/useAuth";
import { toast } from "react-toastify";
const GENERIC_STORE_DESKTOP = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80";
const GENERIC_STORE_MOBILE = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80";

const DEFAULT_SHOWCASE = {
  enabled: true,
  title: "Store Showcase",
  badgeText: "PREMIUM STORE & SHOWROOM",
  subtitle: "Explore our premium collection and visit our store",
  buttonText: "Contact us",
  buttonType: "whatsapp", // 'whatsapp' | 'custom'
  buttonLink: "",
  whatsappNumber: "",
  whatsappMessage: "Hi, I would like to inquire about your products.",
  desktopImage: "",
  mobileImage: "",
};

export default function ShowcaseTab({ draft, updateDraft, onSave, isDirty, saving: parentSaving }) {
  const { setConfig } = useSiteConfig();
  const { user } = useAuth();

  const showcaseConfig = {
    ...DEFAULT_SHOWCASE,
    ...(draft?.bengalTilesSection || {}),
  };

  const [previewMode, setPreviewMode] = useState("desktop");
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [progressDesktop, setProgressDesktop] = useState(0);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [progressMobile, setProgressMobile] = useState(0);
  const [internalSaving, setInternalSaving] = useState(false);
  const saving = parentSaving !== undefined ? parentSaving : internalSaving;

  // Helper to update specific showcase fields in draft
  const updateSection = (field, value) => {
    const updated = {
      ...showcaseConfig,
      [field]: value,
    };
    updateDraft({ bengalTilesSection: updated });
  };

  // Upload handlers
  const handleUploadDesktop = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDesktop(true);
    setProgressDesktop(0);
    try {
      const url = await uploadService.uploadCompanyAsset(file, setProgressDesktop);
      updateSection("desktopImage", url);
      toast.success("Desktop image uploaded successfully");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to upload desktop image");
    } finally {
      setUploadingDesktop(false);
    }
  };

  const handleUploadMobile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMobile(true);
    setProgressMobile(0);
    try {
      const url = await uploadService.uploadCompanyAsset(file, setProgressMobile);
      updateSection("mobileImage", url);
      toast.success("Mobile image uploaded successfully");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to upload mobile image");
    } finally {
      setUploadingMobile(false);
    }
  };

  // Save changes explicitly
  const handleSaveSection = async () => {
    if (onSave) {
      await onSave();
      return;
    }
    setInternalSaving(true);
    try {
      const updatedConfig = {
        bengalTilesSection: showcaseConfig,
      };
      await configureService.saveSiteConfig(updatedConfig, user?.uid || "");
      setConfig((prev) => ({ ...prev, ...updatedConfig }));
      toast.success("Hero Showcase section saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err?.message || "Failed to save showcase section");
    } finally {
      setInternalSaving(false);
    }
  };

  // Reset to default
  const handleResetDefaults = () => {
    if (window.confirm("Reset Hero Showcase section to showroom defaults?")) {
      updateDraft({ bengalTilesSection: DEFAULT_SHOWCASE });
      toast.info("Reset to showroom defaults. Click 'Save Changes' to apply.");
    }
  };

  // Compute preview images
  const activeDesktopImg = showcaseConfig.desktopImage || GENERIC_STORE_DESKTOP;
  const activeMobileImg = showcaseConfig.mobileImage || showcaseConfig.desktopImage || GENERIC_STORE_MOBILE;
  const previewImg = previewMode === "desktop" ? activeDesktopImg : activeMobileImg;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">storefront</span>
            <h2 className="text-lg sm:text-xl font-black text-text-base tracking-wide">
              Hero Showcase Section
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                showcaseConfig.enabled
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {showcaseConfig.enabled ? "Active on Home" : "Hidden"}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Configure the full-width storefront hero showcase banner imagery, headlines, and call-to-action button.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-subtle hover:bg-card-hover text-text-muted hover:text-text-base text-xs font-bold transition-all cursor-pointer"
            title="Reset to showroom defaults"
          >
            <FaUndo size={11} />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSection}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-compli font-bold text-xs shadow-md shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-compli border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaSave size={13} />
                <span>Save Showcase</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Interactive Preview Box */}
      <div className="rounded-2xl border border-border-subtle bg-bg-surface overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 bg-bg-base border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold text-text-base uppercase tracking-wider flex items-center gap-1.5">
              <FaEye size={12} className="text-primary" /> Live Showcase Preview
            </span>
          </div>

          {/* Desktop / Mobile Switcher */}
          <div className="flex items-center gap-1 bg-card border border-border-subtle rounded-xl p-1">
            <button
              type="button"
              onClick={() => setPreviewMode("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                previewMode === "desktop"
                  ? "bg-primary text-compli shadow-xs"
                  : "text-text-muted hover:text-text-base"
              }`}
            >
              <FaDesktop size={12} />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                previewMode === "mobile"
                  ? "bg-primary text-compli shadow-xs"
                  : "text-text-muted hover:text-text-base"
              }`}
            >
              <FaMobileAlt size={12} />
              <span>Mobile</span>
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="p-4 sm:p-6 flex justify-center bg-black/40">
          <div
            className={`relative overflow-hidden rounded-xl border border-border-subtle shadow-2xl transition-all duration-300 w-full ${
              previewMode === "desktop" ? "max-w-4xl h-[340px] sm:h-[400px]" : "max-w-[340px] h-[480px]"
            }`}
          >
            {/* Background Image */}
            <img
              src={previewImg}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/15 pointer-events-none" />

            {/* Content Mockup */}
            <div className="absolute inset-0 flex flex-col justify-end items-center text-center p-6 z-10">
              <div className="space-y-2 sm:space-y-3 max-w-lg">
                {showcaseConfig.badgeText && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-[10px] font-bold tracking-widest uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{showcaseConfig.badgeText}</span>
                  </div>
                )}

                <h3 className="text-2xl sm:text-4xl font-black text-text-base tracking-tight drop-shadow-md">
                  {showcaseConfig.title || "Store Showcase"}
                </h3>

                <p className="text-xs sm:text-sm font-medium text-text-muted line-clamp-2 leading-relaxed">
                  {showcaseConfig.subtitle || "Explore our premium collection and visit our store"}
                </p>

                <div className="pt-2 flex justify-center">
                  <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-compli font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-black/60">
                    {showcaseConfig.buttonType === "whatsapp" ? (
                      <FaWhatsapp className="text-base text-compli" />
                    ) : (
                      <FaLink className="text-xs text-compli" />
                    )}
                    <span>{showcaseConfig.buttonText || "Contact us"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Grid: Images & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Image Management */}
        <div className="space-y-6">
          <div className="pb-2 border-b border-border-subtle">
            <h3 className="text-sm font-extrabold text-text-base uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">photo_library</span>
              Background Imagery
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Upload custom showcase imagery or provide hosted image URLs.
            </p>
          </div>

          {/* Desktop Image Card */}
          <div className="bg-bg-surface p-4 rounded-2xl border border-border-subtle space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-text-base uppercase tracking-wider flex items-center gap-1.5">
                <FaDesktop className="text-primary" /> Desktop Background Image
              </label>
              <span className="text-[10px] text-text-muted font-bold">1920×800 / 1280×600</span>
            </div>

            {/* Thumbnail Preview */}
            <div className="relative h-36 rounded-xl border border-border-subtle overflow-hidden bg-bg-base flex items-center justify-center group">
              <img
                src={activeDesktopImg}
                alt="Desktop Preview"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <label className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-compli rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md">
                  <FaUpload size={11} />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingDesktop}
                    onChange={handleUploadDesktop}
                  />
                </label>
                {showcaseConfig.desktopImage && (
                  <button
                    type="button"
                    onClick={() => updateSection("desktopImage", "")}
                    className="px-2.5 py-1.5 bg-red-600/80 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                    title="Revert to default"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {uploadingDesktop && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-text-muted font-semibold">
                  <span>Uploading desktop image...</span>
                  <span>{progressDesktop}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-bg-base overflow-hidden border border-border-subtle">
                  <div className="h-full bg-primary transition-all duration-200" style={{ width: `${progressDesktop}%` }} />
                </div>
              </div>
            )}

            {/* URL input */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-text-muted font-bold">Or enter Image URL:</label>
              <input
                type="text"
                value={showcaseConfig.desktopImage}
                onChange={(e) => updateSection("desktopImage", e.target.value)}
                placeholder="https://... or leave empty for default store image"
                className="w-full h-10 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
              />
            </div>
          </div>

          {/* Mobile Image Card */}
          <div className="bg-bg-surface p-4 rounded-2xl border border-border-subtle space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-text-base uppercase tracking-wider flex items-center gap-1.5">
                <FaMobileAlt className="text-primary" /> Mobile Background Image (Optional)
              </label>
              <span className="text-[10px] text-text-muted font-bold">750×1000 Portrait</span>
            </div>

            {/* Thumbnail Preview */}
            <div className="relative h-36 rounded-xl border border-border-subtle overflow-hidden bg-bg-base flex items-center justify-center group">
              <img
                src={activeMobileImg}
                alt="Mobile Preview"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <label className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-compli rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md">
                  <FaUpload size={11} />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingMobile}
                    onChange={handleUploadMobile}
                  />
                </label>
                {showcaseConfig.mobileImage && (
                  <button
                    type="button"
                    onClick={() => updateSection("mobileImage", "")}
                    className="px-2.5 py-1.5 bg-red-600/80 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                    title="Revert to default"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {uploadingMobile && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-text-muted font-semibold">
                  <span>Uploading mobile image...</span>
                  <span>{progressMobile}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-bg-base overflow-hidden border border-border-subtle">
                  <div className="h-full bg-primary transition-all duration-200" style={{ width: `${progressMobile}%` }} />
                </div>
              </div>
            )}

            {/* URL input */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-text-muted font-bold">Or enter Mobile Image URL:</label>
              <input
                type="text"
                value={showcaseConfig.mobileImage}
                onChange={(e) => updateSection("mobileImage", e.target.value)}
                placeholder="https://... (falls back to desktop image if blank)"
                className="w-full h-10 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Headings & CTA Content */}
        <div className="space-y-6">
          <div className="pb-2 border-b border-border-subtle">
            <h3 className="text-sm font-extrabold text-text-base uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">edit_note</span>
              Headlines & Action Button (CTA)
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Customize title text, luxury badge, description, and direct contact details.
            </p>
          </div>

          <div className="space-y-4 bg-bg-surface p-5 rounded-2xl border border-border-subtle">
            {/* Visibility Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-bg-base border border-border-subtle">
              <div>
                <span className="text-xs font-bold text-text-base block">Section Visibility</span>
                <span className="text-[11px] text-text-muted">Display this hero showcase section on homepage</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showcaseConfig.enabled !== false}
                  onChange={(e) => updateSection("enabled", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-border-subtle peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Badge Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-base uppercase tracking-wider pl-0.5">
                Eyebrow Label / Badge (Optional)
              </label>
              <input
                type="text"
                value={showcaseConfig.badgeText}
                onChange={(e) => updateSection("badgeText", e.target.value)}
                placeholder="e.g. PREMIUM SHOWROOM & DEALERSHIP"
                className="w-full h-11 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
              />
            </div>

            {/* Section Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-base uppercase tracking-wider pl-0.5">
                Main Showcase Title
              </label>
              <input
                type="text"
                value={showcaseConfig.title}
                onChange={(e) => updateSection("title", e.target.value)}
                placeholder="e.g. Store Showcase"
                className="w-full h-11 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
              />
            </div>

            {/* Tagline / Subtitle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-base uppercase tracking-wider pl-0.5">
                Tagline / Subtitle Description
              </label>
              <textarea
                rows={3}
                value={showcaseConfig.subtitle}
                onChange={(e) => updateSection("subtitle", e.target.value)}
                placeholder="e.g. Explore our premium collection and visit our store"
                className="w-full p-3.5 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition resize-none"
              />
            </div>

            {/* CTA Button Settings */}
            <div className="pt-2 border-t border-border-subtle space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Button Label */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-base uppercase tracking-wider pl-0.5">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={showcaseConfig.buttonText}
                    onChange={(e) => updateSection("buttonText", e.target.value)}
                    placeholder="e.g. Contact us"
                    className="w-full h-11 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                  />
                </div>

                {/* Button Action Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-base uppercase tracking-wider pl-0.5">
                    Button Action Type
                  </label>
                  <select
                    value={showcaseConfig.buttonType || "whatsapp"}
                    onChange={(e) => updateSection("buttonType", e.target.value)}
                    className="w-full h-11 rounded-xl border border-border-subtle bg-bg-base text-text-base px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                  >
                    <option value="whatsapp">Open WhatsApp Chat</option>
                    <option value="custom">Custom Web Link / Page URL</option>
                  </select>
                </div>
              </div>

              {/* Conditional Fields based on buttonType */}
              {showcaseConfig.buttonType === "whatsapp" ? (
                <div className="space-y-4 bg-bg-base/60 p-4 rounded-xl border border-border-subtle">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-base uppercase tracking-wider pl-0.5 flex items-center gap-1.5">
                      <FaWhatsapp className="text-emerald-500" /> WhatsApp Number (Optional Override)
                    </label>
                    <input
                      type="text"
                      value={showcaseConfig.whatsappNumber}
                      onChange={(e) => updateSection("whatsappNumber", e.target.value)}
                      placeholder="e.g. +91 98765 43210 (leave blank to use site phone)"
                      className="w-full h-11 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                    />
                    <p className="text-[11px] text-text-muted pl-0.5">
                      Enter 10-digit mobile number or full international format. Defaults to primary site phone.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-base uppercase tracking-wider pl-0.5">
                      Pre-filled Inquiry Message
                    </label>
                    <input
                      type="text"
                      value={showcaseConfig.whatsappMessage}
                      onChange={(e) => updateSection("whatsappMessage", e.target.value)}
                      placeholder="Hi, I would like to inquire about your products..."
                      className="w-full h-11 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 bg-bg-base/60 p-4 rounded-xl border border-border-subtle">
                  <label className="text-xs font-bold text-text-base uppercase tracking-wider pl-0.5 flex items-center gap-1.5">
                    <FaLink className="text-primary" /> Target URL / Route
                  </label>
                  <input
                    type="text"
                    value={showcaseConfig.buttonLink}
                    onChange={(e) => updateSection("buttonLink", e.target.value)}
                    placeholder="e.g. /allproducts or https://..."
                    className="w-full h-11 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                  />
                  <p className="text-[11px] text-text-muted pl-0.5">
                    Internal routes like <code className="text-primary font-bold">/allproducts</code> or external links like <code className="text-primary font-bold">https://example.com</code>.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Save Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleSaveSection}
                disabled={saving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover text-compli font-bold text-sm shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-compli border-t-transparent rounded-full animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <FaSave size={15} />
                    <span>Save Showcase Section</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
