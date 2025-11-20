// Validation utilities
import { z } from 'zod';
import { userRole } from '@shared/constants';
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_UPPER_LIMIT } from '@server/constants';

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  // At least 8 characters long
  return password.length >= 8;
}

export function sanitizeFilename(filename: string): string {
  // Remove or replace dangerous characters
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// Common validation schemas
export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(PAGINATION_UPPER_LIMIT).default(PAGINATION_DEFAULT_LIMIT),
  offset: z.coerce.number().min(0).default(0),
});

export const idSchema = z.object({
  id: z.coerce.number().min(1),
});

/**
 * Authentication validation schemas
 */

// Initial login/register - only email required
export const emailOnlySchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Complete user profile after OTP verification (for new users)
export const completeUserProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  contactNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid contact number (use E.164 format)'),
  role: z
    .enum([userRole.USER, userRole.SELLER, userRole.DELIVERY_PARTNER], {
      errorMap: () => ({ message: 'Role must be user, seller, or deliveryPartner' }),
    })
    .optional()
    .default(userRole.USER),
});

// Verify OTP
export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

// Email only (for resending OTP)
export const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * Address validation schemas
 */
export const createAddressSchema = z.object({
  addressType: z.string().min(1, 'Address type is required').max(50), // Flexible string
  addressLine: z.string().min(5, 'Address must be at least 5 characters').max(500),
  city: z.string().min(2).max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().min(4).max(20),
  country: z.string().min(2).max(100).default('India'),
  landmark: z.string().optional(),
  contactNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid contact number')
    .optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();

/**
 * Payment Method validation schemas
 */
export const createPaymentMethodSchema = z.object({
  cardHolderName: z.string().min(2, 'Card holder name must be at least 2 characters').max(100),
  cardNumber: z.string().regex(/^\d{13,19}$/, 'Invalid card number (13-19 digits)'),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Invalid month (01-12)'),
  expiryYear: z.string().regex(/^\d{4}$/, 'Invalid year (YYYY)'),
  cardType: z.enum(['Visa', 'MasterCard', 'American Express', 'Discover', 'Rupay', 'Other']),
  isDefault: z.boolean().optional(),
});

export const updatePaymentMethodSchema = createPaymentMethodSchema.partial();

/**
 * Notification validation schemas
 */
export const createNotificationSchema = z.object({
  userId: z.number().int().positive(),
  type: z
    .enum(['order', 'payment', 'delivery', 'promotion', 'account', 'system'])
    .default('system'),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
});

export const markNotificationAsReadSchema = z.object({
  isRead: z.boolean(),
});

// Export types
export type EmailOnlyInput = z.infer<typeof emailOnlySchema>;
export type CompleteUserProfileInput = z.infer<typeof completeUserProfileSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type EmailInput = z.infer<typeof emailSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type CreatePaymentMethodInput = z.infer<typeof createPaymentMethodSchema>;
export type UpdatePaymentMethodInput = z.infer<typeof updatePaymentMethodSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type MarkNotificationAsReadInput = z.infer<typeof markNotificationAsReadSchema>;
