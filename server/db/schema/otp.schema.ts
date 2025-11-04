import { pgTable, serial, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';

/**
 * OTP Verifications table
 * Stores OTPs for email-based authentication
 */
export const otpVerifications = pgTable(
  'otp_verifications',
  {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    otp: text('otp').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    isUsed: boolean('is_used').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      emailIdx: index('otp_email_idx').on(table.email),
      expiresAtIdx: index('otp_expires_at_idx').on(table.expiresAt),
    };
  }
);

export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = typeof otpVerifications.$inferInsert;
