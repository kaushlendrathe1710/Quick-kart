import { db } from '@server/db/connect';
import { eq, and, desc, sql } from 'drizzle-orm';
import { deliveryPartnerLocations } from '@server/db/schema';

/**
 * Delivery Location Service
 * Handles database operations for real-time delivery partner location tracking
 */

export interface LocationUpdate {
  deliveryPartnerId: number;
  orderId?: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  recordedAt?: Date;
}

export interface LocationRecord {
  id: number;
  deliveryPartnerId: number;
  orderId: number | null;
  latitude: string;
  longitude: string;
  accuracy: string | null;
  heading: string | null;
  speed: string | null;
  recordedAt: Date;
  createdAt: Date | null;
}

/**
 * Save a new location update from a delivery partner
 */
export async function updatePartnerLocation(data: LocationUpdate): Promise<LocationRecord> {
  const [location] = await db
    .insert(deliveryPartnerLocations)
    .values({
      deliveryPartnerId: data.deliveryPartnerId,
      orderId: data.orderId || null,
      latitude: data.latitude.toString(),
      longitude: data.longitude.toString(),
      accuracy: data.accuracy?.toString() || null,
      heading: data.heading?.toString() || null,
      speed: data.speed?.toString() || null,
      recordedAt: data.recordedAt || new Date(),
    })
    .returning();

  return location;
}

/**
 * Get the latest location for a specific delivery partner
 */
export async function getLatestPartnerLocation(
  deliveryPartnerId: number
): Promise<LocationRecord | undefined> {
  const result = await db
    .select()
    .from(deliveryPartnerLocations)
    .where(eq(deliveryPartnerLocations.deliveryPartnerId, deliveryPartnerId))
    .orderBy(desc(deliveryPartnerLocations.recordedAt))
    .limit(1);

  return result[0];
}

/**
 * Get the latest location for a delivery partner on a specific order
 */
export async function getPartnerLocationForOrder(
  deliveryPartnerId: number,
  orderId: number
): Promise<LocationRecord | undefined> {
  const result = await db
    .select()
    .from(deliveryPartnerLocations)
    .where(
      and(
        eq(deliveryPartnerLocations.deliveryPartnerId, deliveryPartnerId),
        eq(deliveryPartnerLocations.orderId, orderId)
      )
    )
    .orderBy(desc(deliveryPartnerLocations.recordedAt))
    .limit(1);

  return result[0];
}

/**
 * Get location history for a delivery partner
 * @param deliveryPartnerId - ID of the delivery partner
 * @param limit - Maximum number of records to return
 */
export async function getPartnerLocationHistory(
  deliveryPartnerId: number,
  limit: number = 50
): Promise<LocationRecord[]> {
  return await db
    .select()
    .from(deliveryPartnerLocations)
    .where(eq(deliveryPartnerLocations.deliveryPartnerId, deliveryPartnerId))
    .orderBy(desc(deliveryPartnerLocations.recordedAt))
    .limit(limit);
}

/**
 * Get all recent locations for orders in a specific store
 * Useful for store owners to track all their active deliveries
 */
export async function getLocationsForOrders(orderIds: number[]): Promise<LocationRecord[]> {
  if (orderIds.length === 0) return [];

  const result = await db
    .select()
    .from(deliveryPartnerLocations)
    .where(sql`${deliveryPartnerLocations.orderId} = ANY(${orderIds})`)
    .orderBy(desc(deliveryPartnerLocations.recordedAt));

  // Get only the latest location for each order
  const latestByOrder = new Map<number, LocationRecord>();

  for (const location of result) {
    if (location.orderId && !latestByOrder.has(location.orderId)) {
      latestByOrder.set(location.orderId, location);
    }
  }

  return Array.from(latestByOrder.values());
}

/**
 * Clean up old location records
 * Should be called periodically to prevent database bloat
 * @param olderThanDays - Delete records older than this many days
 */
export async function cleanupOldLocations(olderThanDays: number = 7): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const result = await db
    .delete(deliveryPartnerLocations)
    .where(sql`${deliveryPartnerLocations.recordedAt} < ${cutoffDate}`)
    .returning();

  return result.length;
}
