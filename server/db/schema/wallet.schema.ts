import { pgTable, serial, integer, decimal, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

/**
 * Wallets table
 * Stores wallet balance for delivery partners
 */
export const wallets = pgTable(
  'wallets',
  {
    id: serial('id').primaryKey(),
    deliveryPartnerId: integer('delivery_partner_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),

    balance: decimal('balance', { precision: 10, scale: 2 }).notNull().default('0.00'),
    totalEarnings: decimal('total_earnings', { precision: 10, scale: 2 }).notNull().default('0.00'),
    totalWithdrawn: decimal('total_withdrawn', { precision: 10, scale: 2 })
      .notNull()
      .default('0.00'),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    partnerIdx: index('wallet_partner_idx').on(table.deliveryPartnerId),
  })
);

export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;
