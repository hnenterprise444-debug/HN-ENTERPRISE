import React, { useState, useEffect } from "react";

const INPUT_CLS = "w-full px-4 py-3 rounded-xl border border-border-subtle bg-bg-base text-text-base placeholder:text-text-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition text-sm";
const LABEL_CLS = "block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wide";

const EMPTY_FORM = { fullName: "", phone: "", houseNo: "", street: "", landmark: "", city: "", state: "", pincode: "", addressType: "HOME", isDefault: false };

export default function AddressFormModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) setForm(initialData ? { ...EMPTY_FORM, ...initialData } : EMPTY_FORM);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) e.phone = "Valid 10-digit phone required";
    if (!form.houseNo.trim()) e.houseNo = "House/Flat No. is required";
    if (!form.street.trim()) e.street = "Street/Area is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode.trim())) e.pincode = "Valid 6-digit pincode required";
    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border-subtle rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle sticky top-0 bg-card z-10">
          <h2 className="text-lg font-bold text-text-base">{initialData ? "Edit Address" : "Add New Address"}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-base p-1 rounded-lg hover:bg-bg-base transition cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLS}>Full Name *</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter full name" className={INPUT_CLS} />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label className={LABEL_CLS}>Phone Number *</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit number" maxLength={10} className={INPUT_CLS} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLS}>House / Flat No. *</label>
              <input name="houseNo" value={form.houseNo} onChange={handleChange} placeholder="e.g. B-204, Tower 3" className={INPUT_CLS} />
              {errors.houseNo && <p className="text-red-500 text-xs mt-1">{errors.houseNo}</p>}
            </div>
            <div>
              <label className={LABEL_CLS}>Street / Area / Colony *</label>
              <input name="street" value={form.street} onChange={handleChange} placeholder="Street name or locality" className={INPUT_CLS} />
              {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
            </div>
          </div>

          <div>
            <label className={LABEL_CLS}>Landmark (Optional)</label>
            <input name="landmark" value={form.landmark} onChange={handleChange} placeholder="Near, Opposite, Beside..." className={INPUT_CLS} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className={LABEL_CLS}>City *</label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="City" className={INPUT_CLS} />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className={LABEL_CLS}>State *</label>
              <input name="state" value={form.state} onChange={handleChange} placeholder="State" className={INPUT_CLS} />
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
            </div>
            <div>
              <label className={LABEL_CLS}>Pincode *</label>
              <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit" maxLength={6} className={INPUT_CLS} />
              {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
            </div>
          </div>

          <div>
            <label className={LABEL_CLS}>Address Type</label>
            <div className="flex gap-3 flex-wrap">
              {["HOME", "OFFICE", "OTHER"].map((type) => (
                <button key={type} type="button" onClick={() => setForm((p) => ({ ...p, addressType: type }))}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${form.addressType === type ? "bg-primary text-compli border-primary shadow-xs" : "border-border-subtle bg-bg-base text-text-muted hover:border-primary hover:text-text-base"}`}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div
            className="flex items-center gap-3 cursor-pointer select-none py-1"
            onClick={() => setForm((p) => ({ ...p, isDefault: !p.isDefault }))}
          >
            <div className={`relative w-10 h-6 rounded-full transition-colors ${form.isDefault ? "bg-primary" : "bg-border-subtle"}`}>
              <div className={`absolute top-1 w-4 h-4 bg-compli rounded-full shadow transition-transform ${form.isDefault ? "translate-x-5" : "translate-x-1"}`} />
            </div>
            <span className="text-sm font-medium text-text-base">Set as default address</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-border-subtle text-text-muted font-semibold hover:bg-bg-base hover:text-text-base transition cursor-pointer">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-3 rounded-xl bg-primary hover:bg-primary-hover text-compli font-black transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-md">
              {saving && <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="3" className="opacity-25"/><path d="M4 12a8 8 0 018-8" strokeWidth="3" className="opacity-75"/></svg>}
              {saving ? "Saving..." : initialData ? "Update Address" : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
