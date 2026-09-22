'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useAuthStore } from '@/stores/auth.store';
import { useSidebarStore } from '@/stores/sidebar.store';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { CookieConsentBanner } from '@/components/shared/cookie-consent-banner';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, hydrateFromSession, isLoading } =
    useAuthStore();

  const isCollapsed = useSidebarStore(
    (state) => state.isCollapsed
  );

  const router = useRouter();
  const pathname = usePathname();

  // Restore authenticated supplier session
  useEffect(() => {
    hydrateFromSession();
  }, [hydrateFromSession]);

  // Send unauthenticated users to Login
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  // Handle subscription and selected-service routing
  useEffect(() => {
    if (isLoading || !user || user.status !== 'ACTIVE') {
      return;
    }

    const selectedService = localStorage.getItem(
      'gozolt-selected-service'
    );

    const quickServicesMode = localStorage.getItem(
      'quick-services-access-mode'
    );

    const activeModule =
      useSidebarStore.getState().activeModule;

    const isMissingSubscription = !user.subscription;

    const isExpired = Boolean(
      user.subscription?.currentPeriodEnd &&
        new Date(user.subscription.currentPeriodEnd) <
          new Date()
    );

    const hasActiveSubscription =
      !isMissingSubscription && !isExpired;

    const hasQuickServicesAccess =
      selectedService === 'QUICK_SERVICES' &&
      (quickServicesMode === 'WITH_SUBSCRIPTION' ||
        quickServicesMode === 'WITHOUT_SUBSCRIPTION');

    const isCommonSubscriptionPage =
      pathname === '/subscription';

    const isQuickServicesSubscriptionPage =
      pathname.startsWith(
        '/quick-services/subscription'
      );

    const isAnySubscriptionPage =
      isCommonSubscriptionPage ||
      isQuickServicesSubscriptionPage;

    // No service was selected
    if (!selectedService) {
      router.replace('/');
      return;
    }

    /*
     * QUICK SERVICES
     *
     * Quick Services supports:
     * 1. With Subscription
     * 2. Without Subscription
     */
    if (selectedService === 'QUICK_SERVICES') {
      if (
        !hasQuickServicesAccess &&
        !isQuickServicesSubscriptionPage
      ) {
        router.replace('/quick-services/subscription');
        return;
      }

      if (
        hasQuickServicesAccess &&
        isQuickServicesSubscriptionPage
      ) {
        router.replace('/quick-services/dashboard');
        return;
      }
    }

    /*
     * CAB, CAR RENTAL AND BIKE RENTAL
     *
     * These services require the common subscription.
     */
    if (
      selectedService !== 'QUICK_SERVICES' &&
      !hasActiveSubscription &&
      !isCommonSubscriptionPage
    ) {
      router.replace(
        `/subscription?service=${encodeURIComponent(
          selectedService
        )}`
      );

      return;
    }

    // After completing the common subscription,
    // open the selected service dashboard.
    if (
      selectedService !== 'QUICK_SERVICES' &&
      hasActiveSubscription &&
      isCommonSubscriptionPage
    ) {
      switch (selectedService) {
        case 'CAB':
          useSidebarStore
            .getState()
            .setActiveModule('CAB');

          router.replace('/dashboard');
          return;

        case 'CAR_RENTAL':
          useSidebarStore
            .getState()
            .setActiveModule('RENTAL');

          router.replace('/car-rentals/dashboard');
          return;

        case 'BIKE_RENTAL':
          useSidebarStore
            .getState()
            .setActiveModule('BIKE_RENTAL');

          router.replace('/bike-rentals/dashboard');
          return;
      }
    }

    // If the sidebar module was lost, restore it
    // from the selected service.
    if (!activeModule && !isAnySubscriptionPage) {
      switch (selectedService) {
        case 'CAB':
          useSidebarStore
            .getState()
            .setActiveModule('CAB');
          break;

        case 'CAR_RENTAL':
          useSidebarStore
            .getState()
            .setActiveModule('RENTAL');
          break;

        case 'BIKE_RENTAL':
          useSidebarStore
            .getState()
            .setActiveModule('BIKE_RENTAL');
          break;

        case 'QUICK_SERVICES':
          useSidebarStore
            .getState()
            .setActiveModule('QUICK_SERVICES');
          break;

        default:
          router.replace('/');
      }
    }
  }, [user, isLoading, pathname, router]);

  // Loading screen
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FCD223] border-t-transparent" />

          <p className="text-sm text-[#6B7280]">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Prevent protected content from briefly appearing
  if (!user) {
    return null;
  }

  /*
   * Subscription setup pages do not show the sidebar.
   *
   * This applies to:
   * - Common transport subscription
   * - Quick Services subscription
   */
  const isSubscriptionSetupPage =
    pathname === '/subscription' ||
    pathname.startsWith(
      '/quick-services/subscription'
    );

  if (isSubscriptionSetupPage) {
    return (
      <div className="min-h-screen bg-black">
        <Topbar />

        <main className="p-6">
          {children}
        </main>

        <CookieConsentBanner />
      </div>
    );
  }

  // Normal dashboard layout
  return (
    <div className="min-h-screen bg-black">
      <Sidebar />

      <div
        className={cn(
          'transition-all duration-300',
          isCollapsed
            ? 'ml-[68px]'
            : 'ml-[240px]'
        )}
      >
        <Topbar />

        <main className="p-6">
          {children}
        </main>
      </div>

      <CookieConsentBanner />
    </div>
  );
}