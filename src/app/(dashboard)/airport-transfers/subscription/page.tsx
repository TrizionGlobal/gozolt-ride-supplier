'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowLeft, Plane } from 'lucide-react';
import { toast } from 'sonner';

import { Step5Payment } from '@/components/auth/step5-payment';
import { CurrentPlanBanner } from '@/components/subscription/current-plan-banner';
import { ExpiredSubscriptionBanner } from '@/components/subscription/expired-subscription-banner';
import { PlanComparisonCards } from '@/components/subscription/plan-comparison-cards';
import { airportTransfersSubscriptionService } from '@/services/airport-transfers/airport-transfers-subscription.service';
import { useAuthStore } from '@/stores/auth.store';
import { useSidebarStore } from '@/stores/sidebar.store';
import type { PlanDetails, SubscriptionInfo } from '@/types';

const AIRPORT_TRANSFER_PLANS: PlanDetails[] = [
  {
    tier: 'STARTER',
    name: 'Starter Fleet',
    price: 49,
    maxVehicles: 5,
    maxDrivers: 10,
    maxRides: 100,
    features: [
      'Up to 5 Transfer Vehicles',
      'Up to 10 Chauffeurs / Drivers',
      'Up to 100 Airport Transfers / Month',
      'Meet & Greet Passenger Coordination',
      'Standard Supplier Support',
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
      'Up to 20 Transfer Vehicles',
      'Up to 40 Chauffeurs / Drivers',
      'Up to 500 Airport Transfers / Month',
      'Live Flight Tracking Integration',
      'Meet & Greet Passenger Coordination',
      'Priority Chauffeur Dispatch',
      'Priority Supplier Support',
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
      'Up to 50 Transfer Vehicles',
      'Up to 100 Chauffeurs / Drivers',
      'Up to 1,500 Airport Transfers / Month',
      'Live Flight Tracking & Delay Protection',
      'VIP Terminal & Chauffeur Coordination',
      'Priority Chauffeur Dispatch',
      '24/7 Dedicated Support',
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
      'Unlimited Transfer Vehicles',
      'Unlimited Chauffeurs / Drivers',
      'Unlimited Airport Transfers',
      'Full Fleet & Terminal Automation',
      'Live Flight Tracking & Auto-Rescheduling',
      'Dedicated Account Manager',
    ],
  },
];

type UsageInfo = {
  totalVehicles: number;
  totalDrivers: number;
  totalRides: number;
};

type PaymentData = {
  paymentMethodId: string;
  cardName: string;
  last4: string;
  brand: string;
};

