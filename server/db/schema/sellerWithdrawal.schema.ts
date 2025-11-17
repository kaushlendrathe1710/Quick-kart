import { pgTable, serial, integer, decimal, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

export const sellerWithdrawals = pgTable('seller_withdrawals', {
  id: serial('id').primaryKey(),
  sellerId: integer('seller_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, processing, completed, failed, rejected
  paymentMethod: varchar('payment_method', { length: 50 }), // bank_transfer, upi, etc.
  accountDetails: text('account_details'), // JSON string containing bank/UPI details
  referenceId: varchar('reference_id', { length: 100 }), // Transaction reference ID
  adminNotes: text('admin_notes'),
  processedBy: integer('processed_by').references(() => users.id), // Admin who processed it
  processedAt: timestamp('processed_at'),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type SellerWithdrawal = typeof sellerWithdrawals.$inferSelect;
export type NewSellerWithdrawal = typeof sellerWithdrawals.$inferInsert;
