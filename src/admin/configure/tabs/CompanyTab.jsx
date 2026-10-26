import { useState } from "react";
import { uploadService } from "../../../services/upload/uploadService";
import { useSiteConfig } from "../../../context/SiteConfigContext";
import { configureService } from "../../../services/configure/configureService";
import useAuth from "../../../hooks/auth/useAuth";
import { toast } from "react-toastify";

const Field = ({ label, children }) => (
    <div className="space-y-2">
        <label className="block text-xs font-bold text-text-base uppercase tracking-wider pl-0.5">
            {label}
        </label>
        {children}
    </div>
);

const Input = ({ value, onChange, placeholder, type = "text", disabled = false, readOnly = false, className = "" }) => (
    <input
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={`w-full h-11 rounded-xl border border-border-subtle bg-bg-base px-4 text-sm font-medium text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
            disabled || readOnly ? "bg-bg-surface text-text-muted cursor-not-allowed border-border-subtle select-none" : ""
        } ${className}`}
    />
);

/**
 * LogoUpload
 * Shows a preview panel with the current image (or local preview before upload).
 * Dispatches file upload to the configured service provider in env.
 */
function LogoUpload({ label, currentUrl, onUpload, hint }) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [localPreview, setLocalPreview] = useState(null);
    const [pendingFile, setPendingFile] = useState(null);

    const displayUrl = localPreview || currentUrl;

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPendingFile(file);
        setLocalPreview(URL.createObjectURL(file));
    };

    const handleUpload = async () => {
        if (!pendingFile) return;
        setUploading(true);
        setProgress(0);
        try {
            const url = await uploadService.uploadCompanyAsset(pendingFile, setProgress);
            await onUpload(url);
            setLocalPreview(null);
            setPendingFile(null);
            toast.success(`${label} uploaded and saved successfully`);
        } catch (err) {
            const errorMsg = err?.code === 'storage/unauthorized'
                ? "Permission denied: Please ensure you are logged in to upload assets."
                : (err?.message || "Upload failed");
            toast.error(errorMsg);
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleDiscard = () => {
        setLocalPreview(null);
        setPendingFile(null);
    };

    return (
        <div className="space-y-4 bg-bg-surface p-4 rounded-2xl border border-border-subtle">
            {/* Preview panel with transparency checkerboard */}
            <div className={`relative h-40 rounded-2xl border-2 border-dashed overflow-hidden bg-bg-base flex items-center justify-center transition-colors bg-[radial-gradient(#3a2d0b_1px,transparent_1px)] [background-size:12px_12px] ${
                displayUrl ? "border-primary/40" : "border-border-subtle"
            }`}>
                {displayUrl ? (
                    <>
                        <img
                            src={displayUrl}
                            alt={label}
                            className="max-h-full max-w-full object-contain p-4 drop-shadow-xs"
                        />
                        {localPreview && (
                            <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-primary text-compli text-[10px] font-bold uppercase tracking-wider shadow-xs">
                                Unsaved
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center">
                        <span className="material-symbols-outlined text-4xl text-text-subtle">image</span>
                        <p className="mt-2 text-xs text-text-muted font-medium">No {label} set</p>
                    </div>
                )}
            </div>

            {/* Hint */}
            {hint && <p className="text-xs text-text-muted leading-relaxed pl-0.5">{hint}</p>}

            {/* Progress Bar */}
            {uploading && (
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-text-muted">
                        <span>Uploading...</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-bg-base border border-border-subtle/50 overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="space-y-2.5">
                {localPreview && !uploading && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleUpload}
                            className="flex-1 h-10 px-3 rounded-xl bg-primary text-compli hover:bg-primary-hover font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-base">cloud_upload</span>
                            <span>Upload & Save</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleDiscard}
                            className="h-10 px-3.5 rounded-xl border border-border-subtle bg-card hover:bg-card-hover text-text-base font-bold text-xs transition-colors cursor-pointer shrink-0"
                        >
                            Discard
                        </button>
                    </div>
                )}

                <label className="block">
                    <span className="w-full h-10 rounded-xl border border-border-subtle bg-card hover:bg-card-hover text-text-base font-bold text-xs transition-colors flex items-center justify-center cursor-pointer shadow-xs gap-1.5">
                        <span className="material-symbols-outlined text-base">photo_camera</span>
                        <span>{displayUrl ? `Replace ${label}` : `Select ${label}`}</span>
                    </span>
                    <input
                        type="file"
                        accept="image/png, image/webp, image/svg+xml, image/jpeg, image/x-icon, image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={uploading}
                    />
                </label>
            </div>
        </div>
    );
}

export default function CompanyTab({ draft, updateDraft, markFieldSaved }) {
    const { setConfig } = useSiteConfig();
    const { user } = useAuth();

    const handleLogoUpload = async (url) => {
        updateDraft({ companyLogo: url });
        try {
            await configureService.saveSiteConfig({ companyLogo: url }, user?.uid || "");
            setConfig((prev) => ({ ...prev, companyLogo: url }));
            if (markFieldSaved) markFieldSaved("companyLogo", url);
        } catch (err) {
            console.error("Failed to save company logo:", err);
            toast.error("Failed to save logo to database");
        }
    };

    const handleFaviconUpload = async (url) => {
        updateDraft({ faviconUrl: url });
        try {
            await configureService.saveSiteConfig({ faviconUrl: url }, user?.uid || "");
            setConfig((prev) => ({ ...prev, faviconUrl: url }));
            if (markFieldSaved) markFieldSaved("faviconUrl", url);
        } catch (err) {
            console.error("Failed to save favicon:", err);
            toast.error("Failed to save favicon to database");
        }
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Company Name">
                    <div>
                        <Input
                            value={draft.companyName || "Store"}
                            readOnly
                            disabled
                        />
                    </div>
                </Field>
                <Field label="Company Tagline">
                    <Input
                        value={draft.companyTagline}
                        onChange={(e) => updateDraft({ companyTagline: e.target.value })}
                        placeholder="Quality you can trust."
                    />
                </Field>
            </div>

            {/* Founder Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                <Field label="Founder Name">
                    <Input
                        value={draft.founderName || ""}
                        onChange={(e) => updateDraft({ founderName: e.target.value })}
                        placeholder="e.g. Founder Name"
                    />
                </Field>
                <Field label="Founder Phone Number">
                    <Input
                        value={draft.founderPhone || ""}
                        onChange={(e) => updateDraft({ founderPhone: e.target.value })}
                        placeholder="e.g. +91 98765 43210"
                    />
                </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Company Logo">
                    <LogoUpload
                        label="Logo"
                        currentUrl={draft.companyLogo}
                        hint="Shown in Navbar and Admin sidebar. Supports transparent background PNG, WebP, SVG."
                        onUpload={handleLogoUpload}
                    />
                </Field>
                <Field label="Favicon">
                    <LogoUpload
                        label="Favicon"
                        currentUrl={draft.faviconUrl}
                        hint="Shown in browser tab. Recommended: 32×32px ICO/PNG with transparency."
                        onUpload={handleFaviconUpload}
                    />
                </Field>
            </div>
        </div>
    );
}
