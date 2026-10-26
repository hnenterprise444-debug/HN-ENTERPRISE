import React from "react";

export default function PaymentProcessingOverlay({ orderId }) {
  return (
    <div className="fixed inset-0 z-50 bg-bg-base flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md mx-auto">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          <div className="absolute inset-3 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-text-base mb-3">Verifying Payment...</h2>
        <p className="text-text-muted text-sm mb-2">Please wait while we securely verify your payment.</p>
        <p className="text-text-muted text-sm font-semibold mb-8 text-amber-500">Do not close this page or press back.</p>

        {orderId && (
          <div className="bg-bg-surface rounded-xl px-5 py-3 border border-border-subtle mb-6">
            <p className="text-xs text-text-muted">Order Reference</p>
            <p className="text-sm font-mono font-semibold text-text-base truncate">{orderId}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {["Payment received by gateway", "Verifying transaction signature", "Confirming your order"].map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-text-muted">
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: `${i * 400}ms` }}></div>
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
