'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { DevBypass } from '@/components/shared/dev-bypass';
import { useAuthStore } from '@/stores/auth.store';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const devBypass = useAuthStore((s) => s.devBypass);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (_data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      if (devBypass) {
        await new Promise((r) => setTimeout(r, 800));
      }
      // Backend endpoint not ready yet — always show success
      toast.success('Password reset email sent! Check your inbox.');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] rounded-lg border border-[#27272A] bg-[#0F0F0F] p-8">
      {/* Heading */}
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-white">Forgot your password?</h1>
        <p className="mt-2 text-sm text-[#A1A1AA]">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email Address"
            className="h-10 rounded-lg border-[#27272A] bg-[#0A0A0A] text-white placeholder:text-[#71717A] focus-visible:border-[#FACC15] focus-visible:ring-[#FACC15]/20"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Reset Password Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-full bg-[#FACC15] py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#EAB308] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Reset password'
          )}
        </button>
      </form>

      {/* Back to login */}
      <div className="mt-5 flex justify-center">
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-sm text-[#A1A1AA] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>
      </div>

      {/* Dev Bypass */}
      <DevBypass />
    </div>
  );
}
