import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaYoutube, FaArrowRight } from 'react-icons/fa';
import { videoService } from '../../../services/video/videoService';
import VideoModal from '../../../components/video/VideoModal';

export default function VideoGuidesSection() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadVideos() {
      try {
        const data = await videoService.getFeaturedVideos();
        if (isMounted) setVideos(data);
      } catch (err) {
        console.error("Error loading featured videos:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadVideos();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && (!Array.isArray(videos) || videos.length === 0)) {
    return null;
  }

  return (
    <section className="w-full py-8 sm:py-12">
      {/* ── Section Header ── */}
      <div className="text-center max-w-2xl mx-auto px-4 mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold mb-3 shadow-2xs">
          <FaYoutube className="text-sm" />
          <span>VIDEO LIBRARY</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-base tracking-tight">
          Tile Inspiration &amp; Video Guides
        </h2>
        <p className="mt-2 text-sm sm:text-base text-text-muted font-medium">
          Ideas, tips &amp; inspiration for your space
        </p>
      </div>

      {/* ── Video Cards Grid ── */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card border border-border-subtle rounded-2xl sm:rounded-3xl p-3 sm:p-4 space-y-3 animate-pulse shadow-xs"
              >
                <div className="aspect-video w-full bg-bg-surface rounded-xl" />
                <div className="h-4 bg-bg-surface rounded w-3/4" />
                <div className="h-3 bg-bg-surface rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
            {videos.slice(0, 3).map((video) => (
              <div
                key={video.id}
                onClick={() => setActiveVideo(video)}
                className="group cursor-pointer bg-card hover:bg-card-hover border border-border-subtle hover:border-primary/40 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
              >
                <div className="space-y-3.5">
                  {/* Video Thumbnail Frame */}
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

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 group-hover:from-black/90 transition-colors" />

                    {/* Category Badge */}
                    {video.category && (
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-bg-surface/90 backdrop-blur-md text-primary border border-border-subtle shadow-xs">
                        {video.category}
                      </span>
                    )}

                    {/* YouTube Red Icon */}
                    <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-red-500 shadow-xs border border-white/10">
                      <FaYoutube className="text-sm" />
                    </div>

                    {/* Centered Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-bg-surface/90 backdrop-blur-md text-text-base border border-border-subtle shadow-lg group-hover:bg-primary group-hover:text-compli transition-all duration-300 transform group-hover:scale-110">
                        <FaPlay className="text-xs ml-0.5" />
                        <span className="text-xs font-black tracking-wider uppercase">
                          Video
                        </span>
                      </div>
                    </div>

                    {/* Optional Duration Tag */}
                    {video.duration && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white font-mono">
                        {video.duration}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5 px-1">
                    <h3 className="font-bold text-base sm:text-lg text-text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="pt-3 px-1 border-t border-border-subtle mt-3 flex items-center justify-between text-xs font-bold text-primary">
                  <span className="inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
                    Watch Guide <FaArrowRight className="text-[10px]" />
                  </span>
                  <span className="text-[11px] font-medium text-text-subtle">
                    YouTube
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── View All Videos CTA Button ── */}
        <div className="mt-8 sm:mt-10 text-center">
          <button
            type="button"
            onClick={() => navigate('/videos')}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-bg-surface hover:bg-card border border-border-subtle text-text-base font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer hover:border-primary/40"
          >
            <span>View All Videos</span>
            <FaArrowRight className="text-xs text-primary" />
          </button>
        </div>
      </div>

      {/* ── Video Modal Player ── */}
      <VideoModal
        video={activeVideo}
        isOpen={Boolean(activeVideo)}
        onClose={() => setActiveVideo(null)}
      />
    </section>
  );
}
