import { apiClient } from '@/lib/api-client';

export type QuickServicesPaidPlan =
  | 'QUICK_BASIC'
  | 'QUICK_ADVANCED';

interface CheckoutResponse {
  checkoutUrl: string;
}

export const quickServicesSubscriptionService = {
  async createCheckout(
    plan: QuickServicesPaidPlan
  ): Promise<CheckoutResponse> {
    const response = await apiClient.post(
      '/quick-services/supplier/subscription/checkout',
      {
        serviceType: 'QUICK_SERVICES',
        subscriptionMode:
          'WITH_SUBSCRIPTION',
        plan,
      }
    );

    return response.data;
  },

  async continueWithoutSubscription():
    Promise<void> {
    /*
     * Temporary local frontend testing.
     *
     * The backend endpoint is not available yet.
     * In production, the API request below will run.
     */
    if (
      process.env.NODE_ENV === 'development'
    ) {
      return;
    }

    await apiClient.post(
      '/quick-services/supplier/subscription/standard-access',
      {
        serviceType: 'QUICK_SERVICES',
        subscriptionMode:
          'WITHOUT_SUBSCRIPTION',
      }
    );
  },
};