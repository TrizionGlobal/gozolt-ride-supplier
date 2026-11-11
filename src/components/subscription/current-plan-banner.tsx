'use client';

import { Crown } from 'lucide-react';
import type { SubscriptionInfo, PlanDetails } from '@/types';

interface CurrentPlanBannerProps {
  subscription: SubscriptionInfo | null;
  usage: { totalVehicles: number; totalDrivers: number; totalRides?: number } | null;
  plans: PlanDetails[];
  isLoading: boolean;
}

export function CurrentPlanBanner({ subscription, usage, plans, isLoading }: CurrentPlanBannerProps) {
  if (isLoading || !subscription || !usage) {
    return (
      <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
        <div className="h-6 w-48 rounded bg-[#27272A] animate-pulse mb-3" />
        <div className="h-4 w-64 rounded bg-[#27272A] animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex-1 h-4 rounded bg-[#27272A] animate-pulse" />
          <div className="flex-1 h-4 rounded bg-[#27272A] animate-pulse" />
          <div className="flex-1 h-4 rounded bg-[#27272A] animate-pulse" />
        </div>
      </div>
    );
  }

  const currentPlan = plans.find((p) => p.tier === subscription.tier);
  const nextBilling = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

  const hasVehicleLimits = Boolean(currentPlan?.maxVehicles && currentPlan.maxVehicles < 9000);
  const hasDriverLimits = Boolean(currentPlan?.maxDrivers && currentPlan.maxDrivers < 9000);

  const vehiclePercent = hasVehicleLimits && currentPlan?.maxVehicles
    ? Math.min((usage.totalVehicles / currentPlan.maxVehicles) * 100, 100)
    : 0;
  const driverPercent = hasDriverLimits && currentPlan?.maxDrivers
    ? Math.min((usage.totalDrivers / currentPlan.maxDrivers) * 100, 100)
    : 0;
  const isUnlimitedRides = !currentPlan?.maxRides || currentPlan.maxRides > 900000;
  const ridePercent = isUnlimitedRides
    ? 0
    : Math.min(((usage.totalRides || 0) / currentPlan.maxRides) * 100, 100);

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#111111] p-6">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-[#FACC15]" />
            <h3 className="text-lg font-bold text-white">{currentPlan?.name || subscription.tier} plan</h3>
          </div>
          <p className="mt-1 text-sm text-[#A1A1AA]">
            € {currentPlan?.price || 0}/month • Next billing: {nextBilling}
          </p>
        </div>
        <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
          Active
        </span>
      </div>

      {/* Usage section */}
      {hasVehicleLimits || hasDriverLimits ? (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vehicles */}
          <div className="flex-1">
            <p className="mb-2 text-sm text-[#D4D4D8]">
              Vehicles: {usage.totalVehicles} / {currentPlan?.maxVehicles}
            </p>
            <div className="h-2 w-full rounded-full bg-[#3F3F46]">
              <div
                className="h-2 rounded-full bg-[#3B82F6] transition-all"
                style={{ width: `${vehiclePercent}%` }}
              />
            </div>
          </div>
          {/* Drivers */}
          <div className="flex-1">
            <p className="mb-2 text-sm text-[#D4D4D8]">
              Drivers: {usage.totalDrivers} / {currentPlan?.maxDrivers}
            </p>
            <div className="h-2 w-full rounded-full bg-[#3F3F46]">
              <div
                className="h-2 rounded-full bg-[#FACC15] transition-all"
                style={{ width: `${driverPercent}%` }}
              />
            </div>
          </div>
          {/* Rides */}
          <div className="flex-1">
            <p className="mb-2 text-sm text-[#D4D4D8]">
              Rides: {usage.totalRides || 0} / {isUnlimitedRides ? 'Unlimited' : currentPlan?.maxRides}
            </p>
            <div className="h-2 w-full rounded-full bg-[#3F3F46]">
              <div
                className="h-2 rounded-full bg-[#10B981] transition-all"
                style={{ width: `${ridePercent}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#D4D4D8]">
                Monthly Rides: <span className="font-semibold text-white">{usage.totalRides || 0}</span> / {isUnlimitedRides ? 'Unlimited' : currentPlan?.maxRides}
              </p>
              {!isUnlimitedRides && currentPlan?.maxRides && (
                <span className="text-xs text-[#A1A1AA]">
                  {Math.max(0, currentPlan.maxRides - (usage.totalRides || 0))} rides remaining
                </span>
              )}
            </div>
            {!isUnlimitedRides && (
              <div className="h-2.5 w-full rounded-full bg-[#3F3F46]">
                <div
                  className="h-2.5 rounded-full bg-[#10B981] transition-all"
                  style={{ width: `${ridePercent}%` }}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-6 pt-2 text-xs text-[#A1A1AA]">
            <span>Active Fleet: <strong className="text-white">{usage.totalVehicles}</strong> Vehicles</span>
            <span>•</span>
            <span><strong className="text-white">{usage.totalDrivers}</strong> Drivers</span>
            <span className="rounded-full bg-[#27272A] px-2 py-0.5 text-[11px] text-[#A1A1AA]">No vehicle or driver limits</span>
          </div>
        </div>
      )}
    </div>
  );
}
