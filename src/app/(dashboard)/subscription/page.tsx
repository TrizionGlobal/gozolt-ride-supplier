'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { subscriptionService } from '@/services/subscription/subscription.service';
import { CurrentPlanBanner } from '@/components/subscription/current-plan-banner';
import { PlanComparisonCards } from '@/components/subscription/plan-comparison-cards';
import { RatePricingTable } from '@/components/subscription/rate-pricing-table';
import { BillingHistoryTable } from '@/components/subscription/billing-history-table';
import { vehicleRatePricing, mockBillingHistory } from '@/lib/mock-data';
import type { SubscriptionInfo, PlanDetails } from '@/types';

const PLAN_CONFIG: PlanDetails[] = [
  {
    tier: 'STARTER',
    name: 'Starter',
    price: 49,
    features: [
      'Up to 5 vehicles',
      'Up to 5 drivers',
      'Basic analytics',
      '9% commission per ride',
      '16-day payout cycle',
      'Email support',
    ],
  },
  {
    tier: 'PROFESSIONAL',
    name: 'Professional',
    price: 149,
    isRecommended: true,
    features: [
      'Up to 25 vehicles',
      'Up to 25 drivers',
      'GPS tracking',
      '6% commission per ride',
      '14-day payout cycle',
      'Email & Phone support',
    ],
  },
  {
    tier: 'ENTERPRISE',
    name: 'Enterprise',
    price: 199,
    features: [
      'Unlimited vehicles',
      'Unlimited drivers',
      'Full analytics & GPS tracking',
      '4% commission per ride',
      '10-day payout cycle',
      'Dedicated support (WhatsApp, Telegram, Chat)',
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
      <RatePricingTable data={vehicleRatePricing} />

      {/* Billing History */}
      <BillingHistoryTable data={mockBillingHistory} />

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
