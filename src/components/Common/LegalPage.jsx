import React from "react";
import { useSiteConfig } from "../../context/SiteConfigContext";
import LegalPdfViewer from "./LegalPdfViewer";

export function FormattedLegalContent({ content, title }) {
    const rawText = content || `# ${title}\n\nContent for ${title} will be updated soon.`;
    const blocks = rawText.split(/\n\n+/);

    return (
        <div className="space-y-6 text-text-base leading-relaxed">
            {blocks.map((block, idx) => {
                const trimmed = block.trim();
                if (trimmed.startsWith('# ')) {
                    return (
                        <h1 key={idx} className="text-xl sm:text-2xl font-bold text-text-base pb-4 border-b border-border-subtle">
                            {trimmed.replace(/^#\s+/, '')}
                        </h1>
                    );
                }
                if (trimmed.startsWith('### ')) {
                    return (
                        <h3 key={idx} className="text-base sm:text-lg font-bold text-primary pt-2">
                            {trimmed.replace(/^###\s+/, '')}
                        </h3>
                    );
                }
                if (trimmed.startsWith('## ')) {
                    return (
                        <h2 key={idx} className="text-lg sm:text-xl font-bold text-text-base pt-3 pb-1 border-b border-border-subtle/50">
                            {trimmed.replace(/^##\s+/, '')}
                        </h2>
                    );
                }
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    const items = trimmed.split(/\n/).map((i) => i.replace(/^[-*]\s+/, ''));
                    return (
                        <ul key={idx} className="list-disc list-inside space-y-2 pl-2 text-sm text-text-muted">
                            {items.map((item, iIdx) => (
                                <li key={iIdx} className="leading-relaxed">{item}</li>
                            ))}
                        </ul>
                    );
                }
                return (
                    <p key={idx} className="text-sm sm:text-base text-text-muted leading-relaxed font-normal whitespace-pre-line">
                        {trimmed}
                    </p>
                );
            })}
        </div>
    );
}

/**
 * LegalPage — minimal document renderer for standard legal/policy pages.
 * Supports PDF documents via LegalPdfViewer and formatted text documents.
 */
function LegalPage({ configKey, title }) {
    const { config, loading } = useSiteConfig();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-text-muted text-sm font-medium">
                Loading policy document...
            </div>
        );
    }

    const legalData = config?.legal || {};
    const pageObj = legalData.fixedPages?.[configKey] || {};
    
    // Resolve docUrl / pdfUrl or direct string storage URL
    const docUrl = pageObj.docUrl || pageObj.pdfUrl || (typeof legalData[configKey] === "string" && legalData[configKey].startsWith("http") ? legalData[configKey] : "");

    if (pageObj.isActive === false) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-text-muted gap-2">
                <p className="text-xl font-bold text-text-base">{title}</p>
                <p className="text-sm">This policy page is currently inactive.</p>
            </div>
        );
    }

    // If Document/PDF URL is uploaded and configured in Firestore, render LegalPdfViewer
    if (docUrl) {
        return <LegalPdfViewer pdfUrl={docUrl} title={title} />;
    }

    // Otherwise render native formatted document
    const content = pageObj.content || (typeof legalData[configKey] === "string" ? legalData[configKey] : null) || "";

    return (
        <div className="w-full bg-bg-base min-h-screen py-6 sm:py-8 px-4 sm:px-6 flex justify-center items-start font-sans">
            <div className="w-full max-w-[920px] bg-card border border-border-subtle rounded-3xl p-6 sm:p-10 shadow-xs">
                <FormattedLegalContent content={content} title={title} />
            </div>
        </div>
    );
}

export default LegalPage;
