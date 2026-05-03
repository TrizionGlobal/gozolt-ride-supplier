'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { settingsService } from '@/services/settings/settings.service';

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

export function DeleteAccountDialog({ open, onClose }: DeleteAccountDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!open) return null;

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await settingsService.deleteAccount();
      toast.success('Account deletion requested');
      onClose();
    } catch {
      toast.error('Failed to request account deletion');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="mx-4 w-full max-w-[440px] rounded-xl border border-[#27272A] bg-[#111111] p-6">
        <h3 className="text-lg font-bold text-red-400">Delete Account</h3>
        <p className="mt-2 text-sm text-[#A1A1AA]">
          This action is permanent and cannot be undone. All your data, including drivers, vehicles,
          and documents will be permanently deleted.
        </p>

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-[#A1A1AA]">
            Type <span className="font-bold text-white">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3.5 py-2.5 text-sm text-white placeholder-[#52525B] outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-[#3F3F46] py-2.5 text-sm font-medium text-white hover:bg-[#52525B] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmText !== 'DELETE' || isDeleting}
            className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
