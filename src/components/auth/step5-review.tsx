'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth.store';
import type { Step1FormData } from './step1-company-info';
import type { DocumentFile } from './step2-documents';

const PLAN_LABELS: Record<string, string> = {
  STARTER: 'Starter-€49/mo',
  PROFESSIONAL: 'Professional-€99/mo',
  ENTERPRISE: 'Enterprise-€199/mo',
};

interface Step5Props {
  step1Data: Step1FormData;
  documents: DocumentFile[];
  stripeConnected: boolean;
  selectedPlan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  onPrevious: () => void;
  onComplete: () => void;
}

export function Step5Review({
  step1Data,
  documents,
  stripeConnected,
  selectedPlan,
  onPrevious,
  onComplete,
}: Step5Props) {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeGDPR, setAgreeGDPR] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register: registerUser } = useAuth();
  const devBypass = useAuthStore((s) => s.devBypass);

  const uploadedCount = documents.filter((d) => d.file !== null).length;
  const canSubmit = agreeTerms && agreeGDPR;

  const summaryRows = [
    { label: 'Company', value: step1Data.companyName || 'Not provided' },
    { label: 'Email', value: step1Data.email || 'Not provided' },
    { label: 'Documents', value: uploadedCount > 0 ? `${uploadedCount} Uploaded` : 'None uploaded' },
    { label: 'Stripe', value: stripeConnected ? 'connected' : 'not connected' },
    { label: 'Plan', value: PLAN_LABELS[selectedPlan] || selectedPlan },
  ];

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      if (devBypass) {
        await new Promise((r) => setTimeout(r, 800));
      } else {
        await registerUser({
          email: step1Data.email || '',
          password: step1Data.password,
          companyName: step1Data.companyName,
          vatNumber: step1Data.vatNumber,
          contactPhone: step1Data.phone,
        });
      }
      onComplete();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#0F0F0F] p-6">
      <div className="mb-6 border-b border-[#27272A] pb-4">
        <h2 className="text-lg font-bold text-white">Step 5: Review</h2>
      </div>

      {/* Summary */}
      <div className="space-y-3 border-l-2 border-[#3F3F46] pl-4 mb-6">
        {summaryRows.map((row) => (
          <div key={row.label} className="flex items-baseline gap-2">
            <span className="text-sm text-[#71717A]">{row.label} :</span>
            <span className={`text-sm font-medium ${row.value === 'Not provided' || row.value === 'None uploaded' ? 'italic text-[#52525B]' : 'text-white'}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Consent Checkboxes */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2.5">
          <Checkbox
            id="terms"
            checked={agreeTerms}
            onCheckedChange={(c) => setAgreeTerms(c === true)}
            className="h-4 w-4 border-[#3F3F46] data-[state=checked]:bg-[#FACC15] data-[state=checked]:border-[#FACC15] data-[state=checked]:text-black"
          />
          <label htmlFor="terms" className="text-sm text-white cursor-pointer select-none">
            I agree to the Terms & Conditions and Privacy Policy
          </label>
        </div>
        <div className="flex items-center gap-2.5">
          <Checkbox
            id="gdpr"
            checked={agreeGDPR}
            onCheckedChange={(c) => setAgreeGDPR(c === true)}
            className="h-4 w-4 border-[#3F3F46] data-[state=checked]:bg-[#FACC15] data-[state=checked]:border-[#FACC15] data-[state=checked]:text-black"
          />
          <label htmlFor="gdpr" className="text-sm text-white cursor-pointer select-none">
            I Consent to data processing under GDPR
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className="flex w-full items-center justify-center rounded-full bg-[#FACC15] py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#EAB308] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Application'}
      </button>

      {/* Bottom Navigation */}
      <div className="flex items-center pt-4">
        <button
          type="button"
          onClick={onPrevious}
          className="flex items-center gap-1.5 rounded-full border border-[#3F3F46] bg-[#1A1A1A] px-5 py-2 text-sm text-white transition-colors hover:border-[#52525B]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous
        </button>
      </div>
    </div>
  );
}
