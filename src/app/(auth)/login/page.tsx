'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, AlertCircle, Clock, ShieldOff, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/use-auth';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

type ErrorType = 'invalid_credentials' | 'under_review' | 'suspended' | 'rejected' | 'generic';

interface LoginError {
  type: ErrorType;
  message: string;
}

function getErrorDetails(rawMessage: string): LoginError {
  const msg = rawMessage.toLowerCase();

  if (msg.includes('invalid credentials')) {
    return {
      type: 'invalid_credentials',
      message: 'Invalid email or password. Please double-check your credentials and try again.',
    };
  }
  if (msg.includes('under review') || msg.includes('pending verification')) {
    return {
      type: 'under_review',
      message: rawMessage,
    };
  }
  if (msg.includes('suspended')) {
    return {
      type: 'suspended',
      message: rawMessage,
    };
  }
  if (msg.includes('rejected')) {
    return {
      type: 'rejected',
      message: rawMessage,
    };
  }
  return { type: 'generic', message: rawMessage };
}

const errorConfig: Record<
  ErrorType,
  { icon: React.ReactNode; borderColor: string; bgColor: string; titleColor: string; title: string }
> = {
  invalid_credentials: {
    icon: <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />,
    borderColor: 'border-red-500/40',
    bgColor: 'bg-red-500/10',
    titleColor: 'text-red-400',
    title: 'Invalid Credentials',
  },
  under_review: {
    icon: <Clock className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />,
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-500/10',
    titleColor: 'text-amber-400',
    title: 'Account Under Review',
  },
  suspended: {
    icon: <ShieldOff className="h-5 w-5 text-orange-400 mt-0.5 shrink-0" />,
    borderColor: 'border-orange-500/40',
    bgColor: 'bg-orange-500/10',
    titleColor: 'text-orange-400',
    title: 'Account Suspended',
  },
  rejected: {
    icon: <XCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />,
    borderColor: 'border-red-500/40',
    bgColor: 'bg-red-500/10',
    titleColor: 'text-red-400',
    title: 'Account Rejected',
  },
  generic: {
    icon: <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />,
    borderColor: 'border-red-500/40',
    bgColor: 'bg-red-500/10',
    titleColor: 'text-red-400',
    title: 'Login Failed',
  },
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<LoginError | null>(null);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setLoginError(null);
    try {
      await login(data);
      toast.success('Login successful');
    } catch (error: any) {
      const rawMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Login failed. Please check your credentials.';
      const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;
      setLoginError(getErrorDetails(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] rounded-lg border border-[#27272A] bg-[#0F0F0F] p-8">
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Inline error banner */}
        {loginError && (() => {
          const cfg = errorConfig[loginError.type];
          return (
            <div
              className={`flex gap-3 rounded-lg border p-3.5 ${cfg.borderColor} ${cfg.bgColor}`}
            >
              {cfg.icon}
              <div className="space-y-0.5">
                <p className={`text-sm font-semibold ${cfg.titleColor}`}>{cfg.title}</p>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">{loginError.message}</p>
              </div>
            </div>
          );
        })()}

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm text-white">Email Address</label>
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

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm text-white">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="h-10 rounded-lg border-[#27272A] bg-[#0A0A0A] pr-10 text-white placeholder:text-[#71717A] focus-visible:border-[#FACC15] focus-visible:ring-[#FACC15]/20"
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
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me / Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              className="h-3.5 w-3.5 border-[#27272A] data-[state=checked]:bg-[#FACC15] data-[state=checked]:border-[#FACC15] data-[state=checked]:text-black"
            />
            <label htmlFor="remember" className="text-xs text-[#A1A1AA] cursor-pointer select-none">
              Remember me
            </label>
          </div>
          <Link href="/forgot-password" className="text-xs text-[#FACC15] hover:underline">
            Forgot Password?
          </Link>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-full bg-[#FACC15] py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#EAB308] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Sign In'
          )}
        </button>

        {/* Register Button */}
        <Link
          href="/register"
          className="flex w-full items-center justify-center rounded-full border border-[#FACC15] py-2.5 text-sm font-semibold text-[#FACC15] transition-colors hover:bg-[#FACC15]/10"
        >
          Register as New Supplier
        </Link>
      </form>


    </div>
  );
}


