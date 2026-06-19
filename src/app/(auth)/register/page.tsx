'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RegistrationStepper } from '@/components/auth/registration-stepper';
import { Step1CompanyInfo, type Step1FormData } from '@/components/auth/step1-company-info';
import { Step2Documents, type DocumentFile } from '@/components/auth/step2-documents';
import { Step3BankInfo, type Step3FormData } from '@/components/auth/step3-bank-info';
import { Step4Terms } from '@/components/auth/step4-terms';
import { Step4Subscription } from '@/components/auth/step4-subscription';
import { RegistrationComplete } from '@/components/auth/registration-complete';
import { supplierRegister } from '@/services/auth/auth.service';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 state
  const [step1Data, setStep1Data] = useState<Partial<Step1FormData>>(defaultStep1);

  // Step 2 state
  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  // Step 3 state
  const [step3Data, setStep3Data] = useState<Partial<Step3FormData>>(defaultStep3);

  // Step 4 state
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'GROWTH' | 'PROFESSIONAL' | 'ENTERPRISE'>('PROFESSIONAL');

  const handleStep1Next = (data: Step1FormData) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const handleStep3Next = (data: Step3FormData) => {
    setStep3Data(data);
    setCurrentStep(4);
  };

  const handleStep4Next = () => {
    setCurrentStep(5);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const formData = new FormData();

      // Append Step 1 Text fields
      Object.entries(step1Data).forEach(([key, value]) => {
        if (value && key !== 'confirmPassword') {
          formData.append(key, value);
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
          formData.append(doc.type, doc.file);
        }
      });

      // Append Subscription Plan
      formData.append('subscriptionTier', selectedPlan);

      // Send to API
      await supplierRegister(formData);

      toast.success('Registration successful!');
      setRegistrationComplete(true);
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
    <div className={`w-full py-6 ${currentStep === 4 ? 'max-w-[1200px]' : 'max-w-[750px]'}`}>
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
        <Step3BankInfo
          defaultValues={step3Data}
          onNext={handleStep3Next}
          onPrevious={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 4 && (
        <Step4Subscription
          selectedTier={selectedPlan}
          onSelectTier={setSelectedPlan}
          onNext={handleStep4Next}
          onPrevious={() => setCurrentStep(3)}
        />
      )}

      {currentStep === 5 && (
        <Step4Terms
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onPrevious={() => setCurrentStep(4)}
        />
      )}
    </div>
  );
}
