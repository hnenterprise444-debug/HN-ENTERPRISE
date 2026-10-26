import React, { useState, useEffect } from "react";
import { 
  FaTimes, 
  FaSearch, 
  FaCheckCircle, 
  FaImages, 
  FaCopy, 
  FaCloudUploadAlt,
  FaCheck
} from "react-icons/fa";
import { mediaService } from "../../services/media/mediaService.js";
import { uploadService } from "../../services/upload/uploadService.js";
import { toast } from "react-toastify";

function MediaLibraryModal({
  isOpen,
  onClose,
  onSelectImages,
  multiple = true
}) {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUrls, setSelectedUrls] = useState([]);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMediaLibrary();
      setSelectedUrls([]);
    }
  }, [isOpen]);

  const loadMediaLibrary = async () => {
    setLoading(true);
    try {
      const items = await mediaService.getMediaLibrary();
      setMediaItems(items || []);
    } catch (err) {
      console.error("Failed to load media library:", err);
      toast.error("Failed to load media library");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (url) => {
    if (multiple) {
      if (selectedUrls.includes(url)) {
        setSelectedUrls(selectedUrls.filter(u => u !== url));
      } else {
        setSelectedUrls([...selectedUrls, url]);
      }
    } else {
      setSelectedUrls([url]);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedUrls.length === 0) {
      toast.info("Please select at least one image");
      return;
    }
    if (typeof onSelectImages === "function") {
      onSelectImages(multiple ? selectedUrls : selectedUrls[0]);
    }
    onClose();
  };

  const handleCopyLink = (url, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success("Image URL copied to clipboard!");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleModalUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const url = await uploadService.uploadProductImage(file);
        await mediaService.saveMedia(url, file.name);
      }
      toast.success("Images uploaded to media library!");
      await loadMediaLibrary();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload image to media library");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const filteredItems = mediaItems.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.source?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-bg-surface border border-border-base rounded-2xl w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-base flex items-center justify-between bg-bg-base/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <FaImages size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-text-base flex items-center gap-2">
                Media Library
              </h2>
              <p className="text-[11px] text-text-muted mt-0.5">
                Select from previously uploaded media across your product catalog.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-base hover:bg-bg-base transition cursor-pointer"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Toolbar: Search & Upload */}
        <div className="px-6 py-3 border-b border-border-base flex flex-col sm:flex-row items-center justify-between gap-3 bg-bg-base/20">
          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={12} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product or image name..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border-base bg-bg-surface text-xs focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-base hover:bg-border-base border border-border-base text-xs font-bold cursor-pointer transition active:scale-95 text-text-base">
              {uploading ? (
                <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <FaCloudUploadAlt size={14} className="text-primary" />
              )}
              <span>{uploading ? "Uploading..." : "Upload New"}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleModalUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            <span className="text-[11px] font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
              {filteredItems.length} Images
            </span>
          </div>
        </div>

        {/* Gallery Grid Container */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[300px]">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-text-muted font-bold">Loading media library...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-border-base/60 rounded-2xl bg-bg-base/30">
              <FaImages size={32} className="text-text-muted mx-auto mb-2 opacity-50" />
              <h3 className="font-bold text-text-base text-xs">No Uploaded Media Found</h3>
              <p className="text-[10px] text-text-muted mt-1">
                Upload new images using the button above to add them to your library.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filteredItems.map((item) => {
                const isSelected = selectedUrls.includes(item.url);

                return (
                  <div
                    key={item.id || item.url}
                    onClick={() => handleToggleSelect(item.url)}
                    className={`group relative rounded-xl border-2 overflow-hidden bg-bg-base cursor-pointer transition-all duration-200 aspect-square flex flex-col justify-between p-1.5 shadow-xs ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20 shadow-md scale-[1.02]"
                        : "border-border-base hover:border-primary/50 hover:shadow-sm"
                    }`}
                  >
                    {/* Image Preview */}
                    <div className="w-full h-full rounded-lg overflow-hidden relative bg-white dark:bg-slate-900 flex items-center justify-center">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />

                      {/* Selection Overlay */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                            <FaCheckCircle size={16} />
                          </div>
                        </div>
                      )}

                      {/* Hover Controls */}
                      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(item.url, e)}
                          className="p-1.5 rounded-lg bg-black/70 text-white hover:bg-black transition cursor-pointer"
                          title="Copy Link"
                        >
                          {copiedUrl === item.url ? <FaCheck size={10} className="text-emerald-400" /> : <FaCopy size={10} />}
                        </button>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-1 px-1 flex items-center justify-between gap-1 text-[9.5px]">
                      <span className="truncate font-semibold text-text-muted max-w-[100px]" title={item.name}>
                        {item.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-border-base flex items-center justify-between bg-bg-base/40">
          <div className="text-xs font-bold text-text-base">
            {selectedUrls.length} image{selectedUrls.length !== 1 ? "s" : ""} selected
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border-base bg-bg-surface hover:bg-bg-base font-bold text-text-base transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmSelection}
              disabled={selectedUrls.length === 0}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-compli font-black transition disabled:opacity-50 cursor-pointer shadow-md active:scale-95"
            >
              Attach Selected ({selectedUrls.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MediaLibraryModal;
