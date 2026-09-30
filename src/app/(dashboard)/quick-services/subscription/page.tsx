'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BellRing, Check, Crown, Loader2, ShieldCheck, X, Zap, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { quickServicesSubscriptionService, type QuickServicesPaidPlan, } from '@/services/quick-services/quick-services-subscription.service';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useAuthStore } from '@/stores/auth.store';
import { SubscriptionTier } from '@/types';
import { Step5Payment } from '@/components/auth/step5-payment';

type AccessChoice =
  | 'WITH_SUBSCRIPTION'
  | 'WITHOUT_SUBSCRIPTION'
  | null;

const PAID_PLANS: Array<{
  code: QuickServicesPaidPlan;
  name: string;
  price: number;
  recommended?: boolean;
  features: string[];
}> = [
  {
    code: 'QUICK_BASIC',
    name: 'Basic',
    price: 100,
    features: [
      'Priority service-request notifications',
      'Complete customer booking information',
      'Accept available service requests',
      'No per-service platform charge',
      '0% platform commission on completed services',
      'Standard supplier support',
      'Monthly activity summary',
    ],
  },
  {
    code: 'QUICK_ADVANCED',
    name: 'Advanced',
    price: 250,
    recommended: true,
    features: [
      'Highest-priority service-request notifications',
      'Early access to suitable service requests',
      'Complete customer booking information',
      'Accept available service requests',
      'No per-service platform charge',
      '0% platform commission on completed services',
      'Advanced performance analytics',
      'Featured supplier visibility',
      'Priority supplier support',
    ],
  },
];

const WITHOUT_SUBSCRIPTION_FEATURES = [
  'Standard service-request notifications',
  'Requests offered after subscribed suppliers',
  'Platform charge may apply per accepted service',
  'Commission may apply to completed services',
  'Standard supplier visibility',
  'Basic booking information',
  'Standard support',
];

