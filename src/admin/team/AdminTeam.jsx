import React, { useState, useEffect, useMemo } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaPhoneAlt,
  FaCheckCircle,
  FaEyeSlash,
  FaUserTie,
  FaUsers,
  FaStar,
  FaSync,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Header from "../Components/Header";
import WarningModal from "../../components/modal/WarningModal";
import { teamService } from "../../services/team/teamService";
import TeamMemberModal from "./sections/TeamMemberModal";

export default function AdminTeam() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadTeam = async () => {
    setLoading(true);
    try {
      const data = await teamService.getTeamMembers();
      setMembers(data);
    } catch (err) {
      console.error("Failed to load team:", err);
      toast.error("Failed to load team members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchStatus =
        statusFilter === "ALL" ||
        (m.status || "Active").toLowerCase() === statusFilter.toLowerCase();
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        m.name?.toLowerCase().includes(q) ||
        m.designation?.toLowerCase().includes(q) ||
        m.phone?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [members, statusFilter, search]);

  // Statistics
  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((m) => (m.status || "Active") === "Active").length;
    const leadership = members.filter((m) => m.isLeadership).length;
    const inactive = total - active;
    return { total, active, leadership, inactive };
  }, [members]);

  // Save (Create or Update)
  const handleSaveMember = async (formData) => {
    setSaving(true);
    try {
      if (memberToEdit) {
        await teamService.updateTeamMember(memberToEdit.id, formData);
        toast.success(`Updated ${formData.name} successfully.`);
      } else {
        await teamService.addTeamMember(formData);
        toast.success(`Added ${formData.name} to the team.`);
      }
      setIsModalOpen(false);
      setMemberToEdit(null);
      await loadTeam();
    } catch (err) {
      console.error("Error saving team member:", err);
      toast.error("Failed to save team member.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (member) => {
    try {
      const current = member.status || "Active";
      const nextStatus = await teamService.toggleMemberStatus(member.id, current);
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, status: nextStatus } : m))
      );
      toast.info(`${member.name} is now ${nextStatus}.`);
    } catch (err) {
      console.error("Error toggling status:", err);
      toast.error("Failed to toggle status.");
    }
  };

  // Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    const targetName = deleteTarget.name;
    setDeleting(true);
    try {
      // Optimistic update
      setMembers((prev) => prev.filter((m) => m.id !== targetId));
      await teamService.deleteTeamMember(targetId);
      toast.success(`Removed ${targetName} from the team.`);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting member:", err);
      toast.error(err?.message || "Failed to delete team member.");
      await loadTeam();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-7 px-4 md:px-0 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Team Management"
          description="Manage showroom staff, consultants, and leadership details showcased in the Meet Our Team horizontal section."
        />
        <button
          onClick={() => {
            setMemberToEdit(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-[#090909] text-xs font-bold shadow-md active:scale-95 transition cursor-pointer self-start sm:self-auto shrink-0"
        >
          <FaPlus size={11} />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border-subtle flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Total Members
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-text-base mt-1">
              {stats.total}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <FaUsers size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border-subtle flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Active Displayed
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-primary mt-1">
              {stats.active}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <FaCheckCircle size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border-subtle flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Leadership
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-text-base mt-1">
              {stats.leadership}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <FaStar size={17} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border-subtle flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              Inactive / Hidden
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-text-muted mt-1">
              {stats.inactive}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-card-hover border border-border-subtle text-text-muted flex items-center justify-center shrink-0">
            <FaEyeSlash size={16} />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <FaSearch
            size={12}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Search by name, role, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-bg-base border border-border-subtle text-text-base placeholder:text-text-muted/60 focus:outline-none focus:border-primary transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "Active", "Inactive"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                statusFilter === tab
                  ? "bg-primary text-[#090909] shadow-xs"
                  : "bg-bg-base border border-border-subtle text-text-muted hover:text-text-base hover:border-primary/40"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Member Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-card border border-border-subtle animate-pulse p-4"
            />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-card border border-border-subtle space-y-3">
          <FaUserTie size={32} className="mx-auto text-text-muted opacity-50" />
          <h4 className="text-base font-bold text-text-base">No Team Members Found</h4>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            {search
              ? "No team members matched your search query."
              : "No team members configured yet."}
          </p>
          <button
            onClick={() => {
              setMemberToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-[#090909] text-xs font-bold hover:bg-primary-hover transition cursor-pointer"
          >
            <FaPlus size={10} />
            <span>Add Member</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const isActive = (member.status || "Active") === "Active";
            return (
              <div
                key={member.id}
                className="group relative rounded-2xl bg-card border border-border-subtle hover:border-primary/40 p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all duration-200 shadow-xs hover:shadow-lg hover:shadow-black/40"
              >
                {/* Header row: Avatar, Info, Status */}
                <div className="flex items-start gap-4">
                  {/* Photo */}
                  <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-bg-base border border-border-subtle shrink-0">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {member.isLeadership && (
                      <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-primary text-[#090909]">
                        Lead
                      </span>
                    )}
                  </div>

                  {/* Text details */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider block truncate">
                        Order #{member.displayOrder ?? 1}
                      </span>
                      <button
                        onClick={() => handleToggleStatus(member)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider transition cursor-pointer ${
                          isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                        }`}
                        title="Click to toggle status"
                      >
                        {isActive ? "Active" : "Inactive"}
                      </button>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-text-base truncate group-hover:text-primary transition-colors">
                      {member.name}
                    </h4>

                    <p className="text-xs text-text-muted font-medium truncate">
                      {member.designation}
                    </p>

                    {member.phone && (
                      <a
                        href={`tel:${member.phone.replace(/[^0-9+]/g, "")}`}
                        className="inline-flex items-center gap-1.5 text-[11px] text-text-base hover:text-primary font-semibold transition"
                      >
                        <FaPhoneAlt size={9} className="text-primary" />
                        <span>{member.phone}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Bio snippet if available */}
                {member.bio && (
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-2 pt-1 border-t border-border-subtle/50 font-normal">
                    {member.bio}
                  </p>
                )}

                {/* Footer Action buttons */}
                <div className="pt-2 border-t border-border-subtle flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setMemberToEdit(member);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card-hover hover:bg-card border border-border-subtle hover:border-primary/40 text-xs font-semibold text-text-base transition cursor-pointer"
                  >
                    <FaEdit size={11} className="text-primary" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      setDeleteTarget(member);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-card-hover hover:bg-red-500/10 border border-border-subtle hover:border-red-500/30 text-text-muted hover:text-red-400 transition cursor-pointer"
                    title="Delete member"
                  >
                    <FaTrash size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Member Modal */}
      <TeamMemberModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setMemberToEdit(null);
        }}
        onSave={handleSaveMember}
        memberToEdit={memberToEdit}
        saving={saving}
      />

      {/* Delete Confirmation Modal */}
      <WarningModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Team Member"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This member will no longer appear on the store homepage.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        loading={deleting}
      />
    </div>
  );
}
