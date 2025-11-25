import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { authApi, cartApi } from '@/api/buyer';
import { useAppDispatch } from '@/store/hooks';
import { setUser, setToken, setRequiresProfile } from '@/store/slices/authSlice';
import { guestCartUtils } from '@/utils/guestCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';

/**
 * Auth Page - OTP-based authentication
 * Step 1: Enter email and send OTP
 * Step 2: Verify OTP
 * Step 3: Complete profile (if new user)
 */

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  bio: z.string().optional(),
});

type EmailForm = z.infer<typeof emailSchema>;
type OtpForm = z.infer<typeof otpSchema>;
type ProfileForm = z.infer<typeof profileSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<'email' | 'otp' | 'profile'>('email');
  const [email, setEmail] = useState('');
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);

  // Email form
  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });

  // OTP form
  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
  });

  // Profile form
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: authApi.sendOtp,
    onSuccess: (data) => {
      toast.success(data.message || 'OTP sent to your email');
      setStep('otp');
    },
    onError: (error: any) => {
      toast.error(error || 'Failed to send OTP');
    },
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: async (data) => {
      toast.success(data.message || 'Login successful');

      // Check user role and handle accordingly
      const userRole = data.user?.role;

      // Store token
      if (data.token) {
        dispatch(setToken(data.token));
      }

      // Store user (works for all roles: buyer, seller, admin, etc.)
      dispatch(setUser(data.user));

      // Sync guest cart with database cart for buyers
      if (userRole === 'user') {
        const guestCart = guestCartUtils.getCart();
        if (guestCart.items.length > 0) {
          try {
            await cartApi.syncCart(guestCart.items);
            guestCartUtils.clearCart();
            toast.success('Cart synced successfully');
          } catch (error) {
            console.error('Failed to sync cart:', error);
            // Don't show error to user, cart sync is not critical
          }
        }
      }

      // Role-based redirect
      if (userRole === 'seller') {
        toast.success('Welcome to Seller Dashboard!');
        setLocation('/seller/dashboard');
      } else if (userRole === 'user') {
        // Buyer login
        if (data.requiresProfile) {
          dispatch(setRequiresProfile(true));
          setStep('profile');
        } else {
          setLocation('/');
        }
      } else {
        // Other roles (admin, delivery_partner, etc.)
        toast.success('Login successful!');
        setLocation('/');
      }
    },
    onError: (error: any) => {
      toast.error(error || 'Invalid OTP');
    },
  });

  // Complete profile mutation
  const completeProfileMutation = useMutation({
    mutationFn: authApi.completeProfile,
    onSuccess: (data) => {
      toast.success(data.message || 'Profile completed successfully');
      dispatch(setUser(data.user));
      dispatch(setRequiresProfile(false));
      setLocation('/');
    },
    onError: (error: any) => {
      toast.error(error || 'Failed to complete profile');
    },
  });

  // Resend OTP mutation
  const resendOtpMutation = useMutation({
    mutationFn: authApi.resendOtp,
    onSuccess: (data) => {
      toast.success(data.message || 'OTP resent successfully');
      startCountdown();
    },
    onError: (error: any) => {
      toast.error(error || 'Failed to resend OTP');
    },
  });

  const startCountdown = () => {
    setResendDisabled(true);
    setCountdown(30);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setResendDisabled(false);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (step === 'otp') {
      startCountdown();
    }
  }, [step]);

  const handleEmailSubmit = (data: EmailForm) => {
    setEmail(data.email);
    sendOtpMutation.mutate({ email: data.email });
  };

  const handleOtpSubmit = (data: OtpForm) => {
    verifyOtpMutation.mutate({ email, otp: data.otp });
  };

  const handleProfileSubmit = (data: ProfileForm) => {
    completeProfileMutation.mutate(data);
  };

  const handleResendOtp = () => {
    if (email) {
      resendOtpMutation.mutate({ email });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to Quick-kart</CardTitle>
          <CardDescription>
            {step === 'email' && 'Enter your email to get started'}
            {step === 'otp' && 'Enter the OTP sent to your email'}
            {step === 'profile' && 'Complete your profile'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    {...emailForm.register('email')}
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!emailForm.watch('email') || sendOtpMutation.isPending}
              >
                {sendOtpMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="mt-1 text-center text-2xl tracking-widest"
                  {...otpForm.register('otp')}
                />
                {otpForm.formState.errors.otp && (
                  <p className="mt-1 text-sm text-red-600">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={verifyOtpMutation.isPending}>
                {verifyOtpMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleResendOtp}
                disabled={resendDisabled || resendOtpMutation.isPending}
              >
                {resendOtpMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  `Resend OTP${countdown > 0 ? ` (${countdown}s)` : ''}`
                )}
              </Button>
            </form>
          )}

          {/* Step 3: Complete Profile */}
          {step === 'profile' && (
            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  className="mt-1"
                  {...profileForm.register('username')}
                />
                {profileForm.formState.errors.username && (
                  <p className="mt-1 text-sm text-red-600">
                    {profileForm.formState.errors.username.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Input
                  id="bio"
                  type="text"
                  placeholder="Tell us about yourself"
                  className="mt-1"
                  {...profileForm.register('bio')}
                />
              </div>
              <Button type="submit" className="w-full" disabled={completeProfileMutation.isPending}>
                {completeProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
