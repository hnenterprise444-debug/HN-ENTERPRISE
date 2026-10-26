import React from "react";
import AddressFormModal from "../components/AddressFormModal";

export default function AddressSection({
  addresses, selectedAddressId, addressLoading, addressFormOpen, editingAddress,
  onSelectAddress, onAddAddress, onUpdateAddress, onSetDefault, onOpenForm, onCloseForm, onDelete,
}) {
  return (
    <section className="bg-card rounded-xl shadow-sm border border-border-subtle overflow-hidden">
      {/* Section Header */}
      <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between bg-bg-surface">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="font-bold text-sm text-text-base">Delivery Address</h2>
          </div>
        </div>
        <button
          onClick={() => onOpenForm(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-primary hover:text-primary-hover font-bold text-xs transition cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add New Address
        </button>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {addressLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-bg-surface animate-pulse rounded-xl border border-border-subtle" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl border-2 border-dashed border-border-subtle bg-bg-surface">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
              <span className="material-symbols-outlined text-[28px]">location_on</span>
            </div>
            <h3 className="font-bold text-text-base mb-1">No Saved Addresses Found</h3>
            <p className="text-text-muted text-xs mb-5 max-w-xs mx-auto">Please add a shipping address to proceed with order delivery.</p>
            <button
              onClick={() => onOpenForm(null)}
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-compli rounded-xl font-bold transition shadow-lg shadow-primary/20 text-xs cursor-pointer"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => {
              const isSelected = addr.addressId === selectedAddressId;
              return (
                <div
                  key={addr.addressId}
                  onClick={() => onSelectAddress(addr.addressId)}
                  className={`relative group rounded-xl border-2 py-3 px-4 transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border-subtle hover:border-primary/40 bg-bg-surface"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="mt-1">
                        {isSelected ? (
                          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                            radio_button_checked
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-text-subtle opacity-40">
                            radio_button_unchecked
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-bold text-text-base text-base">{addr.fullName}</span>
                          <span className="px-3 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider border border-primary/20">
                            {addr.addressType || "Home"}
                          </span>
                          {addr.isDefault && (
                            <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] uppercase tracking-wider">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-muted leading-relaxed max-w-md">
                          {addr.houseNo && `${addr.houseNo}, `}{addr.street}
                          {addr.landmark && `, Near ${addr.landmark}`}
                          {addr.city && `, ${addr.city}`}{addr.state && `, ${addr.state}`} - <span className="font-bold text-text-base">{addr.pincode}</span>
                        </p>
                        <div className="flex items-center gap-2 text-text-base text-xs font-semibold mt-1">
                          <span className="material-symbols-outlined text-[18px] opacity-40">call</span>
                          <span>{addr.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!addr.isDefault && onSetDefault && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onSetDefault(addr.addressId); }}
                          title="Set as Default Address"
                          className="px-2.5 py-1 rounded-lg border border-border-subtle text-text-muted hover:text-emerald-400 hover:border-emerald-500/40 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onOpenForm(addr); }}
                        title="Edit Address"
                        className="p-1.5 rounded-lg hover:bg-card-hover transition-colors text-text-muted hover:text-primary cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDelete(addr.addressId); }}
                        title="Delete Address"
                        className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors text-text-muted cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddressFormModal
        isOpen={addressFormOpen}
        onClose={onCloseForm}
        initialData={editingAddress}
        onSubmit={editingAddress
          ? (data) => onUpdateAddress(editingAddress.addressId, data)
          : onAddAddress}
      />
    </section>
  );
}


