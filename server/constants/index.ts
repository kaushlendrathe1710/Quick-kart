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
  UPPER_LIMIT: 100,
  MAX_LIMIT: 100, // Alias for backward compatibility
} as const;

export const PAGINATION_DEFAULT_LIMIT = PAGINATION.DEFAULT_LIMIT;
export const PAGINATION_UPPER_LIMIT = PAGINATION.UPPER_LIMIT;

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

// Product Media Upload Configuration
export const PRODUCT_MEDIA_CONFIG = {
  // Image configuration
  IMAGE: {
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB per image
    MAX_FILES: 10, // Maximum 10 images per product
  },
  // Video configuration
  VIDEO: {
    ALLOWED_MIME_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB per video
    MAX_FILES: 3, // Maximum 3 videos per product
  },
  // Total media limit
  MAX_TOTAL_MEDIA: 13, // 10 images + 3 videos
} as const;

// Banner/Promotional Media Configuration
export const BANNER_MEDIA_CONFIG = {
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB for banners (higher quality)
  MAX_FILES: 1, // One banner at a time
} as const;

// Review Media Configuration
export const REVIEW_MEDIA_CONFIG = {
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_FILE_SIZE: 3 * 1024 * 1024, // 3MB per review image
  MAX_FILES: 5, // Maximum 5 images per review
} as const;

// Profile/Avatar Configuration
export const PROFILE_MEDIA_CONFIG = {
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB for profile images
  MAX_FILES: 1,
} as const;
