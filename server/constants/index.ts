/**
 * Server Constants
 * Centralized configuration values
 */

// OTP Configuration
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 5,
  MAX_ATTEMPTS: 3,
} as const;

// JWT Configuration
export const JWT_CONFIG = {
  EXPIRY: process.env.JWT_EXPIRY || '7d',
  SECRET: process.env.JWT_SECRET || 'your-secret-key',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// User Roles (re-export for server-side convenience)
export { userRole } from '@shared/constants';

// Delivery Partner Configuration
export const DELIVERY_PARTNER_CONFIG = {
  MINIMUM_PAYOUT_THRESHOLD: 500, // in currency units (e.g., INR)
  MAXIMUM_PAYOUT_AMOUNT: 50000,
  BASE_DELIVERY_FEE: 30,
  PER_KM_DELIVERY_FEE: 8,
  MIN_RATING: 1,
  MAX_RATING: 5,
  MAX_DOCUMENT_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// S3 Configuration for Delivery Partner Documents
export const DELIVERY_PARTNER_S3_CONFIG = {
  FOLDER_PREFIX: 'delivery-partners',
  DOCUMENTS_FOLDER: 'documents',
  VEHICLE_FOLDER: 'vehicles',
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;
