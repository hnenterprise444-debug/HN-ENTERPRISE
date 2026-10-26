import React, { useState, useEffect, useMemo } from 'react';
import { FaYoutube, FaSearch, FaPlay, FaArrowLeft, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { videoService } from '../../services/video/videoService';
import VideoModal from '../../components/video/VideoModal';

export default function VideosPage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchVideos() {
      try {
        const data = await videoService.getPublishedVideos();
        if (isMounted) setVideos(data);
      } catch (err) {
        console.error("Failed to load videos:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchVideos();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute unique categories
  const categories = useMemo(() => {
    const set = new Set();
    videos.forEach((v) => {
      if (v.category) set.add(v.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [videos]);

  // Filtered video list
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const matchCat =
        selectedCategory === 'ALL' ||
        v.category?.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        v.title?.toLowerCase().includes(q) ||
        v.description?.toLowerCase().includes(q) ||
        v.category?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [videos, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10">
      {/* Top Breadcrumb & Return to Home */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-text-muted hover:text-text-base transition-colors cursor-pointer"
        >
          <FaArrowLeft className="text-xs" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Hero Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold shadow-2xs">
          <FaYoutube className="text-sm" />
          <span>VIDEO LIBRARY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-base tracking-tight">
          Inspiration &amp; Video Guides
        </h1>
        <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto leading-relaxed">
          Watch expert buying advice, design concepts, and useful tips to elevate your interiors.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-card border border-border-subtle rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative max-w-md w-full">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle text-xs pointer-events-none" />
          <input
            type="text"
            placeholder="Search tile guides, tutorials, design ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-bg-base border border-border-subtle rounded-xl text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-text-muted flex items-center gap-1 shrink-0 mr-1">
            <FaFilter className="text-[10px]" /> Category:
          </span>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-compli shadow-xs font-bold'
                    : 'bg-bg-surface hover:bg-card-hover text-text-muted hover:text-text-base border border-border-subtle'
                }`}
              >
                {cat === 'ALL' ? 'All Guides' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-card border border-border-subtle rounded-2xl p-4 space-y-3 animate-pulse shadow-xs"
            >
              <div className="aspect-video w-full bg-bg-surface rounded-xl" />
              <div className="h-4 bg-bg-surface rounded w-3/4" />
              <div className="h-3 bg-bg-surface rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border-subtle rounded-2xl bg-card p-6">
          <FaYoutube className="text-4xl text-text-subtle/40 mx-auto mb-2" />
          <h3 className="text-base font-bold text-text-base">No video guides found</h3>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or selecting a different category filter.
          </p>
          {(searchQuery || selectedCategory !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-compli shadow-xs hover:opacity-90 transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className="group cursor-pointer bg-card hover:bg-card-hover border border-border-subtle hover:border-primary/40 rounded-2xl sm:rounded-3xl p-4 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
            >
              <div className="space-y-3.5">
                {/* 16:9 Thumbnail Frame */}
                <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-inner border border-border-subtle/40">
                  <img
                    src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      if (video.youtubeId && !e.currentTarget.src.includes('mqdefault')) {
                        e.currentTarget.src = `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`;
                      } else {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 group-hover:from-black/90 transition-colors" />

                  {video.category && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-bg-surface/90 backdrop-blur-md text-primary border border-border-subtle shadow-xs">
                      {video.category}
                    </span>
                  )}

                  <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-red-500 shadow-xs border border-white/10">
                    <FaYoutube className="text-sm" />
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-bg-surface/90 backdrop-blur-md text-text-base border border-border-subtle shadow-lg group-hover:bg-primary group-hover:text-compli transition-all duration-300 transform group-hover:scale-110">
                      <FaPlay className="text-xs ml-0.5" />
                      <span className="text-xs font-black tracking-wider uppercase">
                        Watch
                      </span>
                    </div>
                  </div>

                  {video.duration && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white font-mono">
                      {video.duration}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1.5 px-1">
                  <h3 className="font-bold text-base sm:text-lg text-text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-3">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 px-1 border-t border-border-subtle mt-3 flex items-center justify-between text-xs font-bold text-primary">
                <span className="inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
                  Play Video Guide →
                </span>
                <span className="text-[11px] font-medium text-text-subtle">
                  YouTube
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      <VideoModal
        video={activeVideo}
        isOpen={Boolean(activeVideo)}
        onClose={() => setActiveVideo(null)}
      />
    </div>
  );
}
