import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaYoutube, FaCheck, FaExclamationCircle, FaPlay, FaImage, FaInfoCircle } from 'react-icons/fa';
import { extractYouTubeId, getYouTubeThumbnail } from '../../../services/video/videoService';

const PREDEFINED_CATEGORIES = [
  'Buying Guide',
  'Tile Design',
  'Bathroom Ideas',
  'Living Room',
  'Kitchen Backsplash',
  'Installation Tips',
  'Maintenance & Care',
  'Showroom Tour',
];

export default function VideoFormModal({ isOpen, onClose, onSave, videoToEdit = null, saving = false }) {
  const [formData, setFormData] = useState({
    youtubeUrl: '',
    title: '',
    category: 'Buying Guide',
    customCategory: '',
    description: '',
    thumbnail: '',
    isFeatured: true,
    status: 'Published',
    displayOrder: 1,
  });

  const [youtubeId, setYoutubeId] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (videoToEdit) {
      const isCustom = !PREDEFINED_CATEGORIES.includes(videoToEdit.category);
      setFormData({
        youtubeUrl: videoToEdit.youtubeUrl || '',
        title: videoToEdit.title || '',
        category: isCustom ? 'Other' : (videoToEdit.category || 'Buying Guide'),
        customCategory: isCustom ? videoToEdit.category : '',
        description: videoToEdit.description || '',
        thumbnail: videoToEdit.thumbnail || '',
        isFeatured: videoToEdit.isFeatured ?? true,
        status: videoToEdit.status || 'Published',
        displayOrder: videoToEdit.displayOrder || 1,
      });
      const id = extractYouTubeId(videoToEdit.youtubeUrl || '');
      setYoutubeId(id);
    } else {
      setFormData({
        youtubeUrl: '',
        title: '',
        category: 'Buying Guide',
        customCategory: '',
        description: '',
        thumbnail: '',
        isFeatured: true,
        status: 'Published',
        displayOrder: 1,
      });
      setYoutubeId('');
    }
    setErrors({});
  }, [videoToEdit, isOpen]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || typeof document === 'undefined' || !document.body) return null;

  // Handle URL change & auto-extract video ID
  const handleUrlChange = (url) => {
    const id = extractYouTubeId(url);
    setYoutubeId(id);

    setFormData((prev) => {
      // If user hasn't set a custom thumbnail yet or it was auto-generated, auto-refresh thumbnail
      const autoThumb = id ? getYouTubeThumbnail(id, 'hqdefault') : prev.thumbnail;
      return {
        ...prev,
        youtubeUrl: url,
        thumbnail: autoThumb,
      };
    });

    if (errors.youtubeUrl) {
      setErrors((prev) => ({ ...prev, youtubeUrl: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.youtubeUrl.trim()) {
      newErrors.youtubeUrl = 'YouTube URL is required.';
    } else if (!extractYouTubeId(formData.youtubeUrl)) {
      newErrors.youtubeUrl = 'Invalid YouTube URL. Please check the link.';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required.';
    }

    if (formData.category === 'Other' && !formData.customCategory.trim()) {
      newErrors.category = 'Please enter a custom category name.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalCategory =
      formData.category === 'Other' ? formData.customCategory.trim() : formData.category;

    const payload = {
      ...formData,
      category: finalCategory,
      displayOrder: Number(formData.displayOrder) || 1,
    };

    onSave(payload);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="min-h-full flex items-center justify-center py-4 sm:py-6">
        <div
          className="relative w-full max-w-4xl lg:max-w-5xl bg-card border border-border-subtle rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-border-subtle bg-bg-base/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
                <FaYoutube className="text-sm" />
              </div>
              <div>
                <h2 className="text-base font-bold text-text-base leading-tight">
                  {videoToEdit ? 'Edit Video Guide' : 'Add New YouTube Video'}
                </h2>
                <p className="text-xs text-text-muted">
                  {videoToEdit
                    ? 'Update YouTube video details, category, and display settings'
                    : 'Embed YouTube tile guides, tutorials, and customer inspiration'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-card hover:bg-card-hover border border-border-subtle text-text-muted hover:text-text-base flex items-center justify-center transition cursor-pointer"
              aria-label="Close modal"
            >
              <FaTimes size={13} />
            </button>
          </div>

          {/* Form Body - 2 Columns */}
          <form onSubmit={handleSubmit}>
            <div className="p-5 sm:p-7">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Form Inputs (7 of 12) */}
                <div className="lg:col-span-7 space-y-3.5">
                  {/* YouTube URL */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-base flex items-center justify-between">
                      <span>YouTube URL *</span>
                      {youtubeId && (
                        <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                          <FaCheck className="text-[9px]" /> ID: {youtubeId}
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                      value={formData.youtubeUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-bg-base border rounded-xl text-text-base placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.youtubeUrl ? 'border-rose-500' : 'border-border-subtle'
                      }`}
                    />
                    {errors.youtubeUrl && (
                      <p className="text-[11px] text-rose-500 flex items-center gap-1 pt-0.5">
                        <FaExclamationCircle className="text-[10px]" /> {errors.youtubeUrl}
                      </p>
                    )}
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-base">Video Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. How to Choose the Right Floor Tiles"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, title: e.target.value }));
                        if (errors.title) setErrors((p) => ({ ...p, title: null }));
                      }}
                      className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-bg-base border rounded-xl text-text-base placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.title ? 'border-rose-500' : 'border-border-subtle'
                      }`}
                    />
                    {errors.title && (
                      <p className="text-[11px] text-rose-500 flex items-center gap-1 pt-0.5">
                        <FaExclamationCircle className="text-[10px]" /> {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Category & Display Order */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-text-base">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-bg-base border border-border-subtle rounded-xl text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                      >
                        {PREDEFINED_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        <option value="Other">+ Custom Category...</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-text-base">Display Order</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={formData.displayOrder}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, displayOrder: e.target.value }))
                        }
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-bg-base border border-border-subtle rounded-xl text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* Custom Category if "Other" */}
                  {formData.category === 'Other' && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-text-base">Custom Category Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Balcony Tiling"
                        value={formData.customCategory}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, customCategory: e.target.value }))
                        }
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-bg-base border border-border-subtle rounded-xl text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      {errors.category && (
                        <p className="text-[11px] text-rose-500">{errors.category}</p>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-base">Description (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Brief summary about what this video covers..."
                      value={formData.description}
                      onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-bg-base border border-border-subtle rounded-xl text-text-base placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  {/* Status & Featured Checkbox */}
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border-subtle items-center">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-text-base">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs bg-bg-base border border-border-subtle rounded-xl text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                      >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>

                    <div className="pt-4">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, isFeatured: e.target.checked }))
                          }
                          className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-text-base">
                          Feature on Home Page
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column: Video & Thumbnail Live Preview (5 of 12) */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-base flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FaImage className="text-primary text-xs" /> Live Preview
                      </span>
                      {youtubeId && (
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                          Ready to preview
                        </span>
                      )}
                    </label>

                    {/* 16:9 Ratio Preview Container */}
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/90 border border-border-subtle shadow-md flex items-center justify-center">
                      {youtubeId ? (
                        <div className="relative w-full h-full group">
                          <img
                            src={formData.thumbnail || getYouTubeThumbnail(youtubeId, 'hqdefault')}
                            alt="YouTube Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-all group-hover:bg-black/30">
                            <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                              <FaPlay className="text-sm ml-0.5" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-text-muted p-4 text-center">
                          <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center text-text-muted border border-border-subtle">
                            <FaYoutube className="text-xl text-red-500/70" />
                          </div>
                          <p className="text-xs font-bold text-text-base">No Video Loaded</p>
                          <p className="text-[11px] text-text-muted">
                            Paste a YouTube URL to automatically generate thumbnail and video preview.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Custom URL Override */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-base flex items-center justify-between">
                      <span>Thumbnail Image URL</span>
                      {youtubeId && (
                        <span className="text-[10px] text-text-muted">Auto-generated</span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="https://img.youtube.com/vi/.../hqdefault.jpg"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData((p) => ({ ...p, thumbnail: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs bg-bg-base border border-border-subtle rounded-xl text-text-base placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Helpful Info Tip */}
                  <div className="p-3 rounded-2xl bg-bg-base/70 border border-border-subtle flex items-start gap-2.5 text-[11px] text-text-muted leading-relaxed">
                    <FaInfoCircle className="text-primary text-xs shrink-0 mt-0.5" />
                    <span>
                      Supports standard watch URLs, short URLs (<code>youtu.be</code>), and Shorts. Video thumbnails are automatically cached and shown on the home page.
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-5 sm:px-7 py-3.5 border-t border-border-subtle bg-bg-base/70 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-base hover:bg-card-hover rounded-xl border border-border-subtle transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-bold bg-primary text-compli hover:bg-primary-hover rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <span className="animate-spin text-xs">⏳</span>}
                <span>{videoToEdit ? 'Save Changes' : 'Save Video'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
