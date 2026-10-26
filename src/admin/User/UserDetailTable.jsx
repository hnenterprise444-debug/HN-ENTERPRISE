import React, { useState, useEffect } from 'react';
import Header from '../Components/Header';
import FilterBar from '../Components/FilterBar';
import TableSkeleton from '../../components/loader/SkeletonLoader/TableSkeleton';
import Pagination from '../../components/Common/Pagination';
import CursorPagination from '../../components/Common/CursorPagination';
import WarningModal from '../../components/modal/WarningModal';
import StatusBadge from '../Components/common/StatusBadge';
import DataTable from '../Components/common/DataTable';
import { 
  FaUserPlus, FaShieldAlt, FaTimes, FaSpinner, 
  FaEye, FaEyeSlash, FaTrash, FaCrown, FaLock,
  FaEnvelope
} from 'react-icons/fa';
import { userService, isSuperAdmin } from '../../services/user/userService';
import { authService } from '../../services/auth/authService';
import { activityService } from '../../services/activity/activityService';
import { toast } from 'react-toastify';
import { getFriendlyErrorMessage } from '../../utils/firebaseErrorHandler.js';
import useUsersQuery from '../../hooks/user/useUsersQuery';
import useDebounce from '../../hooks/common/useDebounce';

/**
 * UserDetailTable Component
 * Displays client and administrator accounts inside the admin panel.
 * Uses shared DataTable, StatusBadge, CursorPagination, and Pagination components.
 */
