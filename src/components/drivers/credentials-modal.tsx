'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertTriangle, Copy } from 'lucide-react';
import { toast } from 'sonner';
import type { DriverCredentials } from '@/types';

interface CredentialsModalProps {
  credentials: DriverCredentials;
  onClose: () => void;
}

export function CredentialsModal({ credentials, onClose }: CredentialsModalProps) {
  const router = useRouter();
  const [sendEmail, setSendEmail] = useState(false);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied!`);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDone = () => {
    router.push('/drivers');
  };

  const handleEmailToggle = () => {
    const next = !sendEmail;
    setSendEmail(next);
    if (next) {
      toast.success("Credentials sent to driver's email");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative mx-4 w-full max-w-[420px] rounded-xl border border-[#27272A] bg-[#111111] p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#A1A1AA] hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <h2 className="mb-6 text-xl font-bold text-white">Driver Credentials Generated</h2>

        {/* Driver ID */}
        <div className="mb-4">
          <p className="mb-2 text-sm text-[#A1A1AA]">Driver ID</p>
          <button
            onClick={() => copyToClipboard(credentials.driverId, 'Driver ID')}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#3F3F46] bg-[#1A1A1A] p-4 transition-colors hover:border-[#FACC15]"
          >
            <span className="font-mono text-lg font-bold tracking-wider text-white">
              {credentials.driverId}
            </span>
            <Copy className="h-4 w-4 text-[#71717A]" />
          </button>
        </div>

        {/* Password */}
        <div className="mb-4">
          <p className="mb-2 text-sm text-[#A1A1AA]">Driver ID</p>
          <button
            onClick={() => copyToClipboard(credentials.temporaryPassword, 'Password')}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#3F3F46] bg-[#1A1A1A] p-4 transition-colors hover:border-[#FACC15]"
          >
            <span className="font-mono text-lg font-bold tracking-wider text-white">
              {credentials.temporaryPassword}
            </span>
            <Copy className="h-4 w-4 text-[#71717A]" />
          </button>
        </div>

        {/* Warning */}
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-400">
            Password is shown only once. Please save it now.
          </p>
        </div>

        {/* Send via email toggle */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <button
            onClick={handleEmailToggle}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              sendEmail ? 'bg-[#FACC15]' : 'bg-[#52525B]'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                sendEmail ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
          <span className="text-sm text-[#D4D4D8]">Send Via Email</span>
        </div>

        {/* Done button */}
        <button
          onClick={handleDone}
          className="w-full rounded-full bg-[#FACC15] py-2.5 text-sm font-semibold text-black hover:bg-[#EAB308] transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
