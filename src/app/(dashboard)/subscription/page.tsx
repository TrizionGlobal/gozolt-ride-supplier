'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { subscriptionService } from '@/services/subscription/subscription.service';
import { CurrentPlanBanner } from '@/components/subscription/current-plan-banner';
import { PlanComparisonCards } from '@/components/subscription/plan-comparison-cards';
import { RatePricingTable } from '@/components/subscription/rate-pricing-table';
import { BillingHistoryTable } from '@/components/subscription/billing-history-table';
import type { SubscriptionInfo, PlanDetails } from '@/types';
import { useFleetTracking } from '@/hooks/use-fleet-tracking';
import { useAuthStore } from '@/stores/auth.store';
import { Step4Subscription } from '@/components/auth/step4-subscription';
import { Step5Payment } from '@/components/auth/step5-payment';
import { useRouter } from 'next/navigation';

const PLAN_CONFIG: PlanDetails[] = [
  {
    tier: 'STARTER',
    name: 'Starter Fleet',
    price: 49,
    features: [
      'Up to 5 Vehicles',
      'Up to 10 Drivers',
      'Up to 100 Rides / Month',
      'Fleet Management',
      'Vehicle Assignment',
      'Driver Management',
      'Ride Tracking',
      'Earnings Dashboard',
    ],
  },
  {
    tier: 'GROWTH',
    name: 'Growth Fleet',
    price: 149,
    isRecommended: true,
    features: [
      'Up to 20 Vehicles',
      'Up to 40 Drivers',
      'Up to 500 Rides / Month',
      'Everything in Starter',
      'Fleet Analytics',
      'Advanced Reports',
      'Priority Support',
    ],
  },
  {
    tier: 'PROFESSIONAL',
    name: 'Professional Fleet',
    price: 199,
    features: [
      'Up to 50 Vehicles',
      'Up to 100 Drivers',
      'Up to 1,500 Rides / Month',
      'Everything in Growth',
      'Driver Performance Reports',
      'Advanced Fleet Insights',
      'Multi-Manager Access',
    ],
  },
  {
    tier: 'ENTERPRISE',
    name: 'Enterprise Fleet',
    price: 299,
    features: [
      'Unlimited Vehicles',
      'Unlimited Drivers',
      'Unlimited Rides',
      'Unlimited Fleet Management',
      'Unlimited Driver Assignments',
      'Unlimited Ride Operations',
      'Dedicated Account Manager',
      'Premium Support',
    ],
  },
];

export default function SubscriptionPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [usage, setUsage] = useState<{ totalVehicles: number; totalDrivers: number } | null>(null);
  const [isChanging, setIsChanging] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Setup Flow States
  const { user, hydrateFromSession } = useAuthStore();
  const router = useRouter();
  const [setupStep, setSetupStep] = useState<1 | 2>(1);
  const [selectedTier, setSelectedTier] = useState<'STARTER' | 'GROWTH' | 'PROFESSIONAL' | 'ENTERPRISE'>('STARTER');
  const [cardData, setCardData] = useState<{ paymentMethodId: string; cardName: string; last4: string; brand: string; }>({
    paymentMethodId: '', cardName: '', last4: '', brand: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFleetTracking({ onRefresh: fetchData });

  const handleSelectPlan = async (tier: SubscriptionInfo['tier']) => {
    if (!subscription || tier === subscription.tier) return;

    const planName = PLAN_CONFIG.find((p) => p.tier === tier)?.name || tier;
    const confirmed = window.confirm(
      `Are you sure you want to switch to ${planName}? Your subscription will change immediately.`,
    );
    if (!confirmed) return;

    setIsChanging(tier);
    try {
      const updated = await subscriptionService.changePlan(tier);
      setSubscription(updated);
      toast.success(`Subscription updated to ${planName}`);
    } catch {
      toast.error('Failed to change subscription');
    } finally {
      setIsChanging(null);
    }
  };

  const handleCancelSubscription = () => {
    setShowCancelDialog(false);
    toast.success('Subscription cancellation request submitted');
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
      await fetchData();
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

  const isExpired =
    subscription?.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd) < new Date();

  // Check if we need to show the setup flow
  if (!subscription || isExpired) {
    const isMissing = !subscription;
    
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8 text-center space-y-2">
          {isMissing ? (
            <>
              <h1 className="text-3xl font-bold text-white">Welcome to Gozolt</h1>
              <p className="text-[#A1A1AA]">
                Supplier not yet subscribed. To use the app, please subscribe to a plan.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-red-500">Subscription Expired</h1>
              <p className="text-[#A1A1AA]">
                Your subscription expired on{' '}
                <span className="font-medium text-white">
                  {new Date(subscription!.currentPeriodEnd!).toLocaleDateString()}
                </span>
                . Please repay to continue using the app.
              </p>
            </>
          )}
        </div>

        {setupStep === 1 && (
          <Step4Subscription
            selectedTier={selectedTier}
            onSelectTier={setSelectedTier}
            onNext={() => setSetupStep(2)}
            onPrevious={() => {
              // Can't go back from here
            }}
          />
        )}

        {setupStep === 2 && (
          <div className="relative">
            {isSubmitting && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-black/60 backdrop-blur-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FACC15] border-t-transparent" />
              </div>
            )}
            <Step5Payment
              selectedTier={selectedTier}
              initialValues={cardData}
              ownerName={user?.companyName || ''}
              companyAddress={user?.address || ''}
              companyCity={user?.city || ''}
              onPrevious={() => setSetupStep(1)}
              onNext={handleSetupSubscription}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Subscription</h1>
        <button
          onClick={() => setShowCancelDialog(true)}
          className="rounded-lg border border-red-500 bg-red-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors"
        >
          Cancel Subscription
        </button>
      </div>

      {/* Current Plan Banner */}
      <CurrentPlanBanner
        subscription={subscription}
        usage={usage}
        plans={PLAN_CONFIG}
        isLoading={isLoading}
      />

      {/* Plan Comparison Cards */}
      <PlanComparisonCards
        plans={PLAN_CONFIG}
        currentTier={subscription?.tier || null}
        isChanging={isChanging}
        onSelectPlan={handleSelectPlan}
      />

      {/* Vehicle Rate Pricing */}
      <RatePricingTable data={[]} />

      {/* Billing History */}
      <BillingHistoryTable data={[]} />

      {/* Cancel Subscription Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="mx-4 w-full max-w-[420px] rounded-xl border border-[#27272A] bg-[#111111] p-6">
            <h3 className="text-lg font-bold text-white">Cancel Subscription</h3>
            <p className="mt-2 text-sm text-[#A1A1AA]">
              Are you sure? Your account will be downgraded at the end of the current billing period.
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
                className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
