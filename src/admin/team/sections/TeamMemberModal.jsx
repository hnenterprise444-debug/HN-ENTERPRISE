import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaCamera, FaSpinner } from "react-icons/fa";
import { uploadService } from "../../../services/upload/uploadService";
import { toast } from "react-toastify";

export default function TeamMemberModal({
  isOpen,
  onClose,
  onSave,
  memberToEdit = null,
  saving = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    phone: "",
    photo: "",
    bio: "",
    isLeadership: false,
    status: "Active",
    displayOrder: 1,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        name: memberToEdit.name || "",
        designation: memberToEdit.designation || "",
        phone: memberToEdit.phone || "",
        photo: memberToEdit.photo || "",
        bio: memberToEdit.bio || "",
        isLeadership: Boolean(memberToEdit.isLeadership),
        status: memberToEdit.status || "Active",
        displayOrder: memberToEdit.displayOrder ?? 1,
      });
    } else {
      setFormData({
        name: "",
        designation: "",
        phone: "",
        photo: "",
        bio: "",
        isLeadership: false,
        status: "Active",
        displayOrder: 1,
      });
    }
  }, [memberToEdit, isOpen]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || typeof document === "undefined" || !document.body) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be under 5MB");
      return;
    }

    try {
      setUploadingImage(true);
      setUploadProgress(0);
      let url;
      try {
        url = await uploadService.uploadCompanyAsset(file, (prog) => {
          setUploadProgress(prog);
        });
      } catch (err1) {
        if (err1?.code === "storage/unauthorized") {
          url = await uploadService.uploadProductImage(file, (prog) => {
            setUploadProgress(prog);
          });
        } else {
          throw err1;
        }
      }
      setFormData((prev) => ({ ...prev, photo: url }));
      toast.success("Portrait photo uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      if (err?.code === "storage/unauthorized") {
        toast.error("Firebase Storage permissions restricted. You can paste an image URL directly into the Photo URL field.");
      } else {
        toast.error("Failed to upload image. Please try an image URL or smaller file.");
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter member name.");
      return;
    }
    if (!formData.designation.trim()) {
      toast.error("Please enter member designation/role.");
      return;
    }
    onSave(formData);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="min-h-full flex items-center justify-center py-6 sm:py-8">
        <div
          className="relative w-full max-w-lg rounded-2xl md:rounded-3xl bg-card border border-border-subtle shadow-2xl p-6 sm:p-7 space-y-5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div>
              <h3 className="text-lg font-bold text-text-base">
                {memberToEdit ? "Edit Team Member" : "Add Team Member"}
              </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Enter staff details to display on the store homepage.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-base hover:bg-card-hover transition cursor-pointer"
            aria-label="Close modal"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Portrait Photo preview & upload */}
          <div>
            <label className="block text-xs font-bold text-text-base mb-1.5">
              Portrait Photo
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-bg-base border border-border-subtle shrink-0">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-text-muted text-[10px]">
                    <FaCamera size={18} className="mb-1 opacity-50" />
                    <span>No Photo</span>
                  </div>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-primary text-[10px]">
                    <FaSpinner className="animate-spin text-sm mb-1" />
                    <span>{uploadProgress}%</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-card-hover border border-border-subtle hover:border-primary/40 text-text-base cursor-pointer transition shadow-2xs">
                    <FaCamera size={12} className="text-primary" />
                    <span>{formData.photo ? "Change Photo" : "Upload Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                  {formData.photo && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, photo: "" }))}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-card border border-border-subtle text-text-muted hover:text-error transition cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-text-muted/70">
                  PNG, JPG, or WebP up to 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Name & Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-text-base mb-1">
                Full Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Tanmay Roy"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl bg-bg-base border border-border-subtle text-text-base placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-base mb-1">
                Designation / Role <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                name="designation"
                required
                placeholder="e.g. Architectural Consultant"
                value={formData.designation}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl bg-bg-base border border-border-subtle text-text-base placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          {/* Phone & Display Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-text-base mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl bg-bg-base border border-border-subtle text-text-base placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-base mb-1">
                Display Order
              </label>
              <input
                type="number"
                name="displayOrder"
                min="1"
                max="999"
                value={formData.displayOrder}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl bg-bg-base border border-border-subtle text-text-base focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          {/* Short Bio / Description */}
          <div>
            <label className="block text-xs font-bold text-text-base mb-1">
              Short Description / Bio
            </label>
            <textarea
              name="bio"
              rows="2"
              placeholder="Brief note about the member's specialization or role..."
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs rounded-xl bg-bg-base border border-border-subtle text-text-base placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition resize-none"
            />
          </div>

          {/* Checkboxes: Leadership & Status */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isLeadership"
                checked={formData.isLeadership}
                onChange={handleChange}
                className="rounded border-border-subtle text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-semibold text-text-base">
                Leadership / Founder Role
              </span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-muted">Status:</span>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="px-2.5 py-1 text-xs rounded-lg bg-bg-base border border-border-subtle text-text-base focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-card-hover hover:bg-card border border-border-subtle text-text-muted hover:text-text-base transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-primary hover:bg-primary-hover text-[#090909] shadow-xs active:scale-95 transition cursor-pointer disabled:opacity-50"
            >
              {saving && <FaSpinner className="animate-spin text-xs" />}
              <span>{memberToEdit ? "Update Member" : "Save Member"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>,
  document.body
);
}
