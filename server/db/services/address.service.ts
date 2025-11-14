import { db } from '@server/db/connect';
import { eq, and } from 'drizzle-orm';
import { addresses } from '@server/db/schema';
import type { Address, CreateAddressInput, UpdateAddressInput } from '@shared/types';

/**
 * Address Service
 * Handles all database operations for addresses
 */

/**
 * Get all addresses for a user
 */
export async function getUserAddresses(userId: number): Promise<Address[]> {
  return await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(addresses.createdAt);
}

/**
 * Get a single address by ID
 */
export async function getAddressById(
  addressId: number,
  userId: number
): Promise<Address | undefined> {
  const result = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));

  return result[0];
}

/**
 * Create a new address
 */
export async function createAddress(userId: number, data: CreateAddressInput): Promise<Address> {
  // If this is set as default, unset all other default addresses
  if (data.isDefault) {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
  }

  const [newAddress] = await db
    .insert(addresses)
    .values({
      userId,
      ...data,
      // Convert numbers to strings for decimal fields
      latitude: data.latitude !== undefined ? String(data.latitude) : undefined,
      longitude: data.longitude !== undefined ? String(data.longitude) : undefined,
    })
    .returning();

  return newAddress;
}

/**
 * Update an existing address
 */
export async function updateAddress(
  addressId: number,
  userId: number,
  data: UpdateAddressInput
): Promise<Address | undefined> {
  // If this is being set as default, unset all other default addresses
  if (data.isDefault) {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
  }

  const [updatedAddress] = await db
    .update(addresses)
    .set({
      ...data,
      // Convert numbers to strings for decimal fields
      latitude: data.latitude !== undefined ? String(data.latitude) : undefined,
      longitude: data.longitude !== undefined ? String(data.longitude) : undefined,
      updatedAt: new Date(),
    })
    .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
    .returning();

  return updatedAddress;
}

/**
 * Delete an address
 */
export async function deleteAddress(addressId: number, userId: number): Promise<boolean> {
  const result = await db
    .delete(addresses)
    .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
    .returning();

  return result.length > 0;
}

/**
 * Get default address for a user
 */
export async function getDefaultAddress(userId: number): Promise<Address | undefined> {
  const result = await db
    .select()
    .from(addresses)
    .where(and(eq(addresses.userId, userId), eq(addresses.isDefault, true)));

  return result[0];
}

/**
 * Set an address as default
 */
export async function setDefaultAddress(
  addressId: number,
  userId: number
): Promise<Address | undefined> {
  // Unset all other default addresses
  await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));

  // Set the new default
  const [updatedAddress] = await db
    .update(addresses)
    .set({ isDefault: true, updatedAt: new Date() })
    .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
    .returning();

  return updatedAddress;
}
