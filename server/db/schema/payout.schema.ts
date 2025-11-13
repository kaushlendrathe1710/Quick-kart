import { pgTable, serial, integer, decimal, text, timestamp, index } from 'drizzle-orm/pg-core';
import { wallets } from './wallet.schema';
import { payoutStatusEnum } from './enums';

/**
 * Payouts table
 * Tracks payout requests and payments to delivery partners
 */
export const payouts = pgTable(
  'payouts',
  {
    id: serial('id').primaryKey(),
    walletId: integer('wallet_id')
      .notNull()
      .references(() => wallets.id, { onDelete: 'cascade' }),

    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    status: payoutStatusEnum('status').notNull().default('applied'),

    // Payment details
    paymentReferenceId: text('payment_reference_id'), // UTR or transaction ID
    paymentMethod: text('payment_method'), // bank_transfer, upi, etc.

    // Rejection details
    rejectionReason: text('rejection_reason'),

    // Timestamps
    appliedAt: timestamp('applied_at').defaultNow(),
    processedAt: timestamp('processed_at'),
    paidAt: timestamp('paid_at'),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    walletIdx: index('payout_wallet_idx').on(table.walletId),
    statusIdx: index('payout_status_idx').on(table.status),
    appliedAtIdx: index('payout_applied_at_idx').on(table.appliedAt),
  })
);

export type Payout = typeof payouts.$inferSelect;
export type NewPayout = typeof payouts.$inferInsert;
