'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ChevronRight, Eye, EyeOff, Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Check, X } from 'lucide-react';
import { Upload, Image } from 'antd';
import { ImageCropperModal } from '@/components/ui/image-cropper-modal';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/settings/location-picker'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full rounded-lg bg-[#27272A] animate-pulse flex items-center justify-center text-[#A1A1AA]">Loading Map...</div>
});

const step1Schema = z
  .object({
    logo: z.any().optional(),
    companyName: z
      .string()
      .min(1, 'Company name is required')
      .max(30, 'Company name cannot exceed 30 characters'),
    registrationNo: z
      .string()
      .min(1, 'Registration Number is required')
      .max(15, 'Registration Number cannot exceed 15 characters')
      .regex(/^[a-zA-Z0-9]+$/, 'Special characters are not allowed'),
    vatNumber: z
      .string()
      .max(15, 'VAT Number cannot exceed 15 characters')
      .regex(/^[a-zA-Z0-9]*$/, 'Special characters are not allowed')
      .optional()
      .or(z.literal('')),
    tinNumber: z
      .string()
      .min(1, 'TIN Number is required')
      .max(15, 'TIN Number cannot exceed 15 characters')
      .regex(/^[a-zA-Z0-9]+$/, 'Special characters are not allowed'),
    ownerName: z
      .string()
      .min(1, 'Owner name is required')
      .max(20, 'Owner / Authorized Person Name cannot exceed 20 characters'),
    email: z.string().email('Enter a valid email').min(1, 'Email is required'),
    contactPhone: z
      .string()
      .min(1, 'Mobile number is required')
      .superRefine((val, ctx) => {
        const cleaned = (val || '').replace(/[\s\-()]/g, '');
        const match = cleaned.match(/^(\+\d{1,4})(.*)$/);
        const localNumber = match ? match[2] : '';

        if (!cleaned || cleaned === '+' || !localNumber || localNumber.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Mobile number is required',
          });
          return;
        }

        if (!/^\+[1-9]\d{6,14}$/.test(cleaned)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Please enter a valid mobile number',
          });
          return;
        }
      }),
    address: z
      .string()
      .min(1, 'Business address is required')
      .max(30, 'Business address cannot exceed 30 characters'),
    city: z.string().min(1, 'City is required'),
    country: z
      .string()
      .min(1, 'Country is required')
      .max(15, 'Country cannot exceed 15 characters'),
    postalCode: z
      .string()
      .min(1, 'Postal Code is required')
      .max(8, 'Postal Code cannot exceed 8 characters')
      .regex(/^[a-zA-Z0-9 -]+$/, 'Postal Code can only contain letters, numbers, spaces, and hyphens'),
    defaultDriverCommission: z.preprocess(
      (val) => Number(val),
      z.number().min(0).max(100)
    ).optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
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
  selectedService?: string | null;
}

