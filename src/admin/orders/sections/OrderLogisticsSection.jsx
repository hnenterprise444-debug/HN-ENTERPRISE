import React from "react";
import { FaTruck, FaEdit, FaExternalLinkAlt, FaBarcode } from "react-icons/fa";

export default function OrderLogisticsSection({ tracking, onOpenTrackingModal }) {
  return (
    <div className="bg-card p-5 rounded-2xl border border-border-subtle shadow-xs space-y-4 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle/70">
        <h2 className="text-sm font-black text-text-base flex items-center gap-2">
          <FaTruck className="text-primary" /> Logistics & Tracking
        </h2>
        <button
          onClick={onOpenTrackingModal}
          className="px-3 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5"
        >
          <FaEdit size={11} />
          <span>{tracking?.trackingId ? "Edit Tracking" : "+ Add Tracking"}</span>
        </button>
      </div>

      {tracking?.trackingId ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-bg-base border border-border-subtle/70">
            <div>
              <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Courier Partner</span>
              <span className="font-black text-text-base text-xs mt-0.5 block">{tracking.courier || "Standard Delivery"}</span>
            </div>
            <div>
              <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Tracking Number</span>
              <span className="font-mono font-black text-text-base text-xs mt-0.5 block">{tracking.trackingId}</span>
            </div>
          </div>

          {tracking.trackingUrl && (
            <a
              href={tracking.trackingUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-extrabold text-xs transition border border-primary/20"
            >
              <span>Track Live Package Shipment</span>
              <FaExternalLinkAlt size={11} />
            </a>
          )}
        </div>
      ) : (
        <div className="p-5 rounded-xl border border-dashed border-border-subtle text-center bg-bg-base/40 space-y-2">
          <FaBarcode className="text-text-muted text-xl mx-auto" />
          <p className="text-xs text-text-muted font-medium">No tracking code added for this order shipment.</p>
          <button
            type="button"
            onClick={onOpenTrackingModal}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-compli text-xs font-bold hover:bg-primary-hover transition cursor-pointer shadow-xs"
          >
            + Add Tracking ID
          </button>
        </div>
      )}
    </div>
  );
}
