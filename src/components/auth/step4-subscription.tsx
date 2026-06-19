'use client';

import { Check, ArrowLeft, ChevronRight } from 'lucide-react';

export interface PlanDetails {
  tier: 'STARTER' | 'GROWTH' | 'PROFESSIONAL' | 'ENTERPRISE';
  name: string;
  price: number;
  isRecommended?: boolean;
  features: string[];
}

const PLAN_CONFIG: PlanDetails[] = [
  {
    tier: 'STARTER',
    name: 'Starter Fleet',
    price: 49,
    features: [
      'Up to 5 Vehicles',
      'Up to 10 Drivers',
      'Up to 100 Rides / Month',
      'Fleet Management',
      'Vehicle Assignment',
      'Driver Management',
      'Ride Tracking',
      'Earnings Dashboard',
    ],
  },
  {
    tier: 'GROWTH',
    name: 'Growth Fleet',
    price: 149,
    features: [
      'Up to 20 Vehicles',
      'Up to 40 Drivers',
      'Up to 500 Rides / Month',
      'Everything in Starter',
      'Fleet Analytics',
      'Advanced Reports',
      'Priority Support',
    ],
  },
  {
    tier: 'PROFESSIONAL',
    name: 'Professional Fleet',
    price: 299,
    isRecommended: true,
    features: [
      'Up to 50 Vehicles',
      'Up to 100 Drivers',
      'Up to 1,500 Rides / Month',
      'Everything in Growth',
      'Driver Performance Reports',
      'Advanced Fleet Insights',
      'Multi-Manager Access',
    ],
  },
  {
    tier: 'ENTERPRISE',
    name: 'Enterprise Fleet',
    price: 499,
    features: [
      'Unlimited Vehicles',
      'Unlimited Drivers',
      'Unlimited Rides',
      'Unlimited Fleet Management',
      'Unlimited Driver Assignments',
      'Unlimited Ride Operations',
      'Dedicated Account Manager',
      'Premium Support',
    ],
  },
];

interface Step4SubscriptionProps {
  selectedTier: 'STARTER' | 'GROWTH' | 'PROFESSIONAL' | 'ENTERPRISE';
  onSelectTier: (tier: 'STARTER' | 'GROWTH' | 'PROFESSIONAL' | 'ENTERPRISE') => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step4Subscription({
  selectedTier,
  onSelectTier,
  onNext,
  onPrevious,
}: Step4SubscriptionProps) {
  return (
    <div className="rounded-lg border border-[#27272A] bg-[#0F0F0F] p-6">
      <div className="mb-6 border-b border-[#27272A] pb-4">
        <h2 className="text-lg font-bold text-white">Step 4: Subscription Plans</h2>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Choose the best plan for your fleet. You can change your plan at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {PLAN_CONFIG.map((plan) => {
          const isSelected = selectedTier === plan.tier;
          const isRecommended = plan.isRecommended;

          return (
            <div
              key={plan.tier}
              onClick={() => onSelectTier(plan.tier)}
              className={`relative flex flex-col rounded-xl p-5 cursor-pointer transition-all duration-200 border-2 ${
                isSelected
                  ? 'border-[#FACC15] bg-[#1A1A15] shadow-[0_0_15px_rgba(250,204,21,0.1)]'
                  : 'border-[#27272A] bg-[#111111] hover:border-[#3F3F46]'
              }`}
            >
              {/* Recommended badge */}
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[#FACC15] px-3 py-0.5 text-[10px] font-bold uppercase text-black">
                    Recommended
                  </span>
                </div>
              )}

              {/* Selection dot */}
              <div className="absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full border border-[#3F3F46] bg-transparent">
                {isSelected && (
                  <div className="h-3 w-3 rounded-full bg-[#FACC15]" />
                )}
              </div>

              {/* Plan name + price */}
              <h3 className="text-center text-md font-bold text-white mt-2">{plan.name}</h3>
              <p className="mt-2 text-center text-2xl font-black text-[#FACC15]">
                € {plan.price}/mo
              </p>

              {/* Features */}
              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FACC15]" />
                    <span className="text-xs text-[#D4D4D8]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Select indicator bar */}
              <div
                className={`mt-4 rounded-lg py-1.5 text-center text-xs font-bold transition-colors ${
                  isSelected
                    ? 'bg-[#FACC15] text-black'
                    : 'bg-[#1e1e21] text-[#A1A1AA]'
                }`}
              >
                {isSelected ? 'Selected' : 'Choose Plan'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-[#27272A]">
        <button
          type="button"
          onClick={onPrevious}
          className="flex items-center gap-1.5 rounded-full border border-[#3F3F46] bg-[#1A1A1A] px-5 py-2 text-sm text-white transition-colors hover:border-[#52525B]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-1 rounded-full bg-[#FACC15] px-6 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#EAB308]"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
