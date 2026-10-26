import React, { useState, useEffect } from 'react';
import { FaTimes, FaEye, FaEyeSlash, FaSpinner, FaLock } from 'react-icons/fa';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '../../../firebase/FirebaseConfig';
import { toast } from 'react-toastify';
import { activityService } from '../../../services/activity/activityService';
import { getFriendlyErrorMessage } from '../../../utils/firebaseErrorHandler';

/**
 * ChangePasswordModal Component
 * Allows an authenticated administrator to securely update their own account password.
 * Requires verifying their current password before committing the new password.
 */
export default function ChangePasswordModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currentUser = auth.currentUser;
  const adminEmail = currentUser?.email || JSON.parse(localStorage.getItem('user') || '{}')?.user?.email || '';

  // Reset form states whenever modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currentPassword.trim()) {
      setErrorMessage('Please enter your current password.');
      return;
    }

    if (!newPassword.trim()) {
      setErrorMessage('Please enter your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage('New password cannot be the same as your current password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    if (!currentUser || !currentUser.email) {
      setErrorMessage('No active user session found. Please re-login to change password.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword.trim());
      await reauthenticateWithCredential(currentUser, credential);

      // 2. Update to new password
      await updatePassword(currentUser, newPassword.trim());

      // 3. Log activity
      activityService.logActivity({
        type: 'ADMIN_PASSWORD_CHANGED',
        title: 'Admin Password Changed',
        description: `Admin password was successfully updated for ${currentUser.email}`,
        userEmail: currentUser.email,
      }).catch(() => {});

      toast.success('Your password has been changed successfully!');
      onClose();
    } catch (err) {
      console.error('Password change error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMessage('Incorrect current password. Please try again.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('The new password is too weak. Please choose a stronger password.');
      } else if (err.code === 'auth/requires-recent-login') {
        setErrorMessage('Your session has expired. Please log out and sign back in before changing your password.');
      } else {
        setErrorMessage(getFriendlyErrorMessage(err, 'Failed to update password. Please try again.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md p-6 bg-card border border-border-subtle rounded-2xl shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-base hover:bg-card-hover rounded-xl transition-colors cursor-pointer"
          title="Close"
        >
          <FaTimes size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
            <FaLock size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-text-base tracking-tight">
              Change Password
            </h2>
            <p className="text-xs text-text-muted truncate mt-0.5" title={adminEmail}>
              Account: <span className="font-semibold text-text-base">{adminEmail || 'Admin'}</span>
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold leading-relaxed animate-in fade-in duration-150">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-text-base">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-border-subtle bg-bg-base text-text-base text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-base cursor-pointer"
                title={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-text-base">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-border-subtle bg-bg-base text-text-base text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-base cursor-pointer"
                title={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-text-base">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                minLength={6}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-border-subtle bg-bg-base text-text-base text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-base cursor-pointer"
                title={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-border-subtle bg-bg-base hover:bg-card-hover text-text-base font-bold text-sm transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-compli font-bold text-sm transition cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && <FaSpinner className="animate-spin" size={14} />}
              <span>{isSubmitting ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
