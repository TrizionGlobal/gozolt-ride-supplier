'use client';

import { ArrowLeft, ChevronRight, Check } from 'lucide-react';

type PlanTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

interface PlanCard {
  tier: PlanTier;
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

const PLANS: PlanCard[] = [
  {
    tier: 'STARTER',
    name: 'Starter',
    price: '€ 49/mo',
    features: ['Up to 5 vehicles', 'Up to 5 drivers', 'Basic analytics', 'Email'],
  },
  {
    tier: 'PROFESSIONAL',
    name: 'Professional',
    price: '€ 99/mo',
    recommended: true,
    features: [
      'Up to 25 vehicles',
      'Up to 25 drivers',
      'Full analytics',
      'Advanced analytics',
      'API tracking',
      'WhatsApp, Telegram, Email, SMS',
    ],
  },
  {
    tier: 'ENTERPRISE',
    name: 'Enterprise',
    price: '€ 199/mo',
    features: [
      'Unlimited vehicles',
      'Unlimited vehicles/drivers',
      'Full analytics',
      'Full branding',
      'WhatsApp, Telegram, Email, SMS',
    ],
  },
];

interface Step4Props {
  selectedPlan: PlanTier;
  onPlanChange: (plan: PlanTier) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function Step4Plan({ selectedPlan, onPlanChange, onNext, onPrevious }: Step4Props) {
  return (
    <div className="rounded-lg border border-[#27272A] bg-[#0F0F0F] p-6">
      <div className="mb-6 border-b border-[#27272A] pb-4">
        <h2 className="text-lg font-bold text-white">Step 4 : Plan</h2>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.tier;
          return (
            <div
              key={plan.tier}
              className={`relative flex flex-col rounded-lg border p-5 transition-colors ${
                isSelected ? 'border-[#FACC15]' : 'border-[#27272A]'
              } bg-[#111111]`}
            >
              {plan.recommended && (
                <span className="absolute -top-0 right-3 -translate-y-1/2 rounded-full bg-[#7C3AED] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                  RECOMMENDED
                </span>
              )}
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <p className="mt-1 text-2xl font-bold text-[#FACC15]">{plan.price}</p>
              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-[#D4D4D8]">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#A1A1AA]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onPlanChange(plan.tier)}
                className={`mt-5 w-full rounded-full py-2 text-sm font-semibold transition-colors ${
                  isSelected
                    ? 'bg-[#FACC15] text-black'
                    : 'border border-[#3F3F46] bg-transparent text-white hover:border-[#FACC15]'
                }`}
              >
                {isSelected ? 'Selected ✓' : 'Select'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-6">
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
          Done
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
