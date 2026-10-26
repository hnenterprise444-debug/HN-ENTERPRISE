import React, { useState } from "react";
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaCheck, FaSpinner } from "react-icons/fa";

export default function ProfileTab({ profile, setProfile, handleSaveProfile, saving }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...profile });

  const handleStartEdit = () => {
    setTempProfile({ ...profile });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setProfile({ ...tempProfile });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    await handleSaveProfile();
    setIsEditing(false);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
        <div>
          <h3 className="text-base font-bold text-text-base">Profile Information</h3>
          <p className="text-[11px] text-text-muted mt-0.5">Manage your personal Details</p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleStartEdit}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition active:scale-95 cursor-pointer border border-primary/20"
          >
            <FaEdit size={12} />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Mode A: Clean Read-Only Summary View */}
      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Full Name */}
          <div className="p-3 rounded-xl bg-bg-surface border border-border-subtle space-y-1">
            <div className="flex items-center gap-1.5 text-text-subtle text-[10px] font-bold uppercase tracking-wider">
              <FaUser size={11} className="text-primary" />
              <span>Full Name</span>
            </div>
            <p className="font-semibold text-sm text-text-base pl-5">
              {profile.name || <span className="italic text-text-muted font-normal">Not provided</span>}
            </p>
          </div>

          {/* Email Address */}
          <div className="p-3 rounded-xl bg-bg-surface border border-border-subtle space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-text-subtle text-[10px] font-bold uppercase tracking-wider">
                <FaEnvelope size={11} className="text-primary" />
                <span>Email Address</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                Primary
              </span>
            </div>
            <p className="font-semibold text-sm text-text-base pl-5 truncate" title={profile.email}>
              {profile.email || <span className="italic text-text-muted font-normal">Not added</span>}
            </p>
          </div>

          {/* Phone Number */}
          <div className="p-3 rounded-xl bg-bg-surface border border-border-subtle space-y-1">
            <div className="flex items-center gap-1.5 text-text-subtle text-[10px] font-bold uppercase tracking-wider">
              <FaPhone size={11} className="text-primary" />
              <span>Phone Number</span>
            </div>
            <p className="font-semibold text-sm text-text-base pl-5">
              {profile.phone || <span className="italic text-text-muted font-normal">Not added</span>}
            </p>
          </div>
        </div>
      ) : (
        /* Mode B: Edit Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Full Name Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative flex items-center">
                <FaUser className="absolute left-3.5 text-text-muted text-xs pointer-events-none z-10" />
                <input
                  type="text"
                  value={profile.name || ""}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-border-subtle bg-bg-base text-text-base text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Email Address Input (Disabled / Primary) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Email Address
                </label>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-bg-base border border-border-subtle text-text-subtle px-1.5 py-0.5 rounded">
                  Primary
                </span>
              </div>
              <div className="relative flex items-center">
                <FaEnvelope className="absolute left-3.5 text-text-muted text-xs pointer-events-none z-10" />
                <input
                  type="email"
                  value={profile.email || ""}
                  disabled
                  placeholder="yourname@example.com"
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-border-subtle bg-bg-base text-text-subtle text-sm font-semibold cursor-not-allowed opacity-75 focus:outline-none"
                />
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative flex items-center">
                <FaPhone className="absolute left-3.5 text-text-muted text-xs pointer-events-none z-10" />
                <input
                  type="text"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-border-subtle bg-bg-base text-text-base text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Edit Actions Bar */}
          <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={saving}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-border-subtle text-text-base font-bold text-xs hover:bg-card-hover transition cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-compli text-xs font-bold shadow-2xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" size={11} />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <FaCheck size={11} />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
