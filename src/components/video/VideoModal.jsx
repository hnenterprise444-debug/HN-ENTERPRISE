import React, { useEffect } from 'react';
import { FaTimes, FaYoutube, FaExternalLinkAlt } from 'react-icons/fa';

/**
 * VideoModal Component
 * Fullscreen backdrop with responsive 16:9 iframe video player
 */
export default function VideoModal({ video, isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
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

  if (!isOpen || !video) return null;

  const videoId = video.youtubeId || '';
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    : video.youtubeUrl;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="min-h-full flex items-center justify-center py-4 sm:py-8">
        <div
          className="relative w-full max-w-4xl bg-bg-surface rounded-2xl md:rounded-3xl border border-border-subtle shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border-subtle bg-bg-base/80">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <span className="p-1.5 rounded-lg bg-red-600 text-white shrink-0">
              <FaYoutube className="text-sm" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-text-base truncate">
                {video.title}
              </h3>
              {video.category && (
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                  {video.category}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {video.youtubeUrl && (
              <a
                href={video.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-base px-2.5 py-1.5 rounded-lg hover:bg-card transition-colors"
                title="Open in YouTube"
              >
                <span>YouTube</span>
                <FaExternalLinkAlt className="text-[10px]" />
              </a>
            )}
            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-base hover:bg-card transition-colors cursor-pointer"
              aria-label="Close video"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>

        {/* 16:9 Aspect Video Player */}
        <div className="relative w-full aspect-video bg-black">
          {videoId ? (
            <iframe
              src={embedUrl}
              title={video.title}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white text-sm">
              Invalid Video URL
            </div>
          )}
        </div>

        {/* Description & Details Footer */}
        {video.description && (
          <div className="px-4 sm:px-6 py-4 bg-bg-surface border-t border-border-subtle">
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-3">
              {video.description}
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
