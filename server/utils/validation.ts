// Validation utilities
import { z } from 'zod';
import { userRole } from '@shared/constants';

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
  limit: z.coerce.number().min(1).max(100).default(20),
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

// Export types
export type EmailOnlyInput = z.infer<typeof emailOnlySchema>;
export type CompleteUserProfileInput = z.infer<typeof completeUserProfileSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type EmailInput = z.infer<typeof emailSchema>;
