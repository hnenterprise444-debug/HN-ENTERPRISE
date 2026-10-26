import { useState } from "react";
import { uploadService } from "../../../services/upload/uploadService";
import { FaFilePdf, FaPlus, FaTrash, FaCheck, FaTimes, FaGlobe, FaFileUpload } from "react-icons/fa";
import { toast } from "react-toastify";

const FIXED_LEGAL_PAGES = [
  { key: "aboutUs", label: "About Us", path: "/aboutus" },
  { key: "privacyPolicy", label: "Privacy Policy", path: "/privacypolicy" },
  { key: "termsAndConditions", label: "Terms & Conditions", path: "/termsconditions" },
  { key: "returnPolicy", label: "Return Policy", path: "/returnpolicy" },
  { key: "shippingPolicy", label: "Shipping Policy", path: "/shippingpolicy" },
  { key: "refundPolicy", label: "Refund Policy", path: "/refundpolicy" },
];

export default function LegalTab({ draft, updateDraft }) {
  const [uploadingKey, setUploadingKey] = useState(null);

  // Normalize legacy string formats to object structure
  const rawLegal = draft.legal || {};
  const fixedPages = rawLegal.fixedPages || {};
  const customPages = Array.isArray(rawLegal.customPages) ? rawLegal.customPages : [];

  const updateFixedPdf = (key, docUrl) => {
    updateDraft({
      legal: {
        ...rawLegal,
        fixedPages: {
          ...fixedPages,
          [key]: {
            ...fixedPages[key],
            docUrl,
            pdfUrl: docUrl,
            isActive: fixedPages[key]?.isActive ?? true,
          },
        },
      },
    });
  };

  const removeFixedPdf = (key) => {
    updateDraft({
      legal: {
        ...rawLegal,
        fixedPages: {
          ...fixedPages,
          [key]: {
            ...fixedPages[key],
            docUrl: "",
            pdfUrl: "",
            isActive: fixedPages[key]?.isActive ?? true,
          },
        },
      },
    });
    toast.info("Document removed. Default formatted content will be shown.");
  };

  const toggleFixedActive = (key) => {
    const pageData = fixedPages[key] || {};
    const existingDoc = pageData.docUrl || pageData.pdfUrl || (typeof rawLegal[key] === 'string' ? rawLegal[key] : '');
    updateDraft({
      legal: {
        ...rawLegal,
        fixedPages: {
          ...fixedPages,
          [key]: {
            ...pageData,
            docUrl: existingDoc,
            pdfUrl: existingDoc,
            isActive: !(pageData.isActive ?? true),
          },
        },
      },
    });
  };

  const handleFileUpload = async (key, file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please select a valid PDF file (.pdf)");
      return;
    }

    setUploadingKey(key);
    try {
      const url = await uploadService.uploadFile(file, "legal");
      updateFixedPdf(key, url);
      toast.success("Document uploaded successfully. Remember to click Save Changes below.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload document");
    } finally {
      setUploadingKey(null);
    }
  };

  // ── Extra Custom Pages Handlers ──────────────────────────────────────────────
  const addCustomPage = () => {
    const newPage = {
      id: Date.now().toString(),
      name: "New Policy Page",
      slug: `custom-page-${customPages.length + 1}`,
      docUrl: "",
      pdfUrl: "",
      isActive: true,
    };
    updateDraft({
      legal: {
        ...rawLegal,
        customPages: [...customPages, newPage],
      },
    });
  };

  const updateCustomPage = (id, field, value) => {
    const updated = customPages.map((page) => {
      if (page.id !== id) return page;
      if (field === "name" && !page.slugEdited) {
        const autoSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        return { ...page, name: value, slug: autoSlug };
      }
      return { ...page, [field]: value };
    });
    updateDraft({
      legal: {
        ...rawLegal,
        customPages: updated,
      },
    });
  };

  const uploadCustomPdf = async (id, file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please select a valid PDF file (.pdf)");
      return;
    }

    setUploadingKey(id);
    try {
      const url = await uploadService.uploadFile(file, "legal");
      const updated = customPages.map((page) => {
        if (page.id !== id) return page;
        return { ...page, docUrl: url, pdfUrl: url };
      });
      updateDraft({
        legal: {
          ...rawLegal,
          customPages: updated,
        },
      });
      toast.success("Custom document uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload custom document");
    } finally {
      setUploadingKey(null);
    }
  };

  const deleteCustomPage = (id) => {
    const filtered = customPages.filter((p) => p.id !== id);
    updateDraft({
      legal: {
        ...rawLegal,
        customPages: filtered,
      },
    });
  };

  return (
    <div className="max-w-4xl space-y-8 text-xs">
      {/* Overview Banner */}
      <div className="p-4 bg-bg-surface border border-border-subtle rounded-2xl space-y-1 text-text-muted">
        <h3 className="text-sm font-bold text-text-base flex items-center gap-2">
          <FaFilePdf className="text-red-500" /> Legal & Policy Documents
        </h3>
        <p className="text-xs">
          Upload PDF documents for your store policy pages. The customer storefront will render these documents directly inside the clean reader.
        </p>
      </div>

      {/* Standard Legal Pages */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-base">Standard Legal Pages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FIXED_LEGAL_PAGES.map(({ key, label, path }) => {
            const pageData = fixedPages[key] || {};
            const docUrl = pageData.docUrl || pageData.pdfUrl || (typeof rawLegal[key] === "string" && rawLegal[key].startsWith("http") ? rawLegal[key] : "");
            const isActive = pageData.isActive ?? true;
            const isUploading = uploadingKey === key;

            return (
              <div key={key} className="bg-bg-surface border border-border-subtle rounded-2xl p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-text-base">{label}</h4>
                    <p className="text-[10px] text-text-muted font-mono">{path}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFixedActive(key)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                      isActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-bg-base text-text-subtle border border-border-subtle"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </button>
                </div>

                {docUrl ? (
                  <div className="flex items-center justify-between gap-2 p-2 bg-bg-base border border-border-subtle rounded-xl">
                    <div className="flex items-center gap-2 truncate">
                      <FaFilePdf className="text-red-500 shrink-0" size={14} />
                      <a href={docUrl} target="_blank" rel="noopener noreferrer" className="truncate font-semibold text-primary hover:underline text-[11px]">
                        View Document
                      </a>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <label className="text-[10px] font-bold text-text-muted hover:text-text-base cursor-pointer underline">
                        Replace
                        <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileUpload(key, e.target.files[0])} />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeFixedPdf(key)}
                        className="text-[10px] font-bold text-rose-400 hover:text-rose-300 cursor-pointer"
                        title="Remove uploaded document"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border-subtle hover:border-primary/50 bg-bg-base rounded-xl cursor-pointer text-text-muted hover:text-primary transition">
                    <FaFileUpload size={14} />
                    <span className="font-semibold text-[11px]">{isUploading ? "Uploading Document..." : "Upload Document (PDF)"}</span>
                    <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileUpload(key, e.target.files[0])} disabled={isUploading} />
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Extra Custom Pages */}
      <div className="space-y-4 pt-4 border-t border-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-base">Extra Legal & Custom Pages</h3>
            <p className="text-[11px] text-text-muted mt-0.5">Add custom policy pages (e.g. Warranty Policy, Affiliate Policy, Careers)</p>
          </div>
          <button
            type="button"
            onClick={addCustomPage}
            className="px-3 py-2 rounded-xl bg-primary text-compli text-xs font-bold hover:bg-primary-hover transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FaPlus size={10} /> Add Custom Page
          </button>
        </div>

        {customPages.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-border-subtle rounded-2xl text-text-muted">
            No extra legal pages created yet. Click "Add Custom Page" above to add one.
          </div>
        ) : (
          <div className="space-y-4">
            {customPages.map((page) => {
              const isUploading = uploadingKey === page.id;
              const docUrl = page.docUrl || page.pdfUrl || "";
              return (
                <div key={page.id} className="bg-bg-surface border border-border-subtle rounded-2xl p-4 space-y-3 shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Page Name</label>
                      <input
                        type="text"
                        value={page.name}
                        onChange={(e) => updateCustomPage(page.id, "name", e.target.value)}
                        placeholder="e.g. Warranty Policy"
                        className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle text-xs font-bold focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">URL Slug</label>
                      <div className="flex items-center gap-1 bg-bg-base border border-border-subtle rounded-xl px-3 py-2">
                        <span className="text-text-muted font-mono text-[10px]">/legal/</span>
                        <input
                          type="text"
                          value={page.slug}
                          onChange={(e) => {
                            updateCustomPage(page.id, "slugEdited", true);
                            updateCustomPage(page.id, "slug", e.target.value);
                          }}
                          placeholder="warranty-policy"
                          className="w-full text-xs font-mono font-bold text-text-base focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Upload area or view link */}
                  {docUrl ? (
                    <div className="flex items-center justify-between gap-2 p-2 bg-bg-base border border-border-subtle rounded-xl">
                      <div className="flex items-center gap-2 truncate">
                        <FaFilePdf className="text-red-500 shrink-0" size={14} />
                        <a href={docUrl} target="_blank" rel="noopener noreferrer" className="truncate font-semibold text-primary hover:underline text-[11px]">
                          View Document
                        </a>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <label className="text-[10px] font-bold text-text-muted hover:text-text-base cursor-pointer underline">
                          Replace
                          <input type="file" accept="application/pdf" className="hidden" onChange={(e) => uploadCustomPdf(page.id, e.target.files[0])} />
                        </label>
                        <button
                          type="button"
                          onClick={() => updateCustomPage(page.id, "docUrl", "")}
                          className="text-[10px] font-bold text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="flex items-center justify-center gap-2 p-2.5 border-2 border-dashed border-border-subtle hover:border-primary/50 bg-bg-base rounded-xl cursor-pointer text-text-muted hover:text-primary transition">
                        <FaFileUpload size={13} />
                        <span className="font-semibold text-[11px]">{isUploading ? "Uploading..." : "Upload Document (PDF)"}</span>
                        <input type="file" accept="application/pdf" className="hidden" onChange={(e) => uploadCustomPdf(page.id, e.target.files[0])} disabled={isUploading} />
                      </label>

                      <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                          Or Write Policy Text (Markdown / Formatted Text)
                        </label>
                        <textarea
                          value={page.content || ""}
                          onChange={(e) => updateCustomPage(page.id, "content", e.target.value)}
                          placeholder={`# ${page.name || "Policy"}\n\nEnter policy details, terms, conditions, or information here...`}
                          rows={3}
                          className="w-full px-3 py-2 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle text-xs font-mono focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle/50">
                    <button
                      type="button"
                      onClick={() => updateCustomPage(page.id, "isActive", !page.isActive)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                        page.isActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-bg-base text-text-subtle border border-border-subtle"
                      }`}
                    >
                      {page.isActive ? "Active" : "Inactive"}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteCustomPage(page.id)}
                      className="text-rose-400 hover:text-rose-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <FaTrash size={10} /> Delete Page
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
