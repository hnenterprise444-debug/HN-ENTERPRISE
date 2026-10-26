import React, { useState, useEffect, useCallback } from "react";
import { FaHome, FaBriefcase, FaMapPin, FaPlus, FaEdit, FaTrash, FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { userService } from "../../../services/user/userService";
import AddressFormModal from "../../../components/modal/AddressFormModal";
import { getFriendlyErrorMessage } from "../../../utils/firebaseErrorHandler.js";

const TYPE_ICONS = {
  HOME: <FaHome size={11} />,
  OFFICE: <FaBriefcase size={11} />,
  WORK: <FaBriefcase size={11} />,
  OTHER: <FaMapPin size={11} />,
};

export default function AddressTab({ profile, uid: propUid }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const uid = propUid || profile?.uid || profile?.docId;

  const loadAddresses = useCallback(async () => {
    if (!uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const addrs = await userService.getAddresses(uid);
      setAddresses(addrs || []);
    } catch (err) {
      console.error("Error loading addresses in AddressTab:", err);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleAdd = async (formData) => {
    if (!uid) {
      toast.error("User ID not found.");
      return;
    }
    try {
      const res = await userService.addAddress(uid, formData);
      const updatedList = res?.addresses || (await userService.getAddresses(uid));
      setAddresses(updatedList);
      setModalOpen(false);
      toast.success("Address added successfully!");
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err, "Failed to add address."));
    }
  };

  const handleUpdate = async (addressId, formData) => {
    if (!uid) return;
    try {
      const res = await userService.updateAddress(uid, addressId, formData);
      const updatedList = res?.addresses || (await userService.getAddresses(uid));
      setAddresses(updatedList);
      setModalOpen(false);
      setEditingAddress(null);
      toast.success("Address updated successfully!");
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err, "Failed to update address."));
    }
  };

  const handleSetDefault = async (addressId) => {
    if (!uid) return;
    try {
      const updatedAddrs = await userService.setDefaultAddress(uid, addressId);
      setAddresses(updatedAddrs);
      toast.success("Default address updated!");
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err, "Failed to update default address."));
    }
  };

  const handleDelete = async (addressId) => {
    if (!uid) return;
    try {
      const updatedAddrs = await userService.deleteAddress(uid, addressId);
      setAddresses(updatedAddrs || []);
      toast.success("Address removed.");
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err, "Failed to delete address."));
    }
  };

  return (
    <div className="space-y-3.5 text-xs">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-1.5 border-b border-border-subtle">
        <div>
          <h3 className="text-sm font-extrabold text-text-base">Delivery Addresses</h3>
          <p className="text-[10px] text-text-muted mt-0.5">Manage saved shipping addresses for instant checkout</p>
        </div>
        <button
          onClick={() => {
            setEditingAddress(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-compli text-xs font-extrabold shadow-2xs transition-all active:scale-95 cursor-pointer"
        >
          <FaPlus size={9} />
          Add New Address
        </button>
      </div>

      {/* Address List */}
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-card border border-border-subtle animate-pulse rounded-xl" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-3 border-2 border-dashed border-border-subtle rounded-2xl text-center bg-card">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
            <FaMapPin size={16} />
          </div>
          <p className="text-xs font-bold text-text-base mb-0.5">No Saved Addresses</p>
          <p className="text-[11px] text-text-muted max-w-xs mb-3">Add your shipping address so you can use it seamlessly during checkout.</p>
          <button
            onClick={() => {
              setEditingAddress(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-compli text-xs font-bold shadow-2xs hover:bg-primary-hover transition-all cursor-pointer"
          >
            <FaPlus size={10} />
            Add Address Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {addresses.map((addr) => (
            <div
              key={addr.addressId}
              className="relative p-3 sm:p-3.5 rounded-xl border border-border-subtle bg-bg-surface hover:bg-card-hover hover:border-primary/40 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-xs sm:text-sm text-text-base">{addr.fullName}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-primary/10 text-primary border border-primary/20">
                    {TYPE_ICONS[addr.addressType] || TYPE_ICONS.OTHER}
                    {addr.addressType || "HOME"}
                  </span>
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <FaCheckCircle size={8} /> Default
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-text-muted leading-snug">
                  {addr.houseNo && `${addr.houseNo}, `}
                  {addr.street}
                  {addr.landmark && `, Near ${addr.landmark}`}
                  {addr.city && `, ${addr.city}`}
                  {addr.state && `, ${addr.state}`} - <span className="font-bold text-text-base">{addr.pincode}</span>
                </p>
                <p className="text-[10px] font-semibold text-text-muted">Phone: <span className="text-text-base">{addr.phone}</span></p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 flex-shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border-subtle">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.addressId)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border-subtle text-text-muted hover:text-emerald-400 hover:border-emerald-500/40 transition text-[11px] font-semibold cursor-pointer"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingAddress(addr);
                    setModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border-subtle text-text-muted hover:text-primary hover:border-primary transition text-[11px] font-semibold cursor-pointer"
                >
                  <FaEdit size={10} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.addressId)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border-subtle text-text-muted hover:text-rose-400 hover:border-rose-500/40 transition text-[11px] font-semibold cursor-pointer"
                >
                  <FaTrash size={9} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal for Add/Edit */}
      <AddressFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAddress(null);
        }}
        initialData={editingAddress}
        onSubmit={editingAddress ? (data) => handleUpdate(editingAddress.addressId, data) : handleAdd}
      />
    </div>
  );
}
