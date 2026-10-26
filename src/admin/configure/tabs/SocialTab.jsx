import { DEFAULT_SOCIAL_LINKS } from "../../../services/configure/configureService";
import ToggleButton from "../../../components/Common/ToggleButton";

const PLATFORM_LABELS = {
    facebook: "Facebook",
    instagram: "Instagram",
    twitter: "X (Twitter)",
    youtube: "YouTube",
    linkedin: "LinkedIn",
    pinterest: "Pinterest",
};

export default function SocialTab({ draft, updateDraft }) {
    // Ensure all default platforms exist, preserve any existing values
    const links = DEFAULT_SOCIAL_LINKS.map((def) => {
        const existing = (draft.socialLinks || []).find((s) => s.platform === def.platform);
        return existing || def;
    });

    const update = (platform, field, value) => {
        const updated = links.map((s) =>
            s.platform === platform ? { ...s, [field]: value } : s
        );
        updateDraft({ socialLinks: updated });
    };

    return (
        <div className="max-w-9xl space-y-6">
            <p className="text-xs text-text-muted font-medium mb-2 pl-0.5">
                Toggle platforms on/off and paste the full profile URL. Only active platforms appear in the footer.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3  gap-4">
                {links.map((link) => (
                    <div
                        key={link.platform}
                        className={`flex flex-col gap-3.5 p-4 rounded-2xl border transition-all ${
                            link.isActive
                                ? "border-primary/40 bg-primary/10 shadow-xs"
                                : "border-border-subtle bg-bg-surface"
                        }`}
                    >
                        {/* Top Info and Toggle Row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <i className={`fa-brands ${link.icon} text-base w-5 text-center ${link.isActive ? "text-primary" : "text-text-muted"}`} />
                                <span className="text-sm font-bold text-text-base">
                                    {PLATFORM_LABELS[link.platform]}
                                </span>
                            </div>
                            
                            <ToggleButton
                                checked={Boolean(link.isActive)}
                                onChange={(val) => update(link.platform, "isActive", val)}
                                size="sm"
                                color="primary"
                            />
                        </div>

                        {/* Input URL (collapsible/visible when active) */}
                        {link.isActive && (
                            <input
                                type="text"
                                value={link.url || ""}
                                onChange={(e) => update(link.platform, "url", e.target.value)}
                                placeholder={
                                    link.platform === "whatsapp"
                                        ? "e.g. 919876543210 or https://wa.me/919876543210"
                                        : `https://${link.platform}.com/yourpage`
                                }
                                className="w-full h-11 px-4 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
