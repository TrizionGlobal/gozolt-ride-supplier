'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, Building2, FileText, Banknote, ShieldCheck, Zap, CreditCard } from 'lucide-react';
import { RegistrationStepper } from '@/components/auth/registration-stepper';
import { Step1CompanyInfo, type Step1FormData } from '@/components/auth/step1-company-info';
import { Step2Documents, type DocumentFile } from '@/components/auth/step2-documents';
import { Step3BankInfo, type Step3FormData } from '@/components/auth/step3-bank-info';
import { Step4Terms } from '@/components/auth/step4-terms';
import { RegistrationComplete } from '@/components/auth/registration-complete';
import { supplierRegister } from '@/services/auth/auth.service';

const REGISTRATION_STEPS = [
  { number: 1, label: 'Company Information' },
  { number: 2, label: 'Business Documents' },
  { number: 3, label: 'Bank Information' },
  { number: 4, label: 'Terms & Verification' },
];



const defaultStep1: Partial<Step1FormData> = {
  companyName: '',
  registrationNo: '',
  vatNumber: '',
  tinNumber: '',
  ownerName: '',
  email: '',
  contactPhone: '',
  address: '',
  city: '',
  password: '',
  confirmPassword: '',
};

const defaultStep3: Partial<Step3FormData> = {
  supplierAccountHolder: '',
  supplierBankName: '',
  supplierAccountNumber: '',
  supplierSwiftCode: '',
};

export default function RegisterPage() {
  const router = useRouter();

  const [flow, setFlow] = useState<'REGISTRATION' | 'SUCCESS_PROMPT'>('REGISTRATION');
  const [currentStep, setCurrentStep] = useState(1);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 state
  const [step1Data, setStep1Data] = useState<Partial<Step1FormData>>(defaultStep1);

  // Step 2 state
  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  // Step 3 state
  const [step3Data, setStep3Data] = useState<Partial<Step3FormData>>(defaultStep3);



  const handleStep1Next = (data: Step1FormData) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const handleStep3Next = (data: Step3FormData) => {
    setStep3Data(data);
    setCurrentStep(4);
  };

  const handleRegistrationSubmit = async () => {
    try {
      setIsLoading(true);

      const formData = new FormData();

      // Append Step 1 Text fields
      Object.entries(step1Data).forEach(([key, value]) => {
        if (value && key !== 'confirmPassword') {
          if (key === 'logo' && typeof value === 'string' && value.startsWith('data:image')) {
            const arr = value.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            const file = new File([u8arr], 'logo.png', { type: mime });
            formData.append('logo', file);
          } else if (key === 'contactPhone') {
            formData.append(key, (value as string).replace(/\s+/g, ''));
          } else {
            formData.append(key, value as string);
          }
        }
      });

      // Append Step 3 Text fields
      Object.entries(step3Data).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });

      // Append Step 2 Documents
      documents.forEach((doc) => {
        if (doc.file) {
          formData.append(doc.type, doc.file, doc.fileName || doc.file.name || 'document');
        }
      });

      // Send to API
      const res = await supplierRegister(formData);

      toast.success('Registration successful!');
      setSupplierId(res.supplierId);
      setFlow('SUCCESS_PROMPT');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Registration failed');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };



  // Show completion screen
  if (registrationComplete) {
    return <RegistrationComplete />;
  }

  return (
    <div className="w-full py-6 max-w-[750px]">

      {flow === 'REGISTRATION' && (
        <>
          <RegistrationStepper currentStep={currentStep} steps={REGISTRATION_STEPS} />

          {currentStep === 1 && (
            <Step1CompanyInfo defaultValues={step1Data} onNext={handleStep1Next} />
          )}

          {currentStep === 2 && (
            <Step2Documents
              documents={documents}
              onDocumentsChange={setDocuments}
              onNext={() => setCurrentStep(3)}
              onPrevious={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <Step3BankInfo
              defaultValues={step3Data}
              onNext={handleStep3Next}
              onPrevious={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <Step4Terms
              isLoading={isLoading}
              onSubmit={handleRegistrationSubmit}
              onPrevious={() => setCurrentStep(3)}
            />
          )}
        </>
      )}

      {flow === 'SUCCESS_PROMPT' && (
        <div className="relative overflow-hidden rounded-2xl border border-[#27272A] bg-[#0A0A0A] p-10 text-center shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#FACC15] opacity-[0.15] blur-[80px]"></div>

          <div className="relative z-10">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <h2 className="mb-4 text-3xl font-black tracking-tight text-white">
              Application Submitted
            </h2>

            <div className="mx-auto mb-10 max-w-[600px] space-y-4 rounded-xl border border-[#27272A] bg-[#111111] p-6 text-sm text-[#A1A1AA]">
              <p className="leading-relaxed">
                Your supplier registration is currently under review by the <span className="font-semibold text-white">Gozolt Verification Team</span>.
              </p>
              <div className="h-px w-full bg-[#27272A]"></div>
              <p className="leading-relaxed text-[#D4D4D8]">
                Once your company details and documentation pass our compliance checks, we will notify you at your registered email address.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-[#1A1A1A] py-2.5 text-xs font-medium text-[#FACC15]">
                <ShieldCheck className="h-4 w-4" />
                Verification typically completes within 24 hours.
              </div>
            </div>

            <button
              onClick={() => router.push('/login')}
              className="mx-auto flex items-center justify-center gap-2 rounded-full bg-[#FACC15] px-8 py-3 text-sm font-bold text-black transition-all hover:scale-105 hover:bg-[#EAB308] hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] active:scale-95"
            >
              Return to Login
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
