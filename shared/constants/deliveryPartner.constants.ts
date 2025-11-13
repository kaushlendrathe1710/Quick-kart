/**
 * Delivery Partner Constants
 */

// Minimum payout threshold - partner can only apply for payout if balance >= this amount
export const MINIMUM_PAYOUT_THRESHOLD = 500; // in currency units (e.g., INR)

// Maximum payout amount per request
export const MAXIMUM_PAYOUT_AMOUNT = 50000;

// Delivery fee configuration
export const BASE_DELIVERY_FEE = 30;
export const PER_KM_DELIVERY_FEE = 8;

// Rating limits
export const MIN_RATING = 1;
export const MAX_RATING = 5;

// Document upload limits
export const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// Vehicle types
export const VEHICLE_TYPES = {
  MOTORCYCLE: 'motorcycle',
  SCOOTER: 'scooter',
  BICYCLE: 'bicycle',
  CAR: 'car',
  VAN: 'van',
} as const;

// Fuel types
export const FUEL_TYPES = {
  PETROL: 'petrol',
  DIESEL: 'diesel',
  ELECTRIC: 'electric',
  CNG: 'cng',
  HYBRID: 'hybrid',
} as const;

// Account types
export const ACCOUNT_TYPES = {
  SAVINGS: 'savings',
  CURRENT: 'current',
} as const;

// Delivery status
export const DELIVERY_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  PICKED_UP: 'picked_up',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
} as const;

// Transaction types
export const TRANSACTION_TYPES = {
  RECEIVED: 'received',
  PENDING: 'pending',
  DEDUCTED: 'deducted',
  BONUS: 'bonus',
} as const;

// Transaction status
export const TRANSACTION_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  FAILED: 'failed',
  REVERSED: 'reversed',
} as const;

// Payout status
export const PAYOUT_STATUS = {
  APPLIED: 'applied',
  PROCESSING: 'processing',
  PAID: 'paid',
  REJECTED: 'rejected',
} as const;

// Issue types
export const ISSUE_TYPES = {
  PAYMENT_ISSUE: 'payment_issue',
  TECHNICAL_PROBLEM: 'technical_problem',
  ACCOUNT_RELATED: 'account_related',
  DELIVERY_ISSUE: 'delivery_issue',
  VEHICLE_ISSUE: 'vehicle_issue',
  OTHER: 'other',
} as const;

// Ticket status
export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

// Payment methods for payouts
export const PAYOUT_PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
  UPI: 'upi',
} as const;
