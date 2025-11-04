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
