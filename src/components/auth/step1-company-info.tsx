'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';

const step1Schema = z
  .object({
    companyName: z.string().min(1, 'Company name is required'),
    registrationNo: z.string().min(1, 'Registration Number is required'),
    vatNumber: z.string().optional(),
    tinNumber: z.string().min(1, 'TIN Number is required'),
    ownerName: z.string().min(1, 'Owner name is required'),
    email: z.string().email('Enter a valid email').min(1, 'Email is required'),
    contactPhone: z.string().min(1, 'Mobile number is required'),
    address: z.string().min(1, 'Business address is required'),
    city: z.string().min(1, 'City is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type Step1FormData = z.infer<typeof step1Schema>;

interface Step1Props {
  defaultValues: Partial<Step1FormData>;
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
    defaultValues: defaultValues as any,
  });

  const inputClassName =
    'h-10 rounded-lg border-[#27272A] bg-[#0A0A0A] text-white placeholder:text-[#71717A] focus-visible:border-[#FACC15] focus-visible:ring-[#FACC15]/20 text-sm';

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#0F0F0F] p-6">
      <div className="mb-6 border-b border-[#27272A] pb-4">
        <h2 className="text-lg font-bold text-white">Step 1 : Company Information</h2>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-white">
              Company Name<span className="text-[#FACC15]">*</span>
            </label>
            <Input placeholder="Enter company name" className={inputClassName} {...register('companyName')} />
            {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white">
              Registration Number<span className="text-[#FACC15]">*</span>
            </label>
            <Input placeholder="Enter registration number" className={inputClassName} {...register('registrationNo')} />
            {errors.registrationNo && <p className="mt-1 text-xs text-red-500">{errors.registrationNo.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-white">
              VAT Number
            </label>
            <Input placeholder="Enter VAT number" className={inputClassName} {...register('vatNumber')} />
            {errors.vatNumber && <p className="mt-1 text-xs text-red-500">{errors.vatNumber.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white">
              TIN Number<span className="text-[#FACC15]">*</span>
            </label>
            <Input placeholder="Enter TIN number" className={inputClassName} {...register('tinNumber')} />
            {errors.tinNumber && <p className="mt-1 text-xs text-red-500">{errors.tinNumber.message}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-white">
            Owner / Authorized Person Name<span className="text-[#FACC15]">*</span>
          </label>
          <Input placeholder="Enter full name" className={inputClassName} {...register('ownerName')} />
          {errors.ownerName && <p className="mt-1 text-xs text-red-500">{errors.ownerName.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-white">
              Business Email<span className="text-[#FACC15]">*</span>
            </label>
            <Input type="email" placeholder="example@business.com" className={inputClassName} {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white">
              Mobile Number<span className="text-[#FACC15]">*</span>
            </label>
            <Input placeholder="+1234567890" className={inputClassName} {...register('contactPhone')} />
            {errors.contactPhone && <p className="mt-1 text-xs text-red-500">{errors.contactPhone.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-white">
              Business Address<span className="text-[#FACC15]">*</span>
            </label>
            <Input placeholder="Enter full address" className={inputClassName} {...register('address')} />
            {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white">
              City<span className="text-[#FACC15]">*</span>
            </label>
            <Input placeholder="Enter city" className={inputClassName} {...register('city')} />
            {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-white">
              Password<span className="text-[#FACC15]">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
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
                placeholder="••••••••"
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
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
