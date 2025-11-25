import { db } from '@server/db/connect';
import { eq, and, or, desc, asc, sql } from 'drizzle-orm';
import { deliveries } from '@server/db/schema';
import type { Delivery, NewDelivery } from '@server/db/schema';

/**
 * Get delivery by ID
 */
export async function getDeliveryById(id: number): Promise<Delivery | undefined> {
  const result = await db.select().from(deliveries).where(eq(deliveries.id, id));
  return result[0];
}

/**
 * Get delivery by order ID
 */
export async function getDeliveryByOrderId(orderId: number): Promise<Delivery | undefined> {
  const result = await db.select().from(deliveries).where(eq(deliveries.orderId, orderId));
  return result[0];
}

/**
 * Get deliveries by delivery partner ID
 */
export async function getDeliveriesByPartnerId(
  deliveryPartnerId: number,
  options?: { limit?: number; offset?: number }
): Promise<{ data: Delivery[]; total: number }> {
  const query = db
    .select()
    .from(deliveries)
    .where(eq(deliveries.deliveryPartnerId, deliveryPartnerId))
    .orderBy(desc(deliveries.createdAt));

  if (options?.limit) {
    query.limit(options.limit);
  }
  if (options?.offset) {
    query.offset(options.offset);
  }

  const data = await query;

  // Get total count
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(deliveries)
    .where(eq(deliveries.deliveryPartnerId, deliveryPartnerId));

  return {
    data,
    total: Number(totalResult[0]?.count || 0),
  };
}

/**
 * Get deliveries by buyer ID
 */
export async function getDeliveriesByBuyerId(
  buyerId: number,
  options?: { limit?: number; offset?: number }
): Promise<Delivery[]> {
  const query = db
    .select()
    .from(deliveries)
    .where(eq(deliveries.buyerId, buyerId))
    .orderBy(desc(deliveries.createdAt));

  if (options?.limit) {
    query.limit(options.limit);
  }
  if (options?.offset) {
    query.offset(options.offset);
  }

  return await query;
}

/**
 * Get deliveries by status
 */
export async function getDeliveriesByStatus(
  status: string,
  options?: { limit?: number; offset?: number }
): Promise<Delivery[]> {
  const query = db
    .select()
    .from(deliveries)
    .where(eq(deliveries.status, status as any))
    .orderBy(desc(deliveries.createdAt));

  if (options?.limit) {
    query.limit(options.limit);
  }
  if (options?.offset) {
    query.offset(options.offset);
  }

  return await query;
}

/**
 * Get deliveries by seller ID (via orders table join)
 */
export async function getDeliveriesBySellerId(
  sellerId: number,
  options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }
): Promise<{ data: Delivery[]; total: number }> {
  const { orders } = await import('@server/db/schema');

  let whereConditions = [eq(orders.sellerId, sellerId)];

  if (options?.status) {
    whereConditions.push(eq(deliveries.status, options.status as any));
  }

  const query = db
    .select()
    .from(deliveries)
    .innerJoin(orders, eq(deliveries.orderId, orders.id))
    .where(and(...whereConditions))
    .orderBy(desc(deliveries.createdAt));

  if (options?.limit) {
    query.limit(options.limit);
  }
  if (options?.offset) {
    query.offset(options.offset);
  }

  const results = await query;
  const data = results.map((row) => row.deliveries);

  // Get total count
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(deliveries)
    .innerJoin(orders, eq(deliveries.orderId, orders.id))
    .where(and(...whereConditions));

  return {
    data,
    total: Number(totalResult[0]?.count || 0),
  };
}

/**
 * Create delivery
 */
export async function createDelivery(data: NewDelivery): Promise<Delivery> {
  const [newDelivery] = await db.insert(deliveries).values(data).returning();
  return newDelivery;
}

/**
 * Update delivery
 */
export async function updateDelivery(
  id: number,
  data: Partial<Omit<NewDelivery, 'orderId' | 'buyerId'>>
): Promise<Delivery | undefined> {
  const [updatedDelivery] = await db
    .update(deliveries)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(deliveries.id, id))
    .returning();
  return updatedDelivery;
}

/**
 * Assign delivery to partner
 */
export async function assignDelivery(
  id: number,
  deliveryPartnerId: number
): Promise<Delivery | undefined> {
  const [assignedDelivery] = await db
    .update(deliveries)
    .set({
      deliveryPartnerId,
      status: 'assigned',
      assignedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(deliveries.id, id))
    .returning();
  return assignedDelivery;
}

/**
 * Update delivery status
 */
export async function updateDeliveryStatus(
  id: number,
  status: string
): Promise<Delivery | undefined> {
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  // Set timestamp based on status
  if (status === 'picked_up') {
    updateData.pickedUpAt = new Date();
  } else if (status === 'delivered') {
    updateData.deliveredAt = new Date();
  }

  const [updatedDelivery] = await db
    .update(deliveries)
    .set(updateData)
    .where(eq(deliveries.id, id))
    .returning();
  return updatedDelivery;
}

/**
 * Cancel delivery
 */
export async function cancelDelivery(
  id: number,
  cancellationReason: string
): Promise<Delivery | undefined> {
  const [cancelledDelivery] = await db
    .update(deliveries)
    .set({
      status: 'cancelled',
      cancellationReason,
      updatedAt: new Date(),
    })
    .where(eq(deliveries.id, id))
    .returning();
  return cancelledDelivery;
}

/**
 * Delete delivery
 */
export async function deleteDelivery(id: number): Promise<boolean> {
  const result = await db.delete(deliveries).where(eq(deliveries.id, id)).returning();
  return result.length > 0;
}

/**
 * Get delivery partner statistics
 */
export async function getPartnerStats(deliveryPartnerId: number) {
  const stats = await db
    .select({
      totalDeliveries: sql<number>`count(*)::int`,
      completedDeliveries: sql<number>`count(case when ${deliveries.status} = 'delivered' then 1 end)::int`,
      cancelledDeliveries: sql<number>`count(case when ${deliveries.status} = 'cancelled' then 1 end)::int`,
      totalEarnings: sql<string>`coalesce(sum(${deliveries.deliveryFee} + ${deliveries.tip}), 0)`,
    })
    .from(deliveries)
    .where(eq(deliveries.deliveryPartnerId, deliveryPartnerId));

  return stats[0];
}

export const deliveryService = {
  getDeliveryById,
  getDeliveryByOrderId,
  getDeliveriesByPartnerId,
  getDeliveriesByBuyerId,
  getDeliveriesByStatus,
  getDeliveriesBySellerId,
  createDelivery,
  updateDelivery,
  assignDelivery,
  updateDeliveryStatus,
  cancelDelivery,
  deleteDelivery,
  getPartnerStats,
};
