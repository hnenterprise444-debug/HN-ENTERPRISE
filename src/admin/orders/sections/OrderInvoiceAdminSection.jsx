import React, { useState } from "react";
import { FaFilePdf, FaFileUpload, FaTrashAlt, FaDownload, FaSpinner, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { invoiceService } from "../../../services/invoice/invoiceService.js";
import getFriendlyErrorMessage from "../../../utils/firebaseErrorHandler.js";

/**
 * OrderInvoiceAdminSection Component
 * Allows admins to view current invoice status, upload custom PDF invoices,
 * replace existing invoices, or remove uploaded invoices.
 */
export default function OrderInvoiceAdminSection({ order, onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  if (!order) return null;

  const orderId = order.id || order.docId || order.orderId;
  const isUploaded = Boolean(order.invoice?.uploaded && (order.invoice?.storagePath || order.invoice?.url));
  const fileName = order.invoice?.fileName || "Uploaded Invoice.pdf";
  const uploadedAt = order.invoice?.uploadedAt
    ? new Date(order.invoice.uploadedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : null;

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const currentStoragePath = order.invoice?.storagePath || null;
      await invoiceService.uploadAdminInvoice(orderId, file, currentStoragePath);
      toast.success(`Uploaded "${file.name}" as official order invoice!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Admin invoice upload error:", err);
      const msg = getFriendlyErrorMessage(err);
      toast.error(msg || "Failed to upload invoice PDF.");
    } finally {
      setUploading(false);
      e.target.value = ""; // reset file input
    }
  };

  const handleRemove = async () => {
    if (!window.confirm("Are you sure you want to remove the uploaded invoice? The system will revert to the default system-generated invoice.")) {
      return;
    }

    try {
      setRemoving(true);
      const currentStoragePath = order.invoice?.storagePath || null;
      await invoiceService.removeAdminInvoice(orderId, currentStoragePath);
      toast.success("Uploaded invoice removed. Client will receive system-generated invoice.");
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Admin invoice removal error:", err);
      const msg = getFriendlyErrorMessage(err);
      toast.error(msg || "Failed to remove invoice.");
    } finally {
      setRemoving(false);
    }
  };

  const handleDownloadUploaded = async () => {
    try {
      const storagePath = order.invoice?.storagePath || order.invoice?.url;
      await invoiceService.downloadUploadedInvoice(storagePath, fileName);
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err));
    }
  };

  return (
    <div className="bg-card border border-border-subtle rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <FaFilePdf size={15} />
          </div>
          <h3 className="font-extrabold text-xs sm:text-sm text-text-base truncate">
            Order Invoice Management
          </h3>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border shrink-0 ${
          isUploaded
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-primary/10 text-primary border-primary/20"
        }`}>
          {isUploaded ? "Custom Uploaded PDF" : "System Generated"}
        </span>
      </div>

      {/* Body Status Content */}
      {isUploaded ? (
        <div className="p-3.5 sm:p-4 rounded-xl bg-bg-base border border-border-subtle/70 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
                <FaFilePdf size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-xs text-text-base truncate" title={fileName}>
                  {fileName}
                </p>
                {uploadedAt && (
                  <p className="text-[10px] text-text-muted mt-0.5">Uploaded: {uploadedAt}</p>
                )}
                <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                  <FaCheckCircle size={9} /> Active for Client Download
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadUploaded}
              className="h-8 px-3 rounded-xl bg-card border border-border-subtle text-text-base text-xs font-bold hover:bg-card-hover hover:border-primary/40 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
            >
              <FaDownload size={10} className="text-primary" />
              <span>Download</span>
            </button>
          </div>

          <div className="pt-2.5 border-t border-border-subtle/60 flex flex-wrap items-center justify-between gap-2.5">
            <label className="h-8 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-primary/20">
              {uploading ? <FaSpinner className="animate-spin" size={11} /> : <FaFileUpload size={11} />}
              <span>{uploading ? "Replacing..." : "Replace PDF"}</span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                disabled={uploading || removing}
                onChange={handleFileSelect}
              />
            </label>

            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading || removing}
              className="h-8 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-rose-500/20"
            >
              {removing ? <FaSpinner className="animate-spin" size={11} /> : <FaTrashAlt size={10} />}
              <span>Remove Upload</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-bg-base border border-border-subtle space-y-3">
          <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
            <FaInfoCircle size={14} className="text-primary shrink-0" />
            <span>Currently using <strong>System-Generated Tax Invoice</strong>. Clients can generate and download their invoice on demand.</span>
          </div>

          <div>
            <label className="w-full h-10 px-4 rounded-xl bg-primary text-compli hover:bg-primary-hover text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs">
              {uploading ? <FaSpinner className="animate-spin" size={13} /> : <FaFileUpload size={13} />}
              <span>{uploading ? "Uploading Invoice PDF..." : "Upload Custom Invoice PDF"}</span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                disabled={uploading}
                onChange={handleFileSelect}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
