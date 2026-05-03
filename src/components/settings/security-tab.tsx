'use client';

import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function SecurityTab() {
  const [twoFA, setTwoFA] = useState({ isEnabled: false });
  const [enabling2FA, setEnabling2FA] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handle2FA = async () => {
    if (enabling2FA) return;
    setEnabling2FA(true);
    await new Promise((r) => setTimeout(r, 1000));
    setTwoFA({ isEnabled: true });
    setEnabling2FA(false);
    toast.success('Two-Factor Authentication enabled');
  };

  const handleChangePassword = async () => {
    if (changingPassword) return;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    await new Promise((r) => setTimeout(r, 1000));
    setChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Password changed successfully');
  };

  return (
    <div>
      <h3 className="mb-1 text-lg font-semibold text-white">Security</h3>
      <p className="mb-6 text-sm text-[#71717A]">Manage your account security settings</p>

      <div className="rounded-lg border border-[#27272A] bg-[#0A0A0A] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
            <p className="text-xs text-[#71717A] mt-1">Add an extra layer of security with TOTP</p>
          </div>
          {twoFA.isEnabled ? (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">Enabled</span>
          ) : (
            <button
              onClick={handle2FA}
              disabled={enabling2FA}
              className="flex items-center gap-2 rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-semibold text-black hover:bg-[#E5B800] transition-colors disabled:opacity-50"
            >
              {enabling2FA ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enable 2FA'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-[#27272A] bg-[#0A0A0A] p-6">
        <p className="text-sm font-medium text-white mb-2">Change Password</p>
        <p className="text-xs text-[#71717A] mb-4">Update your account password</p>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-[#27272A] bg-[#111111] px-3 py-2.5 pr-10 text-sm text-white outline-none focus:border-[#FACC15] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full rounded-lg border border-[#27272A] bg-[#111111] px-3 py-2.5 pr-10 text-sm text-white placeholder-[#52525B] outline-none focus:border-[#FACC15] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-[#27272A] bg-[#111111] px-3 py-2.5 text-sm text-white outline-none focus:border-[#FACC15] transition-colors"
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="flex items-center gap-2 rounded-lg bg-[#FACC15] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors disabled:opacity-50"
          >
            {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
