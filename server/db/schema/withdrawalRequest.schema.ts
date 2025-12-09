import {
  pgTable,
  serial,
  integer,
  decimal,
  varchar,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { wallets } from './wallet.schema';

/**
 * Withdrawal Requests table
 * Unified table for both seller and delivery partner withdrawal requests
 */
export const withdrawalRequests = pgTable(
  'withdrawal_requests',
  {
    id: serial('id').primaryKey(),
    walletId: integer('wallet_id')
      .notNull()
      .references(() => wallets.id, { onDelete: 'cascade' }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    userType: varchar('user_type', { length: 20 }).notNull(), // 'seller' or 'deliveryPartner'

    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'approved', 'processing', 'completed', 'rejected', 'cancelled'

    // Bank/Payment details (encrypted or as per your security requirements)
    paymentMethod: varchar('payment_method', { length: 50 }), // 'bank_transfer', 'upi', 'razorpayx'
    accountDetails: text('account_details'), // JSON string containing bank/UPI details

    // Admin actions
    processedBy: integer('processed_by').references(() => users.id), // Admin who processed
    adminNotes: text('admin_notes'),
    rejectionReason: text('rejection_reason'),

    // Razorpay payout details
    razorpayPayoutId: varchar('razorpay_payout_id', { length: 100 }),
    razorpayContactId: varchar('razorpay_contact_id', { length: 100 }),
    razorpayFundAccountId: varchar('razorpay_fund_account_id', { length: 100 }),
    payoutReferenceId: varchar('payout_reference_id', { length: 100 }), // UTR or transaction ID

    // Timestamps
    requestedAt: timestamp('requested_at').defaultNow().notNull(),
    processedAt: timestamp('processed_at'),
    completedAt: timestamp('completed_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    walletIdx: index('withdrawal_wallet_idx').on(table.walletId),
    userIdx: index('withdrawal_user_idx').on(table.userId),
    userTypeIdx: index('withdrawal_user_type_idx').on(table.userType),
    statusIdx: index('withdrawal_status_idx').on(table.status),
    requestedAtIdx: index('withdrawal_requested_at_idx').on(table.requestedAt),
  })
);

export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type NewWithdrawalRequest = typeof withdrawalRequests.$inferInsert;
