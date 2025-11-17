import { userRole } from '@shared/constants';
import {
  pgTable,
  text,
  serial,
  boolean,
  timestamp,
  varchar,
  json,
  index,
  pgEnum,
  integer,
} from 'drizzle-orm/pg-core';

const userRoles = Object.values(userRole) as [string, ...string[]];

export const userRoleEnum = pgEnum('user_role', userRoles);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  contactNumber: varchar('contact_number', { length: 15 }),
  avatar: text('avatar'),
  isApproved: boolean('is_approved').default(false),
  rejected: boolean('rejected').default(false),
  rejectionReason: text('rejection_reason'),
  role: userRoleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * User Payment Methods table
 * Stores payment information for regular users
 */
export const userPaymentMethods = pgTable('user_payment_methods', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  paymentType: varchar('payment_type', { length: 20 }).notNull(), // 'credit_card' | 'upi'
  // Credit Card fields
  cardHolderName: text('card_holder_name'),
  cardNumber: varchar('card_number', { length: 19 }), // Encrypted
  expiryMonth: varchar('expiry_month', { length: 2 }),
  expiryYear: varchar('expiry_year', { length: 4 }),
  // UPI fields
  upiId: varchar('upi_id', { length: 100 }),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Seller Information table
 * Stores business and payment details for sellers
 */
export const sellerInfo = pgTable('seller_info', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  businessName: text('business_name'),
  businessAddress: text('business_address'),
  gstNumber: varchar('gst_number', { length: 15 }),
  panNumber: varchar('pan_number', { length: 10 }),
  // Bank details
  bankName: text('bank_name'),
  bankState: varchar('bank_state', { length: 100 }),
  bankCity: varchar('bank_city', { length: 100 }),
  bankPincode: varchar('bank_pincode', { length: 10 }),
  accountNumber: varchar('account_number', { length: 50 }),
  ifscCode: varchar('ifsc_code', { length: 11 }),
  // Approval tracking
  approvedAt: timestamp('approved_at'),
  approvedBy: integer('approved_by').references(() => users.id),
  rejectedAt: timestamp('rejected_at'),
  rejectedBy: integer('rejected_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type UserPaymentMethod = typeof userPaymentMethods.$inferSelect;
export type InsertUserPaymentMethod = typeof userPaymentMethods.$inferInsert;
export type SellerInfo = typeof sellerInfo.$inferSelect;
export type InsertSellerInfo = typeof sellerInfo.$inferInsert;

// this is not used explicitly in the current codebase, but used via express-session
export const session = pgTable(
  'session',
  {
    sid: varchar('sid').primaryKey(), // character varying NOT NULL
    sess: json('sess').notNull(), // json NOT NULL
    expire: timestamp('expire', { precision: 6 }).notNull(), // timestamp without time zone NOT NULL
  },
  (table) => {
    return {
      expireIndex: index('IDX_session_expire').on(table.expire),
    };
  }
);
