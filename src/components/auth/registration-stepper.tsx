'use client';

import { Check } from 'lucide-react';

const STEPS = [
  { number: 1, label: 'Company Info' },
  { number: 2, label: 'Documents' },
  { number: 3, label: 'Payments' },
  { number: 4, label: 'Plan' },
  { number: 5, label: 'Review' },
  { number: 6, label: 'Contact Info' },
];

interface RegistrationStepperProps {
  currentStep: number;
}

export function RegistrationStepper({ currentStep }: RegistrationStepperProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {STEPS.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                step.number === currentStep
                  ? 'border-[#FACC15] bg-[#FACC15] text-black'
                  : step.number < currentStep
                    ? 'border-[#22C55E] bg-[#22C55E] text-white'
                    : 'border-[#3F3F46] bg-transparent text-[#71717A]'
              }`}
            >
              {step.number < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                step.number
              )}
            </div>
            <span
              className={`mt-1.5 text-[10px] whitespace-nowrap ${
                step.number === currentStep
                  ? 'text-[#FACC15] font-medium'
                  : step.number < currentStep
                    ? 'text-[#22C55E] font-medium'
                    : 'text-[#71717A]'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={`h-[2px] w-10 mx-1 mt-[-14px] ${
                step.number < currentStep ? 'bg-[#22C55E]' : 'bg-[#3F3F46]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
