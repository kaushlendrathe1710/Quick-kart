import { z } from 'zod';

/**
 * Seller Form Validation Schemas
 * Zod schemas for all seller forms with proper validation
 */

// Product Form Schema
export const productFormSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  specifications: z.string().optional(),
  sku: z.string().optional(),
  mrp: z.coerce.number().positive('MRP must be positive').optional(),
  purchasePrice: z.coerce.number().min(0, 'Purchase price cannot be negative').optional(),
  price: z.coerce.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  categoryId: z.coerce.number().positive().optional(),
  subcategoryId: z.coerce.number().positive().nullable().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  gstRate: z.string().optional(),
  weight: z.string().optional(),
  length: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  warranty: z.coerce.number().int().min(0).optional(),
  returnPolicy: z.string().optional(),
  isDraft: z.boolean().default(false),
  deliveryCharges: z.coerce.number().min(0, 'Delivery charges cannot be negative').default(0),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

// Product Variant Schema
export const productVariantSchema = z.object({
  color: z.string().optional(),
  size: z.string().optional(),
  sku: z.string().optional(),
  price: z.coerce.number().positive().optional(),
  mrp: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  images: z.string().optional(),
});

export type ProductVariantFormValues = z.infer<typeof productVariantSchema>;

// Business Details Schema
export const businessDetailsSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').optional(),
  gstNumber: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number')
    .optional()
    .or(z.literal('')),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number')
    .optional()
    .or(z.literal('')),
  businessType: z.string().optional(),
});

export type BusinessDetailsFormValues = z.infer<typeof businessDetailsSchema>;

// Banking Information Schema
export const bankingInformationSchema = z.object({
  accountHolderName: z.string().min(2, 'Account holder name is required'),
  accountNumber: z.string().min(9, 'Account number must be at least 9 digits').max(18),
  bankName: z.string().min(2, 'Bank name is required'),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
});

export type BankingInformationFormValues = z.infer<typeof bankingInformationSchema>;

// Profile Update Schema
export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;

// Order Status Update Schema
export const orderStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  trackingNumber: z.string().optional(),
  courierName: z.string().optional(),
});

export type OrderStatusUpdateFormValues = z.infer<typeof orderStatusUpdateSchema>;

// Stock Update Schema
export const stockUpdateSchema = z.object({
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  notes: z.string().optional(),
});

export type StockUpdateFormValues = z.infer<typeof stockUpdateSchema>;

// Payment Request Schema
export const paymentRequestSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export type PaymentRequestFormValues = z.infer<typeof paymentRequestSchema>;
