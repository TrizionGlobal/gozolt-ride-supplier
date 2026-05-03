'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ChevronRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';

const step1Schema = z
  .object({
    companyName: z.string().min(1, 'Company name is required'),
    metroName: z.string().optional(),
    sortingName: z.string().optional(),
    registration: z.string().min(1, 'Registration is required'),
    metroNumber: z.string().optional(),
    dOrder: z.string().optional(),
    vatNumber: z.string().min(1, 'VAT number is required'),
    tinNumber: z.string().min(1, 'TIN number is required'),
    address: z.string().optional(),
    taxBase: z.string().optional(),
    email: z.string().email('Enter a valid email').optional().or(z.literal('')),
    infoEmail: z.string().optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
    adjustedTime: z.string().optional(),
    mod: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type Step1FormData = z.infer<typeof step1Schema>;

interface Step1Props {
  defaultValues: Step1FormData;
  onNext: (data: Step1FormData) => void;
}

export function Step1CompanyInfo({ defaultValues, onNext }: Step1Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues,
  });

  const inputClassName =
    'h-10 rounded-lg border-[#27272A] bg-[#0A0A0A] text-white placeholder:text-[#71717A] focus-visible:border-[#FACC15] focus-visible:ring-[#FACC15]/20 text-sm';

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#0F0F0F] p-6">
      <div className="mb-6 border-b border-[#27272A] pb-4">
        <h2 className="text-lg font-bold text-white">Step 1 : Company Info</h2>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        {/* Row 1: Company Name */}
        <div>
          <label className="mb-1.5 block text-xs text-white">
            Company Name<span className="text-[#FACC15]">*</span>
          </label>
          <Input placeholder="Company Name" className={inputClassName} {...register('companyName')} />
          {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>}
        </div>

        {/* Row 2: Metro Name */}
        <div>
          <label className="mb-1.5 block text-xs text-white">Metro Name</label>
          <Input placeholder="Metro Name" className={inputClassName} {...register('metroName')} />
        </div>

        {/* Row 3: Sorting Name | Registration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-white">Sorting Name</label>
            <Input placeholder="Sorting Name" className={inputClassName} {...register('sortingName')} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white">
              Registration<span className="text-[#FACC15]">*</span>
            </label>
            <Input placeholder="Registration" className={inputClassName} {...register('registration')} />
            {errors.registration && <p className="mt-1 text-xs text-red-500">{errors.registration.message}</p>}
          </div>
        </div>

        {/* Row 4: Metro Number | D-Order */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-white">Metro Number</label>
            <Input placeholder="Metro Number" className={inputClassName} {...register('metroNumber')} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white">D-Order</label>
            <Input placeholder="D-Order" className={inputClassName} {...register('dOrder')} />
          </div>
        </div>

        {/* Row 5: VAT Number | TIN Number */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-white">
              VAT Number<span className="text-[#FACC15]">*</span>
            </label>
            <Input placeholder="VAT Number" className={inputClassName} {...register('vatNumber')} />
            {errors.vatNumber && <p className="mt-1 text-xs text-red-500">{errors.vatNumber.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white">
              TIN Number<span className="text-[#FACC15]">*</span>
            </label>
            <Input placeholder="TIN Number" className={inputClassName} {...register('tinNumber')} />
            {errors.tinNumber && <p className="mt-1 text-xs text-red-500">{errors.tinNumber.message}</p>}
          </div>
        </div>

        {/* Row 6: Address | Tax Base */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-white">Address</label>
            <Input placeholder="Address" className={inputClassName} {...register('address')} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white">Tax Base</label>
            <Input placeholder="Tax Base" className={inputClassName} {...register('taxBase')} />
          </div>
        </div>

        {/* Row 7: Email */}
        <div>
          <label className="mb-1.5 block text-xs text-white">Email</label>
          <Input type="email" placeholder="Email" className={inputClassName} {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {/* Row 8: Info Email */}
        <div>
          <label className="mb-1.5 block text-xs text-white">Info Email</label>
          <Input type="email" placeholder="Info@email.com" className={inputClassName} {...register('infoEmail')} />
        </div>

        {/* Row 9: Phone | City */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-white">Phone</label>
            <Input placeholder="Phone" className={inputClassName} {...register('phone')} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white">City</label>
            <Input placeholder="City" className={inputClassName} {...register('city')} />
          </div>
        </div>

        {/* Row 10: Adjusted Time | MOD */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-white">Adjusted Time</label>
            <Input placeholder="Adjusted Time" className={inputClassName} {...register('adjustedTime')} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white">MOD</label>
            <Input placeholder="MOD" className={inputClassName} {...register('mod')} />
          </div>
        </div>

        {/* Row 11: Password | Confirm Password */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-white">
              Password<span className="text-[#FACC15]">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••"
                className={`${inputClassName} pr-10`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white">
              Confirm Password<span className="text-[#FACC15]">*</span>
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••"
                className={`${inputClassName} pr-10`}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="flex items-center justify-between pt-4">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm text-[#A1A1AA] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Login
          </Link>
          <button
            type="submit"
            className="flex items-center gap-1 rounded-full bg-[#FACC15] px-6 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#EAB308]"
          >
            Save
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
