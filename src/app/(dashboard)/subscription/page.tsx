'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowLeft, Crown, Percent, Check, Zap } from 'lucide-react';
import { toast } from 'sonner';

import { Step5Payment } from '@/components/auth/step5-payment';
import { CurrentPlanBanner } from '@/components/subscription/current-plan-banner';
import { ExpiredSubscriptionBanner } from '@/components/subscription/expired-subscription-banner';
import { PlanComparisonCards } from '@/components/subscription/plan-comparison-cards';
import { useFleetTracking } from '@/hooks/use-fleet-tracking';
import { subscriptionService } from '@/services/subscription/subscription.service';
import { useAuthStore } from '@/stores/auth.store';
import { useSidebarStore } from '@/stores/sidebar.store';
import {
  isSupplierService,
  SUPPLIER_SERVICE_NAMES,
  type SupplierService,
} from '@/types/supplier-service';
import type {
  PlanDetails,
  SubscriptionInfo,
} from '@/types';

type CabAccessChoice = 'WITH_SUBSCRIPTION' | 'COMMISSION' | null;

const CAB_COMMISSION_FEATURES = [
  'Zero upfront cost — €0 / month subscription fee',
  'Pay standard 9% platform commission per completed ride',
  'Add unlimited vehicles and drivers to your fleet',
  'Real-time ride dispatch & tracking access',
  'Automatic payouts & transparent settlement tracking',
  'Standard supplier portal features & dedicated support',
  'Flexible: Switch to a fixed monthly subscription plan anytime',
];

