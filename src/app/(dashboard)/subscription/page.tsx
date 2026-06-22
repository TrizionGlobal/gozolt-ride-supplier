'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { subscriptionService } from '@/services/subscription/subscription.service';
import { CurrentPlanBanner } from '@/components/subscription/current-plan-banner';
import { PlanComparisonCards } from '@/components/subscription/plan-comparison-cards';
import type { SubscriptionInfo, PlanDetails } from '@/types';
import { useFleetTracking } from '@/hooks/use-fleet-tracking';
import { useAuthStore } from '@/stores/auth.store';
import { Step5Payment } from '@/components/auth/step5-payment';
import { useRouter } from 'next/navigation';

const PLAN_CONFIG: PlanDetails[] = [
  {
    tier: 'STARTER',
    name: 'Starter Fleet',
    price: 49,
    maxVehicles: 5,
    maxDrivers: 10,
    maxRides: 100,
    features: [
      'Up to 5 Vehicles',
      'Up to 10 Drivers',
      'Up to 100 Rides / Month',
      'All Platform Modules Included',
      'Standard Support',
    ],
  },
  {
    tier: 'GROWTH',
    name: 'Growth Fleet',
    price: 99,
    maxVehicles: 20,
    maxDrivers: 40,
    maxRides: 500,
    isRecommended: true,
    features: [
      'Up to 20 Vehicles',
      'Up to 40 Drivers',
      'Up to 500 Rides / Month',
      'All Platform Modules Included',
      'Priority Support',
    ],
  },
  {
    tier: 'PROFESSIONAL',
    name: 'Professional Fleet',
    price: 149,
    maxVehicles: 50,
    maxDrivers: 100,
    maxRides: 1500,
    features: [
      'Up to 50 Vehicles',
      'Up to 100 Drivers',
      'Up to 1,500 Rides / Month',
      'All Platform Modules Included',
      'Priority Support',
    ],
  },
  {
    tier: 'ENTERPRISE',
    name: 'Enterprise Fleet',
    price: 199,
    maxVehicles: 9999,
    maxDrivers: 9999,
    maxRides: 999999,
    features: [
      'Unlimited Vehicles',
      'Unlimited Drivers',
      'Unlimited Rides',
      'All Platform Modules Included',
      'Dedicated Account Manager',
    ],
  },
];