export default function QuickServicesSubscriptionPage() {
  const router = useRouter();

  const [choice, setChoice] =
    useState<AccessChoice>(null);

  const [currentMode, setCurrentMode] = useState<AccessChoice>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [activeTier, setActiveTier] = useState<string | null>(null);

  useEffect(() => {
    const mode = localStorage.getItem('quick-services-access-mode') as AccessChoice;
    const storedTier = localStorage.getItem('quick-services-subscription-tier');
    setCurrentMode(mode);
    setActiveTier(storedTier);
  }, []);

  const [selectedPlan, setSelectedPlan] =
    useState<QuickServicesPaidPlan>('QUICK_BASIC');

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const activePlanName = activeTier ? PAID_PLANS.find(p => p.code === activeTier)?.name : null;

  const [showPaymentModal, setShowPaymentModal] = useState<QuickServicesPaidPlan | null>(null);

  const [cardData] = useState({
    paymentMethodId: '',
    cardName: '',
    last4: '',
    brand: '',
  });

  const continueWithSubscription = async () => {
    setShowPaymentModal(selectedPlan);
  };

  const handleSetupSubscription = async (paymentData: any) => {
    setIsSubmitting(true);
    
    try {
      // Mock saving subscription and returning to dashboard
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      useAuthStore.setState((state) => ({
        user: state.user
          ? {
              ...state.user,
              subscription: {
                id: 'qs_sub_' + Math.random().toString(36).substr(2, 9),
                tier: selectedPlan as any,
                status: 'ACTIVE',
                maxDrivers: 999,
                maxVehicles: 999,
                maxRides: 999,
                currentPeriodEnd: null,
                cancelAtPeriodEnd: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            }
          : null,
      }));

      localStorage.setItem('quick-services-access-mode', 'WITH_SUBSCRIPTION');
      localStorage.setItem('quick-services-subscription-tier', selectedPlan);
      setCurrentMode('WITH_SUBSCRIPTION');
      setActiveTier(selectedPlan);
      setShowPaymentModal(null);
      setChoice(null);

      toast.success(
        'Quick Services Premium access activated successfully.'
      );

      router.push('/quick-services/subscription/success');
    } catch (error: any) {
      toast.error('Unable to setup subscription payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Need to handle the "Continue Without Subscription" action (Once Backend API is available need to remove the localStorage part and call the backend API)
  const continueWithoutSubscription = async () => {
  setIsSubmitting(true);

  try {
    await quickServicesSubscriptionService.continueWithoutSubscription();

    // Mock updating the user's subscription in auth store so layout.tsx routing unlocks
    useAuthStore.setState((state) => ({
      user: state.user
        ? {
            ...state.user,
            subscription: {
              id: 'qs_sub_' + Math.random().toString(36).substr(2, 9),
              tier: SubscriptionTier.STARTER, // Or any string that satisfies the types
              status: 'ACTIVE',
              maxDrivers: 999,
              maxVehicles: 999,
              maxRides: 999,
              currentPeriodEnd: null,
              cancelAtPeriodEnd: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }
        : null,
    }));

    localStorage.setItem('quick-services-access-mode', 'WITHOUT_SUBSCRIPTION');
    localStorage.removeItem('quick-services-subscription-tier');
    setCurrentMode('WITHOUT_SUBSCRIPTION');
    setActiveTier(null);

    toast.success(
      'Quick Services access activated successfully.'
    );

    router.push('/quick-services/dashboard');
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message ||
        'Unable to activate Quick Services access.'
    );

    setIsSubmitting(false);
  }
};

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      // Mock API call to cancel
      await new Promise((resolve) => setTimeout(resolve, 1000));
      localStorage.removeItem('quick-services-access-mode');
      localStorage.removeItem('quick-services-subscription-tier');
      setCurrentMode(null);
      setActiveTier(null);
      setChoice(null);
      setShowCancelDialog(false);
      toast.success('Your subscription preference has been reset.');
    } catch (error: any) {
      toast.error('Unable to cancel subscription.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {currentMode && (
            <button
              type="button"
              onClick={() => router.push('/quick-services/dashboard')}
              className="mt-1 flex shrink-0 items-center justify-center rounded-full bg-white/5 p-2 text-[#A1A1AA] transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
          <h1 className="text-3xl font-black text-white">
            {currentMode ? 'Quick Services Subscription' : (
              <>
                Choose Your{' '}
                <span className="text-[#FCD223]">
                  Quick Services Plan
                </span>
              </>
            )}
          </h1>

          {!currentMode && (
            <p className="mt-3 max-w-2xl text-sm text-[#A1A1AA]">
              Select subscription access for additional benefits,
              or continue using the standard pay-per-service model.
            </p>
          )}
          </div>
        </div>

        {currentMode && (
          <button
            type="button"
            onClick={() => setShowCancelDialog(true)}
            className="shrink-0 rounded-md border border-red-500/30 bg-transparent px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            Cancel or Switch Access
          </button>
        )}
      </div>

      {currentMode && (
        <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                {currentMode === 'WITH_SUBSCRIPTION' ? (
                  <Crown className="h-5 w-5 text-[#FCD223]" />
                ) : (
                  <Zap className="h-5 w-5 text-[#A1A1AA]" />
                )}
                <h3 className="text-lg font-bold text-white">
                  {currentMode === 'WITH_SUBSCRIPTION' ? (activePlanName ? `${activePlanName} Plan` : 'Premium Paid Plan') : 'Standard Access (No Monthly Fee)'}
                </h3>
                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                  Active
                </span>
              </div>
              
              <p className="mt-2 text-sm text-[#A1A1AA]">
                {currentMode === 'WITH_SUBSCRIPTION' 
                  ? 'You are currently subscribed to a premium plan with no per-service commissions.'
                  : 'You are using standard access. Per-service platform charges and commissions apply.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {currentMode && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-white">Want to switch plans?</h2>
        </div>
      )}

      {/* Main access choices */}
      <div className="grid gap-6 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setChoice('WITH_SUBSCRIPTION')}
          className={`rounded-2xl border p-6 text-left transition-all ${
            choice === 'WITH_SUBSCRIPTION'
              ? 'border-[#FCD223] bg-[#FCD223]/10'
              : 'border-[#27272A] bg-[#111111] hover:border-[#FCD223]/60'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FCD223]/10">
              <Crown className="h-6 w-6 text-[#FCD223]" />
            </div>

            {choice === 'WITH_SUBSCRIPTION' && (
              <Check className="h-6 w-6 text-[#FCD223]" />
            )}
          </div>

          <h2 className="mt-5 text-xl font-bold text-white">
            With Subscription
          </h2>

          <p className="mt-2 text-sm text-[#A1A1AA]">
            Receive priority access with no per-service
            platform charge or platform commission.
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            setChoice('WITHOUT_SUBSCRIPTION')
          }
          className={`rounded-2xl border p-6 text-left transition-all ${
            choice === 'WITHOUT_SUBSCRIPTION'
              ? 'border-[#FCD223] bg-[#FCD223]/10'
              : 'border-[#27272A] bg-[#111111] hover:border-[#FCD223]/60'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
              <Zap className="h-6 w-6 text-[#A1A1AA]" />
            </div>

            {choice === 'WITHOUT_SUBSCRIPTION' && (
              <Check className="h-6 w-6 text-[#FCD223]" />
            )}
          </div>

          <h2 className="mt-5 text-xl font-bold text-white">
            Without Subscription
          </h2>

          <p className="mt-2 text-sm text-[#A1A1AA]">
            Continue without a monthly payment. Platform
            charges and commissions may apply.
          </p>
        </button>
      </div>

      {/* Paid plans */}
      {choice === 'WITH_SUBSCRIPTION' && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {PAID_PLANS.map((plan) => {
              const isSelected =
                selectedPlan === plan.code;

              return (
                <button
                  key={plan.code}
                  type="button"
                  onClick={() =>
                    setSelectedPlan(plan.code)
                  }
                  className={`relative flex flex-col rounded-2xl border p-6 text-left transition-all ${
                    isSelected
                      ? 'border-[#FCD223] bg-[#1A1A15]'
                      : 'border-[#27272A] bg-[#111111] hover:border-[#52525B]'
                  }`}
                >
                  {plan.recommended && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#FCD223] px-4 py-1 text-xs font-bold text-black">
                      Recommended
                    </span>
                  )}

                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">
                      {plan.name}
                    </h3>

                    <div className="flex items-center gap-2">
                      {currentMode === 'WITH_SUBSCRIPTION' && (activeTier as string) === plan.code && (
                        <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500 border border-green-500/20">
                          Active
                        </span>
                      )}
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          isSelected
                            ? 'border-[#FCD223] bg-[#FCD223]'
                            : 'border-[#52525B]'
                        }`}
                      >
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-black" />
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-4xl font-black text-[#FCD223]">
                    €{plan.price}
                    <span className="text-sm font-normal text-[#71717A]">
                      {' '}
                      / month
                    </span>
                  </p>

                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />

                        <span className="text-sm text-[#D4D4D8]">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {currentMode === 'WITH_SUBSCRIPTION' && (activeTier as string) === selectedPlan ? (
            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 py-3 font-bold text-green-500"
            >
              <CheckCircle2 className="h-5 w-5" />
              Current Active Plan
            </button>
          ) : (
            <button
              type="button"
              onClick={continueWithSubscription}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FCD223] py-3 font-bold text-black hover:bg-[#EAB308] disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}

              {currentMode === 'WITH_SUBSCRIPTION' ? 'Switch Plan & Pay' : 'Continue to Secure Payment'}
            </button>
          )}
        </div>
      )}

      {/* Without-subscription details */}
      {choice === 'WITHOUT_SUBSCRIPTION' && (
        <div className="rounded-2xl border border-[#27272A] bg-[#111111] p-6">
          <h2 className="text-xl font-bold text-white">
            Standard Access
          </h2>

          <p className="mt-2 text-sm text-[#A1A1AA]">
            No monthly subscription. Charges are applied
            according to the current platform rate.
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {WITHOUT_SUBSCRIPTION_FEATURES.map(
              (feature, index) => (
                <li
                  key={feature}
                  className="flex items-start gap-2"
                >
                  {index < 2 ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#FCD223]" />
                  ) : (
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  )}

                  <span className="text-sm text-[#D4D4D8]">
                    {feature}
                  </span>
                </li>
              )
            )}
          </ul>

          {currentMode === 'WITHOUT_SUBSCRIPTION' ? (
            <button
              type="button"
              disabled
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 py-3 font-bold text-green-500"
            >
              <CheckCircle2 className="h-5 w-5" />
              Current Active Plan
            </button>
          ) : (
            <button
              type="button"
              onClick={continueWithoutSubscription}
              disabled={isSubmitting}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full border border-[#FCD223] py-3 font-bold text-[#FCD223] hover:bg-[#FCD223]/10 disabled:opacity-50"
            >
              {isSubmitting && (
                <Loader2 className="h-5 w-5 animate-spin" />
              )}

              Continue Without Subscription
            </button>
          )}
        </div>
      )}

      <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
        <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />

        <p className="text-xs leading-relaxed text-[#A1A1AA]">
          Platform fees, commissions and applicable statutory
          taxes are governed by your supplier agreement and
          local regulations.
        </p>
      </div>

      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-[420px] rounded-xl border border-[#27272A] bg-[#111111] p-6">
            <h3 className="text-lg font-bold text-white">
              Cancel or Switch Plan
            </h3>

            <p className="mt-2 text-sm text-[#A1A1AA]">
              Are you sure you want to cancel or reset your current access mode? You will need to select a new plan to continue using Quick Services.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCancelDialog(false)}
                disabled={isCancelling}
                className="rounded-full px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Keep Current Plan
              </button>

              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {isCancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div className="relative w-full max-w-[600px] my-8 rounded-xl bg-[#111111]">
            <Step5Payment
              selectedTier={showPaymentModal}
              initialValues={cardData}
              onPrevious={() => setShowPaymentModal(null)}
              onNext={handleSetupSubscription}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}

    </div>
  );
}