const PLAN_CONFIG: PlanDetails[] = [
  {
    tier: 'STARTER',
    name: 'Starter Fleet',
    price: 99,
    maxVehicles: 10,
    maxDrivers: 20,
    maxRides: 500,
    features: [
      'Up to 10 Vehicles',
      'Up to 20 Drivers',
      'Up to 500 Rides / Month',
      'All Platform Modules Included',
      'Standard Support',
    ],
  },
  {
    tier: 'GROWTH',
    name: 'Growth Fleet',
    price: 149,
    maxVehicles: 30,
    maxDrivers: 60,
    maxRides: 1500,
    isRecommended: true,
    features: [
      'Up to 30 Vehicles',
      'Up to 60 Drivers',
      'Up to 1,500 Rides / Month',
      'All Platform Modules Included',
      'Priority Support',
    ],
  },
  {
    tier: 'PROFESSIONAL',
    name: 'Professional Fleet',
    price: 199,
    maxVehicles: 75,
    maxDrivers: 150,
    maxRides: 3500,
    features: [
      'Up to 75 Vehicles',
      'Up to 150 Drivers',
      'Up to 3,500 Rides / Month',
      'All Platform Modules Included',
      'Priority Support',
    ],
  },
  {
    tier: 'ENTERPRISE',
    name: 'Enterprise Fleet',
    price: 499,
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

type UsageInfo = {
  totalVehicles: number;
  totalDrivers: number;
};

type PaymentData = {
  paymentMethodId: string;
  cardName: string;
  last4: string;
  brand: string;
};

export default function SubscriptionPage() {
  const router = useRouter();

  const {
    user,
    clearAuth,
    hydrateFromSession,
  } = useAuthStore();

  const [selectedService, setSelectedService] =
    useState<SupplierService | null>(null);

  const [subscription, setSubscription] =
    useState<SubscriptionInfo | null>(null);

  const [usage, setUsage] =
    useState<UsageInfo | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isCancelling, setIsCancelling] =
    useState(false);

  const [isChanging, setIsChanging] =
    useState<string | null>(null);

  const [setupStep, setSetupStep] =
    useState<number>(1);

  const [showCancelDialog, setShowCancelDialog] =
    useState(false);

  const [
    showConfirmPlanDialog,
    setShowConfirmPlanDialog,
  ] = useState<SubscriptionInfo['tier'] | null>(
    null
  );

  const [
    showPaymentModal,
    setShowPaymentModal,
  ] = useState<SubscriptionInfo['tier'] | null>(
    null
  );

  const [cardData] = useState<PaymentData>({
    paymentMethodId: '',
    cardName: '',
    last4: '',
    brand: '',
  });

  const [cabChoice, setCabChoice] =
    useState<CabAccessChoice>(null);

  const [currentCabMode, setCurrentCabMode] =
    useState<CabAccessChoice>(null);

  /*
   * Read the service selected on the landing page.
   *
   * This common subscription page is used only for:
   * - Cab Booking
   * - Car Rental
   * - Bike Rental
   *
   * Quick Services has a separate subscription page.
   */
  useEffect(() => {
    let activeModule = useSidebarStore.getState().activeModule;
    
    // Map activeModule to SupplierService (activeModule uses RENTAL, SupplierService uses CAR_RENTAL)
    let service: SupplierService | null = null;
    if (activeModule === 'CAB') service = 'CAB';
    if (activeModule === 'RENTAL') service = 'CAR_RENTAL';
    if (activeModule === 'BIKE_RENTAL') service = 'BIKE_RENTAL';

    if (!service) {
      const queryParamService = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('service') : null;
      const fallback = (queryParamService || user?.registeredService || (typeof window !== 'undefined' ? localStorage.getItem('gozolt-selected-service') : null)) as SupplierService | null;
      if (fallback === 'CAB' || fallback === 'CAR_RENTAL' || (fallback as string) === 'RENTAL' || fallback === 'BIKE_RENTAL') {
        service = (fallback as string) === 'RENTAL' ? 'CAR_RENTAL' : fallback;
        useSidebarStore.getState().setActiveModule((fallback as string) === 'CAR_RENTAL' ? 'RENTAL' : fallback as any);
      }
    }

    if (!service) {
      router.replace('/');
      return;
    }

    setSelectedService(service);
  }, [router, user]);

  /*
   * Fetch current subscription and usage.
   */
  const fetchData = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        setIsLoading(true);
      }

      try {
        const [sub, usg] =
          await Promise.all([
            subscriptionService.getSubscription(),
            subscriptionService.getUsage(),
          ]);

        setSubscription(sub);
        setUsage(usg);
      } catch (error) {
        console.error(
          'Failed to fetch subscription information:',
          error
        );
      } finally {
        if (showLoader) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFleetTracking({
    onRefresh: fetchData,
  });

  const effectiveSubscription = subscription || user?.subscription;

  const isExpired = Boolean(
    effectiveSubscription?.status === 'EXPIRED' ||
      Boolean(effectiveSubscription?.cancelledAt) ||
      (effectiveSubscription?.currentPeriodEnd &&
        new Date(
          effectiveSubscription.currentPeriodEnd
        ) < new Date())
  );

  useEffect(() => {
    const storedCabMode =
      typeof window !== 'undefined'
        ? (localStorage.getItem('cab-access-mode') as CabAccessChoice)
        : null;

    if (storedCabMode) {
      setCurrentCabMode(storedCabMode);
      setCabChoice((prev) => prev ?? storedCabMode);
    } else if (effectiveSubscription && !isExpired) {
      setCurrentCabMode('WITH_SUBSCRIPTION');
      setCabChoice((prev) => prev ?? 'WITH_SUBSCRIPTION');
    }
  }, [effectiveSubscription, isExpired]);

  const handleContinueWithCommission = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cab-access-mode', 'COMMISSION');
    }
    setCurrentCabMode('COMMISSION');
    setCabChoice('COMMISSION');
    toast.success('Commission model activated successfully!');
    useSidebarStore.getState().setActiveModule('CAB');
    router.push('/dashboard');
  };

  /*
   * Redirect to the dashboard selected before login.
   */
  const openSelectedDashboard = () => {
    const sidebarStore =
      useSidebarStore.getState();

    switch (selectedService) {
      case 'CAB':
        sidebarStore.setActiveModule('CAB');
        router.push('/dashboard');
        break;

      case 'CAR_RENTAL':
        sidebarStore.setActiveModule(
          'RENTAL'
        );
        router.push(
          '/car-rentals/dashboard'
        );
        break;

      case 'BIKE_RENTAL':
        sidebarStore.setActiveModule(
          'BIKE_RENTAL'
        );
        router.push(
          '/bike-rentals/dashboard'
        );
        break;

      default:
        sidebarStore.setActiveModule(null);
        router.push('/');
    }
  };

  /*
   * Handle plan card selection.
   */
  const handleSelectPlan = async (
    tier: SubscriptionInfo['tier']
  ) => {
    if (
      effectiveSubscription &&
      !isExpired &&
      tier === effectiveSubscription.tier
    ) {
      return;
    }

    if (!effectiveSubscription || isExpired) {
      setShowPaymentModal(tier);
      return;
    }

    setShowConfirmPlanDialog(tier);
  };

  /*
   * Confirm changing an existing plan.
   */
  const confirmPlanChange = () => {
    if (!showConfirmPlanDialog) {
      return;
    }

    const tier = showConfirmPlanDialog;

    setShowConfirmPlanDialog(null);
    setShowPaymentModal(tier);
  };

  /*
   * Handle both:
   * 1. New subscription
   * 2. Existing subscription plan change
   */
  const handleConfirmPayment = async (
    paymentData: PaymentData
  ) => {
    if (!showPaymentModal) {
      return;
    }

    if (!paymentData.paymentMethodId) {
      toast.error(
        'Payment method is required.'
      );
      return;
    }

    const tier = showPaymentModal;

    const planName =
      PLAN_CONFIG.find(
        (plan) => plan.tier === tier
      )?.name || tier;

    setIsSubmitting(true);
    setIsChanging(tier);

    try {
      if (!effectiveSubscription || isExpired) {
        await subscriptionService.setupSubscription({
          subscriptionTier: tier,
          paymentMethodId:
            paymentData.paymentMethodId,
        });

        toast.success(
          'Subscription setup successful!'
        );

        if (selectedService === 'CAB') {
          if (typeof window !== 'undefined') {
            localStorage.setItem('cab-access-mode', 'SUBSCRIPTION');
          }
          setCurrentCabMode('WITH_SUBSCRIPTION');
        }

        await hydrateFromSession();
        await fetchData(false);

        setShowPaymentModal(null);
        setSetupStep(3);
      } else {
        const updatedSubscription =
          await subscriptionService.changePlan(
            tier,
            paymentData.paymentMethodId
          );

        setSubscription(
          updatedSubscription
        );

        if (selectedService === 'CAB') {
          if (typeof window !== 'undefined') {
            localStorage.setItem('cab-access-mode', 'SUBSCRIPTION');
          }
          setCurrentCabMode('WITH_SUBSCRIPTION');
        }

        setShowPaymentModal(null);

        toast.success(
          `Subscription updated to ${planName}`
        );
      }
    } catch (error: unknown) {
      let message =
        'Failed to update subscription';

      if (
        typeof error === 'object' &&
        error !== null
      ) {
        const apiError = error as {
          response?: {
            data?: {
              message?: string | string[];
            };
          };
          message?: string;
        };

        message =
          Array.isArray(
            apiError.response?.data?.message
          )
            ? apiError.response.data.message.join(
                ', '
              )
            : apiError.response?.data
                ?.message ||
              apiError.message ||
              message;
      }

      toast.error(message);
    } finally {
      setIsSubmitting(false);
      setIsChanging(null);
    }
  };

  /*
   * Cancel the shared transport subscription.
   */
  const handleCancelSubscription =
    async () => {
      setIsCancelling(true);

      try {
        await subscriptionService.cancelSubscription();

        if (selectedService === 'CAB') {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('cab-access-mode');
          }
          setCurrentCabMode(null);
          setCabChoice(null);
        }

        await hydrateFromSession();

        setShowCancelDialog(false);

        toast.success(
          'Subscription cancelled successfully.'
        );
      } catch (error: unknown) {
        let message =
          'Failed to cancel subscription';

        if (
          typeof error === 'object' &&
          error !== null
        ) {
          const apiError = error as {
            response?: {
              data?: {
                message?: string | string[];
              };
            };
            message?: string;
          };

          message =
            Array.isArray(
              apiError.response?.data?.message
            )
              ? apiError.response.data.message.join(
                  ', '
                )
              : apiError.response?.data
                  ?.message ||
                apiError.message ||
                message;
        }

        toast.error(message);
      } finally {
        setIsCancelling(false);
      }
    };

  /*
   * Loading screen.
   */
  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FACC15] border-t-transparent" />
      </div>
    );
  }

  /*
   * Payment success screen.
   */
  if (setupStep === 3) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="flex w-full max-w-4xl flex-col items-center justify-center rounded-lg border border-[#27272A] bg-[#0F0F0F] px-4 py-12 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-green-500">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <h2 className="mb-3 text-3xl font-bold text-white">
            Payment Completed Successfully!
          </h2>

          <p className="mb-8 max-w-md text-[#A1A1AA]">
            Your payment was successful and
            your subscription plan is now
            active. You can now access your
            selected GOZOLT supplier service.
          </p>

          <button
            type="button"
            onClick={openSelectedDashboard}
            className="rounded-full bg-[#FACC15] px-8 py-3 text-sm font-semibold text-black shadow-lg shadow-[#FACC15]/20 transition-colors hover:bg-[#EAB308]"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {((subscription && !isExpired) || currentCabMode === 'COMMISSION') && (
            <button
              type="button"
              onClick={() => router.push(selectedService === 'CAB' ? '/dashboard' : '/')}
              className="mt-1 flex shrink-0 items-center justify-center rounded-full bg-white/5 p-2 text-[#A1A1AA] transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">
              {selectedService === 'CAB'
                ? 'Cab Booking Pricing & Access Model'
                : selectedService
                ? `${SUPPLIER_SERVICE_NAMES[selectedService]} Subscription`
                : 'Subscription'}
            </h1>

            {selectedService && (
              <p className="mt-1 text-sm text-[#A1A1AA]">
                {selectedService === 'CAB'
                  ? 'Choose between a fixed monthly subscription (0% commission) or pay-as-you-go commission model (9% per ride).'
                  : `Select a subscription plan for ${SUPPLIER_SERVICE_NAMES[selectedService]}.`}
              </p>
            )}
          </div>
        </div>

        {subscription && !isExpired && (
          <button
            type="button"
            onClick={() =>
              setShowCancelDialog(true)
            }
            className="shrink-0 rounded-md border border-red-500/30 bg-transparent px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            Cancel Subscription
          </button>
        )}
      </div>

      {/* Active Commission Model Notice */}
      {selectedService === 'CAB' && currentCabMode === 'COMMISSION' && (
        <div className="rounded-xl border border-[#27272A] bg-[#111111] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FACC15]/10 text-[#FACC15]">
                <Percent className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    Commission Model (9% Per Ride)
                  </h3>
                  <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-400">
                    Active
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#A1A1AA]">
                  You are currently operating on the pay-as-you-earn commission model with €0 monthly fee.
                  Standard 9% platform commission applies per completed passenger ride.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="rounded-lg bg-[#FACC15] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#EAB308]"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current subscription information */}
      {subscription && !isExpired && (
        <CurrentPlanBanner
          subscription={subscription}
          usage={usage}
          plans={PLAN_CONFIG}
          isLoading={isLoading}
        />
      )}

      {/* Expired Subscription Notice */}
      {isExpired && effectiveSubscription && (
        <ExpiredSubscriptionBanner
          subscription={effectiveSubscription}
          plans={PLAN_CONFIG}
          selectedService={selectedService}
        />
      )}

      {/* CAB Options: Subscription vs Commission */}
      {selectedService === 'CAB' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">
              {currentCabMode ? 'Switch or Review Pricing Model' : 'Select Your Operating Model'}
            </h2>
            <p className="mt-1 text-sm text-[#A1A1AA]">
              Choose how you want to partner with GOZOLT for your cab fleet. You can switch models anytime.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Subscription Option Card */}
            <button
              type="button"
              onClick={() => setCabChoice('WITH_SUBSCRIPTION')}
              className={`rounded-2xl border p-6 text-left transition-all ${
                cabChoice === 'WITH_SUBSCRIPTION'
                  ? 'border-[#FACC15] bg-[#FACC15]/10 shadow-lg shadow-[#FACC15]/5'
                  : 'border-[#27272A] bg-[#111111] hover:border-[#FACC15]/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FACC15]/10 text-[#FACC15]">
                  <Crown className="h-6 w-6" />
                </div>
                {cabChoice === 'WITH_SUBSCRIPTION' && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FACC15] text-black">
                    <Check className="h-4 w-4 stroke-[3]" />
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xl font-bold text-white">Subscription Model</h3>
                  <span className="rounded-full bg-[#FACC15]/20 px-2.5 py-0.5 text-xs font-semibold text-[#FACC15]">
                    0% Commission
                  </span>
                </div>
                <p className="mt-1 text-2xl font-black text-white">
                  From €99 <span className="text-xs font-normal text-[#A1A1AA]">/ month</span>
                </p>
                <p className="mt-2 text-sm text-[#A1A1AA]">
                  Pay a fixed monthly fee based on your fleet size. Keep 100% of your ride fares with 0% platform commission.
                </p>
              </div>
            </button>

            {/* Commission Option Card */}
            <button
              type="button"
              onClick={() => setCabChoice('COMMISSION')}
              className={`rounded-2xl border p-6 text-left transition-all ${
                cabChoice === 'COMMISSION'
                  ? 'border-[#FACC15] bg-[#FACC15]/10 shadow-lg shadow-[#FACC15]/5'
                  : 'border-[#27272A] bg-[#111111] hover:border-[#FACC15]/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-[#FACC15]">
                  <Percent className="h-6 w-6" />
                </div>
                {cabChoice === 'COMMISSION' && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FACC15] text-black">
                    <Check className="h-4 w-4 stroke-[3]" />
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xl font-bold text-white">Commission Model</h3>
                  <span className="rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-semibold text-green-400">
                    No Upfront Fee
                  </span>
                </div>
                <p className="mt-1 text-2xl font-black text-white">
                  €0 <span className="text-xs font-normal text-[#A1A1AA]">/ month + 9% per ride</span>
                </p>
                <p className="mt-2 text-sm text-[#A1A1AA]">
                  No upfront subscription required. Pay only a standard 9% platform commission per completed passenger ride.
                </p>
              </div>
            </button>
          </div>

          {/* Details for Commission Model */}
          {cabChoice === 'COMMISSION' && (
            <div className="rounded-2xl border border-[#27272A] bg-[#111111] p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Commission Model Benefits</h3>
                <p className="text-sm text-[#A1A1AA] mt-1">
                  Start operating and receiving ride requests right away with zero upfront cost.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {CAB_COMMISSION_FEATURES.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FACC15]/10 text-[#FACC15]">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span className="text-sm text-[#D4D4D8]">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-[#A1A1AA]">
                  Ready to proceed? No credit card required for the commission model.
                </div>
                <button
                  type="button"
                  onClick={handleContinueWithCommission}
                  className="w-full sm:w-auto rounded-full bg-[#FACC15] px-8 py-3 text-sm font-bold text-black transition-colors hover:bg-[#EAB308] shadow-lg shadow-[#FACC15]/20"
                >
                  Continue with Commission Model
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* First time Welcome message for non-CAB services */}
      {!effectiveSubscription && !isExpired && selectedService !== 'CAB' && (
        <div className="mb-4 space-y-2 py-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Welcome to GOZOLT
          </h2>

          <p className="text-[#A1A1AA]">
            Your account does not have an
            active subscription. Please select
            a plan to continue.
          </p>
        </div>
      )}

      {/* Subscription plans */}
      {(selectedService !== 'CAB' || cabChoice === 'WITH_SUBSCRIPTION') && (
        <div className="space-y-4">
          {selectedService === 'CAB' && (
            <div>
              <h3 className="text-lg font-bold text-white">Choose Your Fleet Tier</h3>
              <p className="text-sm text-[#A1A1AA]">
                Select the plan that fits your vehicle and driver fleet size.
              </p>
            </div>
          )}
          <PlanComparisonCards
            plans={PLAN_CONFIG}
            currentTier={
              subscription?.tier || effectiveSubscription?.tier || null
            }
            isChanging={isChanging}
            onSelectPlan={handleSelectPlan}
            isExpired={isExpired}
          />
        </div>
      )}

      {/* Cancel subscription dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-[420px] rounded-xl border border-[#27272A] bg-[#111111] p-6">
            <h3 className="text-lg font-bold text-white">
              Cancel Subscription
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-[#A1A1AA]">
              Are you sure? Cancelling your
              subscription will immediately
              lock you out of the GOZOLT
              Supplier Portal. You will need to
              subscribe again to regain access.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowCancelDialog(false)
                }
                disabled={isCancelling}
                className="flex-1 rounded-lg bg-[#3F3F46] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#52525B] disabled:opacity-50"
              >
                Keep Subscription
              </button>

              <button
                type="button"
                onClick={
                  handleCancelSubscription
                }
                disabled={isCancelling}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCancelling && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}

                {isCancelling
                  ? 'Cancelling...'
                  : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm plan change dialog */}
      {showConfirmPlanDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-[420px] rounded-xl border border-[#27272A] bg-[#111111] p-6">
            <h3 className="text-lg font-bold text-white">
              Change Subscription Plan
            </h3>

            <p className="mt-2 text-sm text-[#A1A1AA]">
              Are you sure you want to switch
              to{' '}
              <span className="font-semibold text-white">
                {
                  PLAN_CONFIG.find(
                    (plan) =>
                      plan.tier ===
                      showConfirmPlanDialog
                  )?.name
                }
              </span>
              ? Your subscription will change
              after payment confirmation.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPlanDialog(null)
                }
                className="flex-1 rounded-lg bg-[#3F3F46] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#52525B]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmPlanChange}
                className="flex-1 rounded-lg bg-[#FACC15] py-2.5 text-sm font-medium text-black transition-colors hover:bg-[#EAB308]"
              >
                Yes, Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative max-h-[90vh] w-full max-w-[600px] overflow-y-auto rounded-xl border border-[#27272A] bg-[#111111] p-6">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowPaymentModal(null)
                }
                disabled={isSubmitting}
                aria-label="Close payment modal"
                className="text-[#A1A1AA] transition-colors hover:text-white disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <Step5Payment
              selectedTier={
                showPaymentModal
              }
              initialValues={cardData}
              ownerName={
                user?.companyName || ''
              }
              companyAddress={
                user?.address || ''
              }
              companyCity={
                user?.city || ''
              }
              isSubmitting={isSubmitting}
              onNext={handleConfirmPayment}
            />
          </div>
        </div>
      )}
    </div>
  );
}

