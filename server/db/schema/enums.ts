import { pgEnum } from 'drizzle-orm/pg-core';

// Vehicle type enum
export const vehicleTypeEnum = pgEnum('vehicle_type', [
  'motorcycle',
  'scooter',
  'bicycle',
  'car',
  'van',
]);

// Fuel type enum
export const fuelTypeEnum = pgEnum('fuel_type', ['petrol', 'diesel', 'electric', 'cng', 'hybrid']);

// Account type enum
export const accountTypeEnum = pgEnum('account_type', ['savings', 'current']);

// Delivery status enum
export const deliveryStatusEnum = pgEnum('delivery_status', [
  'pending',
  'assigned',
  'in_progress',
  'picked_up',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'failed',
]);

// Wallet transaction type enum
export const transactionTypeEnum = pgEnum('transaction_type', [
  'received',
  'pending',
  'deducted',
  'bonus',
]);

// Transaction status enum
export const transactionStatusEnum = pgEnum('transaction_status', [
  'completed',
  'pending',
  'failed',
  'reversed',
]);

// Payout status enum
export const payoutStatusEnum = pgEnum('payout_status', [
  'applied',
  'processing',
  'paid',
  'rejected',
]);

// Ticket issue type enum
export const issueTypeEnum = pgEnum('issue_type', [
  'payment_issue',
  'technical_problem',
  'account_related',
  'delivery_issue',
  'vehicle_issue',
  'other',
]);

// Ticket status enum
export const ticketStatusEnum = pgEnum('ticket_status', [
  'open',
  'in_progress',
  'resolved',
  'closed',
]);

// Seller ticket issue type enum
export const sellerIssueTypeEnum = pgEnum('seller_issue_type', [
  'product_related',
  'order_issue',
  'payment_issue',
  'account_related',
  'technical_problem',
  'payout_issue',
  'other',
]);
