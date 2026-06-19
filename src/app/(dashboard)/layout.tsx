'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useSidebarStore } from '@/stores/sidebar.store';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { CookieConsentBanner } from '@/components/shared/cookie-consent-banner';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, hydrateFromSession, isLoading } = useAuthStore();
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    hydrateFromSession();
  }, [hydrateFromSession]);

  useEffect(() => {
    if (!isLoading && user && user.status === 'ACTIVE') {
      const isMissingSubscription = !user.subscription;
      const isExpired =
        user.subscription?.currentPeriodEnd &&
        new Date(user.subscription.currentPeriodEnd) < new Date();

      if ((isMissingSubscription || isExpired) && pathname !== '/subscription') {
        router.push('/subscription');
      }
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FACC15] border-t-transparent" />
          <p className="text-sm text-[#6B7280]">Loading...</p>
        </div>
      </div>
    );
  }

  // If the user has no subscription or is expired, we render only the topbar and the main content (no sidebar)
  const isExpired = user?.subscription?.currentPeriodEnd && new Date(user.subscription.currentPeriodEnd) < new Date();
  const isSubscriptionSetup = pathname === '/subscription' && (!user?.subscription || isExpired);

  if (isSubscriptionSetup) {
    return (
      <div className="min-h-screen bg-black">
        <Topbar />
        <main className="p-6">{children}</main>
        <CookieConsentBanner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          isCollapsed ? 'ml-[68px]' : 'ml-[240px]',
        )}
      >
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
      <CookieConsentBanner />
    </div>
  );
}
