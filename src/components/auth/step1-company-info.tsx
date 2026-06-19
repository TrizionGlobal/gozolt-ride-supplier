'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Check, X } from 'lucide-react';

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
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
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
    control,
    watch,
    formState: { errors },
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: defaultValues as any,
    mode: 'onChange',
  });

  const passwordValue = watch('password') || '';
  const passwordCriteria = [
    { label: 'At least 8 characters', met: passwordValue.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(passwordValue) },
    { label: 'One lowercase letter', met: /[a-z]/.test(passwordValue) },
    { label: 'One number', met: /[0-9]/.test(passwordValue) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(passwordValue) },
  ];

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
            <Input placeholder="Enter Company Name" className={inputClassName} {...register('companyName')} />
            {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white">
              Registration Number<span className="text-[#FACC15]">*</span>
            </label>
            <Input placeholder="Enter Registration Number" className={inputClassName} {...register('registrationNo')} />
            {errors.registrationNo && <p className="mt-1 text-xs text-red-500">{errors.registrationNo.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-white">
              VAT Number
            </label>
            <Input placeholder="Enter VAT Number" className={inputClassName} {...register('vatNumber')} />
            {errors.vatNumber && <p className="mt-1 text-xs text-red-500">{errors.vatNumber.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white">
              TIN Number<span className="text-[#FACC15]">*</span>
            </label>
            <Input placeholder="Enter TIN Number" className={inputClassName} {...register('tinNumber')} />
            {errors.tinNumber && <p className="mt-1 text-xs text-red-500">{errors.tinNumber.message}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-white">
            Owner / Authorized Person Name<span className="text-[#FACC15]">*</span>
          </label>
          <Input placeholder="Enter Full Name" className={inputClassName} {...register('ownerName')} />
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
            <Controller
              name="contactPhone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter Mobile Number"
                />
              )}
            />
            {errors.contactPhone && <p className="mt-1 text-xs text-red-500">{errors.contactPhone.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-white">
              Business Address<span className="text-[#FACC15]">*</span>
            </label>
            <Input placeholder="Enter Full Address" className={inputClassName} {...register('address')} />
            {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white">
              City<span className="text-[#FACC15]">*</span>
            </label>
            <Input placeholder="Enter City" className={inputClassName} {...register('city')} />
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
            
            {/* Password strength checklist */}
            <div className="mt-2 space-y-1">
              {passwordCriteria.map((criterion, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  {criterion.met ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-[#52525B]" />
                  )}
                  <span className={`text-xs ${criterion.met ? 'text-green-500/80' : 'text-[#71717A]'}`}>
                    {criterion.label}
                  </span>
                </div>
              ))}
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
