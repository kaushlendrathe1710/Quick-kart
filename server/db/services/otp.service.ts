import { db } from '@server/db/connect';
import { otpVerifications } from '@server/db/schema/otp.schema';
import { eq, and, lt } from 'drizzle-orm';
import type { InsertOtpVerification, OtpVerification } from '@server/db/schema/otp.schema';
import { isOtpExpired } from '@server/utils/otp';

/**
 * Save a new OTP to the database
 */
export async function saveOtp(data: InsertOtpVerification): Promise<OtpVerification> {
  const [otp] = await db.insert(otpVerifications).values(data).returning();
  return otp;
}

/**
 * Find a valid OTP for the given email
 * Returns the OTP only if it exists, matches, is not used, and not expired
 */
export async function findValidOtp(
  email: string,
  otp: string
): Promise<OtpVerification | undefined> {
  const [result] = await db
    .select()
    .from(otpVerifications)
    .where(
      and(
        eq(otpVerifications.email, email),
        eq(otpVerifications.otp, otp),
        eq(otpVerifications.isUsed, false)
      )
    )
    .orderBy(otpVerifications.createdAt)
    .limit(1);

  // Check if OTP is expired
  if (result && isOtpExpired(result.expiresAt)) {
    return undefined;
  }

  return result;
}

/**
 * Mark an OTP as used
 */
export async function markOtpAsUsed(id: number): Promise<void> {
  await db.update(otpVerifications).set({ isUsed: true }).where(eq(otpVerifications.id, id));
}

/**
 * Delete expired OTPs from the database
 * This is a cleanup function that should be called periodically
 */
export async function deleteExpiredOtps(): Promise<number> {
  const result = await db
    .delete(otpVerifications)
    .where(lt(otpVerifications.expiresAt, new Date()))
    .returning();

  return result.length;
}

/**
 * Delete all OTPs for a specific email
 * Useful when you want to invalidate all previous OTPs
 */
export async function deleteOtpsByEmail(email: string): Promise<void> {
  await db.delete(otpVerifications).where(eq(otpVerifications.email, email));
}

/**
 * Get the most recent OTP for an email (for testing/debugging)
 */
export async function getLatestOtpByEmail(email: string): Promise<OtpVerification | undefined> {
  const [result] = await db
    .select()
    .from(otpVerifications)
    .where(eq(otpVerifications.email, email))
    .orderBy(otpVerifications.createdAt)
    .limit(1);

  return result;
}
