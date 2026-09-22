'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { Step5Payment } from '@/components/auth/step5-payment';
import { CurrentPlanBanner } from '@/components/subscription/current-plan-banner';
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
    const urlParams = new URLSearchParams(
      window.location.search
    );

    const serviceFromUrl =
      urlParams.get('service');

    const savedService =
      localStorage.getItem(
        'gozolt-selected-service'
      );

    const service =
      isSupplierService(serviceFromUrl)
        ? serviceFromUrl
        : isSupplierService(savedService)
          ? savedService
          : null;

    if (
      !service ||
      service === 'QUICK_SERVICES'
    ) {
      router.replace('/');
      return;
    }

    localStorage.setItem(
      'gozolt-selected-service',
      service
    );

    setSelectedService(service);
  }, [router]);

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

  const isExpired = Boolean(
    subscription?.currentPeriodEnd &&
      new Date(
        subscription.currentPeriodEnd
      ) < new Date()
  );

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
      subscription &&
      !isExpired &&
      tier === subscription.tier
    ) {
      return;
    }

    if (!subscription || isExpired) {
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
      if (!subscription || isExpired) {
        await subscriptionService.setupSubscription({
          subscriptionTier: tier,
          paymentMethodId:
            paymentData.paymentMethodId,
        });

        toast.success(
          'Subscription setup successful!'
        );

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

        await fetch('/api/auth/logout', {
          method: 'POST',
        });

        clearAuth();

        localStorage.removeItem(
          'gozolt-selected-service'
        );

        useSidebarStore
          .getState()
          .setActiveModule(null);

        setShowCancelDialog(false);

        toast.success(
          'Subscription cancelled successfully.'
        );

        router.push('/');
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
        <div>
          <h1 className="text-2xl font-bold text-white">
            {selectedService
              ? `${SUPPLIER_SERVICE_NAMES[selectedService]} Subscription`
              : 'Subscription'}
          </h1>

          {selectedService && (
            <p className="mt-1 text-sm text-[#A1A1AA]">
              Select a subscription plan for{' '}
              {
                SUPPLIER_SERVICE_NAMES[
                  selectedService
                ]
              }
              .
            </p>
          )}
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

      {/* Current subscription information */}
      {subscription && !isExpired && (
        <CurrentPlanBanner
          subscription={subscription}
          usage={usage}
          plans={PLAN_CONFIG}
          isLoading={isLoading}
        />
      )}

      {/* Welcome message */}
      {(!subscription || isExpired) && (
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
      <PlanComparisonCards
        plans={PLAN_CONFIG}
        currentTier={
          subscription?.tier || null
        }
        isChanging={isChanging}
        onSelectPlan={handleSelectPlan}
      />

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

