import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { razorpayApi } from '@/api/buyer';
import { razorpayKeys } from '@/constants/buyer';
import type {
  CreateRazorpayOrderRequest,
  CreateRazorpayOrderResponse,
  VerifyPaymentRequest,
  RazorpayCheckoutOptions,
  RazorpaySuccessResponse,
} from '@shared/types';

/**
 * Custom hook for Razorpay payment processing
 * Handles order creation, payment verification, and Razorpay checkout integration
 */
export function useRazorpay() {
  const queryClient = useQueryClient();

  // Fetch Razorpay public key
  const { data: razorpayKeyData } = useQuery({
    queryKey: razorpayKeys.key(),
    queryFn: razorpayApi.getRazorpayKey,
    staleTime: Infinity, // Key doesn't change often
  });

  /**
   * Create Razorpay order mutation
   */
  const createOrderMutation = useMutation({
    mutationFn: (data: CreateRazorpayOrderRequest) => razorpayApi.createOrder(data),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create order');
    },
  });

  /**
   * Verify payment mutation
   */
  const verifyPaymentMutation = useMutation({
    mutationFn: (data: VerifyPaymentRequest) => razorpayApi.verifyPayment(data),
    onSuccess: (data) => {
      toast.success('Payment verified successfully!');
      // Invalidate orders to refetch updated order list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Payment verification failed');
    },
  });

  /**
   * Initialize Razorpay checkout
   */
  const initiatePayment = async (
    orderData: CreateRazorpayOrderRequest,
    options?: {
      onSuccess?: (response: RazorpaySuccessResponse) => void;
      onError?: (error: string) => void;
      onDismiss?: () => void;
      prefill?: {
        name?: string;
        email?: string;
        contact?: string;
      };
    }
  ): Promise<void> => {
    try {
      // Step 1: Ensure Razorpay key is loaded
      if (!razorpayKeyData?.keyId) {
        throw new Error('Razorpay key not loaded');
      }

      // Step 2: Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        console.log('Loading Razorpay SDK...');
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        await new Promise<void>((resolve, reject) => {
          script.onload = () => {
            console.log('Razorpay SDK loaded successfully');
            resolve();
          };
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
        });
      }

      // Step 3: Create Razorpay order
      console.log('Creating Razorpay order...', orderData);
      const razorpayOrder = await createOrderMutation.mutateAsync(orderData);
      console.log('Razorpay order created:', razorpayOrder);

      // Step 4: Configure Razorpay checkout options
      const checkoutOptions: RazorpayCheckoutOptions = {
        key: razorpayKeyData.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Quick-kart',
        description: `Order #${razorpayOrder.orderId}`,
        order_id: razorpayOrder.razorpayOrderId,
        handler: async (response: RazorpaySuccessResponse) => {
          // Step 5: Verify payment on backend
          try {
            console.log('Payment successful, verifying...', response);
            await verifyPaymentMutation.mutateAsync({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            console.log('Payment verified successfully');
            // Call custom success handler if provided
            if (options?.onSuccess) {
              options.onSuccess(response);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            const errorMessage =
              error instanceof Error ? error.message : 'Payment verification failed';
            toast.error(errorMessage);
            if (options?.onError) {
              options.onError(errorMessage);
            }
          }
        },
        prefill: options?.prefill || {},
        theme: {
          color: '#3b82f6', // Primary color
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled');
            if (options?.onDismiss) {
              options.onDismiss();
            }
          },
        },
      };

      // Step 6: Open Razorpay checkout
      console.log('Opening Razorpay checkout with options:', checkoutOptions);
      const rzp = new window.Razorpay(checkoutOptions);
      rzp.open();
    } catch (error) {
      console.error('Payment initiation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate payment';
      toast.error(errorMessage);
      if (options?.onError) {
        options.onError(errorMessage);
      }
      throw error;
    }
  };

  return {
    razorpayKey: razorpayKeyData?.keyId,
    createOrder: createOrderMutation.mutate,
    verifyPayment: verifyPaymentMutation.mutate,
    initiatePayment,
    isCreatingOrder: createOrderMutation.isPending,
    isVerifyingPayment: verifyPaymentMutation.isPending,
    createOrderError: createOrderMutation.error,
    verifyPaymentError: verifyPaymentMutation.error,
  };
}
