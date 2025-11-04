/**
 * OTP utility functions
 */

// Constants
export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 5;

/**
 * Generate a random numeric OTP
 * @param length - Length of the OTP (default: 6)
 * @returns A string containing the OTP
 */
export function generateOtp(length: number = OTP_LENGTH): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const otp = Math.floor(min + Math.random() * (max - min + 1));
  return otp.toString();
}

/**
 * Calculate OTP expiry timestamp
 * @param minutes - Number of minutes until expiry (default: OTP_EXPIRY_MINUTES)
 * @returns Date object representing the expiry time
 */
export function getOtpExpiryTime(minutes: number = OTP_EXPIRY_MINUTES): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Check if an OTP has expired
 * @param expiresAt - The expiry timestamp
 * @returns true if expired, false otherwise
 */
export function isOtpExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
