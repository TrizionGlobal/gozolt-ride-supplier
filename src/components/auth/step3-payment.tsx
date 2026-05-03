'use client';

import { useState } from 'react';
import { CreditCard, ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';

interface Step3Props {
  stripeConnected: boolean;
  onStripeChange: (connected: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step3Payment({ stripeConnected, onStripeChange, onNext, onPrevious }: Step3Props) {
  const [isConnecting, setIsConnecting] = useState(false);
  const devBypass = useAuthStore((s) => s.devBypass);

  const handleConnectStripe = async () => {
    setIsConnecting(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      if (devBypass) {
        onStripeChange(true);
        toast.success('Stripe connected (dev mode)');
      } else {
        toast.info('Stripe connection will be available after account approval');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#0F0F0F] p-6">
      <div className="mb-6 border-b border-[#27272A] pb-4">
        <h2 className="text-lg font-bold text-white">Step 3:Payment</h2>
      </div>

      {/* Connect Stripe Section */}
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A1A1A] border border-[#27272A]">
          <CreditCard className="h-8 w-8 text-[#A1A1AA]" />
        </div>

        <h3 className="mb-2 text-xl font-bold text-white">Connect Stripe</h3>

        <p className="mb-6 max-w-[400px] text-center text-sm text-[#71717A]">
          Connect your international business payments directly. You&apos;ll be redirected to Stripe to complete the linking.
        </p>

        <button
          type="button"
          onClick={handleConnectStripe}
          disabled={isConnecting || stripeConnected}
          className="flex items-center gap-2 rounded-full bg-[#7C3AED] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : stripeConnected ? (
            'Connected ✓'
          ) : (
            <>
              Connect Stripe
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-6">
        <button
          type="button"
          onClick={onPrevious}
          className="flex items-center gap-1.5 rounded-full border border-[#3F3F46] bg-[#1A1A1A] px-5 py-2 text-sm text-white transition-colors hover:border-[#52525B]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-1 rounded-full bg-[#FACC15] px-6 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#EAB308]"
        >
          Save
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
