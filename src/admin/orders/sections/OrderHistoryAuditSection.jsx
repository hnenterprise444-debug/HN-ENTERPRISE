import React from "react";
import { FaHistory } from "react-icons/fa";

export default function OrderHistoryAuditSection({ history = [], currentStatus, createdAt, formatDate }) {
  return (
    <div className="bg-card p-5 rounded-2xl border border-border-subtle shadow-xs space-y-4 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle/70">
        <h2 className="text-sm font-black text-text-base flex items-center gap-2">
          <FaHistory className="text-primary" /> Order Audit Log History
        </h2>
        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black">
          {history.length > 0 ? `${history.length} Entries` : "Initial Entry"}
        </span>
      </div>

      <div className="space-y-4 relative pl-4 border-l-2 border-primary/20 ml-2">
        {history.length === 0 ? (
          <div className="flex items-start gap-3 relative">
            <div className="w-3 h-3 rounded-full bg-primary -ml-[23px] mt-1 ring-4 ring-card shadow-xs" />
            <div>
              <p className="text-xs font-black text-text-base">{currentStatus.replace(/_/g, " ")}</p>
              <p className="text-[10px] text-text-muted mt-0.5 font-medium">
                {formatDate(createdAt)} • Created by <strong className="text-text-base">SYSTEM</strong>
              </p>
            </div>
          </div>
        ) : (
          [...history].reverse().map((entry, idx) => (
            <div key={idx} className="flex items-start gap-3 relative">
              <div className="w-3 h-3 rounded-full bg-primary -ml-[23px] mt-1 ring-4 ring-card shadow-xs" />
              <div>
                <p className="text-xs font-black text-text-base">{entry.status.replace(/_/g, " ")}</p>
                <p className="text-[10px] text-text-muted mt-0.5 font-medium">
                  {formatDate(entry.timestamp)} • Updated by <strong className="text-text-base">{entry.updatedBy || "ADMIN"}</strong>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