export function Step1CompanyInfo({ defaultValues, onNext, selectedService }: Step1Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [cropperImageSrc, setCropperImageSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitted },
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema) as any,
    defaultValues: defaultValues as any,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const passwordValue = watch('password') || '';
  const passwordCriteria = [
    { label: 'At least 8 characters', met: passwordValue.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(passwordValue) },
    { label: 'One lowercase letter', met: /[a-z]/.test(passwordValue) },
    { label: 'One number', met: /[0-9]/.test(passwordValue) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(passwordValue) },
  ];

  const handleCropComplete = (croppedImageBase64: string) => {
    setValue('logo', croppedImageBase64, { shouldValidate: true });
    setIsCropperOpen(false);
    setCropperImageSrc(null);
  };

  const inputClassName =
    'h-10 rounded-lg border-[#27272A] bg-[#0A0A0A] text-white placeholder:text-[#71717A] placeholder:normal-case focus-visible:border-[#FACC15] focus-visible:ring-[#FACC15]/20 text-sm';

  const handleNext = (data: Step1FormData) => {
    if ((selectedService === 'CAR_RENTAL' || selectedService === 'BIKE_RENTAL' || selectedService === 'AIRPORT_TRANSFER') && (!data.latitude || !data.longitude)) {
      toast.error('Please pinpoint your Company Map Location before proceeding.');
      return;
    }
    onNext(data);
  };

  const onInvalid = (fieldErrors: any) => {
    const errorKeys = Object.keys(fieldErrors);
    if (errorKeys.length > 0) {
      const firstError = fieldErrors[errorKeys[0]];
      if (firstError?.message) {
        toast.error(firstError.message);
      } else {
        toast.error('Please fill in all required fields before proceeding');
      }
    }
  };

  return (
    <div className="rounded-lg border border-[#27272A] bg-[#0F0F0F] p-6">
      <div className="mb-6 border-b border-[#27272A] pb-4">
        <h2 className="text-lg font-bold text-white">Step 1 : Company Information</h2>
      </div>

      <form onSubmit={handleSubmit(handleNext, onInvalid)} className="space-y-4">
        <div className="flex flex-col items-center mb-6">
          <Upload
            listType="picture-circle"
            accept=".png,.jpeg,.jpg,image/png,image/jpeg"
            fileList={watch('logo') ? [{ uid: '-1', name: 'logo.png', status: 'done', url: watch('logo') instanceof File ? URL.createObjectURL(watch('logo') as File) : watch('logo') }] : []}
            onPreview={(file) => {
              setPreviewImage(file.url || file.preview as string);
              setPreviewOpen(true);
            }}
            onRemove={() => {
              setValue('logo', undefined, { shouldValidate: true });
            }}
            beforeUpload={(file) => {
              const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
              const fileName = file.name.toLowerCase();
              const hasAllowedExt = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png');

              if (!allowedMimes.includes(file.type) && !hasAllowedExt) {
                toast.error('Only PNG, JPEG, and JPG images are allowed');
                return Upload.LIST_IGNORE;
              }

              if (file.size > 15 * 1024 * 1024) {
                toast.error('Image size must be less than 15MB');
                return Upload.LIST_IGNORE;
              }

              const reader = new FileReader();
              reader.addEventListener('load', () => {
                setCropperImageSrc(reader.result?.toString() || null);
                setIsCropperOpen(true);
              });
              reader.readAsDataURL(file);
              return false; // Prevent auto upload
            }}
          >
            {!watch('logo') && (
              <div className="flex flex-col items-center justify-center text-[#A1A1AA] hover:text-[#FACC15] transition-colors">
                <Camera className="h-6 w-6 mb-2" />
                <span className="text-xs font-medium">Upload</span>
              </div>
            )}
          </Upload>
          
          {previewImage && (
            <Image
              wrapperStyle={{ display: 'none' }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(''),
              }}
              src={previewImage}
              alt="Preview"
            />
          )}
          <p className="mt-2 text-xs text-[#A1A1AA]">Company Logo (Optional)</p>
          <span className="text-[10px] text-[#71717A] mt-0.5">PNG, JPEG, JPG — max 15MB</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-white">
              Company Name<span className="text-[#FACC15]">*</span>
            </label>
            <Input
              placeholder="Enter Company Name"
              maxLength={30}
              className={`${inputClassName} capitalize`}
              {...register('companyName')}
            />
            {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white">
              Registration Number<span className="text-[#FACC15]">*</span>
            </label>
            <Input
              placeholder="Enter Registration Number"
              maxLength={15}
              className={`${inputClassName} uppercase`}
              {...register('registrationNo', {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15).toUpperCase();
                },
              })}
            />
            {errors.registrationNo && <p className="mt-1 text-xs text-red-500">{errors.registrationNo.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-white">
              VAT Number
            </label>
            <Input
              placeholder="Enter VAT Number"
              maxLength={15}
              className={`${inputClassName} uppercase`}
              {...register('vatNumber', {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15).toUpperCase();
                },
              })}
            />
            {errors.vatNumber && <p className="mt-1 text-xs text-red-500">{errors.vatNumber.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white">
              TIN Number<span className="text-[#FACC15]">*</span>
            </label>
            <Input
              placeholder="Enter TIN Number"
              maxLength={15}
              className={`${inputClassName} uppercase`}
              {...register('tinNumber', {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15).toUpperCase();
                },
              })}
            />
            {errors.tinNumber && <p className="mt-1 text-xs text-red-500">{errors.tinNumber.message}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-white">
            Owner / Authorized Person Name<span className="text-[#FACC15]">*</span>
          </label>
          <Input
            placeholder="Enter Full Name"
            maxLength={20}
            className={`${inputClassName} capitalize`}
            {...register('ownerName')}
          />
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
                  className={isSubmitted && errors.contactPhone ? '!border-red-500' : ''}
                />
              )}
            />
            {isSubmitted && errors.contactPhone && <p className="mt-1 text-xs text-red-500">{errors.contactPhone.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-white">
              Business Address<span className="text-[#FACC15]">*</span>
            </label>
            <Input placeholder="Enter Full Address" maxLength={30} className={`${inputClassName} capitalize`} {...register('address')} />
            {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white">
              City<span className="text-[#FACC15]">*</span>
            </label>
            <Input placeholder="Enter City" className={`${inputClassName} capitalize`} {...register('city')} />
            {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-white">
              Country<span className="text-[#FACC15]">*</span>
            </label>
            <Input placeholder="Enter Country" maxLength={15} className={`${inputClassName} capitalize`} {...register('country')} />
            {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white">
              Postal Code<span className="text-[#FACC15]">*</span>
            </label>
            <Input
              placeholder="Enter Postal Code"
              maxLength={8}
              className={`${inputClassName} uppercase`}
              {...register('postalCode', {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/[^a-zA-Z0-9 -]/g, '').slice(0, 8).toUpperCase();
                },
              })}
            />
            {errors.postalCode && <p className="mt-1 text-xs text-red-500">{errors.postalCode.message}</p>}
          </div>
        </div>

        {selectedService === 'CAB' && (
          <div>
            <label className="mb-1.5 block text-xs text-white">
              Company Percentage (%)
            </label>
            <Input 
              type="number" 
              placeholder="Enter Company Commission %" 
              className={inputClassName} 
              {...register('defaultDriverCommission', { valueAsNumber: true })} 
              min={0}
              max={100}
            />
            {errors.defaultDriverCommission && <p className="mt-1 text-xs text-red-500">{errors.defaultDriverCommission.message}</p>}
          </div>
        )}

        {(selectedService === 'CAR_RENTAL' || selectedService === 'BIKE_RENTAL' || selectedService === 'AIRPORT_TRANSFER') && (
          <div className="mt-4">
            <label className="mb-2 block text-xs text-white">
              Company Map Location (Pinpoint for Distance Calculation)
            </label>
            <div className="border border-[#27272A] rounded-lg overflow-hidden">
              <LocationPicker
                latitude={watch('latitude') || null}
                longitude={watch('longitude') || null}
                onChange={(lat, lng) => {
                  setValue('latitude', lat, { shouldValidate: true });
                  setValue('longitude', lng, { shouldValidate: true });
                }}
              />
            </div>
          </div>
        )}

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

      {isCropperOpen && cropperImageSrc && (
        <ImageCropperModal
          imageSrc={cropperImageSrc}
          onClose={() => {
            setIsCropperOpen(false);
            setCropperImageSrc(null);
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
