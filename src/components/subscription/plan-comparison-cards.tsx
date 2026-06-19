'use client';

import { Check } from 'lucide-react';
import type { PlanDetails, SubscriptionInfo } from '@/types';

interface PlanComparisonCardsProps {
  plans: PlanDetails[];
  currentTier: SubscriptionInfo['tier'] | null;
  isChanging: string | null;
  onSelectPlan: (tier: SubscriptionInfo['tier']) => void;
}

export function PlanComparisonCards({ plans, currentTier, isChanging, onSelectPlan }: PlanComparisonCardsProps) {
  return (
    <div className="rounded-lg border border-[#27272A] bg-[#0A0A0A] p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = currentTier === plan.tier;
          const isRecommended = plan.isRecommended;

          return (
            <div
              key={plan.tier}
              className={`relative flex flex-col rounded-xl p-6 ${
                isRecommended
                  ? 'border-2 border-[#FACC15] bg-[#1E3A5F]'
                  : 'border border-[#3F3F46] bg-[#1A1A1A]'
              }`}
            >
              {/* Recommended badge */}
              {isRecommended && (
                <div className="mb-3 flex justify-center">
                  <span className="rounded-full bg-[#FACC15] px-3 py-1 text-xs font-bold uppercase text-black">
                    Recommended
                  </span>
                </div>
              )}

              {/* Plan name + price */}
              <h3 className="text-center text-xl font-bold text-white">{plan.name}</h3>
              <p className="mt-2 text-center text-3xl font-bold text-[#FACC15]">
                € {plan.price}/mo
              </p>

              {/* Features */}
              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#FACC15]" />
                    <span className="text-sm text-[#D4D4D8]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Know more link */}
              <p className="mt-4 cursor-pointer text-center text-xs font-medium uppercase tracking-wide text-[#FACC15] hover:underline">
                Know More
              </p>

              {/* Select / Current button */}
              <button
                onClick={() => !isCurrent && onSelectPlan(plan.tier)}
                disabled={isCurrent || isChanging === plan.tier}
                className={`mt-4 w-full rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors ${
                  isCurrent
                    ? 'bg-[#FACC15] text-black cursor-default'
                    : 'bg-[#3F3F46] text-white hover:bg-[#52525B]'
                } disabled:opacity-70`}
              >
                {isChanging === plan.tier
                  ? 'Switching...'
                  : isCurrent
                    ? 'Current plan'
                    : 'Select'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
