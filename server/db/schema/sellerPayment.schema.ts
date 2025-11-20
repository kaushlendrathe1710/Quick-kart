import { pgTable, text, serial, timestamp, integer, decimal } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

/**
 * Seller Payments Table
 * Tracks payment requests and withdrawals for sellers
 * Used for managing seller payouts and withdrawal history
 */
export const sellerPayments = pgTable('seller_payments', {
  id: serial('id').primaryKey(),
  sellerId: integer('seller_id')
    .notNull()
    .references(() => users.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'), // pending, processing, completed, failed
  paymentDate: timestamp('payment_date'),
  referenceId: text('reference_id'), // Bank or payment processor reference
  paymentMethod: text('payment_method'), // bank_transfer, upi, etc.
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Type exports
export type SellerPayment = typeof sellerPayments.$inferSelect;
export type NewSellerPayment = typeof sellerPayments.$inferInsert;
