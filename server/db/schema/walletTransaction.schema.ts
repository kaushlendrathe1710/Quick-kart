import {
  pgTable,
  serial,
  integer,
  decimal,
  text,
  timestamp,
  index,
  varchar,
} from 'drizzle-orm/pg-core';
import { wallets } from './wallet.schema';
import { deliveries } from './delivery.schema';
import { orders } from './order.schema';
import { transactionTypeEnum, transactionStatusEnum } from './enums';

/**
 * Wallet Transactions table
 * Tracks all wallet transactions for sellers and delivery partners
 */
export const walletTransactions = pgTable(
  'wallet_transactions',
  {
    id: serial('id').primaryKey(),
    walletId: integer('wallet_id')
      .notNull()
      .references(() => wallets.id, { onDelete: 'cascade' }),

    orderId: integer('order_id').references(() => orders.id, { onDelete: 'set null' }),
    deliveryId: integer('delivery_id').references(() => deliveries.id, { onDelete: 'set null' }),

    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    type: transactionTypeEnum('type').notNull(),
    status: transactionStatusEnum('status').notNull().default('completed'),

    transactionCategory: varchar('transaction_category', { length: 50 }).notNull(), // 'order_earning', 'delivery_fee', 'withdrawal', 'bonus', 'refund', 'adjustment'

    description: text('description'),
    referenceId: text('reference_id'), // External payment/transaction reference (Razorpay order_id, payment_id, etc.)
    metadata: text('metadata'), // JSON string for additional data

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    walletIdx: index('transaction_wallet_idx').on(table.walletId),
    orderIdx: index('transaction_order_idx').on(table.orderId),
    deliveryIdx: index('transaction_delivery_idx').on(table.deliveryId),
    typeIdx: index('transaction_type_idx').on(table.type),
    statusIdx: index('transaction_status_idx').on(table.status),
    categoryIdx: index('transaction_category_idx').on(table.transactionCategory),
    createdAtIdx: index('transaction_created_at_idx').on(table.createdAt),
  })
);

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type NewWalletTransaction = typeof walletTransactions.$inferInsert;
