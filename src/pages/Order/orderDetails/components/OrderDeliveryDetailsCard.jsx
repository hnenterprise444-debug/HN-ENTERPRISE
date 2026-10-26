import React from "react";
import { FaBuilding, FaHome, FaUser } from "react-icons/fa";

/**
 * OrderDeliveryDetailsCard Component
 * Displays recipient name, phone, and structured delivery address.
 */
export default function OrderDeliveryDetailsCard({ order }) {
  const address = order?.addressInfo || order?.address || order?.shippingAddress || {};
  const recipientName = address.name || address.fullName || order?.userName || "Valued Customer";
  const phone = address.phoneNumber || address.phone || address.mobileNumber || order?.phone || "";

  // Structured address
  const street = address.address || address.street || address.addressLine1 || "";
  const landmark = address.landmark || address.addressLine2 || "";
  const city = address.city || "";
  const state = address.state || "";
  const pincode = address.pincode || address.pinCode || address.postalCode || "";
  const addressType = (address.addressType || "Home").toUpperCase();

  const fullAddress = [street, landmark, city, state ? `${state} - ${pincode}` : pincode]
    .filter(Boolean)
    .join(", ");

  const isWork = addressType === "WORK" || addressType === "OFFICE";

  return (
    <div className="bg-card border border-border-subtle rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      <h3 className="text-sm sm:text-base font-bold text-text-base">
        Delivery details
      </h3>

      <div className="space-y-3.5 text-xs text-text-base">
        {/* Address Row with Building/Home Icon */}
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-lg bg-bg-base text-text-muted flex items-center justify-center shrink-0 mt-0.5 border border-border-subtle">
            {isWork ? <FaBuilding size={11} /> : <FaHome size={11} />}
          </div>
          <div className="min-w-0 flex-1 leading-relaxed">
            <span className="font-extrabold text-text-base mr-1.5 inline-block">
              {address.addressType || "Home"}
            </span>
            <span className="text-text-muted">
              {fullAddress || "Address provided during checkout."}
            </span>
          </div>
        </div>

        {/* Recipient & Phone Row with User Icon */}
        <div className="flex items-center gap-3 pt-1 border-t border-border-subtle">
          <div className="w-6 h-6 rounded-lg bg-bg-base text-text-muted flex items-center justify-center shrink-0 border border-border-subtle">
            <FaUser size={11} />
          </div>
          <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
            <span className="font-bold text-text-base">{recipientName}</span>
            {phone && (
              <span className="font-mono text-text-muted font-medium">{phone}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
