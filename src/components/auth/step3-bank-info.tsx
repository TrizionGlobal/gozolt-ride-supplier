'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

const step3Schema = z.object({
  supplierAccountHolder: z
    .string()
    .min(1, 'Account holder name is required')
    .max(20, 'Account holder name cannot exceed 20 characters'),
  supplierBankName: z
    .string()
    .min(1, 'Bank name is required')
    .max(30, 'Bank name cannot exceed 30 characters'),
  supplierAccountNumber: z
    .string()
    .min(1, 'IBAN/Account number is required')
    .max(30, 'IBAN Number cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'IBAN Number can only contain letters and numbers'),
  supplierSwiftCode: z
    .string()
    .max(30, 'SWIFT Code cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9]*$/, 'SWIFT Code can only contain letters and numbers')
    .optional()
    .or(z.literal('')),
});

export type Step3FormData = z.infer<typeof step3Schema>;

interface Step3Props {
  defaultValues: Partial<Step3FormData>;
  onNext: (data: Step3FormData) => void;
  onPrevious: () => void;
}

export function Step3BankInfo({ defaultValues, onNext, onPrevious }: Step3Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: defaultValues as any,
  });

  const inputClassName =
    'h-10 rounded-lg border-[#27272A] bg-[#0A0A0A] text-white placeholder:text-[#71717A] placeholder:normal-case focus-visible:border-[#FACC15] focus-visible:ring-[#FACC15]/20 text-sm';

  const onInvalid = (fieldErrors: any) => {
    const errorKeys = Object.keys(fieldErrors);
    if (errorKeys.length > 0) {
      const firstError = fieldErrors[errorKeys[0]];
      if (firstError?.message) {
        toast.error(firstError.message);
      } else {
        toast.error('Please fill in all required bank fields before proceeding');
      }
    }
  };

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#0F0F0F] p-6">
      <div className="mb-6 border-b border-[#27272A] pb-4">
        <h2 className="text-lg font-bold text-white">Step 3 : Bank Information</h2>
      </div>

      <form onSubmit={handleSubmit(onNext, onInvalid)} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs text-white">
            Account Holder Name<span className="text-[#FACC15]">*</span>
          </label>
          <Input
            placeholder="Enter Account Holder Name"
            maxLength={20}
            className={`${inputClassName} capitalize`}
            {...register('supplierAccountHolder')}
          />
          {errors.supplierAccountHolder && <p className="mt-1 text-xs text-red-500">{errors.supplierAccountHolder.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-white">
            Bank Name<span className="text-[#FACC15]">*</span>
          </label>
          <Input
            placeholder="Enter Bank Name"
            maxLength={30}
            className={`${inputClassName} capitalize`}
            {...register('supplierBankName')}
          />
          {errors.supplierBankName && <p className="mt-1 text-xs text-red-500">{errors.supplierBankName.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-white">
            IBAN Number<span className="text-[#FACC15]">*</span>
          </label>
          <Input
            placeholder="Enter IBAN Number"
            maxLength={30}
            className={`${inputClassName} uppercase`}
            {...register('supplierAccountNumber', {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 30).toUpperCase();
              },
            })}
          />
          {errors.supplierAccountNumber && <p className="mt-1 text-xs text-red-500">{errors.supplierAccountNumber.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-white">
            SWIFT / BIC Code (Optional)
          </label>
          <Input
            placeholder="Enter SWIFT/BIC Code"
            maxLength={30}
            className={`${inputClassName} uppercase`}
            {...register('supplierSwiftCode', {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 30).toUpperCase();
              },
            })}
          />
          {errors.supplierSwiftCode && <p className="mt-1 text-xs text-red-500">{errors.supplierSwiftCode.message}</p>}
        </div>

        {/* Bottom navigation */}
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
            type="submit"
            className="flex items-center gap-1 rounded-full bg-[#FACC15] px-6 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#EAB308]"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
