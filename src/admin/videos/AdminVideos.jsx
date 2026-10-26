import React, { useState, useEffect, useMemo } from 'react';
import {
  FaPlus,
  FaYoutube,
  FaPlay,
  FaEdit,
  FaTrash,
  FaStar,
  FaSearch,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaEyeSlash,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Header from '../Components/Header';
import { videoService } from '../../services/video/videoService';
import VideoFormModal from './sections/VideoFormModal';
import VideoModal from '../../components/video/VideoModal';
import WarningModal from '../../components/modal/WarningModal';

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteVideoTarget, setDeleteVideoTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [previewVideo, setPreviewVideo] = useState(null);

  // Fetch all videos
  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = await videoService.getVideos();
      setVideos(data);
    } catch (err) {
      console.error('Error fetching admin videos:', err);
      toast.error('Failed to load videos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const total = videos.length;
    const published = videos.filter((v) => v.status === 'Published').length;
    const featured = videos.filter((v) => v.isFeatured).length;
    const catSet = new Set(videos.map((v) => v.category).filter(Boolean));
    return {
      total,
      published,
      featured,
      categories: catSet.size,
    };
  }, [videos]);

  // Unique categories for filtering
  const allCategories = useMemo(() => {
    const set = new Set();
    videos.forEach((v) => {
      if (v.category) set.add(v.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [videos]);

  // Filtered videos
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const matchStatus =
        statusFilter === 'ALL' ||
        v.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchCat =
        categoryFilter === 'ALL' ||
        v.category?.toLowerCase() === categoryFilter.toLowerCase();
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        v.title?.toLowerCase().includes(q) ||
        v.description?.toLowerCase().includes(q) ||
        v.category?.toLowerCase().includes(q);
      return matchStatus && matchCat && matchSearch;
    });
  }, [videos, statusFilter, categoryFilter, search]);

  // Save (Create or Update)
  const handleSaveVideo = async (formData) => {
    setSaving(true);
    try {
      if (videoToEdit && videoToEdit.id) {
        await videoService.updateVideo(videoToEdit.id, formData);
        toast.success('Video updated successfully!');
      } else {
        await videoService.addVideo(formData);
        toast.success('Video added successfully!');
      }
      setIsFormModalOpen(false);
      setVideoToEdit(null);
      await loadVideos();
    } catch (err) {
      console.error('Failed to save video:', err);
      toast.error('Failed to save video. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Quick Toggle Status
  const handleToggleStatus = async (video) => {
    try {
      const newStatus = await videoService.toggleStatus(video.id, video.status);
      setVideos((prev) =>
        prev.map((v) => (v.id === video.id ? { ...v, status: newStatus } : v))
      );
      toast.info(`Video set to ${newStatus}`);
    } catch (err) {
      console.error('Error toggling status:', err);
      toast.error('Failed to toggle status.');
    }
  };

  // Quick Toggle Featured
  const handleToggleFeatured = async (video) => {
    try {
      const newFeatured = await videoService.toggleFeatured(
        video.id,
        video.isFeatured
      );
      setVideos((prev) =>
        prev.map((v) => (v.id === video.id ? { ...v, isFeatured: newFeatured } : v))
      );
      toast.info(newFeatured ? 'Video marked as Featured' : 'Video unfeatured');
    } catch (err) {
      console.error('Error toggling featured:', err);
      toast.error('Failed to toggle featured status.');
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteVideoTarget) return;
    try {
      await videoService.deleteVideo(deleteVideoTarget.id);
      toast.success('Video deleted successfully.');
      setVideos((prev) => prev.filter((v) => v.id !== deleteVideoTarget.id));
      setIsDeleteModalOpen(false);
      setDeleteVideoTarget(null);
    } catch (err) {
      console.error('Error deleting video:', err);
      toast.error('Failed to delete video.');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <Header
        title="Content → Videos"
        description="Manage YouTube tile guides, tutorials, design ideas, and homepage video features"
        buttonText="Add Video"
        icon={<FaPlus />}
        clickhandler={() => {
          setVideoToEdit(null);
          setIsFormModalOpen(true);
        }}
      />

      {/* ── Metric Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card border border-border-subtle rounded-2xl p-4 shadow-2xs">
          <p className="text-xs text-text-muted font-bold uppercase tracking-wider">
            Total Videos
          </p>
          <p className="text-2xl font-black text-text-base mt-1">{stats.total}</p>
        </div>
        <div className="bg-card border border-border-subtle rounded-2xl p-4 shadow-2xs">
          <p className="text-xs text-text-muted font-bold uppercase tracking-wider">
            Published
          </p>
          <p className="text-2xl font-black text-emerald-500 mt-1">
            {stats.published}
          </p>
        </div>
        <div className="bg-card border border-border-subtle rounded-2xl p-4 shadow-2xs">
          <p className="text-xs text-text-muted font-bold uppercase tracking-wider">
            Featured on Home
          </p>
          <p className="text-2xl font-black text-amber-500 mt-1">
            {stats.featured}
          </p>
        </div>
        <div className="bg-card border border-border-subtle rounded-2xl p-4 shadow-2xs">
          <p className="text-xs text-text-muted font-bold uppercase tracking-wider">
            Categories
          </p>
          <p className="text-2xl font-black text-primary mt-1">
            {stats.categories}
          </p>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-card border border-border-subtle rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, description or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-bg-base border border-border-subtle rounded-xl text-text-base placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-bg-base border border-border-subtle rounded-xl text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-bg-base border border-border-subtle rounded-xl text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Videos Table / Grid ── */}
      {loading ? (
        <div className="p-12 text-center text-text-muted text-sm font-medium animate-pulse">
          Loading videos...
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border-subtle rounded-2xl bg-card p-6">
          <FaYoutube className="text-4xl text-text-muted/40 mx-auto mb-2" />
          <h3 className="text-base font-bold text-text-base">No video guides found</h3>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
            {search || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
              ? 'Try adjusting your filters or search keywords.'
              : 'Add your first YouTube tile guide or tutorial!'}
          </p>
          <button
            type="button"
            onClick={() => {
              setVideoToEdit(null);
              setIsFormModalOpen(true);
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-compli shadow-xs hover:bg-primary-hover transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <FaPlus className="text-[10px]" /> Add First Video
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border-subtle rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-base/70 text-text-muted text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">Preview</th>
                  <th className="py-3 px-4">Title &amp; Category</th>
                  <th className="py-3 px-4 w-24 text-center">Order</th>
                  <th className="py-3 px-4 w-28 text-center">Featured</th>
                  <th className="py-3 px-4 w-28 text-center">Status</th>
                  <th className="py-3 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {filteredVideos.map((video) => (
                  <tr
                    key={video.id}
                    className="hover:bg-card-hover transition-colors"
                  >
                    {/* Thumbnail Preview */}
                    <td className="py-3 px-4">
                      <div
                        onClick={() => setPreviewVideo(video)}
                        className="group relative w-16 h-10 rounded-lg overflow-hidden bg-black/80 cursor-pointer shadow-2xs border border-border-subtle shrink-0"
                        title="Click to preview video"
                      >
                        <img
                          src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            if (video.youtubeId && !e.currentTarget.src.includes('mqdefault')) {
                              e.currentTarget.src = `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`;
                            } else {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                          <FaPlay className="text-white text-[10px]" />
                        </div>
                      </div>
                    </td>

                    {/* Title & Category */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text-base line-clamp-1">
                            {video.title}
                          </span>
                          {video.youtubeUrl && (
                            <a
                              href={video.youtubeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-text-muted hover:text-primary shrink-0"
                              title="Open on YouTube"
                            >
                              <FaExternalLinkAlt className="text-[10px]" />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          {video.category && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                              {video.category}
                            </span>
                          )}
                          {video.youtubeId && (
                            <span className="text-[11px] text-text-muted font-mono">
                              ID: {video.youtubeId}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Display Order */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold bg-bg-base border border-border-subtle text-text-base">
                        #{video.displayOrder || 1}
                      </span>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(video)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          video.isFeatured
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                            : 'bg-bg-base text-text-muted hover:text-text-base border border-border-subtle'
                        }`}
                        title="Toggle Homepage Featured"
                      >
                        <FaStar
                          className={`text-[10px] ${
                            video.isFeatured ? 'text-amber-500' : 'text-text-muted'
                          }`}
                        />
                        <span>{video.isFeatured ? 'Featured' : 'Standard'}</span>
                      </button>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(video)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          video.status === 'Published'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                            : 'bg-bg-base text-text-muted border border-border-subtle'
                        }`}
                        title="Click to toggle status"
                      >
                        {video.status === 'Published' ? (
                          <>
                            <FaCheckCircle className="text-[10px]" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <FaEyeSlash className="text-[10px]" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setVideoToEdit(video);
                            setIsFormModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-text-muted hover:text-text-base hover:bg-card-hover transition-colors cursor-pointer"
                          title="Edit Video"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteVideoTarget(video);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Video"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add / Edit Video Modal ── */}
      <VideoFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setVideoToEdit(null);
        }}
        onSave={handleSaveVideo}
        videoToEdit={videoToEdit}
        saving={saving}
      />

      {/* ── Delete Confirmation Modal ── */}
      <WarningModal
        isOpen={isDeleteModalOpen}
        message={`Are you sure you want to delete "${deleteVideoTarget?.title}"? This cannot be undone.`}
        confirmText="Delete Video"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteVideoTarget(null);
        }}
      />

      {/* ── Video Player Preview Modal ── */}
      <VideoModal
        video={previewVideo}
        isOpen={Boolean(previewVideo)}
        onClose={() => setPreviewVideo(null)}
      />
    </div>
  );
}
