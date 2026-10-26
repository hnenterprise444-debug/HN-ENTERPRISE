import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

/**
 * UnsavedChangesDialog
 *
 * Shown as a modal overlay when the user tries to navigate away from a form
 * with unsaved changes (isDirty === true).
 * Refactored using pure Tailwind CSS classes.
 *
 * Props:
 *  - onStay    {Function}  User wants to stay on the page
 *  - onDiscard {Function}  User confirms leaving — draft will be cleared
 */
export default function UnsavedChangesDialog({ onStay, onDiscard }) {
  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onStay}
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm animate-fade-in"
      />

      {/* Modal Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unsaved-dialog-title"
        aria-describedby="unsaved-dialog-desc"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md p-7 sm:p-8 rounded-2xl bg-card border border-border-subtle shadow-2xl text-center transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Warning Icon Badge */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-2xl">
          <FaExclamationTriangle className="w-7 h-7" />
        </div>

        {/* Title */}
        <h2
          id="unsaved-dialog-title"
          className="text-xl font-bold text-text-base mb-2"
        >
          Discard Changes?
        </h2>

        {/* Description */}
        <p
          id="unsaved-dialog-desc"
          className="text-sm text-text-muted leading-relaxed mb-7"
        >
          You have unsaved changes. Are you sure you want to leave?<br />
          <span className="text-xs text-text-subtle mt-1 block">
            Your draft will be discarded and cannot be recovered.
          </span>
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Stay */}
          <button
            id="unsaved-dialog-stay-btn"
            type="button"
            onClick={onStay}
            autoFocus
            className="flex-1 py-2.5 px-4 rounded-xl border border-border-subtle bg-bg-base hover:bg-card-hover text-text-muted hover:text-text-base text-sm font-semibold transition-all duration-150 cursor-pointer"
          >
            Stay
          </button>

          {/* Discard & Leave */}
          <button
            id="unsaved-dialog-discard-btn"
            type="button"
            onClick={onDiscard}
            className="flex-1 py-2.5 px-4 rounded-xl border-0 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-lg shadow-rose-600/25 hover:shadow-rose-600/40 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
          >
            Discard &amp; Leave
          </button>
        </div>
      </div>
    </>
  );
}
