import {
  pgTable,
  text,
  serial,
  timestamp,
  varchar,
  integer,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './user.schema';

/**
 * Card Type Enum
 */
export const cardTypeEnum = pgEnum('card_type', [
  'Visa',
  'MasterCard',
  'American Express',
  'Discover',
  'Rupay',
  'Other',
]);

/**
 * Payment Methods table
 * Stores user payment method information
 * Note: In production, card numbers should be tokenized via a payment gateway
 */
export const paymentMethods = pgTable('payment_methods', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  cardHolderName: varchar('card_holder_name', { length: 100 }).notNull(),
  cardNumber: varchar('card_number', { length: 20 }).notNull(), // Should be encrypted/masked
  expiryMonth: varchar('expiry_month', { length: 2 }).notNull(),
  expiryYear: varchar('expiry_year', { length: 4 }).notNull(),
  cardType: cardTypeEnum('card_type').notNull(),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
