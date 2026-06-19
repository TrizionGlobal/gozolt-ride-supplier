'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface RegistrationCompleteProps {
  paymentDetails?: {
    txnId: string;
    amount: number;
    tier: string;
  };
}

export function RegistrationComplete({ paymentDetails }: RegistrationCompleteProps) {
  const router = useRouter();
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setResending(false);
    toast.success('Verification email resent successfully');
  };

  const planName = paymentDetails?.tier ? ({
    STARTER: 'Starter Fleet',
    GROWTH: 'Growth Fleet',
    PROFESSIONAL: 'Professional Fleet',
    ENTERPRISE: 'Enterprise Fleet',
  }[paymentDetails.tier] || 'Professional Fleet') : 'Professional Fleet';

  return (
    <div className="w-full max-w-[450px] rounded-lg border border-[#27272A] bg-[#111111] p-10">
      <div className="flex flex-col items-center text-center">
        {/* Green checkmark */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#22C55E]">
          <Check className="h-8 w-8 text-white" strokeWidth={3} />
        </div>

        {/* Heading */}
        <h1 className="mt-5 text-2xl font-bold text-white">Application Submitted!</h1>

        {/* Subtitle */}
        <p className="mt-3 max-w-[350px] text-sm text-[#A1A1AA] mb-4">
          Your application is under review, you&apos;ll hear from us within 2-3 business days.
        </p>

        {/* Stripe Payment Confirmation Receipt */}
        {paymentDetails && (
          <div className="w-full rounded-lg border border-[#27272A] bg-[#0A0A0A] p-4 text-left space-y-2.5 mb-6">
            <div className="flex justify-between text-xs border-b border-[#27272A]/50 pb-2">
              <span className="text-[#71717A]">Plan Subscribed:</span>
              <span className="font-medium text-white">{planName}</span>
            </div>
            <div className="flex justify-between text-xs border-b border-[#27272A]/50 pb-2">
              <span className="text-[#71717A]">Amount Charged:</span>
              <span className="font-semibold text-[#FACC15]">€{paymentDetails.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs border-b border-[#27272A]/50 pb-2">
              <span className="text-[#71717A]">Transaction ID:</span>
              <span className="font-mono text-white text-[11px]">{paymentDetails.txnId}</span>
            </div>
            <div className="flex justify-between text-xs pb-2 border-b border-[#27272A]/50">
              <span className="text-[#71717A]">Billing Country:</span>
              <span className="font-medium text-white">🇲🇹 Malta</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#71717A]">Payment Provider:</span>
              <span className="font-medium text-[#635BFF] flex items-center gap-1 font-mono text-[11px]">
                stripe
              </span>
            </div>
          </div>
        )}

        {/* Email Verification Reminder */}
        <div className="mt-6 w-full rounded-lg border border-[#FACC15]/30 bg-[#FACC15]/10 p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mail className="h-4 w-4 text-[#FACC15]" />
            <p className="text-sm font-medium text-[#FACC15]">Verify Your Email</p>
          </div>
          <p className="text-xs text-[#A1A1AA]">
            We&apos;ve sent a verification link to your email address. Please check your inbox
            and verify your email to complete your registration.
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="mt-3 text-xs font-medium text-[#FACC15] hover:underline disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Didn\'t receive it? Resend verification email'}
          </button>
        </div>

        {/* Back to Login */}
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="mt-6 rounded-full bg-[#FACC15] px-8 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#EAB308]"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
