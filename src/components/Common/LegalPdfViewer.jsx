import React, { useState } from "react";

/**
 * LegalPdfViewer
 * Clean document viewing layout.
 * Pure white background, no outer borders, no shadows, no extra padding, and no download buttons.
 */
export default function LegalPdfViewer({ pdfUrl, title = "Document", lastUpdated }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // If no PDF URL is available or load failed
    if (!pdfUrl || hasError) {
        return (
            <div className="w-full bg-bg-base py-8 px-4 flex justify-center items-center font-sans">
                <div className="w-full max-w-[920px] bg-card border border-border-subtle rounded-2xl text-center space-y-3 py-12 px-6">
                    <div className="w-12 h-12 rounded-full bg-bg-surface border border-border-subtle text-primary flex items-center justify-center mx-auto">
                        <span className="material-symbols-outlined text-2xl">description</span>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold text-text-base">Document unavailable</h3>
                        <p className="text-xs text-text-muted max-w-sm mx-auto">
                            The document could not be loaded or is currently unavailable.
                        </p>
                    </div>
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setHasError(false);
                                setIsLoaded(false);
                            }}
                            className="h-9 px-4 rounded-xl border border-border-subtle bg-bg-surface hover:bg-card-hover text-xs font-semibold text-text-base transition cursor-pointer"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-bg-base min-h-screen py-6 sm:py-8 px-4 sm:px-6 flex justify-center items-start font-sans text-text-base">
            {/* Centered Document Area */}
            <div className="w-full max-w-[920px] space-y-6">
                
                {/* Minimal Header */}
                <div className="pb-4 border-b border-border-subtle">
                    <h1 className="text-xl sm:text-2xl font-bold text-text-base tracking-tight">{title}</h1>
                    {lastUpdated && (
                        <p className="text-xs text-text-muted mt-1 font-medium">
                            Last updated: {lastUpdated}
                        </p>
                    )}
                </div>

                {/* PDF Viewing Area */}
                <div className="relative w-full bg-card border border-border-subtle rounded-2xl min-h-[700px] overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {/* Document Skeleton Loader (No Spinner) */}
                    {!isLoaded && (
                        <div className="absolute inset-0 bg-card p-6 space-y-6 animate-pulse flex flex-col justify-start z-10">
                            <div className="h-6 bg-card-hover rounded-md w-1/3 mb-2" />
                            <div className="h-3 bg-card-hover rounded-md w-1/4 mb-6" />

                            <div className="space-y-3">
                                <div className="h-4 bg-card-hover rounded-md w-full" />
                                <div className="h-4 bg-card-hover rounded-md w-11/12" />
                                <div className="h-4 bg-card-hover rounded-md w-4/5" />
                            </div>

                            <div className="space-y-3 pt-4">
                                <div className="h-5 bg-card-hover rounded-md w-2/5 mb-3" />
                                <div className="h-4 bg-card-hover rounded-md w-full" />
                                <div className="h-4 bg-card-hover rounded-md w-full" />
                                <div className="h-4 bg-card-hover rounded-md w-3/4" />
                            </div>

                            <div className="space-y-3 pt-4">
                                <div className="h-5 bg-card-hover rounded-md w-1/3 mb-3" />
                                <div className="h-4 bg-card-hover rounded-md w-full" />
                                <div className="h-4 bg-card-hover rounded-md w-5/6" />
                            </div>
                        </div>
                    )}

                    {/* Clean Embedded PDF Viewport */}
                    <iframe
                        src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                        title={title}
                        scrolling="no"
                        onLoad={() => setIsLoaded(true)}
                        onError={() => setHasError(true)}
                        className={`w-full h-[82vh] min-h-[700px] border-0 bg-white transition-opacity duration-500 overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
                            isLoaded ? "opacity-100" : "opacity-0"
                        }`}
                    />
                </div>
            </div>
        </div>
    );
}
