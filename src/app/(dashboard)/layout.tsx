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
  const { user, hydrateFromSession, isLoading, authError } =
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
    if (!isLoading && !user && !authError) {
      router.replace('/login');
    }
  }, [isLoading, user, authError, router]);

  // Handle subscription and selected-service routing
  useEffect(() => {
    if (isLoading || !user || user.status !== 'ACTIVE') {
      return;
    }

    const selectedService = user.registeredService || localStorage.getItem(
      'gozolt-selected-service'
    );
    
    if (selectedService && selectedService !== localStorage.getItem('gozolt-selected-service')) {
      localStorage.setItem('gozolt-selected-service', selectedService);
    }

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
      router.replace('/welcome');
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
      const qsAccessMode = user.quickServiceAccessMode || localStorage.getItem('quick-services-access-mode');
      const hasChosenWithoutSub = qsAccessMode === 'WITHOUT_SUBSCRIPTION';

      if (
        !hasActiveSubscription &&
        !hasChosenWithoutSub &&
        !isQuickServicesSubscriptionPage
      ) {
        router.replace('/quick-services/subscription');
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
  if (!user && !authError) {
    return null;
  }

  // Show Error screen if an API/Network error occurred
  if (authError) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="rounded-full bg-red-500/10 p-3">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-[#D4D4D8] font-medium">
            {authError}
          </p>
          <button 
            onClick={() => hydrateFromSession()}
            className="mt-2 rounded-lg bg-[#27272A] px-4 py-2 text-sm font-medium text-white hover:bg-[#3f3f46] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
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