import React from "react";
import { FaDatabase } from "react-icons/fa";

export default function OrderMetadataSection({ userId, itemCount }) {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border-subtle shadow-xs space-y-3">
      <h2 className="text-sm font-bold text-text-base flex items-center gap-2">
        <FaDatabase className="text-primary" /> System Metadata
      </h2>
      <div className="h-px bg-border-subtle/60" />
      <div className="space-y-1.5 text-[10.5px] font-mono text-text-muted">
        <p>User ID: <span className="text-text-base font-semibold">{userId || "N/A"}</span></p>
        <p>Items Count: <span className="text-text-base font-semibold">{itemCount}</span></p>
        <p>Region: <span className="text-text-base font-semibold">nam5</span></p>
      </div>
    </div>
  );
}
