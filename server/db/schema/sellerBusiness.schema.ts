import { pgTable, text, serial, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

/**
 * Business Details Table
 * Stores business-related information for sellers
 * Required for seller onboarding and GST compliance
 */
export const businessDetails = pgTable('business_details', {
  id: serial('id').primaryKey(),
  sellerId: integer('seller_id')
    .notNull()
    .references(() => users.id)
    .unique(),
  businessName: text('business_name').notNull(),
  gstNumber: text('gst_number'), // GST registration number
  panNumber: text('pan_number'), // PAN card number
  businessType: text('business_type'), // Sole Proprietorship, Partnership, Private Limited, etc.
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Banking Information Table
 * Stores bank account details for seller payments/withdrawals
 */
export const bankingInformation = pgTable('banking_information', {
  id: serial('id').primaryKey(),
  sellerId: integer('seller_id')
    .notNull()
    .references(() => users.id)
    .unique(),
  accountHolderName: text('account_holder_name').notNull(),
  accountNumber: text('account_number').notNull(),
  bankName: text('bank_name').notNull(),
  ifscCode: text('ifsc_code').notNull(), // Indian Financial System Code
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Type exports
export type BusinessDetails = typeof businessDetails.$inferSelect;
export type NewBusinessDetails = typeof businessDetails.$inferInsert;
export type BankingInformation = typeof bankingInformation.$inferSelect;
export type NewBankingInformation = typeof bankingInformation.$inferInsert;
