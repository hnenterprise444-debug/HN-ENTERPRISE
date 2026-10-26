import React, { useState } from "react";
import { FaUser, FaCopy, FaCheck, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function OrderCustomerInfoSection({
  customerName,
  customerPhone,
  customerEmail,
  addressType,
  fullStreet,
  city,
  state,
  pincode,
  copyToClipboard
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);
  const [addrCopied, setAddrCopied] = useState(false);

  const handleCopyPhone = (e) => {
    e.stopPropagation();
    copyToClipboard(customerPhone, "Phone number copied!");
    setPhoneCopied(true);
    setTimeout(() => setPhoneCopied(false), 2000);
  };

  const handleCopyAddr = (e) => {
    e.stopPropagation();
    const fullAddrStr = `${fullStreet}, ${city}, ${state} - ${pincode}`;
    copyToClipboard(fullAddrStr, "Full address copied!");
    setAddrCopied(true);
    setTimeout(() => setAddrCopied(false), 2000);
  };

  return (
    <div className="bg-card p-5 rounded-2xl border border-border-subtle shadow-xs space-y-4 text-xs transition-all">
      <div 
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex items-center justify-between pb-3 border-b border-border-subtle/70 cursor-pointer select-none group"
      >
        <h2 className="text-sm font-black text-text-base flex items-center gap-2">
          <FaUser className="text-primary" /> Customer Details
        </h2>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
            {addressType}
          </span>
          <button
            type="button"
            aria-label={isExpanded ? "Collapse customer details" : "Expand customer details"}
            className="p-1 text-text-muted group-hover:text-primary transition-colors cursor-pointer"
          >
            {isExpanded ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3.5">
        {/* Customer Name */}
        <div>
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
            Customer Name
          </label>
          <p className="font-black text-text-base text-sm">{customerName}</p>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
              Contact Phone
            </label>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-bg-base border border-border-subtle/70">
              <span className="font-extrabold text-text-base flex items-center gap-1.5">
                <FaPhoneAlt size={10} className="text-primary" />
                {customerPhone}
              </span>
              {customerPhone !== "N/A" && (
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="text-text-muted hover:text-primary transition p-1 cursor-pointer"
                  title="Copy Phone"
                >
                  {phoneCopied ? <FaCheck className="text-emerald-500" size={11} /> : <FaCopy size={11} />}
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <div className="p-2.5 rounded-xl bg-bg-base border border-border-subtle/70 font-semibold text-text-base truncate flex items-center gap-1.5">
              <FaEnvelope size={10} className="text-primary shrink-0" />
              <span className="truncate">{customerEmail}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
            Shipping Address
          </label>
          <div className="p-3.5 rounded-xl bg-bg-base border border-border-subtle/70 space-y-1.5 text-[11.5px] leading-relaxed">
            <p className="font-extrabold text-text-base flex items-start gap-1.5">
              <FaMapMarkerAlt size={12} className="text-primary mt-0.5 shrink-0" />
              <span>{fullStreet}</span>
            </p>
            <p className="text-text-muted pl-4">
              {city}, {state} - <strong className="text-text-base font-mono">{pincode}</strong>
            </p>

            <button
              type="button"
              onClick={handleCopyAddr}
              className="flex items-center gap-1 text-[10.5px] font-bold text-primary hover:underline pt-1.5 pl-4 cursor-pointer"
            >
              {addrCopied ? <FaCheck size={10} className="text-emerald-500" /> : <FaCopy size={10} />}
              <span>{addrCopied ? "Copied!" : "Copy Full Address"}</span>
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
