import React from "react";
import { useParams } from "react-router-dom";
import { useSiteConfig } from "../../context/SiteConfigContext";
import { FormattedLegalContent } from "../../components/Common/LegalPage";
import LegalPdfViewer from "../../components/Common/LegalPdfViewer";

/**
 * CustomLegalPage
 * Dynamic page renderer for custom legal pages configured in the Admin Panel.
 * Supports both uploaded PDF documents via LegalPdfViewer and formatted text documents.
 * Route: /legal/:slug
 */
export default function CustomLegalPage() {
  const { slug } = useParams();
  const { config, loading } = useSiteConfig();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-text-muted text-sm font-medium">
        Loading document...
      </div>
    );
  }

  const customPages = Array.isArray(config?.legal?.customPages) ? config.legal.customPages : [];
  const normalizedSlug = (slug || "").toLowerCase().trim();
  const currentPage = customPages.find(
    (p) => (p.slug || "").toLowerCase().trim() === normalizedSlug
  );

  if (!currentPage) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-text-muted gap-2">
        <h2 className="text-2xl font-bold text-text-base">Page Not Found</h2>
        <p className="text-sm">The legal page you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  if (currentPage.isActive === false) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-text-muted gap-2">
        <h2 className="text-2xl font-bold text-text-base">{currentPage.name}</h2>
        <p className="text-sm">This policy page is currently inactive.</p>
      </div>
    );
  }

  const docUrl = currentPage.docUrl || currentPage.pdfUrl || "";

  // If a PDF document was uploaded for this custom page, render the PDF viewer
  if (docUrl) {
    return <LegalPdfViewer pdfUrl={docUrl} title={currentPage.name} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 sm:p-10 shadow-xs">
        <FormattedLegalContent content={currentPage.content} title={currentPage.name} />
      </div>
    </div>
  );
}
