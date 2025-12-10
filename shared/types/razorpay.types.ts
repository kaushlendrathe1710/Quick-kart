import { z } from 'zod';

// Razorpay Order types
export interface RazorpayOrderOptions {
  amount: number; // Amount in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

// Razorpay Payment types
export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  method: string;
  captured: boolean;
  description?: string;
  email?: string;
  contact?: string;
  fee?: number;
  tax?: number;
  error_code?: string;
  error_description?: string;
  created_at: number;
}

// Frontend Razorpay Checkout options
export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// API Request/Response types
export interface CreateRazorpayOrderRequest {
  addressId: number;
  notes?: string;
}

export interface CreateRazorpayOrderResponse {
  orderId: number;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  orderId: number;
  paymentStatus: string;
}

// Validation schemas
export const createRazorpayOrderSchema = z.object({
  addressId: z.number().int().positive(),
  notes: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export type CreateRazorpayOrderInput = z.infer<typeof createRazorpayOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

// Razorpay window interface for TypeScript
declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => {
      open: () => void;
      on: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}
