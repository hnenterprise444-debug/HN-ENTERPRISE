import React from 'react';
import { FaFileAlt } from 'react-icons/fa';

/**
 * Formats a timestamp into a human-readable "Today at 2:35 PM" style string.
 */
function formatDraftTime(timestamp) {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeStr = date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) return `Today at ${timeStr}`;
  if (isYesterday) return `Yesterday at ${timeStr}`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ` at ${timeStr}`;
}

/**
 * DraftRecoveryDialog
 *
 * Shown when a saved draft is detected on opening the Add Product form.
 * Refactored using pure Tailwind CSS classes.
 *
 * Props:
 *  - formName   {string}   e.g. "Product" — used in the dialog copy
 *  - draftMeta  {Object}   { updatedAt: timestamp }
 *  - onRestore  {Function} Called when user chooses "Continue Editing"
 *  - onDiscard  {Function} Called when user chooses "Discard Draft"
 */
export default function DraftRecoveryDialog({ formName = 'Product', draftMeta, onRestore, onDiscard }) {
  const timeLabel = formatDraftTime(draftMeta?.updatedAt);

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-center justify-between flex-wrap gap-3.5 p-4 sm:px-5 rounded-2xl bg-card border border-border-gold/40 backdrop-blur-md transition-all shadow-sm"
    >
      {/* Icon + Copy */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/15 text-primary shrink-0 mt-0.5">
          <FaFileAlt className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold text-sm text-primary tracking-wide">
            Unsaved Draft Found
          </p>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            You have an unfinished {formName} draft.
          </p>
          {timeLabel && (
            <p className="text-xs text-text-subtle mt-1">
              Last edited: <strong className="font-semibold text-text-muted">{timeLabel}</strong>
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 shrink-0 ml-auto sm:ml-0">
        {/* Discard */}
        <button
          id="draft-recovery-discard-btn"
          type="button"
          onClick={onDiscard}
          className="px-4 py-2 rounded-xl border border-border-subtle hover:border-primary/60 bg-bg-base hover:bg-card-hover text-text-muted hover:text-text-base text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer"
        >
          Discard Draft
        </button>

        {/* Continue Editing */}
        <button
          id="draft-recovery-continue-btn"
          type="button"
          onClick={onRestore}
          className="px-4 py-2 rounded-xl border-0 bg-primary hover:bg-primary-hover text-compli text-xs sm:text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
        >
          Continue Editing
        </button>
      </div>
    </div>
  );
}
