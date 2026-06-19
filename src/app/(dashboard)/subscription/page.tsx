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
    price: 299,
    isRecommended: true,
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
    price: 499,
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
