import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaSave,
  FaExternalLinkAlt,
  FaSearch,
  FaEye,
  FaEyeSlash,
  FaUpload,
  FaTimes,
  FaStore,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { brandService, isDummyBrand } from "../../../services/brands/brandService";
import { uploadService } from "../../../services/upload/uploadService";
import { useSiteConfig } from "../../../context/SiteConfigContext";
import useAuth from "../../../hooks/auth/useAuth";
import ToggleButton from "../../../components/Common/ToggleButton";

export default function BrandsTab({ draft, updateDraft, onSave, isDirty, saving: parentSaving, savedData }) {
  const { config, setConfig } = useSiteConfig();
  const { user } = useAuth();

  // Local state for brands and section settings
  const [brands, setBrands] = useState([]);
  const [sectionConfig, setSectionConfig] = useState({
    title: "Brand Partner and Dealer",
    subtitle: "",
    enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [internalSaving, setInternalSaving] = useState(false);
  const saving = parentSaving !== undefined ? parentSaving : internalSaving;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null); // null = Add, object = Edit
  const [brandForm, setBrandForm] = useState({
    name: "",
    logo: "",
    website: "",
    isActive: true,
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setModalOpen(false);
      }
    };
    if (modalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen]);

  // Initialize from draft/context or fetch from Firestore on mount
  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      try {
        if (Array.isArray(draft?.brands)) {
          const cleanBrands = draft.brands.filter((b) => !isDummyBrand(b));
          if (isMounted) {
            setBrands(cleanBrands);
            setSectionConfig(draft.brandsSection || { title: "Brand Partner and Dealer", subtitle: "", enabled: true });
          }
          if (cleanBrands.length !== draft.brands.length) {
            if (updateDraft) updateDraft({ brands: cleanBrands });
            brandService.saveBrandsData(cleanBrands, draft.brandsSection || sectionConfig, user?.uid || "").catch(() => {});
          }
        } else {
          const data = await brandService.getBrandsData();
          if (isMounted) {
            setBrands(data.brands);
            setSectionConfig(data.sectionConfig);
          }
          if (updateDraft) {
            updateDraft({ brands: data.brands, brandsSection: data.sectionConfig });
          }
        }
      } catch (err) {
        console.error("Error loading brands:", err);
        if (isMounted) setBrands([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    initData();
    return () => {
      isMounted = false;
    };
  }, []); // Run on initial mount only

  // Sync if savedData reverts/resets from parent (e.g. Discard / Cancel)
  useEffect(() => {
    if (savedData?.brands) {
      setBrands((savedData.brands || []).filter((b) => !isDummyBrand(b)));
    }
    if (savedData?.brandsSection) {
      setSectionConfig(savedData.brandsSection);
    }
  }, [savedData]);

  // Sync back to parent draft
  const syncWithDraft = (newBrands, newSection) => {
    setBrands(newBrands);
    setSectionConfig(newSection);
    if (updateDraft) {
      updateDraft({
        brands: newBrands,
        brandsSection: newSection,
      });
    }
  };

  // Save changes explicitly to Firestore
  const handleSaveAll = async () => {
    if (onSave) {
      await onSave();
      return;
    }
    setInternalSaving(true);
    try {
      await brandService.saveBrandsData(brands, sectionConfig, user?.uid || "");
      if (setConfig) {
        setConfig((prev) => ({
          ...prev,
          brands,
          brandsSection: sectionConfig,
        }));
      }
      toast.success("Brands & Dealers saved successfully!");
    } catch (err) {
      console.error("Failed to save brands:", err);
      toast.error(err?.message || "Failed to save brands");
    } finally {
      setInternalSaving(false);
    }
  };


  // Clear all brands
  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to remove all brands?")) {
      syncWithDraft([], sectionConfig);
      try {
        setInternalSaving(true);
        await brandService.saveBrandsData([], sectionConfig, user?.uid || "");
        if (setConfig) {
          setConfig((prev) => ({
            ...prev,
            brands: [],
            brandsSection: sectionConfig,
          }));
        }
        toast.success("All brands removed successfully!");
      } catch (err) {
        toast.error("Failed to clear brands");
      } finally {
        setInternalSaving(false);
      }
    }
  };

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditingBrand(null);
    setBrandForm({
      name: "",
      logo: "",
      website: "",
      isActive: true,
    });
    setUploadProgress(0);
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (brand) => {
    setEditingBrand(brand);
    setBrandForm({
      name: brand.name || "",
      logo: brand.logo || brand.img || "",
      website: brand.website || "",
      isActive: brand.isActive !== false,
    });
    setUploadProgress(0);
    setModalOpen(true);
  };

  // Handle Logo file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setUploadProgress(0);
    try {
      const url = await uploadService.uploadCompanyAsset(file, setUploadProgress);
      setBrandForm((prev) => ({ ...prev, logo: url }));
      toast.success("Brand logo uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Logo upload failed");
    } finally {
      setUploadingLogo(false);
    }
  };

  // Save Modal Form (Add or Edit)
  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!brandForm.name.trim()) {
      toast.warning("Please provide a brand name");
      return;
    }
    if (!brandForm.logo.trim()) {
      toast.warning("Please upload a brand logo or provide an image URL");
      return;
    }

    let updatedBrands;
    if (editingBrand) {
      // Update
      updatedBrands = brands.map((b) =>
        b.id === editingBrand.id
          ? {
              ...b,
              name: brandForm.name.trim(),
              logo: brandForm.logo.trim(),
              website: brandForm.website.trim(),
              isActive: brandForm.isActive,
              updatedAt: Date.now(),
            }
          : b
      );
      toast.success(`Updated ${brandForm.name}`);
    } else {
      // Add
      const newBrand = {
        id: `brand_${Date.now()}`,
        name: brandForm.name.trim(),
        logo: brandForm.logo.trim(),
        website: brandForm.website.trim(),
        isActive: brandForm.isActive,
        order: brands.length + 1,
        createdAt: Date.now(),
      };
      updatedBrands = [newBrand, ...brands];
      toast.success(`Added ${newBrand.name}`);
    }

    syncWithDraft(updatedBrands, sectionConfig);
    setModalOpen(false);

    // Auto-save to Firestore in background
    try {
      await brandService.saveBrandsData(updatedBrands, sectionConfig, user?.uid || "");
      if (setConfig) {
        setConfig((prev) => ({ ...prev, brands: updatedBrands }));
      }
    } catch (err) {
      console.error("Auto-sync error:", err);
    }
  };

  // Delete a brand
  const handleDeleteBrand = async (brandId, brandName) => {
    if (window.confirm(`Delete "${brandName}" from brands & dealers?`)) {
      const updated = brands.filter((b) => b.id !== brandId);
      syncWithDraft(updated, sectionConfig);
      toast.info(`Deleted ${brandName}`);
      try {
        await brandService.saveBrandsData(updated, sectionConfig, user?.uid || "");
        if (setConfig) {
          setConfig((prev) => ({ ...prev, brands: updated }));
        }
      } catch (err) {
        console.error("Failed to persist delete:", err);
      }
    }
  };

  // Toggle single brand visibility
  const handleToggleStatus = async (brandId) => {
    const updated = brands.map((b) =>
      b.id === brandId ? { ...b, isActive: !b.isActive } : b
    );
    syncWithDraft(updated, sectionConfig);
    try {
      await brandService.saveBrandsData(updated, sectionConfig, user?.uid || "");
      if (setConfig) {
        setConfig((prev) => ({ ...prev, brands: updated }));
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  // Filtered list
  const filteredBrands = brands.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? b.isActive !== false
        : b.isActive === false;
    return matchesSearch && matchesStatus;
  });

  const activeCount = brands.filter((b) => b.isActive !== false).length;
  const inactiveCount = brands.length - activeCount;

  if (loading) {
    return (
      <div className="py-12 text-center text-text-muted text-xs font-bold flex items-center justify-center gap-2">
        <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading Brands & Dealers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">verified</span>
            <h2 className="text-lg sm:text-xl font-black text-text-base tracking-wide">
              Brand Partners & Authorized Dealers
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                sectionConfig.enabled !== false
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {sectionConfig.enabled !== false ? "Active on Home" : "Section Hidden"}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Manage partner logos scrolling horizontally in the marquee section on the homepage.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {brands.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/30 hover:bg-red-500/10 text-red-400 text-xs font-bold transition shadow-xs cursor-pointer"
              title="Remove all brand logos"
            >
              <FaTrash size={11} />
              <span>Clear All</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card hover:bg-card-hover border border-primary/50 text-text-base text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <FaPlus size={11} className="text-primary" />
            <span>Add Brand</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-compli font-bold text-xs shadow-md shadow-primary/20 transition cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-compli border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaSave size={13} />
                <span>Save All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Section Global Settings (Title, Subtitle, Visibility) */}
      <div className="bg-bg-surface p-4 sm:p-5 rounded-2xl border border-border-subtle space-y-4">
        <h3 className="text-xs font-bold text-text-base uppercase tracking-wider flex items-center gap-1.5">
          <FaStore className="text-primary" /> Marquee Section Headlines & Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="space-y-1 md:col-span-1">
            <label className="text-[11px] font-bold text-text-muted uppercase">Section Title</label>
            <input
              type="text"
              value={sectionConfig.title}
              onChange={(e) => {
                const updated = { ...sectionConfig, title: e.target.value };
                syncWithDraft(brands, updated);
              }}
              placeholder="e.g. Brand Partner and Dealer"
              className="w-full h-10 px-3 rounded-xl border border-border-subtle bg-bg-base text-text-base text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1 md:col-span-1">
            <label className="text-[11px] font-bold text-text-muted uppercase">Subtitle (Optional)</label>
            <input
              type="text"
              value={sectionConfig.subtitle || ""}
              onChange={(e) => {
                const updated = { ...sectionConfig, subtitle: e.target.value };
                syncWithDraft(brands, updated);
              }}
              placeholder="e.g. Authorized distributors for premium ceramic & vitrified brands"
              className="w-full h-10 px-3 rounded-xl border border-border-subtle bg-bg-base text-text-base text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-bg-base border border-border-subtle md:col-span-1">
            <div>
              <span className="text-xs font-bold text-text-base block">Section Visibility</span>
              <span className="text-[10px] text-text-muted">Display marquee on homepage</span>
            </div>
            <ToggleButton
              checked={sectionConfig.enabled !== false}
              onChange={(val) => {
                const updated = { ...sectionConfig, enabled: val };
                syncWithDraft(brands, updated);
              }}
              size="sm"
              color="primary"
            />
          </div>
        </div>
      </div>

      {/* Live Marquee Preview Box */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden shadow-xs">
        <div className="px-4 py-2.5 bg-bg-base border-b border-border-subtle flex items-center justify-between">
          <span className="text-xs font-bold text-text-base flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Live Marquee Preview ({activeCount} Active)
          </span>
          <span className="text-[10px] text-text-muted italic">Hover to pause preview scroll</span>
        </div>

        <div className="p-4 sm:p-6 overflow-hidden bg-black/40">
          <div className="relative w-full overflow-hidden group">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-bg-base via-bg-base/60 to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-bg-base via-bg-base/60 to-transparent z-10" />

            <div className="flex w-max animate-brand-marquee group-hover:[animation-play-state:paused] py-1 gap-3 select-none">
              {(brands.filter((b) => b.isActive !== false).length > 0
                ? [
                    ...brands.filter((b) => b.isActive !== false),
                    ...brands.filter((b) => b.isActive !== false),
                  ]
                : []
              ).map((brand, idx) => (
                <div
                  key={`preview-${brand.id}-${idx}`}
                  className="w-[120px] h-[64px] rounded-xl bg-card border border-border-subtle flex items-center justify-center p-2.5 shrink-0 shadow-2xs"
                >
                  <img
                    src={brand.logo || brand.img}
                    alt={brand.name}
                    className="max-h-full max-w-full object-contain filter contrast-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats & Search Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* KPI Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
              statusFilter === "all"
                ? "bg-primary text-compli border-primary shadow-xs"
                : "bg-card border-border-subtle text-text-muted hover:text-text-base"
            }`}
          >
            All Brands ({brands.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
              statusFilter === "active"
                ? "bg-emerald-500 text-white border-emerald-500 shadow-xs"
                : "bg-card border-border-subtle text-text-muted hover:text-text-base"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("inactive")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
              statusFilter === "inactive"
                ? "bg-red-500 text-white border-red-500 shadow-xs"
                : "bg-card border-border-subtle text-text-muted hover:text-text-base"
            }`}
          >
            Inactive ({inactiveCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brand name..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {filteredBrands.map((brand) => {
          const isActive = brand.isActive !== false;
          return (
            <div
              key={brand.id}
              className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between bg-card ${
                isActive
                  ? "border-border-subtle hover:border-primary/40 shadow-xs"
                  : "border-border-subtle/40 opacity-60 bg-bg-base"
              }`}
            >
              {/* Logo Area */}
              <div className="h-24 sm:h-28 flex items-center justify-center p-3.5 bg-bg-surface/50 border-b border-border-subtle/50 relative">
                <img
                  src={brand.logo || brand.img}
                  alt={brand.name}
                  className="max-h-full max-w-full object-contain filter contrast-105 group-hover:scale-105 transition-transform"
                />

                {/* Status Indicator */}
                <button
                  type="button"
                  onClick={() => handleToggleStatus(brand.id)}
                  className={`absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center text-xs transition cursor-pointer shadow-xs ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                      : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  }`}
                  title={isActive ? "Visible in marquee (click to hide)" : "Hidden (click to show)"}
                >
                  {isActive ? <FaEye size={11} /> : <FaEyeSlash size={11} />}
                </button>
              </div>

              {/* Info & Action Controls */}
              <div className="p-2.5 space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold text-text-base truncate" title={brand.name}>
                    {brand.name}
                  </p>
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted hover:text-primary transition shrink-0"
                      title={brand.website}
                    >
                      <FaExternalLinkAlt size={10} />
                    </a>
                  )}
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-border-subtle/40">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(brand)}
                    className="flex-1 h-7 rounded-lg bg-card-hover hover:bg-primary/20 text-text-muted hover:text-primary text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer border border-border-subtle"
                  >
                    <FaEdit size={10} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBrand(brand.id, brand.name)}
                    className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs flex items-center justify-center transition cursor-pointer border border-rose-500/20"
                    title="Delete Brand"
                  >
                    <FaTrash size={10} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add New Brand Card Button */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="h-full min-h-[140px] rounded-2xl border-2 border-dashed border-border-subtle hover:border-primary/50 bg-bg-surface/30 hover:bg-bg-surface/60 transition flex flex-col items-center justify-center p-4 gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center text-primary transition">
            <FaPlus size={14} />
          </div>
          <span className="text-xs font-bold text-text-muted group-hover:text-text-base transition">
            Add Brand Partner
          </span>
        </button>
      </div>

      {/* Add / Edit Modal via Portal */}
      {modalOpen && mounted && typeof document !== "undefined" && document.body && createPortal(
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="min-h-full flex items-center justify-center py-4 sm:py-6">
            <div
              className="relative w-full max-w-3xl lg:max-w-4xl bg-card border border-border-subtle rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-border-subtle bg-bg-base/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                    <span className="material-symbols-outlined text-base">
                      {editingBrand ? "edit_note" : "add_business"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text-base leading-tight">
                      {editingBrand ? "Edit Brand Partner" : "Add New Brand Partner"}
                    </h3>
                    <p className="text-xs text-text-muted">
                      Configure partner identity, brand logo, and store marquee visibility
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-card hover:bg-card-hover border border-border-subtle text-text-muted hover:text-text-base flex items-center justify-center transition cursor-pointer"
                  aria-label="Close modal"
                >
                  <FaTimes size={13} />
                </button>
              </div>

              {/* Modal Form - 2 Columns */}
              <form onSubmit={handleSaveModal}>
                <div className="p-5 sm:p-7">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column: Brand Details (7 of 12) */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Brand Name */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-text-base uppercase tracking-wider pl-0.5">
                          Brand / Dealer Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={brandForm.name}
                          onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                          placeholder="e.g. Kajaria Ceramics"
                          className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      {/* Website URL */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-text-base uppercase tracking-wider pl-0.5">
                          Partner Website URL (Optional)
                        </label>
                        <input
                          type="text"
                          value={brandForm.website}
                          onChange={(e) => setBrandForm({ ...brandForm, website: e.target.value })}
                          placeholder="https://brandpartner.com"
                          className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      {/* Active Toggle Card */}
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-bg-base border border-border-subtle">
                        <div>
                          <span className="text-xs font-bold text-text-base block">Active in Marquee</span>
                          <span className="text-[11px] text-text-muted">Display brand logo in homepage marquee</span>
                        </div>
                        <ToggleButton
                          checked={Boolean(brandForm.isActive)}
                          onChange={(val) => setBrandForm({ ...brandForm, isActive: val })}
                          size="sm"
                          color="primary"
                        />
                      </div>
                    </div>

                    {/* Right Column: Logo Upload & Preview (5 of 12) */}
                    <div className="lg:col-span-5 space-y-3.5">
                      <label className="text-xs font-bold text-text-base uppercase tracking-wider pl-0.5 block">
                        Brand Logo Image *
                      </label>

                      {/* Logo Preview */}
                      <div className="relative h-32 rounded-2xl border border-border-subtle bg-bg-base flex items-center justify-center overflow-hidden p-4">
                        {brandForm.logo ? (
                          <img
                            src={brandForm.logo}
                            alt="Brand preview"
                            className="max-h-full max-w-full object-contain filter contrast-105"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 text-text-muted text-center">
                            <span className="material-symbols-outlined text-2xl text-text-subtle">image</span>
                            <span className="text-xs font-medium">No logo selected</span>
                          </div>
                        )}
                      </div>

                      {/* Upload Progress */}
                      {uploadingLogo && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-text-muted font-semibold">
                            <span>Uploading logo...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-bg-base overflow-hidden border border-border-subtle">
                            <div
                              className="h-full bg-primary transition-all duration-200"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Upload Action & URL Input */}
                      <div className="space-y-2">
                        <label className="w-full h-10 rounded-xl bg-card border border-border-subtle hover:bg-card-hover text-text-base text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition">
                          <FaUpload size={12} className="text-primary" />
                          <span>Upload Logo File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingLogo}
                            onChange={handleFileUpload}
                          />
                        </label>

                        <div className="space-y-1">
                          <span className="text-[10px] text-text-muted font-bold pl-0.5">Or direct image URL:</span>
                          <input
                            type="text"
                            value={brandForm.logo}
                            onChange={(e) => setBrandForm({ ...brandForm, logo: e.target.value })}
                            placeholder="https://... logo image URL"
                            className="w-full h-9 px-3 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Modal Buttons Footer */}
                <div className="px-5 sm:px-7 py-3.5 border-t border-border-subtle bg-bg-base/70 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-base hover:bg-card-hover rounded-xl border border-border-subtle transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingLogo}
                    className="px-6 py-2 text-xs font-bold bg-primary hover:bg-primary-hover text-compli rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {editingBrand ? "Save Brand" : "Add Brand"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
