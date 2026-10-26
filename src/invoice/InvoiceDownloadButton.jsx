import React, { useState, useEffect } from "react";
import { FaFileDownload, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { invoiceService } from "../services/invoice/invoiceService.js";
import { configureService } from "../services/configure/configureService.js";
import { normalizeInvoiceData } from "./invoiceDataUtils.js";
import { ACTIVE_INVOICE_TEMPLATE } from "./templates/index.js";
import InvoiceRenderer from "./InvoiceRenderer.jsx";
import getFriendlyErrorMessage from "../utils/firebaseErrorHandler.js";

/**
 * InvoiceDownloadButton Component
 * Renders a client-facing Download Invoice button with dual-source decision engine:
 * 1. Admin Uploaded PDF -> Fetch from Storage & Download.
 * 2. System Generated -> Render InvoiceRenderer & Download locally using ACTIVE_INVOICE_TEMPLATE.
 */
export default function InvoiceDownloadButton({
  order,
  siteConfig: propSiteConfig,
  templateKey,
  buttonClass,
  className,
  showIcon = true,
  label = "Download Invoice"
}) {
  const [downloading, setDownloading] = useState(false);
  const [siteConfig, setSiteConfig] = useState(propSiteConfig || null);
  const [showHiddenTemplate, setShowHiddenTemplate] = useState(false);

  const finalButtonClass = className || buttonClass || "px-3.5 py-1.5 rounded-xl bg-primary text-white hover:bg-primary-hover text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer";

  // Sync siteConfig if not passed as prop
  useEffect(() => {
    if (!propSiteConfig) {
      configureService.getSiteConfig()
        .then((cfg) => {
          if (cfg) setSiteConfig(cfg);
        })
        .catch(() => {});
    }
  }, [propSiteConfig]);

  if (!order) return null;

  // Extract storage path or download URL resiliently from all potential invoice schema variations
  const invoiceObj = order.invoice;
  const storagePath = 
    (typeof invoiceObj === 'object' ? (invoiceObj?.storagePath || invoiceObj?.url || invoiceObj?.downloadUrl) : null) ||
    (typeof invoiceObj === 'string' && invoiceObj.trim() !== '' ? invoiceObj : null) ||
    order.invoiceUrl ||
    order.customInvoiceUrl ||
    null;

  const isUploaded = Boolean(
    (invoiceObj && typeof invoiceObj === 'object' && (invoiceObj.uploaded !== false && (invoiceObj.uploaded || invoiceObj.storagePath || invoiceObj.url))) ||
    (typeof invoiceObj === 'string' && invoiceObj.trim() !== '') ||
    order.invoiceUrl ||
    order.customInvoiceUrl
  ) && Boolean(storagePath);

  const rawStatus = (order.orderStatus || order.status || "").toUpperCase().trim().replace(/[\s-]+/g, "_");
  const isDelivered = rawStatus === "DELIVERED" || rawStatus === "ORDER_DELIVERED";

  const activeTemplateKey = templateKey || siteConfig?.invoiceTemplate || ACTIVE_INVOICE_TEMPLATE;
  const normalizedData = normalizeInvoiceData(order, siteConfig);

  const handleDownload = async (e) => {
    if (e) e.stopPropagation();
    if (!isDelivered) {
      toast.info("Invoice will be available to download once the order is delivered.");
      return;
    }
    if (downloading) return;

    try {
      setDownloading(true);

      // 1. Fetch fresh order document from Firestore to bypass any stale query caches
      const orderDocId = order.id || order.docId || order.orderId;
      let targetOrder = order;

      if (orderDocId) {
        try {
          const { doc, getDoc } = await import("firebase/firestore");
          const { fireDB } = await import("../firebase/FirebaseConfig");
          const docSnap = await getDoc(doc(fireDB, "orders", orderDocId));
          if (docSnap.exists()) {
            targetOrder = { docId: docSnap.id, id: docSnap.id, ...docSnap.data() };
          }
        } catch (fetchErr) {
          console.warn("Could not fetch fresh order snapshot, falling back to local prop:", fetchErr);
        }
      }

      // 2. Evaluate uploaded invoice metadata from fresh order snapshot
      const targetInvoice = targetOrder.invoice;
      const resolvedStoragePath = 
        (typeof targetInvoice === 'object' ? (targetInvoice?.storagePath || targetInvoice?.url || targetInvoice?.downloadUrl) : null) ||
        (typeof targetInvoice === 'string' && targetInvoice.trim() !== '' ? targetInvoice : null) ||
        targetOrder.invoiceUrl ||
        targetOrder.customInvoiceUrl ||
        null;

      const hasUploadedInvoice = Boolean(
        (targetInvoice && typeof targetInvoice === 'object' && (targetInvoice.uploaded !== false && (targetInvoice.uploaded || targetInvoice.storagePath || targetInvoice.url))) ||
        (typeof targetInvoice === 'string' && targetInvoice.trim() !== '') ||
        targetOrder.invoiceUrl ||
        targetOrder.customInvoiceUrl
      ) && Boolean(resolvedStoragePath);

      const targetNormalized = normalizeInvoiceData(targetOrder, siteConfig);
      const targetFileName = 
        (typeof targetInvoice === 'object' && targetInvoice?.fileName) ||
        `Invoice-${targetNormalized.invoiceNumber || targetOrder.id || targetOrder.docId || 'Order'}.pdf`;

      if (hasUploadedInvoice && resolvedStoragePath) {
        // Source A: Admin Uploaded Custom Invoice File
        await invoiceService.downloadUploadedInvoice(resolvedStoragePath, targetFileName);
        toast.success("Custom invoice downloaded successfully!");
      } else {
        // Source B: Render Exact HTML Invoice Template UI for PDF Conversion
        setShowHiddenTemplate(true);
        await new Promise((resolve) => setTimeout(resolve, 150));
        await invoiceService.generateClientInvoicePdf(targetOrder, siteConfig);
        toast.success("Invoice downloaded successfully!");
      }
    } catch (err) {
      console.error("Invoice download error:", err);
      const friendlyMsg = getFriendlyErrorMessage(err);
      toast.error(friendlyMsg || "Failed to download invoice. Please try again.");
    } finally {
      setDownloading(false);
      setShowHiddenTemplate(false);
    }
  };

  // If order is not delivered yet, show disabled/info state button
  if (!isDelivered) {
    return (
      <button
        type="button"
        onClick={(e) => {
          if (e) e.stopPropagation();
          toast.info("Invoice will be available to download once the order is delivered.");
        }}
        className={`${finalButtonClass} opacity-50 cursor-not-allowed`}
        title="Invoice will be available to download once the order is delivered"
      >
        {showIcon && <FaFileDownload size={12} className="opacity-60" />}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className={`${finalButtonClass} ${downloading ? "opacity-75 cursor-not-allowed" : ""}`}
        title="Download Tax Invoice"
      >
        {downloading ? (
          <>
            <FaSpinner className="animate-spin" size={12} />
            <span>Preparing...</span>
          </>
        ) : (
          <>
            {showIcon && <FaFileDownload size={12} />}
            <span>{label}</span>
          </>
        )}
      </button>

      {/* Hidden Invoice Template for PDF Conversion */}
      {showHiddenTemplate && !isUploaded && (
        <div style={{ position: "fixed", left: "-9999px", top: "0px", width: "800px", pointerEvents: "none" }}>
          <InvoiceRenderer invoiceData={normalizedData} templateKey={activeTemplateKey} />
        </div>
      )}
    </>
  );
}
