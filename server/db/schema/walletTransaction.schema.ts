import { pgTable, serial, integer, decimal, text, timestamp, index } from 'drizzle-orm/pg-core';
import { wallets } from './wallet.schema';
import { deliveries } from './delivery.schema';
import { transactionTypeEnum, transactionStatusEnum } from './enums';

/**
 * Wallet Transactions table
 * Tracks all wallet transactions for delivery partners
 */
export const walletTransactions = pgTable(
  'wallet_transactions',
  {
    id: serial('id').primaryKey(),
    walletId: integer('wallet_id')
      .notNull()
      .references(() => wallets.id, { onDelete: 'cascade' }),
    deliveryId: integer('delivery_id').references(() => deliveries.id, { onDelete: 'set null' }),

    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    type: transactionTypeEnum('type').notNull(),
    status: transactionStatusEnum('status').notNull().default('completed'),

    description: text('description'),
    referenceId: text('reference_id'), // External payment/transaction reference

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    walletIdx: index('transaction_wallet_idx').on(table.walletId),
    deliveryIdx: index('transaction_delivery_idx').on(table.deliveryId),
    typeIdx: index('transaction_type_idx').on(table.type),
    statusIdx: index('transaction_status_idx').on(table.status),
    createdAtIdx: index('transaction_created_at_idx').on(table.createdAt),
  })
);

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type NewWalletTransaction = typeof walletTransactions.$inferInsert;