export default function AirportTransfersSubscriptionPage() {
  const router = useRouter();
  const { user, hydrateFromSession } = useAuthStore();
  const { setActiveModule } = useSidebarStore();

  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isChanging, setIsChanging] = useState<string | null>(null);
  const [setupStep, setSetupStep] = useState<number>(1);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<SubscriptionInfo['tier'] | null>(null);

  const [cardData] = useState<PaymentData>({
    paymentMethodId: '',
    cardName: '',
    last4: '',
    brand: '',
  });

  useEffect(() => {
    setActiveModule('AIRPORT_TRANSFER');
  }, [setActiveModule]);

  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const [sub, usg] = await Promise.all([
        airportTransfersSubscriptionService.getSubscription(),
        airportTransfersSubscriptionService.getUsage(),
      ]);

      setSubscription(sub);
      setUsage(usg);
    } catch (error) {
      console.error('Failed to fetch airport transfer subscription info:', error);
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const effectiveSubscription = subscription || user?.subscription;

  const isExpired = Boolean(
    effectiveSubscription?.currentPeriodEnd &&
      new Date(effectiveSubscription.currentPeriodEnd) < new Date()
  );

  const handleSelectPlan = (tier: SubscriptionInfo['tier']) => {
    setShowPaymentModal(tier);
  };

  const handleSetupSubscription = async (paymentData: PaymentData) => {
    if (!paymentData.paymentMethodId) {
      toast.error('Payment method is required.');
      return;
    }

    const tier = showPaymentModal;
    if (!tier) return;

    const planName = AIRPORT_TRANSFER_PLANS.find((p) => p.tier === tier)?.name || tier;

    setIsSubmitting(true);
    setIsChanging(tier);

    try {
      if (!effectiveSubscription || isExpired) {
        const sub = await airportTransfersSubscriptionService.setupSubscription({
          subscriptionTier: tier,
          paymentMethodId: paymentData.paymentMethodId,
        });

        toast.success('Airport Transport subscription setup successful!');
        setSubscription(sub);
        setShowPaymentModal(null);
        setActiveModule('AIRPORT_TRANSFER');
        await hydrateFromSession();

        // Immediately show the supplier dashboard instead of subscription page
        router.replace('/airport-transfers/dashboard');
        return;
      } else {
        const updatedSub = await airportTransfersSubscriptionService.changePlan(
          tier,
          paymentData.paymentMethodId
        );

        setSubscription(updatedSub);
        setShowPaymentModal(null);
        toast.success(`Subscription updated to ${planName}`);
      }
    } catch (error: any) {
      const rawMessage = error?.response?.data?.message || error?.message || 'Failed to update subscription';
      const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      setIsChanging(null);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      await airportTransfersSubscriptionService.cancelSubscription();
      await hydrateFromSession();
      setShowCancelDialog(false);
      toast.success('Subscription cancelled successfully.');
      await fetchData(false);
    } catch (error: any) {
      const rawMessage = error?.response?.data?.message || error?.message || 'Failed to cancel subscription';
      const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;
      toast.error(message);
    } finally {
      setIsCancelling(false);
    }
  };

  // Payment Confirmation Success Screen (Step 3)
  if (setupStep === 3) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-[#27272A] bg-[#0A0A0A] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#FACC15]/10 text-[#FACC15]">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <h2 className="mb-3 text-3xl font-black text-white">
            Subscription Activated!
          </h2>

          <p className="mb-8 max-w-md mx-auto text-sm text-[#A1A1AA] leading-relaxed">
            Your Airport Transport subscription plan is now active. Your fleet, flight tracking integration, and chauffeur dispatch operations are ready.
          </p>

          <button
            type="button"
            onClick={() => {
              setActiveModule('AIRPORT_TRANSFER');
              router.push('/airport-transfers/dashboard');
            }}
            className="rounded-full bg-[#FACC15] px-8 py-3 text-sm font-bold text-black shadow-lg shadow-[#FACC15]/20 transition-all hover:bg-[#EAB308] hover:scale-105 active:scale-95"
          >
            Go to Airport Transport Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {subscription && !isExpired && (
            <button
              type="button"
              onClick={() => router.push('/airport-transfers/dashboard')}
              className="mt-1 flex shrink-0 items-center justify-center rounded-full bg-white/5 p-2 text-[#A1A1AA] transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2.5">
              <Plane className="h-6 w-6 text-[#FACC15]" />
              <h1 className="text-2xl font-black text-white">Airport Transport Subscription</h1>
            </div>
            <p className="mt-1 text-sm text-[#A1A1AA]">
              Select a dedicated fleet subscription tier to receive user transfer bookings and manage pickup and drop-off operations.
            </p>
          </div>
        </div>

        {subscription && !isExpired && (
          <button
            type="button"
            onClick={() => setShowCancelDialog(true)}
            className="shrink-0 rounded-lg border border-red-500/30 bg-transparent px-4 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            Cancel Subscription
          </button>
        )}
      </div>

      {/* Current subscription information */}
      {subscription && !isExpired && (
        <CurrentPlanBanner
          subscription={subscription}
          usage={usage}
          plans={AIRPORT_TRANSFER_PLANS}
          isLoading={isLoading}
        />
      )}

      {/* Expired Subscription Notice */}
      {isExpired && effectiveSubscription && (
        <ExpiredSubscriptionBanner
          subscription={effectiveSubscription}
          plans={AIRPORT_TRANSFER_PLANS}
          serviceName="Airport Transport"
          selectedService="AIRPORT_TRANSFER"
        />
      )}

      {/* First time Welcome message (no subscription ever) */}
      {!effectiveSubscription && !isExpired && (
        <div className="mb-4 space-y-2 py-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Welcome to GOZOLT
          </h2>

          <p className="text-[#A1A1AA]">
            Your account does not have an active subscription. Please select a plan to continue.
          </p>
        </div>
      )}

      {/* Plan Comparison Cards */}
      <PlanComparisonCards
        plans={AIRPORT_TRANSFER_PLANS}
        currentTier={subscription?.tier || null}
        isChanging={isChanging}
        onSelectPlan={handleSelectPlan}
      />

      {/* Cancel Subscription Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#27272A] bg-[#111111] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Cancel Airport Transport Subscription?</h3>
            <p className="mt-2 text-sm text-[#A1A1AA] leading-relaxed">
              Your subscription will remain active until the end of the current billing cycle. After that, your vehicles will be set to inactive and you won&apos;t receive new airport pickup and drop-off requests.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCancelDialog(false)}
                disabled={isCancelling}
                className="rounded-lg border border-[#27272A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1A1A1A]"
              >
                Keep Subscription
              </button>
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Sheet Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg my-8">
            <Step5Payment
              selectedTier={showPaymentModal as any}
              companyAddress={user?.address || ''}
              companyCity={user?.city || ''}
              ownerName={user?.supplierAccountHolder || user?.companyName || ''}
              initialValues={cardData}
              isSubmitting={isSubmitting}
              onNext={handleSetupSubscription}
              onPrevious={() => setShowPaymentModal(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