function UserDetailTable({ 
    mode, 
    user = [], 
    loading = false, 
    formatDate,
    roleFilter: propRoleFilter,
    setRoleFilter: propSetRoleFilter,
    pageIndex: propPageIndex,
    hasMore: propHasMore,
    isFetching: propIsFetching,
    onPrev: propOnPrev,
    onNext: propOnNext,
    onRefresh: propOnRefresh,
    invalidate: propInvalidate,
    pageSize = 10,
    onPageSizeChange,
}) {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);

    // Internal roleFilter state fallback if not controlled by parent
    const [internalRoleFilter, setInternalRoleFilter] = useState('ALL');
    const roleFilter = propRoleFilter !== undefined ? propRoleFilter : internalRoleFilter;
    const setRoleFilter = propSetRoleFilter || setInternalRoleFilter;

    const isCursorPaginated = typeof propPageIndex === 'number';

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Delete modal states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUserToDelete, setSelectedUserToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [adminForm, setAdminForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'ADMIN',
    });

    // Client-side filter logic for search within current result set
    const filteredUsers = user.filter(u => {
        const searchLower = debouncedSearch.toLowerCase().trim();
        const matchesSearch = !debouncedSearch ||
            u.name?.toLowerCase().includes(searchLower) ||
            u.email?.toLowerCase().includes(searchLower) ||
            u.uid?.toLowerCase().includes(searchLower);

        const matchesRole = isCursorPaginated
            ? (roleFilter === 'ALL' || (u.role || 'USER').toUpperCase() === roleFilter)
            : (roleFilter === 'ALL' || (u.role || 'USER').toUpperCase() === roleFilter);

        return matchesSearch && matchesRole;
    });

    // Fallback pagination state for non-cursor mode
    const [currentPage, setCurrentPage] = useState(1);
    const [fallbackPageSize, setFallbackPageSize] = useState(pageSize);

    // Reset to page 1 whenever the active filter or search term changes
    useEffect(() => {
        if (!isCursorPaginated) {
            setCurrentPage(1);
        }
    }, [debouncedSearch, roleFilter, isCursorPaginated]);

    const activePageSize = isCursorPaginated ? pageSize : fallbackPageSize;
    const activePageChangeSize = isCursorPaginated ? onPageSizeChange : (newSize) => {
        setFallbackPageSize(newSize);
        setCurrentPage(1);
        if (onPageSizeChange) onPageSizeChange(newSize);
    };


    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        if (!adminForm.name.trim() || !adminForm.email.trim() || !adminForm.password.trim()) {
            toast.error("Name, Email, and Password are required to create an Admin account");
            return;
        }

        if (adminForm.password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        setSubmitting(true);
        try {
            await userService.createUser({
                name: adminForm.name.trim(),
                email: adminForm.email.trim().toLowerCase(),
                password: adminForm.password.trim(),
                phone: adminForm.phone.trim(),
                role: adminForm.role,
            });

            await activityService.logActivity({
                type: adminForm.role === 'ADMIN' ? 'ADMIN_ADDED' : 'USER_ROLE_UPDATED',
                title: `New ${adminForm.role} Created: ${adminForm.name.trim()}`,
                description: `Created ${adminForm.role} profile for ${adminForm.email.trim()}`,
                userEmail: JSON.parse(localStorage.getItem('user') || '{}')?.user?.email || 'Admin',
            }).catch(() => {});

            toast.success(`New ${adminForm.role} "${adminForm.name}" created successfully! They can now log in at /login with their email & password.`);
            setIsAddModalOpen(false);
            setAdminForm({ name: '', email: '', password: '', phone: '', role: 'ADMIN' });
            if (propOnRefresh) propOnRefresh();
            if (propInvalidate) propInvalidate();
        } catch (err) {
            toast.error(getFriendlyErrorMessage(err, "Failed to create account profile. Please try again."));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (u) => {
        // Block deletion of SUPERADMIN at the UI level
        if (isSuperAdmin(u.role)) {
            toast.error("SUPERADMIN accounts are protected and cannot be deleted.");
            return;
        }
        setSelectedUserToDelete(u);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedUserToDelete) return;
        const targetUid = selectedUserToDelete.uid || selectedUserToDelete.docId || selectedUserToDelete.id;
        if (!targetUid) return;

        setDeleting(true);
        try {
            await userService.deleteUser(targetUid);

            await activityService.logActivity({
                type: 'ACCOUNT_DELETED',
                title: `Account Removed: ${selectedUserToDelete.name || selectedUserToDelete.email}`,
                description: `Deleted ${selectedUserToDelete.role || 'USER'} profile (${targetUid})`,
                userEmail: JSON.parse(localStorage.getItem('user') || '{}')?.user?.email || 'Admin',
            }).catch(() => {});

            toast.success(`Account "${selectedUserToDelete.name || selectedUserToDelete.email}" removed successfully.`);
            setIsDeleteModalOpen(false);
            setSelectedUserToDelete(null);
            if (propOnRefresh) propOnRefresh();
            if (propInvalidate) propInvalidate();
        } catch (err) {
            console.error("Error deleting user:", err);
            toast.error("Failed to delete user account");
        } finally {
            setDeleting(false);
        }
    };
    const filterConfig = [
        {
            value: roleFilter,
            onChange: setRoleFilter,
            options: [
                { value: "ALL", label: "All Roles" },
                { value: "SUPERADMIN", label: "Superadmin Only" },
                { value: "ADMIN", label: "Admins Only" },
                { value: "USER", label: "Customers Only" },
            ],
        },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <Header 
                    title="User & Admin Details" 
                    description="Monitor registered customer accounts, manage system permissions, and add new administrator profiles." 
                    icon={<FaUserPlus size={14} />}
                    buttonText="Add New Admin"
                    clickhandler={() => setIsAddModalOpen(true)}
                />
                <TableSkeleton rows={activePageSize} columns={6} />
            </div>
        );
    }

    // In cursor mode the server already handles page offset;
    // startIndex within the client-filtered subset is always 0.
    const startIndex = isCursorPaginated ? 0 : (currentPage - 1) * activePageSize;
    const displayUsers = isCursorPaginated
        ? filteredUsers
        : filteredUsers.slice(startIndex, startIndex + activePageSize);

    // Suppress server's hasMore when client-side filters produce 0 visible rows,
    // otherwise the Next button stays active even when nothing is displayed.
    const effectiveHasMore = isCursorPaginated
        ? (propHasMore && filteredUsers.length > 0)
        : undefined;

    const columns = [
        {
            key: 'sno',
            header: 'S.No',
            align: 'center',
            className: 'w-16 hidden lg:table-cell',
            cellClassName: 'text-text-muted text-center hidden lg:table-cell',
            render: (item, idx) => startIndex + idx + 1,
        },
        {
            key: 'name',
            header: 'Account Name',
            cellClassName: 'font-bold',
            render: (item) => item.name || 'Customer',
        },
        {
            key: 'email',
            header: 'Email Address',
            render: (item) => (
                <div>
                    <div>{item.email}</div>
                    <div className="text-xs text-text-muted mt-1 xl:hidden">Registered: {formatDate(item.time)}</div>
                </div>
            ),
        },
        {
            key: 'role',
            header: 'Role',
            align: 'center',
            className: 'w-32 text-center',
            cellClassName: 'text-center',
            render: (item) => <StatusBadge status={item.role || 'USER'} size="sm" />,
        },
        {
            key: 'uid',
            header: 'User UID',
            className: 'w-60',
            cellClassName: 'font-mono text-text-muted select-all',
            render: (item) => (
                <span className="bg-bg-base px-2.5 py-1 rounded-xl border border-border-subtle text-xs font-semibold">
                    {item.uid || 'N/A'}
                </span>
            ),
        },
        {
            key: 'time',
            header: 'Registration Date',
            className: 'w-44 hidden xl:table-cell',
            cellClassName: 'text-text-muted hidden xl:table-cell',
            render: (item) => formatDate(item.time),
        },
        {
            key: 'actions',
            header: 'Actions',
            align: 'center',
            className: 'w-24 text-center',
            cellClassName: 'text-center',
            render: (item) => {
                const locked = isSuperAdmin(item.role);
                return (
                    <div className="flex items-center justify-center">
                        {/* Delete Action */}
                        {locked ? (
                            <span
                                className="inline-flex items-center p-2 text-amber-400 cursor-not-allowed opacity-60"
                                title="SUPERADMIN accounts cannot be deleted"
                            >
                                <FaLock size={12} />
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleDeleteClick(item)}
                                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                                title={(item.role || 'USER').toUpperCase() === 'ADMIN' ? "Remove Admin Profile" : "Delete Account"}
                            >
                                <FaTrash size={13} />
                            </button>
                        )}
                    </div>
                );
            },
        },
    ];

    const mobileCardRender = (item, index) => {
        const { name, uid, email, time, role } = item;

        return (
            <div key={index} className="bg-card p-5 rounded-2xl border border-border-subtle shadow-xs space-y-4">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted font-bold">User #{startIndex + index + 1}</span>
                    <div className="flex items-center gap-2">
                        <StatusBadge status={role || 'USER'} size="sm" />
                        {isSuperAdmin(role) ? (
                            <span
                                className="p-1 text-amber-400 cursor-not-allowed opacity-60"
                                title="SUPERADMIN accounts cannot be deleted"
                            >
                                <FaLock size={11} />
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleDeleteClick(item)}
                                className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-md transition cursor-pointer"
                                title="Delete Account"
                            >
                                <FaTrash size={12} />
                            </button>
                        )}
                    </div>
                </div>
                
                <div>
                    <h3 className="font-extrabold text-text-base text-sm">{name || "Customer"}</h3>
                    <p className="text-xs text-text-muted">{email}</p>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">User UID</span>
                    <span className="bg-bg-base px-3 py-1.5 rounded-xl border border-border-subtle font-mono select-all w-fit break-all text-xs font-semibold">
                        {uid || "N/A"}
                    </span>
                </div>

                <div className="text-[11px] text-text-muted border-t border-border-subtle pt-2 flex justify-between items-center">
                    <span>Registered: <strong className="font-semibold text-text-base">{formatDate(time)}</strong></span>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <Header 
                title="User & Admin Details" 
                description="Monitor registered customer accounts, manage system permissions, and add new administrator profiles with credentials." 
                icon={<FaUserPlus size={14} />}
                buttonText="Add New Admin"
                clickhandler={() => setIsAddModalOpen(true)}
            />

            {/* Filter Bar */}
            <FilterBar
                search={search}
                setSearch={setSearch}
                searchPlaceholder="Search within this page by name, email, or UID..."
                filters={filterConfig}
            />

            {/* Reusable Data Table */}
            <DataTable
                columns={columns}
                data={displayUsers}
                emptyMessage="No registered users found."
                mobileCardRender={mobileCardRender}
            />

            {/* Pagination Controls */}
            {isCursorPaginated ? (
                <CursorPagination
                    pageIndex={propPageIndex}
                    hasMore={effectiveHasMore}
                    isFetching={propIsFetching}
                    onPrev={propOnPrev}
                    onNext={propOnNext}
                    onRefresh={propOnRefresh}
                    pageSize={activePageSize}
                    onPageSizeChange={activePageChangeSize}
                />
            ) : (
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredUsers.length}
                    pageSize={activePageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={activePageChangeSize}
                />
            )}

            {/* Add New Admin Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                    <div className="bg-card w-full max-w-md rounded-2xl border border-border-subtle shadow-xl p-6 space-y-5 relative animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                                    <FaShieldAlt size={16} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-base text-text-base">Add Administrator</h3>
                                    <p className="text-[11px] text-text-muted">Create a new admin with Firebase Auth credentials</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-2 rounded-xl text-text-muted hover:text-text-base hover:bg-card-hover transition cursor-pointer"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
                            <div className="space-y-1">
                                <label className="font-bold text-text-base">Full Name <span className="text-rose-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Admin User"
                                    value={adminForm.name}
                                    onChange={(e) => setAdminForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-bg-base text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold text-text-base">Email Address <span className="text-rose-500">*</span></label>
                                <input
                                    type="email"
                                    required
                                    placeholder="e.g. admin@needmate.com"
                                    value={adminForm.email}
                                    onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-bg-base text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold text-text-base">Login Password <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        minLength={6}
                                        placeholder="Enter secure password (min 6 characters)"
                                        value={adminForm.password}
                                        onChange={(e) => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
                                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-border-subtle bg-bg-base text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(prev => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-base transition cursor-pointer"
                                    >
                                        {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-text-muted mt-0.5">
                                    🔑 Credentials to log in at <code className="bg-bg-base px-1 py-0.5 rounded font-mono border border-border-subtle">/login</code>
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold text-text-base">Phone Number (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. +91 9876543210"
                                    value={adminForm.phone}
                                    onChange={(e) => setAdminForm(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-bg-base text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold text-text-base">Role Access Permission</label>
                                <select
                                    value={adminForm.role}
                                    onChange={(e) => setAdminForm(prev => ({ ...prev, role: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-bg-base text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-extrabold cursor-pointer"
                                >
                                    <option value="ADMIN" className="bg-card text-text-base">ADMIN (Full Panel & Management Access)</option>
                                    <option value="USER" className="bg-card text-text-base">USER (Standard Customer Account)</option>
                                </select>
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-border-subtle font-bold text-text-base hover:bg-card-hover transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-compli font-extrabold transition cursor-pointer shadow-xs flex items-center gap-2"
                                >
                                    {submitting && <FaSpinner size={12} className="animate-spin" />}
                                    <span>Create Admin Account</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Warning / Confirmation Delete Modal */}
            <WarningModal
                isOpen={isDeleteModalOpen}
                message={`Are you sure you want to remove account "${selectedUserToDelete?.name || selectedUserToDelete?.email}" (${(selectedUserToDelete?.role || 'USER').toUpperCase()})? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedUserToDelete(null);
                }}
                confirmText={deleting ? "Deleting..." : "Delete Account"}
                mode={mode}
            />
        </div>
    );
}

export default UserDetailTable;
