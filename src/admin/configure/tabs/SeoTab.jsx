const Input = ({ value, onChange, placeholder, type = "text" }) => (
    <input
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-11 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
    />
);

export default function SeoTab({ draft, updateDraft }) {
    const seo = draft.seo || {};

    const set = (key, value) => updateDraft({ seo: { ...seo, [key]: value } });

    return (
        <div className="max-w-2xl space-y-6">
            <p className="text-xs text-text-muted font-medium pl-0.5">
                Default SEO values applied across the site. Individual pages may override these.
            </p>

            <div className="space-y-5">
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-text-base uppercase tracking-wider pl-0.5">
                        Meta Title
                    </label>
                    <Input
                        value={seo.metaTitle}
                        onChange={(e) => set("metaTitle", e.target.value)}
                        placeholder=""
                    />
                    <p className="text-[10px] text-text-muted font-bold pl-0.5">{(seo.metaTitle || "").length}/60 chars recommended</p>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-bold text-text-base uppercase tracking-wider pl-0.5">
                        Meta Description
                    </label>
                    <textarea
                        value={seo.metaDescription || ""}
                        onChange={(e) => set("metaDescription", e.target.value)}
                        placeholder="Short description of your store for search engines..."
                        rows={3}
                        className="w-full p-4 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm font-medium leading-relaxed resize-none min-h-[100px]"
                    />
                    <p className="text-[10px] text-text-muted font-bold pl-0.5">{(seo.metaDescription || "").length}/160 chars recommended</p>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-bold text-text-base uppercase tracking-wider pl-0.5">
                        OG Image URL
                    </label>
                    <Input
                        value={seo.ogImageUrl}
                        onChange={(e) => set("ogImageUrl", e.target.value)}
                        placeholder="https://firebasestorage.googleapis.com/..."
                    />
                    <p className="text-[10px] text-text-muted font-bold pl-0.5">Image shown when the site is shared on social media. Recommended: 1200×630px.</p>
                    {seo.ogImageUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-border-subtle bg-bg-surface p-2 w-fit">
                            <img
                                src={seo.ogImageUrl}
                                alt="OG preview"
                                className="h-28 rounded-lg object-contain"
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-bold text-text-base uppercase tracking-wider pl-0.5">
                        Keywords
                    </label>
                    <Input
                        value={(seo.keywords || []).join(", ")}
                        onChange={(e) =>
                            set(
                                "keywords",
                                e.target.value
                                    .split(",")
                                    .map((k) => k.trim())
                                    .filter(Boolean)
                                    .slice(0, 15) // Limit keywords length
                            )
                        }
                        placeholder="handmade, portrait, custom gifts, art"
                    />
                    <p className="text-[10px] text-text-muted font-bold pl-0.5">Comma-separated keywords.</p>
                </div>
            </div>
        </div>
    );
}
