import { db } from '@server/db/connect';
import { eq, desc, sql, and } from 'drizzle-orm';
import { deliveryRatings } from '@server/db/schema';
import type { DeliveryRating, NewDeliveryRating } from '@server/db/schema';

/**
 * Get rating by ID
 */
export async function getRatingById(id: number): Promise<DeliveryRating | undefined> {
  const result = await db.select().from(deliveryRatings).where(eq(deliveryRatings.id, id));
  return result[0];
}

/**
 * Get rating by delivery ID
 */
export async function getRatingByDeliveryId(
  deliveryId: number
): Promise<DeliveryRating | undefined> {
  const result = await db
    .select()
    .from(deliveryRatings)
    .where(eq(deliveryRatings.deliveryId, deliveryId));
  return result[0];
}

/**
 * Get ratings by delivery partner ID
 */
export async function getRatingsByPartnerId(
  deliveryPartnerId: number,
  options?: { limit?: number; offset?: number }
): Promise<DeliveryRating[]> {
  const query = db
    .select()
    .from(deliveryRatings)
    .where(eq(deliveryRatings.deliveryPartnerId, deliveryPartnerId))
    .orderBy(desc(deliveryRatings.createdAt));

  if (options?.limit) {
    query.limit(options.limit);
  }
  if (options?.offset) {
    query.offset(options.offset);
  }

  return await query;
}

/**
 * Get ratings by buyer ID
 */
export async function getRatingsByBuyerId(
  buyerId: number,
  options?: { limit?: number; offset?: number }
): Promise<DeliveryRating[]> {
  const query = db
    .select()
    .from(deliveryRatings)
    .where(eq(deliveryRatings.buyerId, buyerId))
    .orderBy(desc(deliveryRatings.createdAt));

  if (options?.limit) {
    query.limit(options.limit);
  }
  if (options?.offset) {
    query.offset(options.offset);
  }

  return await query;
}

/**
 * Create rating
 */
export async function createRating(data: NewDeliveryRating): Promise<DeliveryRating> {
  const [newRating] = await db.insert(deliveryRatings).values(data).returning();
  return newRating;
}

/**
 * Update rating
 */
export async function updateRating(
  id: number,
  data: Partial<Pick<NewDeliveryRating, 'rating' | 'feedback'>>
): Promise<DeliveryRating | undefined> {
  const [updatedRating] = await db
    .update(deliveryRatings)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(deliveryRatings.id, id))
    .returning();
  return updatedRating;
}

/**
 * Delete rating
 */
export async function deleteRating(id: number): Promise<boolean> {
  const result = await db.delete(deliveryRatings).where(eq(deliveryRatings.id, id)).returning();
  return result.length > 0;
}

/**
 * Get average rating for a delivery partner
 */
export async function getPartnerAverageRating(deliveryPartnerId: number): Promise<number> {
  const result = await db
    .select({
      avgRating: sql<number>`coalesce(avg(${deliveryRatings.rating}), 0)`,
    })
    .from(deliveryRatings)
    .where(eq(deliveryRatings.deliveryPartnerId, deliveryPartnerId));

  return Number(result[0]?.avgRating || 0);
}

/**
 * Get rating statistics for a delivery partner
 */
export async function getPartnerRatingStats(deliveryPartnerId: number) {
  const stats = await db
    .select({
      totalRatings: sql<number>`count(*)::int`,
      avgRating: sql<number>`coalesce(avg(${deliveryRatings.rating}), 0)`,
      fiveStars: sql<number>`count(case when ${deliveryRatings.rating} = 5 then 1 end)::int`,
      fourStars: sql<number>`count(case when ${deliveryRatings.rating} = 4 then 1 end)::int`,
      threeStars: sql<number>`count(case when ${deliveryRatings.rating} = 3 then 1 end)::int`,
      twoStars: sql<number>`count(case when ${deliveryRatings.rating} = 2 then 1 end)::int`,
      oneStar: sql<number>`count(case when ${deliveryRatings.rating} = 1 then 1 end)::int`,
    })
    .from(deliveryRatings)
    .where(eq(deliveryRatings.deliveryPartnerId, deliveryPartnerId));

  return stats[0];
}

/**
 * Check if rating exists for delivery
 */
export async function ratingExistsForDelivery(deliveryId: number): Promise<boolean> {
  const result = await db
    .select({ id: deliveryRatings.id })
    .from(deliveryRatings)
    .where(eq(deliveryRatings.deliveryId, deliveryId));
  return result.length > 0;
}

export const deliveryRatingService = {
  getRatingById,
  getRatingByDeliveryId,
  getRatingsByPartnerId,
  getRatingsByBuyerId,
  createRating,
  updateRating,
  deleteRating,
  getPartnerAverageRating,
  getPartnerRatingStats,
  ratingExistsForDelivery,
};
