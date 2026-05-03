'use client';

import { useState } from 'react';
import { RegistrationStepper } from '@/components/auth/registration-stepper';
import { Step1CompanyInfo, type Step1FormData } from '@/components/auth/step1-company-info';
import { Step2Documents, type DocumentFile } from '@/components/auth/step2-documents';
import { Step3Payment } from '@/components/auth/step3-payment';
import { Step4Plan } from '@/components/auth/step4-plan';
import { Step5Review } from '@/components/auth/step5-review';
import { RegistrationComplete } from '@/components/auth/registration-complete';
import { DevBypass } from '@/components/shared/dev-bypass';

const defaultStep1: Step1FormData = {
  companyName: '',
  metroName: '',
  sortingName: '',
  registration: '',
  metroNumber: '',
  dOrder: '',
  vatNumber: '',
  tinNumber: '',
  address: '',
  taxBase: '',
  email: '',
  infoEmail: '',
  phone: '',
  city: '',
  adjustedTime: '',
  mod: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Step 1 state
  const [step1Data, setStep1Data] = useState<Step1FormData>(defaultStep1);

  // Step 2 state
  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  // Step 3 state
  const [stripeConnected, setStripeConnected] = useState(false);

  // Step 4 state
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'>('PROFESSIONAL');

  const handleStep1Next = (data: Step1FormData) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  // Show completion screen
  if (registrationComplete) {
    return <RegistrationComplete />;
  }

  return (
    <div className={`w-full py-6 ${currentStep === 4 ? 'max-w-[900px]' : 'max-w-[750px]'}`}>
      {/* Stepper */}
      <RegistrationStepper currentStep={currentStep} />

      {/* Step Content */}
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
        <Step3Payment
          stripeConnected={stripeConnected}
          onStripeChange={setStripeConnected}
          onNext={() => setCurrentStep(4)}
          onPrevious={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 4 && (
        <Step4Plan
          selectedPlan={selectedPlan}
          onPlanChange={setSelectedPlan}
          onNext={() => setCurrentStep(5)}
          onPrevious={() => setCurrentStep(3)}
        />
      )}

      {currentStep === 5 && (
        <Step5Review
          step1Data={step1Data}
          documents={documents}
          stripeConnected={stripeConnected}
          selectedPlan={selectedPlan}
          onPrevious={() => setCurrentStep(4)}
          onComplete={() => setRegistrationComplete(true)}
        />
      )}

      {/* Dev Bypass persists across all steps */}
      <DevBypass />
    </div>
  );
}
