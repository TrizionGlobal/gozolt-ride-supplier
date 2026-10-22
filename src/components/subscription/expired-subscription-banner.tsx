'use client';

import { ReactNode } from 'react';
import { AlertTriangle, Calendar, Clock, CreditCard } from 'lucide-react';
import type { SubscriptionInfo, PlanDetails } from '@/types';
import { SUPPLIER_SERVICE_NAMES, type SupplierService } from '@/types/supplier-service';

interface ExpiredSubscriptionBannerProps {
  subscription:
    | SubscriptionInfo
    | {
        tier: string;
        currentPeriodEnd: string | null;
        createdAt?: string | null;
      }
    | null;
  plans: PlanDetails[];
  serviceName?: string;
  selectedService?: SupplierService | string | null;
}

interface ServiceInformativeContent {
  title: string;
  subtitle: string;
  message: ReactNode;
}

function getServiceInformativeContent(
  selectedService?: SupplierService | string | null,
  serviceName?: string
): ServiceInformativeContent {
  const serviceKey = selectedService || '';

  if (serviceKey === 'CAB') {
    return {
      title: 'Cab Booking',
      subtitle:
        'Your Cab Booking subscription has ended. Renewal is required to continue taxi dispatch operations.',
      message: (
        <>
          To continue accessing your{' '}
          <strong className="text-white">GOZOLT Cab Booking</strong> supplier
          dashboard, dispatching your cabs, managing drivers, and accepting
          live taxi ride bookings, please select a subscription plan below to
          renew your account.
        </>
      ),
    };
  }

  if (serviceKey === 'CAR_RENTAL' || serviceKey === 'RENTAL') {
    return {
      title: 'Car Rental',
      subtitle:
        'Your Car Rental subscription has ended. Renewal is required to manage your rental fleet and reservations.',
      message: (
        <>
          To continue accessing your{' '}
          <strong className="text-white">GOZOLT Car Rental</strong> supplier
          dashboard, managing your rental fleet, handling customer reservations,
          and receiving vehicle rental bookings, please select a subscription plan
          below to renew your account.
        </>
      ),
    };
  }

  if (serviceKey === 'BIKE_RENTAL') {
    return {
      title: 'Bike Rental',
      subtitle:
        'Your Bike Rental subscription has ended. Renewal is required to manage your two-wheeler fleet.',
      message: (
        <>
          To continue accessing your{' '}
          <strong className="text-white">GOZOLT Bike Rental</strong> supplier
          dashboard, managing your two-wheeler fleet, tracking bike
          availability, and accepting rental bookings, please select a
          subscription plan below to renew your account.
        </>
      ),
    };
  }

  if (serviceKey === 'AIRPORT_TRANSFER') {
    return {
      title: 'Airport Transport',
      subtitle:
        'Your Airport Transport subscription has ended. Renewal is required to continue receiving airport pickup and drop-off bookings.',
      message: (
        <>
          To continue accessing your{' '}
          <strong className="text-white">GOZOLT Airport Transport</strong> supplier
          dashboard, receiving user transfer bookings, and dispatching drivers
          for airport pickups and drop-offs between selected locations, please
          select a subscription plan below to renew your account.
        </>
      ),
    };
  }

  if (serviceKey === 'QUICK_SERVICES') {
    return {
      title: 'Quick Services',
      subtitle:
        'Your Quick Services subscription has ended. Renewal is required to accept customer service requests.',
      message: (
        <>
          To continue accessing your{' '}
          <strong className="text-white">GOZOLT Quick Services</strong> supplier
          dashboard, dispatching service providers, and accepting on-demand
          customer assistance requests, please select a subscription plan below
          to renew your account.
        </>
      ),
    };
  }

  const fallbackName =
    serviceName ||
    (selectedService &&
      (SUPPLIER_SERVICE_NAMES as Record<string, string>)[selectedService]) ||
    'Supplier Portal';

  return {
    title: fallbackName,
    subtitle: `Your ${fallbackName} subscription has ended. Renewal is required to continue operations.`,
    message: (
      <>
        To continue accessing your{' '}
        <strong className="text-white">GOZOLT {fallbackName}</strong> supplier
        dashboard, managing your fleet, and accepting customer bookings, please
        select a subscription plan below to renew your account.
      </>
    ),
  };
}

export function ExpiredSubscriptionBanner({
  subscription,
  plans,
  serviceName,
  selectedService,
}: ExpiredSubscriptionBannerProps) {
  if (!subscription) return null;

  const currentPlan = plans.find((p) => p.tier === subscription.tier);
  const planName = currentPlan?.name || `${subscription.tier} Fleet Plan`;
  const planPrice = currentPlan?.price ? `€${currentPlan.price}/month` : null;

  // Format Expired Date
  const expiredDateStr = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  // Format Subscribed Date (fallback to 30 days before currentPeriodEnd if createdAt is not available)
  let subscribedDateStr = 'N/A';
  if (subscription.createdAt) {
    subscribedDateStr = new Date(subscription.createdAt).toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  } else if (subscription.currentPeriodEnd) {
    const fallbackStart = new Date(
      new Date(subscription.currentPeriodEnd).getTime() -
        30 * 24 * 60 * 60 * 1000
    );
    subscribedDateStr = fallbackStart.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  const informativeContent = getServiceInformativeContent(
    selectedService,
    serviceName
  );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-b from-[#180C0C] via-[#111111] to-[#0A0A0A] p-6 md:p-8 shadow-2xl shadow-red-950/20">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-red-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-[#FACC15]/5 blur-3xl" />

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A]/80 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 shadow-inner">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                Subscription Expired
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                Expired
              </span>
            </div>
            <p className="mt-1 text-xs md:text-sm text-[#A1A1AA]">
              {informativeContent.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Details Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Previous Plan */}
        <div className="rounded-xl border border-[#27272A] bg-[#161616]/80 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
            <CreditCard className="h-4 w-4 text-[#FACC15]" />
            Previous Plan
          </div>
          <div className="mt-2">
            <p className="text-base font-bold text-white">{planName}</p>
            {planPrice && <p className="text-xs text-[#A1A1AA]">{planPrice}</p>}
          </div>
        </div>

        {/* Subscribed Date */}
        <div className="rounded-xl border border-[#27272A] bg-[#161616]/80 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
            <Calendar className="h-4 w-4 text-[#3B82F6]" />
            Subscribed Date
          </div>
          <div className="mt-2">
            <p className="text-base font-bold text-white">{subscribedDateStr}</p>
            <p className="text-xs text-[#71717A]">Plan activation date</p>
          </div>
        </div>

        {/* Expired Date */}
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400">
            <Clock className="h-4 w-4 text-red-500" />
            Expired Date
          </div>
          <div className="mt-2">
            <p className="text-base font-bold text-red-400">{expiredDateStr}</p>
            <p className="text-xs text-red-400/70">Ended billing cycle</p>
          </div>
        </div>
      </div>

      {/* Informative message to continue with Gozolt - customized per service */}
      <div className="mt-6 rounded-xl border border-[#27272A] bg-black/40 p-4 text-center sm:text-left">
        <p className="text-sm leading-relaxed text-[#D4D4D8]">
          {informativeContent.message}
        </p>
      </div>
    </div>
  );
}
