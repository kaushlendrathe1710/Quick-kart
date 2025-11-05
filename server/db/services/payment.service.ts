import { db } from '@server/db/connect';
import { eq, and } from 'drizzle-orm';
import { paymentMethods } from '@server/db/schema';
import type {
  PaymentMethod,
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
} from '@shared/types';

/**
 * Payment Method Service
 * Handles all database operations for payment methods
 *
 * Note: In production, card numbers should be tokenized via a payment gateway
 * This implementation stores masked card numbers for demo purposes
 */

/**
 * Mask card number (show only last 4 digits)
 */
export function maskCardNumber(cardNumber: string): string {
  const lastFour = cardNumber.slice(-4);
  return `************${lastFour}`;
}

/**
 * Get all payment methods for a user
 */
export async function getUserPaymentMethods(userId: number): Promise<PaymentMethod[]> {
  return await db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.userId, userId))
    .orderBy(paymentMethods.createdAt);
}

/**
 * Get a single payment method by ID
 */
export async function getPaymentMethodById(
  paymentMethodId: number,
  userId: number
): Promise<PaymentMethod | undefined> {
  const result = await db
    .select()
    .from(paymentMethods)
    .where(and(eq(paymentMethods.id, paymentMethodId), eq(paymentMethods.userId, userId)));

  return result[0];
}

/**
 * Create a new payment method
 */
export async function createPaymentMethod(
  userId: number,
  data: CreatePaymentMethodInput
): Promise<PaymentMethod> {
  // If this is set as default, unset all other default payment methods
  if (data.isDefault) {
    await db
      .update(paymentMethods)
      .set({ isDefault: false })
      .where(eq(paymentMethods.userId, userId));
  }

  // Mask the card number before storing
  const maskedCardNumber = maskCardNumber(data.cardNumber);

  const [newPaymentMethod] = await db
    .insert(paymentMethods)
    .values({
      userId,
      ...data,
      cardNumber: maskedCardNumber,
    })
    .returning();

  return newPaymentMethod;
}

/**
 * Update an existing payment method
 */
export async function updatePaymentMethod(
  paymentMethodId: number,
  userId: number,
  data: UpdatePaymentMethodInput
): Promise<PaymentMethod | undefined> {
  // If this is being set as default, unset all other default payment methods
  if (data.isDefault) {
    await db
      .update(paymentMethods)
      .set({ isDefault: false })
      .where(eq(paymentMethods.userId, userId));
  }

  // Mask card number if it's being updated
  const updateData = { ...data };
  if (updateData.cardNumber) {
    updateData.cardNumber = maskCardNumber(updateData.cardNumber);
  }

  const [updatedPaymentMethod] = await db
    .update(paymentMethods)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(and(eq(paymentMethods.id, paymentMethodId), eq(paymentMethods.userId, userId)))
    .returning();

  return updatedPaymentMethod;
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethod(
  paymentMethodId: number,
  userId: number
): Promise<boolean> {
  const result = await db
    .delete(paymentMethods)
    .where(and(eq(paymentMethods.id, paymentMethodId), eq(paymentMethods.userId, userId)))
    .returning();

  return result.length > 0;
}

/**
 * Get default payment method for a user
 */
export async function getDefaultPaymentMethod(userId: number): Promise<PaymentMethod | undefined> {
  const result = await db
    .select()
    .from(paymentMethods)
    .where(and(eq(paymentMethods.userId, userId), eq(paymentMethods.isDefault, true)));

  return result[0];
}

/**
 * Set a payment method as default
 */
export async function setDefaultPaymentMethod(
  paymentMethodId: number,
  userId: number
): Promise<PaymentMethod | undefined> {
  // Unset all other default payment methods
  await db
    .update(paymentMethods)
    .set({ isDefault: false })
    .where(eq(paymentMethods.userId, userId));

  // Set the new default
  const [updatedPaymentMethod] = await db
    .update(paymentMethods)
    .set({ isDefault: true, updatedAt: new Date() })
    .where(and(eq(paymentMethods.id, paymentMethodId), eq(paymentMethods.userId, userId)))
    .returning();

  return updatedPaymentMethod;
}
