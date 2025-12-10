import { pgTable, serial, integer, decimal, timestamp, index, varchar } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

/**
 * Wallets table
 * Stores wallet balance for sellers and delivery partners
 * Each user (seller or delivery partner) has one wallet
 */
export const wallets = pgTable(
  'wallets',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),

    userType: varchar('user_type', { length: 20 }).notNull(), // 'seller' or 'deliveryPartner'

    balance: decimal('balance', { precision: 10, scale: 2 }).notNull().default('0.00'),
    withdrawableBalance: decimal('withdrawable_balance', { precision: 10, scale: 2 })
      .notNull()
      .default('0.00'),
    totalEarnings: decimal('total_earnings', { precision: 10, scale: 2 }).notNull().default('0.00'),
    totalWithdrawn: decimal('total_withdrawn', { precision: 10, scale: 2 })
      .notNull()
      .default('0.00'),
    pendingAmount: decimal('pending_amount', { precision: 10, scale: 2 }).notNull().default('0.00'),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    userIdx: index('wallet_user_idx').on(table.userId),
    userTypeIdx: index('wallet_user_type_idx').on(table.userType),
  })
);

export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;
