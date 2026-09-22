'use client';

import { CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuickServicesSubscriptionSuccessPage() {
  const router = useRouter();

  const openDashboard = () => {
    localStorage.setItem(
      'quick-services-access-mode',
      'WITH_SUBSCRIPTION'
    );

    router.push('/quick-services/dashboard');
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-[#27272A] bg-[#111111] p-10 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />

        <h1 className="mt-6 text-2xl font-bold text-white">
          Subscription Activated
        </h1>

        <p className="mt-3 text-sm text-[#A1A1AA]">
          Your Quick Services subscription was completed
          successfully.
        </p>

        <button
          type="button"
          onClick={openDashboard}
          className="mt-8 rounded-full bg-[#FCD223] px-8 py-3 font-bold text-black hover:bg-[#EAB308]"
        >
          Open Quick Services Dashboard
        </button>
      </div>
    </div>
  );
}