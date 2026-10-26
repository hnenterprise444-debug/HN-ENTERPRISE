import React from "react";

const WarningModal = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  mode = "light",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl p-6 transition-all duration-200 border border-border-subtle bg-card text-text-base"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full flex items-center justify-center bg-amber-500/15 border border-amber-500/30">
            <span className="text-3xl">⚠️</span>
          </div>
        </div>

        {/* Message Header */}
        <h2 className="text-xl font-bold text-center text-text-base">
          Warning
        </h2>

        {/* Message Content */}
        <p className="mt-3 text-center text-sm font-medium text-text-muted leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3 text-sm">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-border-subtle bg-bg-base text-text-muted hover:text-text-base hover:bg-card-hover px-4 py-2 font-semibold transition cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2 font-bold text-white transition shadow-md active:scale-[0.98] cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;