export default function SubscriptionPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [usage, setUsage] = useState<{ totalVehicles: number; totalDrivers: number } | null>(null);
  const [isChanging, setIsChanging] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showConfirmPlanDialog, setShowConfirmPlanDialog] = useState<SubscriptionInfo['tier'] | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<SubscriptionInfo['tier'] | null>(null);

  // Setup Flow States
  const { user, hydrateFromSession, clearAuth } = useAuthStore();
  const router = useRouter();
  const [setupStep, setSetupStep] = useState<1 | 2>(1);
  const [selectedTier, setSelectedTier] = useState<'STARTER' | 'GROWTH' | 'PROFESSIONAL' | 'ENTERPRISE'>('STARTER');
  const [cardData, setCardData] = useState<{ paymentMethodId: string; cardName: string; last4: string; brand: string; }>({
    paymentMethodId: '', cardName: '', last4: '', brand: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const [sub, usg] = await Promise.all([
        subscriptionService.getSubscription(),
        subscriptionService.getUsage(),
      ]);
      setSubscription(sub);
      setUsage(usg);
    } catch {
      // handled in service
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFleetTracking({ onRefresh: fetchData });

  const isExpired =
    subscription?.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd) < new Date();

  const handleSelectPlan = async (tier: SubscriptionInfo['tier']) => {
    if (subscription && !isExpired && tier === subscription.tier) return;
    
    if (!subscription || isExpired) {
      setShowPaymentModal(tier);
    } else {
      setShowConfirmPlanDialog(tier);
    }
  };

  const confirmPlanChange = () => {
    if (!showConfirmPlanDialog) return;
    const tier = showConfirmPlanDialog;
    setShowConfirmPlanDialog(null);
    setShowPaymentModal(tier);
  };

  const handleConfirmPayment = async (paymentData: any) => {
    if (!showPaymentModal) return;
    const tier = showPaymentModal;
    const planName = PLAN_CONFIG.find((p) => p.tier === tier)?.name || tier;

    setIsSubmitting(true);
    setIsChanging(tier);
    try {
      if (!subscription || isExpired) {
        await subscriptionService.setupSubscription({
          subscriptionTier: tier,
          paymentMethodId: paymentData.paymentMethodId,
        });
        await hydrateFromSession();
        await fetchData(false);
        setShowPaymentModal(null);
        setSetupStep(3); // success card
      } else {
        const updated = await subscriptionService.changePlan(tier, paymentData?.paymentMethodId);
        setSubscription(updated);
        toast.success(`Subscription updated to ${planName}`);
        setShowPaymentModal(null);
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update subscription');
    } finally {
      setIsSubmitting(false);
      setIsChanging(null);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      await subscriptionService.cancelSubscription();
      toast.success('Subscription cancelled successfully. Logging out...');
      
      await fetch('/api/auth/logout', { method: 'POST' });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      clearAuth();
      router.push('/login');
    } catch {
      toast.error('Failed to cancel subscription');
      setIsCancelling(false);
    }
  };

  const handleSetupSubscription = async (paymentData: any) => {
    setIsSubmitting(true);
    try {
      await subscriptionService.setupSubscription({
        subscriptionTier: selectedTier,
        paymentMethodId: paymentData.paymentMethodId,
      });
      toast.success('Subscription setup successful!');
      
      // Update auth store to reflect the new subscription
      await hydrateFromSession();
      
      // Fetch the dashboard data
      await fetchData(false);

      // Show success message card
      setSetupStep(3);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to setup subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FACC15] border-t-transparent" />
      </div>
    );
  }


  if (setupStep === 3) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-4xl flex flex-col items-center justify-center py-12 px-4 text-center rounded-lg border border-[#27272A] bg-[#0F0F0F]">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-green-500">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h2 className="mb-3 text-3xl font-bold text-white">Payment Completed Successfully!</h2>
          <p className="mb-8 max-w-md text-[#A1A1AA]">
            Your payment was successful and your subscription plan is now active. You can now use this plan and access your Gozolt Supplier Portal.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-full bg-[#FACC15] px-8 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#EAB308] shadow-lg shadow-[#FACC15]/20"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (setupStep === 4) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-4xl flex flex-col items-center justify-center py-12 px-4 text-center rounded-lg border border-[#27272A] bg-[#0F0F0F]">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 text-red-500">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mb-3 text-3xl font-bold text-white">Subscription Cancelled!</h2>
          <p className="mb-8 max-w-md text-[#A1A1AA]">
            Your subscription has been successfully cancelled and all details have been removed. You will need to subscribe again to access the full portal.
          </p>
          <button
            onClick={() => setSetupStep(1)}
            className="rounded-full bg-[#FACC15] px-8 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#EAB308] shadow-lg shadow-[#FACC15]/20"
          >
            Subscribe Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Subscription</h1>
        {subscription && !isExpired && (
          <button
            onClick={() => setShowCancelDialog(true)}
            className="rounded-md border border-red-500/30 bg-transparent px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            Cancel Subscription
          </button>
        )}
      </div>

      {/* Current Plan Banner - Only show if subscribed and not expired */}
      {subscription && !isExpired && (
        <CurrentPlanBanner
          subscription={subscription}
          usage={usage}
          plans={PLAN_CONFIG}
          isLoading={isLoading}
        />
      )}

      {/* Welcome Message - Show only if not subscribed or expired */}
      {(!subscription || isExpired) && (
        <div className="mb-4 text-center space-y-2 py-8">
          <h1 className="text-3xl font-bold text-white">Welcome to Gozolt</h1>
          <p className="text-[#A1A1AA]">
            Supplier not yet subscribed. To use the app, please subscribe to a plan.
          </p>
        </div>
      )}

      {/* Plan Comparison Cards */}
      <PlanComparisonCards
        plans={PLAN_CONFIG}
        currentTier={subscription?.tier || null}
        isChanging={isChanging}
        onSelectPlan={handleSelectPlan}
      />

      {/* Cancel Subscription Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="mx-4 w-full max-w-[420px] rounded-xl border border-[#27272A] bg-[#111111] p-6">
            <h3 className="text-lg font-bold text-white">Cancel Subscription</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#A1A1AA]">
              Are you sure? Cancelling your subscription will immediately lock you out of the Gozolt Supplier Portal. You will need to subscribe again to regain access to the application.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 rounded-lg bg-[#3F3F46] py-2.5 text-sm font-medium text-white hover:bg-[#52525B] transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCancelling && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Plan Change Dialog */}
      {showConfirmPlanDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="mx-4 w-full max-w-[420px] rounded-xl border border-[#27272A] bg-[#111111] p-6">
            <h3 className="text-lg font-bold text-white">Change Subscription Plan</h3>
            <p className="mt-2 text-sm text-[#A1A1AA]">
              Are you sure you want to switch to{' '}
              <span className="font-semibold text-white">
                {PLAN_CONFIG.find((p) => p.tier === showConfirmPlanDialog)?.name}
              </span>
              ? Your subscription will change immediately.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirmPlanDialog(null)}
                className="flex-1 rounded-lg bg-[#3F3F46] py-2.5 text-sm font-medium text-white hover:bg-[#52525B] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPlanChange}
                className="flex-1 rounded-lg bg-[#FACC15] py-2.5 text-sm font-medium text-black hover:bg-[#EAB308] transition-colors"
              >
                Yes, Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal for Plan Change */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-[600px] rounded-xl border border-[#27272A] bg-[#111111] p-6 max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-end justify-end">
              <button
                onClick={() => setShowPaymentModal(null)}
                className="text-[#A1A1AA] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <Step5Payment
              selectedTier={showPaymentModal}
              initialValues={cardData}
              ownerName={user?.companyName || ''}
              companyAddress={user?.address || ''}
              companyCity={user?.city || ''}
              isSubmitting={isSubmitting}
              onNext={handleConfirmPayment}
            />
          </div>
        </div>
      )}
    </div>
  );
}
