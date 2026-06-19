'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Check, Loader2, Lock, Unlock, FileText, CheckCircle2 } from 'lucide-react';

const step4Schema = z.object({
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Terms & Conditions',
  }),
  agreePrivacy: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Privacy Policy',
  }),
  infoAccurate: z.boolean().refine((val) => val === true, {
    message: 'You must confirm the provided information is accurate',
  }),
});

export type Step4FormData = z.infer<typeof step4Schema>;

interface Step4Props {
  isLoading: boolean;
  onSubmit: () => void;
  onPrevious: () => void;
}

export function Step4Terms({ isLoading, onSubmit, onPrevious }: Step4Props) {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      agreeTerms: false,
      agreePrivacy: false,
      infoAccurate: false,
    }
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, type: 'terms' | 'privacy') => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 15;
    if (isAtBottom) {
      if (type === 'terms') {
        setHasReadTerms(true);
      } else {
        setHasReadPrivacy(true);
      }
    }
  };

  const handleAcceptAll = (type: 'terms' | 'privacy') => {
    if (type === 'terms') {
      setHasReadTerms(true);
      setValue('agreeTerms', true);
    } else {
      setHasReadPrivacy(true);
      setValue('agreePrivacy', true);
    }
  };

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#0F0F0F] p-6">
      <div className="mb-6 border-b border-[#27272A] pb-4">
        <h2 className="text-lg font-bold text-white">Step 5: Terms & Verification</h2>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Please read the documentations fully, verify and accept our terms before submitting your application.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Document 1: Terms & Conditions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
              <FileText className="h-4 w-4 text-[#FACC15]" />
              Terms & Conditions
            </span>
            {hasReadTerms ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-400">
                <CheckCircle2 className="h-4.5 w-4.5" /> Read
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                <Lock className="h-3.5 w-3.5" /> Scroll to Unlock
              </span>
            )}
          </div>
          
          <div 
            onScroll={(e) => handleScroll(e, 'terms')}
            className="h-48 overflow-y-auto rounded-lg border border-[#27272A] bg-[#050505] p-4 text-xs leading-relaxed text-[#A1A1AA] scrollbar-thin scrollbar-thumb-[#27272A]"
          >
            <h4 className="font-bold text-white mb-2">Gozolt Supplier Portal – Terms & Conditions</h4>
            <p className="mb-3"><strong>1. Supplier Responsibilities</strong><br />Suppliers must:<br />• Provide accurate company information<br />• Maintain valid licenses and required documents<br />• Ensure assigned drivers and vehicles comply with legal requirements<br />• Follow Gozolt operational standards</p>
            <p className="mb-3"><strong>2. Driver & Vehicle Management</strong><br />Suppliers are responsible for:<br />• Adding and managing drivers<br />• Maintaining vehicle documentation<br />• Ensuring driver behavior and vehicle safety standards</p>
            <p className="mb-3"><strong>3. Payments & Settlements</strong><br />• Rider payments are recorded by the Gozolt platform.<br />• Gozolt calculates settlements according to the agreed settlement cycle.<br />• Payments are transferred from Gozolt to the supplier.<br />• The supplier is responsible for distributing payments to their drivers.</p>
            <p className="mb-3"><strong>4. Commission & Fees</strong><br />Gozolt may deduct applicable commissions, service fees, or other agreed charges before releasing settlement amounts to suppliers.</p>
            <p className="mb-3"><strong>5. Suspension & Termination</strong><br />Gozolt reserves the right to suspend or terminate supplier access for:<br />• Fraudulent activities<br />• Invalid documentation<br />• Policy violations<br />• Illegal activities<br />• Actions affecting passenger safety or platform reputation</p>
            <p className="mb-3"><strong>6. Limitation of Liability</strong><br />Gozolt provides the technology platform connecting riders, suppliers, and drivers. Suppliers remain responsible for their business operations, employees, vehicles, and legal obligations.</p>
            <p className="mb-3"><strong>7. Modification of Terms</strong><br />Gozolt may modify these Terms & Conditions at any time. Continued use of the Supplier Portal indicates acceptance of the updated terms.</p>
            <p className="mb-3"><strong>8. Governing Law</strong><br />These Terms shall be governed according to the applicable laws and regulations of Malta and the European Union where applicable.</p>
          </div>

          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span>{!hasReadTerms && "Scroll to the bottom of the terms container to enable the checkbox."}</span>
            {!hasReadTerms && (
              <button 
                type="button" 
                onClick={() => handleAcceptAll('terms')}
                className="text-xs text-[#FACC15] hover:underline focus:outline-none"
              >
                Accept & Agree instantly
              </button>
            )}
          </div>
        </div>

        {/* Document 2: Privacy Policy */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
              <FileText className="h-4 w-4 text-[#FACC15]" />
              Privacy Policy
            </span>
            {hasReadPrivacy ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-400">
                <CheckCircle2 className="h-4.5 w-4.5" /> Read
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                <Lock className="h-3.5 w-3.5" /> Scroll to Unlock
              </span>
            )}
          </div>
          
          <div 
            onScroll={(e) => handleScroll(e, 'privacy')}
            className="h-48 overflow-y-auto rounded-lg border border-[#27272A] bg-[#050505] p-4 text-xs leading-relaxed text-[#A1A1AA] scrollbar-thin scrollbar-thumb-[#27272A]"
          >
            <h4 className="font-bold text-white mb-2">Gozolt Supplier Portal – Privacy Policy</h4>
            <p className="mb-3"><strong>1. Introduction</strong><br />Welcome to Gozolt Supplier Portal. This Privacy Policy explains how Gozolt collects, uses, stores, and protects supplier and fleet information while using the Gozolt platform.<br />By registering as a supplier, you agree to the practices described in this Privacy Policy.</p>
            <p className="mb-3"><strong>2. Information We Collect</strong><br />Gozolt may collect:<br />• Company name and registration details<br />• Business license and legal documents<br />• Owner/authorized representative information<br />• Contact information (email and phone number)<br />• Vehicle information<br />• Driver information managed by the supplier<br />• Financial and settlement records<br />• Platform activity and operational data</p>
            <p className="mb-3"><strong>3. How We Use Supplier Data</strong><br />We use supplier data to:<br />• Verify supplier identity and business legitimacy<br />• Manage vehicles and drivers<br />• Process payments and settlements<br />• Maintain ride operations<br />• Communicate important updates<br />• Prevent fraud and maintain platform security<br />• Comply with legal requirements</p>
            <p className="mb-3"><strong>4. Data Sharing</strong><br />Gozolt may share information with:<br />• Payment service providers (such as Stripe)<br />• Government or regulatory authorities when legally required<br />• Technical service providers supporting the platform<br />Gozolt does not sell supplier personal information to third parties.</p>
            <p className="mb-3"><strong>5. Data Security</strong><br />Gozolt applies appropriate technical and organizational measures to protect supplier data against unauthorized access, loss, misuse, or alteration.</p>
            <p className="mb-3"><strong>6. Data Retention</strong><br />Supplier records, payment information, and operational data may be retained for as long as required for business operations, legal compliance, and dispute resolution.</p>
            <p className="mb-3"><strong>7. Supplier Rights</strong><br />Suppliers may request access, correction, or updates to their information by contacting Gozolt support, subject to applicable laws and contractual obligations.</p>
            <p className="mb-3"><strong>8. Changes to This Policy</strong><br />Gozolt may update this Privacy Policy periodically. Continued use of the Supplier Portal means acceptance of the updated policy.</p>
            <p className="mb-3"><strong>9. Contact Us</strong><br />For privacy-related concerns, suppliers can contact Gozolt through the official support channels.</p>
          </div>

          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span>{!hasReadPrivacy && "Scroll to the bottom of the privacy container to enable the checkbox."}</span>
            {!hasReadPrivacy && (
              <button 
                type="button" 
                onClick={() => handleAcceptAll('privacy')}
                className="text-xs text-[#FACC15] hover:underline focus:outline-none"
              >
                Accept & Agree instantly
              </button>
            )}
          </div>
        </div>

        {/* Verification Checkboxes */}
        <div className="space-y-4 pt-4 border-t border-[#27272A]">
          <label className={`flex items-start gap-3 cursor-pointer group transition-opacity duration-200 ${!hasReadTerms ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                disabled={!hasReadTerms}
                className="peer h-5 w-5 appearance-none rounded border border-[#3F3F46] bg-[#111111] checked:border-[#FACC15] checked:bg-[#FACC15] disabled:border-[#1E1E20] disabled:bg-[#080809] transition-colors"
                {...register('agreeTerms')}
              />
              <Check className="pointer-events-none absolute h-3.5 w-3.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
            <div className="flex-1">
              <span className="text-sm text-white font-medium flex items-center gap-1.5">
                I agree to the Supplier Terms & Conditions
                {!hasReadTerms && <Lock className="h-3 w-3 text-amber-500" />}
              </span>
              <p className="text-xs text-[#71717A] mt-1">I have read and agree to follow all platform rules and operational guidelines for suppliers.</p>
              {errors.agreeTerms && <p className="mt-1 text-xs text-red-500">{errors.agreeTerms.message}</p>}
            </div>
          </label>

          <label className={`flex items-start gap-3 cursor-pointer group transition-opacity duration-200 ${!hasReadPrivacy ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                disabled={!hasReadPrivacy}
                className="peer h-5 w-5 appearance-none rounded border border-[#3F3F46] bg-[#111111] checked:border-[#FACC15] checked:bg-[#FACC15] disabled:border-[#1E1E20] disabled:bg-[#080809] transition-colors"
                {...register('agreePrivacy')}
              />
              <Check className="pointer-events-none absolute h-3.5 w-3.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
            <div className="flex-1">
              <span className="text-sm text-white font-medium flex items-center gap-1.5">
                I agree to the Privacy Policy
                {!hasReadPrivacy && <Lock className="h-3 w-3 text-amber-500" />}
              </span>
              <p className="text-xs text-[#71717A] mt-1">I consent to the collection and processing of my business and personal data as described.</p>
              {errors.agreePrivacy && <p className="mt-1 text-xs text-red-500">{errors.agreePrivacy.message}</p>}
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                className="peer h-5 w-5 appearance-none rounded border border-[#3F3F46] bg-[#111111] checked:border-[#FACC15] checked:bg-[#FACC15] transition-colors"
                {...register('infoAccurate')}
              />
              <Check className="pointer-events-none absolute h-3.5 w-3.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
            <div className="flex-1">
              <span className="text-sm text-white font-medium">Information Accuracy</span>
              <p className="text-xs text-[#71717A] mt-1">I confirm that all provided information and uploaded documents are genuine and accurate.</p>
              {errors.infoAccurate && <p className="mt-1 text-xs text-red-500">{errors.infoAccurate.message}</p>}
            </div>
          </label>
        </div>

        {/* Bottom navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-[#27272A]">
          <button
            type="button"
            onClick={onPrevious}
            className="flex items-center gap-1.5 rounded-full border border-[#3F3F46] bg-[#1A1A1A] px-5 py-2 text-sm text-white transition-colors hover:border-[#52525B]"
            disabled={isLoading}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Previous
          </button>
          <button
            type="submit"
            disabled={isLoading || !hasReadTerms || !hasReadPrivacy}
            className="flex items-center gap-2 rounded-full bg-[#FACC15] px-8 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#EAB308] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
}
