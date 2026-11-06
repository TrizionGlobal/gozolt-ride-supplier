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
        <h2 className="text-lg font-bold text-white">Step 4: Terms & Verification</h2>
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


            <p className="mb-3">
              <strong>1. Interpretation and Contractual Structure</strong><br />
              GOZOLT is the digital platform operated by Primooo Global Ltd, company registration C 112223, Malta. A service provider is the trader identified before booking or purchase. Whether GOZOLT is acting as intermediary, agent or direct contracting supplier must be accurately identified in the booking journey and receipt. Nothing in these terms alters a mandatory statutory responsibility or creates a fictional agency relationship.
            </p>

            <p className="mb-3">
              <strong>2. Mandatory Rights and Hierarchy</strong><br />
              These terms are subject to mandatory Maltese and EU law. Nothing excludes statutory consumer remedies, liability for fraud or wilful misconduct, or any liability that cannot lawfully be excluded. Where a service-specific provision conflicts with these general terms, the more specific provision governs unless mandatory law requires otherwise.
            </p>

            <p className="mb-3">
              <strong>3. Evidence, Communications and Records</strong><br />
              Notices may be delivered by in-app message or email, subject to applicable law. GOZOLT may retain records of accepted versions, booking confirmations, timestamps, payment authorisations, refunds and complaint correspondence in accordance with its retention policy. Customers and suppliers should save their transaction confirmations.
            </p>

            <p className="mb-3">
              <strong>4. Admission, KYB and Ongoing Verification</strong><br />
              Before activation, each supplier must provide true business identity, registration and tax details, beneficial ownership information where legally required, contact details, banking details and all sector-specific permits, professional credentials and insurance evidence. GOZOLT may verify authenticity against lawful sources and request updates on expiry. False documents, prohibited activity or serious safety concerns may justify immediate proportionate restriction.
            </p>

            <p className="mb-3">
              <strong>5. Contracting Model and Supplier Accountability</strong><br />
              Unless a separately signed agreement states otherwise, the supplier is an independent trader responsible for the services or goods it offers and for its employees, agents and subcontractors. This clause does not override employment-status tests, tax law, platform-work rules or circumstances in which GOZOLT itself is the trader. The checkout and invoice must reflect the actual contracting structure.
            </p>

            <p className="mb-3">
              <strong>6. Listings, Accurate Information and Prices</strong><br />
              Suppliers must publish accurate availability, service descriptions, legally required disclosures, total prices, VAT treatment, product characteristics and cancellation conditions. They must promptly correct errors and must not use misleading scarcity, fake reviews or discriminatory listings. Changes to accepted bookings require lawful customer approval or remedies.
            </p>

            <p className="mb-3">
              <strong>7. Payments, Commission and Settlements</strong><br />
              Commercial commission, service fees, chargebacks, tax handling, settlement frequency, reserve or withholding rights and invoice responsibility shall be set out in a signed commercial schedule. GOZOLT may withhold disputed amounts only on documented, proportionate grounds and subject to applicable law; undisputed balances should be paid on the agreed schedule. Suppliers must not be required to accept undisclosed fees or retroactive changes.
            </p>

            <p className="mb-3">
              <strong>8. Transportation Licensing and Safety</strong><br />
              Transport suppliers warrant that operators, drivers and vehicles have all Maltese authorisations required for the specific activity, including relevant Transport Malta permits, insurance and roadworthiness. They must comply with passenger safety, accessibility, vehicle standards, incident reporting and lawful fare rules. Vehicle rental suppliers must provide clear damage, deposit and inspection procedures. GOZOLT may request documentary proof and suspend unsafe listings.
            </p>

            <p className="mb-3">
              <strong>9. Quick Services Standards</strong><br />
              Quick Services providers must possess legally required trade qualifications and permissions, use suitable equipment, comply with health and safety rules, respect customer property and disclose call-out, labour, material and emergency surcharges before acceptance. They must obtain approval for additional chargeable work and cooperate with warranty and complaint investigations.
            </p>

            <p className="mb-3">
              <strong>10. Food, Grocery and Delivery Duties</strong><br />
              Food suppliers must comply with applicable food-business registration, hygiene, allergen, traceability, labelling, temperature-control and product-safety requirements. They must disclose unavailable items and obtain customer choices for substitutions. Delivery partners must follow applicable food transport and handling rules. Unsafe food or recalled products must be promptly reported and removed.
            </p>

            <p className="mb-3">
              <strong>11. Rewards, Offers and Marketing</strong><br />
              Suppliers may participate in GO Coins or discount campaigns only under a clear written promotion schedule specifying who funds the benefit, eligibility, accounting, reversals and settlement treatment. Suppliers must not misrepresent promotional prices, create false transactions to earn rewards or claim a partnership endorsement without authorisation.
            </p>

            <p className="mb-3">
              <strong>12. Customer Complaints, Refunds and Cooperation</strong><br />
              Suppliers must promptly investigate non-delivery, defects, safety concerns and complaints, preserve relevant records, and provide lawful refunds or remedies where responsible. GOZOLT may administer refunds as an agent only where contractually authorised or otherwise legally entitled, with transparent reconciliation and an escalation process.
            </p>

            <p className="mb-3">
              <strong>13. Platform Transparency, Ranking and Restrictions</strong><br />
              Where EU Platform-to-Business rules apply, GOZOLT must disclose main ranking parameters, relevant differentiated treatment, data-access terms, reasons for restriction or termination and the applicable complaint or mediation mechanisms. Where Digital Services Act trader-traceability duties apply, suppliers must provide required information before offers are enabled. Notice, statements of reasons and appeal routes will follow applicable law.
            </p>

            <p className="mb-3">
              <strong>14. Data Protection and Confidentiality</strong><br />
              Each party must assess its GDPR role for each activity, process customer information only for legitimate fulfilment purposes, use appropriate security, limit staff access and notify the other party promptly of relevant incidents. Processor arrangements require a separate Article 28 agreement where appropriate. Supplier access to customer contact and location information must not be used for unrelated marketing.
            </p>

            <p className="mb-3">
              <strong>15. Insurance, Indemnities and Liability</strong><br />
              Suppliers must maintain legally required and commercially appropriate insurance for their services. Each party indemnifies the other only for substantiated third-party loss caused by its breach, negligence or unlawful acts, subject to applicable law, reasonable mitigation and fair claims handling. No clause limits fraud, intentional misconduct or non-excludable liability. Insurance coverage thresholds belong in the commercial schedule.
            </p>

            <p className="mb-3">
              <strong>16. Suspension, Termination &amp; Exit</strong><br />
              GOZOLT may restrict listings for documented fraud, expired licences, urgent safety threats or legal compliance. Other suspensions and termination should follow applicable notice and explanation duties, including P2B protections where relevant. On exit, parties should settle undisputed balances, complete outstanding lawful customer remedies, preserve required records and remove unnecessary access.
            </p>

            <p className="mb-3">
              <strong>17. Governing Law and Disputes</strong><br />
              Maltese law governs subject to overriding mandatory EU rules. Parties should first use the documented supplier complaint channel and any legally required mediation or out-of-court process. Nothing removes access to competent courts or regulators. Amendments to commercial terms require the notice and acceptance mechanisms mandated by applicable law.
            </p>

            <div className="mb-3 rounded border border-[#27272A] bg-[#111111] p-2.5">
              <p className="font-semibold text-white mb-1">Publication Details Requiring Confirmation</p>
              <p>Registered office and public legal contact: use the current verified company-register address and monitored contact channel. Effective date, support escalation details, actual vendor list, retention schedule and service-specific commercial schedules must be approved internally before release. Avoid publishing assumptions as established facts.</p>
            </div>

            <p className="mb-3">
              <strong>18. Governing Law &amp; Jurisdiction</strong><br />
              These Terms are governed by:<br />
              • Laws of Malta<br />
              • Applicable European Union laws<br />
              Disputes shall fall under Malta jurisdiction unless EU law grants otherwise.
            </p>

            <div className="mb-3 rounded border border-[#27272A] bg-[#111111] p-2.5">
              <p className="font-semibold text-white mb-1">Legal Reference Framework</p>
              <p>Relevant instruments to verify include GDPR (EU) 2016/679; Digital Services Act (EU) 2022/2065; Platform-to-Business Regulation (EU) 2019/1150; Consumer Rights Directive 2011/83/EU; Unfair Contract Terms Directive 93/13/EEC; Unfair Commercial Practices Directive 2005/29/EC; applicable Maltese consumer, transport, food safety, privacy, tax and licensing law. Applicability depends on the actual service and business model.</p>
            </div>

            <div className="mb-2 rounded border border-[#27272A] bg-[#111111] p-2.5 text-[#D4D4D8]">
              <p className="font-semibold text-white mb-1">19. Contact Us</p>
              <p>• <strong>Company:</strong> Primooo Global Ltd.</p>
              <p>• <strong>Customer Support:</strong> support@gozolt.com.mt</p>
              <p>• <strong>Privacy/DPO Contact:</strong> privacy@gozolt.com.mt</p>
              <p>• <strong>Address:</strong> No 270 Carmel Street, Ħal Luqa, Malta</p>
              <p className="mt-2 text-xs text-[#FACC15]">For emergencies, always contact local emergency services first.</p>
              <p className="mt-2 text-[10px] text-[#71717A]">© 2024 Primooo Global Ltd. All rights reserved.<br />These Terms are intended to comply with applicable GDPR (EU) 2016/679 requirements and EU consumer protection laws.</p>
            </div>
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

            <p className="mb-3">
              <strong>1. Who we are &amp; How to Contact Us</strong><br />
              Primooo Global Ltd (C 112223), Malta, acts as controller for GOZOLT customer accounts, platform analytics, fraud controls and loyalty administration where it determines purposes and means. A transport operator or Quick Services trader may act as a separate controller for its own fulfilment, tax and customer-service records. Roles must be documented and explained at the point of data sharing; calling every supplier a processor would be inaccurate.
            </p>

            <div className="mb-3 rounded border border-[#27272A] bg-[#111111] p-2.5">
              <p className="font-semibold text-white mb-1">Company Information</p>
              <p>• <strong>Company Name:</strong> Primooo Global Ltd.</p>
              <p>• <strong>Trading Name:</strong> Gozolt</p>
              <p>• <strong>Registered Address:</strong> No 270 Carmel Street, Ħal Luqa, Malta</p>
              <p>• <strong>Contact Support:</strong> support@gozolt.com.mt</p>
              <p>• <strong>Privacy Email/DPO Contact:</strong> privacy@gozolt.com.mt</p>
              <p className="mt-1">If you have any questions regarding this Privacy Policy or your personal data, you may contact us at <a href="mailto:privacy@gozolt.com.mt" className="text-[#FACC15] hover:underline">privacy@gozolt.com.mt</a></p>
            </div>

            <p className="mb-3">
              <strong>2. Controller Roles and Individuals Covered</strong><br />
              Primooo Global Ltd controls supplier portal accounts, onboarding decisions, compliance checks, settlements administration, access logs and platform safety processes where it determines the purposes and means. This notice covers sole traders, drivers, delivery partners, authorised representatives, directors, employees and beneficial owners whose information is provided to GOZOLT. Corporate information alone may not be personal data, but identifiable contact and ownership information is.
            </p>

            <p className="mb-3">
              <strong>3. Data Categories</strong><br />
              Identity and contact details, company registration and tax identifiers, authorised signatory details, identity verification evidence, licence and insurance records, bank account and payout references, service activity, job acceptance and completion logs, location data where enabled, ratings, complaints, correspondence, device identifiers and audit records may be processed as relevant to the supplier role.
            </p>

            <p className="mb-3">
              <strong>4. Purposes and Lawful Bases</strong><br />
              Contract and pre-contractual steps may support sole-trader onboarding and platform access. Legitimate interests may support corporate representative administration, proportionate fraud detection, safety reviews and platform integrity after balancing. Legal obligations may apply to tax, accounting and regulator-mandated records. Consent should not be used where it is not genuinely optional.
            </p>

            <p className="mb-3">
              <strong>5. Verification and Official Sources</strong><br />
              GOZOLT may check information against lawful official registries, licensing authorities and credible verification providers where justified and permitted. Not every government database is publicly accessible. Criminal-conviction information or other restricted categories must not be collected without a specific lawful basis and Article 10 safeguards where applicable.
            </p>

            <p className="mb-3">
              <strong>6. Location, Performance Metrics and Automated Decisions</strong><br />
              Supplier or driver location may be used for dispatch, navigation, arrival confirmation and incident resolution when enabled and necessary. Explain any background tracking, retention and off-duty controls. Ratings, cancellation metrics and fraud indicators may affect access; significant solely automated decisions require assessment and applicable GDPR safeguards, including human review where required.
            </p>

            <p className="mb-3">
              <strong>7. Recipients and Transfers</strong><br />
              Relevant personal information may be disclosed to customers where needed for a booking, payment and verification providers, cloud and communications vendors, insurers, professional advisers and authorities with a lawful basis. International transfers require an applicable GDPR Chapter V mechanism. Separate controller and processor roles must be recorded, with Article 28 contracts for processors.
            </p>

            <p className="mb-3">
              <strong>8. Retention, Security and Individual Rights</strong><br />
              Retain supplier identity and licence records only for documented operational and legal periods; settlement records may require statutory accounting retention; location and diagnostic logs should have limited periods. Apply role-based access, secure transmission, incident procedures and deletion processes. Individuals have GDPR rights subject to lawful limits and may complain to the Malta IDPC.
            </p>

            <p className="mb-3">
              <strong>9. Supplier Obligations When Receiving Customer Data</strong><br />
              Suppliers may use customer names, addresses, phone numbers and order details only for the authorised service and required records. They must prevent unauthorised access, prohibit unrelated advertising without a valid basis, restrict staff permissions and report incidents promptly. Where a supplier independently determines purposes, it must publish its own privacy notice and meet its own controller obligations.
            </p>

            <p className="mb-3">
              <strong>10. Privacy Contact and Transparency Updates</strong><br />
              Publish the real controller contact address, monitored privacy email and DPO contact if one is required. Material privacy changes should be communicated appropriately. Maintain accurate privacy notices reflecting actual integrations, tracking, processors and retention schedules.
            </p>

            <div className="mb-3 rounded border border-[#27272A] bg-[#111111] p-2.5">
              <p className="font-semibold text-white mb-1">Publication Details Requiring Confirmation</p>
              <p>Registered office and public legal contact: use the current verified company-register address and monitored contact channel. Effective date, support escalation details, actual vendor list, retention schedule and service-specific commercial schedules must be approved internally before release. Avoid publishing assumptions as established facts.</p>
              <p className="font-semibold text-white mt-2 mb-1">Legal Reference Framework</p>
              <p>Relevant instruments to verify include GDPR (EU) 2016/679; Digital Services Act (EU) 2022/2065; Platform-to-Business Regulation (EU) 2019/1150; Consumer Rights Directive 2011/83/EU; Unfair Contract Terms Directive 93/13/EEC; Unfair Commercial Practices Directive 2005/29/EC; applicable Maltese consumer, transport, food safety, privacy, tax and licensing law. Applicability depends on the actual service and business model.</p>
            </div>

            <p className="mb-3">
              <strong>11. Changes to this Privacy Policy</strong><br />
              We may update this Privacy Policy periodically to reflect:<br />
              • Legal changes<br />
              • Operational changes<br />
              • New services or features<br />
              • Security improvements<br />
              Updated versions will be published on the Gozolt website and within the app.
            </p>

            <div className="mb-2 rounded border border-[#27272A] bg-[#111111] p-2.5 text-[#D4D4D8]">
              <p className="font-semibold text-white mb-1">12. Contact Us</p>
              <p>For any privacy-related questions or requests:</p>
              <p>• <strong>Primooo Global Ltd.</strong></p>
              <p>• <strong>Trading Name:</strong> Gozolt</p>
              <p>• <strong>Support:</strong> support@gozolt.com.mt</p>
              <p>• <strong>Privacy &amp; GDPR:</strong> privacy@gozolt.com.mt</p>
              <p>• <strong>Registered Address:</strong> No 270 Carmel Street, Ħal Luqa, Malta</p>
              <p className="mt-2 text-[10px] text-[#71717A]">© 2024 Primooo Global Ltd. All rights reserved.<br />These Terms are intended to comply with applicable GDPR (EU) 2016/679 requirements and EU consumer protection laws.</p>
            </div>
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
            className="flex items-center gap-1.5 rounded-full border border-[#3F3F46] bg-[#1A1A1A] px-5 py-2 text-sm text-white transition-colors hover:border-[#52525B] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[#3F3F46]"
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
