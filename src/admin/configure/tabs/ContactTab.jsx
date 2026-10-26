import React from "react";
import { FaPlus, FaTrash, FaWhatsapp, FaExternalLinkAlt } from "react-icons/fa";
import ToggleButton from "../../../components/Common/ToggleButton";

const Input = ({ value, onChange, placeholder, type = "text" }) => (
    <input
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-11 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
    />
);

const SectionHeader = ({ title, desc }) => (
    <div className="pb-3 border-b border-border-subtle mb-4">
        <h3 className="text-sm font-extrabold text-text-base">{title}</h3>
        {desc && <p className="text-xs text-text-muted mt-1 font-medium">{desc}</p>}
    </div>
);

export default function ContactTab({ draft, updateDraft }) {
    const address = draft.address || {};
    const phones = draft.phones || [];
    const emails = draft.emails || [];
    const whatsappModal = draft.whatsappModal || {
        enabled: true,
        phoneNumber: "",
        message: "",
    };

    const setAddress = (field, value) =>
        updateDraft({ address: { ...address, [field]: value } });

    const updateWhatsappModal = (field, value) => {
        updateDraft({
            whatsappModal: {
                ...whatsappModal,
                [field]: value,
            },
        });
    };

    const addPhone = () =>
        updateDraft({ phones: [...phones, { label: "", number: "", isWhatsapp: false }] });
    const removePhone = (i) =>
        updateDraft({ phones: phones.filter((_, idx) => idx !== i) });
    const updatePhone = (i, field, value) => {
        const updated = [...phones];
        updated[i] = { ...updated[i], [field]: value };
        updateDraft({ phones: updated });
    };

    const addEmail = () =>
        updateDraft({ emails: [...emails, { label: "", email: "" }] });
    const removeEmail = (i) =>
        updateDraft({ emails: emails.filter((_, idx) => idx !== i) });
    const updateEmail = (i, field, value) => {
        const updated = [...emails];
        updated[i] = { ...updated[i], [field]: value };
        updateDraft({ emails: updated });
    };

    return (
        <div className="max-w-9xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                
                {/* Left Column: Address Details & Dedicated WhatsApp Modal Form */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <SectionHeader title="Address Details" desc="Physical location shown in the footer." />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input value={address.line1} onChange={(e) => setAddress("line1", e.target.value)} placeholder="Street address line 1" />
                            <Input value={address.line2} onChange={(e) => setAddress("line2", e.target.value)} placeholder="Landmark / line 2 (optional)" />
                            <Input value={address.city} onChange={(e) => setAddress("city", e.target.value)} placeholder="City" />
                            <Input value={address.state} onChange={(e) => setAddress("state", e.target.value)} placeholder="State" />
                            <Input value={address.pincode} onChange={(e) => setAddress("pincode", e.target.value)} placeholder="PIN Code" />
                            <Input value={address.country} onChange={(e) => setAddress("country", e.target.value)} placeholder="Country" />
                        </div>
                        <Input value={address.mapUrl} onChange={(e) => setAddress("mapUrl", e.target.value)} placeholder="Google Maps embed URL (optional)" />
                    </div>

                    {/* Dedicated WhatsApp Modal Form */}
                    <div className="space-y-4">
                        <SectionHeader 
                            title="WhatsApp Floating Widget / Modal" 
                            desc="Configure the dedicated WhatsApp chat button that floats across your website." 
                        />

                        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 sm:p-5 flex flex-col gap-5 shadow-xs">
                            {/* Card Header with Icon, Title, and Enable Toggle */}
                            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-[#25D366] flex items-center justify-center text-lg">
                                        <FaWhatsapp />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-extrabold text-text-base uppercase tracking-wider">
                                            Floating WhatsApp Button
                                        </h4>
                                        <p className="text-[11px] text-text-muted font-medium">
                                            {whatsappModal.enabled !== false ? "Active on website" : "Hidden from website"}
                                        </p>
                                    </div>
                                </div>

                                <ToggleButton
                                    checked={whatsappModal.enabled !== false}
                                    onChange={(val) => updateWhatsappModal("enabled", val)}
                                    size="sm"
                                    color="success"
                                />
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5">
                                        Dedicated WhatsApp Number
                                    </label>
                                    <Input
                                        value={whatsappModal.phoneNumber}
                                        onChange={(e) => updateWhatsappModal("phoneNumber", e.target.value)}
                                        placeholder="e.g. +91 98765 43210 or 9876543210"
                                    />
                                    <p className="text-[11px] text-text-muted font-normal pl-0.5">
                                        Only used for the floating WhatsApp button. When set, it will no longer take the first phone number.
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5">
                                        Prefilled Inquiry Message (Optional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={whatsappModal.message || ""}
                                        onChange={(e) => updateWhatsappModal("message", e.target.value)}
                                        placeholder="e.g. Hi, I would like to inquire about your products and services."
                                        className="w-full rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle p-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
                                    />
                                    <p className="text-[11px] text-text-muted font-normal pl-0.5">
                                        Pre-populates the customer's text message when clicking the WhatsApp button.
                                    </p>
                                </div>

                                {/* Live preview link when number is set */}
                                {whatsappModal.phoneNumber && (
                                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium truncate">
                                            <FaWhatsapp className="shrink-0 text-base text-[#25D366]" />
                                            <span className="truncate">
                                                Target: wa.me/{whatsappModal.phoneNumber.replace(/\D/g, "")}
                                            </span>
                                        </div>
                                        <a
                                            href={`https://wa.me/${whatsappModal.phoneNumber.replace(/\D/g, "").length === 10 ? `91${whatsappModal.phoneNumber.replace(/\D/g, "")}` : whatsappModal.phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappModal.message || "Hi, I would like to inquire about your products.")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold shrink-0 transition-colors"
                                        >
                                            <span>Test Link</span>
                                            <FaExternalLinkAlt className="text-[10px]" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Contact Lists */}
                <div className="space-y-8">
                    
                    {/* Phones */}
                    <div className="space-y-4">
                        <SectionHeader title="Phone Numbers" desc="All numbers shown in footer contact section." />
                        
                        <div className="space-y-4">
                            {phones.map((p, i) => (
                                <div key={i} className="bg-bg-surface border border-border-subtle rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xs">
                                    {/* Card Header with Label & Delete */}
                                    <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                                        <span className="text-xs font-extrabold text-text-muted uppercase tracking-wider">Phone #{i + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => removePhone(i)}
                                            className="h-8 w-8 rounded-lg bg-card border border-border-subtle hover:bg-rose-500/20 text-rose-400 flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                                            title="Remove Phone"
                                        >
                                            <FaTrash size={12} />
                                        </button>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5">Label</label>
                                             <Input value={p.label} onChange={(e) => updatePhone(i, "label", e.target.value)} placeholder="e.g. Sales, Support" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5">Phone Number</label>
                                            <Input value={p.number} onChange={(e) => updatePhone(i, "number", e.target.value)} placeholder="+91 98765 43210" />
                                        </div>
                                    </div>

                                    {/* WhatsApp Option */}
                                    <div className="flex items-center justify-between pt-2 border-t border-border-subtle/50">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={p.isWhatsapp}
                                                onChange={(e) => updatePhone(i, "isWhatsapp", e.target.checked)}
                                                className="w-4 h-4 accent-primary rounded cursor-pointer"
                                            />
                                            <span className="text-xs font-bold text-text-base">WhatsApp enabled</span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addPhone}
                            className="w-full h-11 border-2 border-dashed border-border-subtle hover:border-primary/50 bg-bg-base rounded-xl text-xs sm:text-sm text-text-muted hover:text-primary transition font-bold flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <FaPlus className="text-xs" /> Add Phone Number
                        </button>
                    </div>

                    {/* Emails */}
                    <div className="space-y-4">
                        <SectionHeader title="Email Addresses" desc="Contact emails shown in footer." />
                        
                        <div className="space-y-4">
                            {emails.map((e, i) => (
                                <div key={i} className="bg-bg-surface border border-border-subtle rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xs">
                                    {/* Card Header with Label & Delete */}
                                    <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                                        <span className="text-xs font-extrabold text-text-muted uppercase tracking-wider">Email #{i + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeEmail(i)}
                                            className="h-8 w-8 rounded-lg bg-card border border-border-subtle hover:bg-rose-500/20 text-rose-400 flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                                            title="Remove Email"
                                        >
                                            <FaTrash size={12} />
                                        </button>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5">Label</label>
                                            <Input value={e.label} onChange={(ev) => updateEmail(i, "label", ev.target.value)} placeholder="e.g. Enquiries, Support" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5">Email Address</label>
                                            <Input value={e.email} onChange={(ev) => updateEmail(i, "email", ev.target.value)} placeholder="support@example.com" type="email" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addEmail}
                            className="w-full h-11 border-2 border-dashed border-border-subtle hover:border-primary/50 bg-bg-base rounded-xl text-xs sm:text-sm text-text-muted hover:text-primary transition font-bold flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <FaPlus className="text-xs" /> Add Email Address
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}
