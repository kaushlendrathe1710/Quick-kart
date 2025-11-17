import { db } from '../index';
import { banners } from '../schema';
import { eq, desc } from 'drizzle-orm';

/**
 * Get all banners with pagination
 */
export async function getAllBanners(limit?: number, offset?: number) {
  const data = await db
    .select()
    .from(banners)
    .orderBy(banners.position, desc(banners.createdAt))
    .limit(limit || 100)
    .offset(offset || 0);

  const totalResult = await db.select().from(banners);

  return {
    data,
    total: totalResult.length,
  };
}

/**
 * Get banner by ID
 */
export async function getBannerById(bannerId: number) {
  const banner = await db.query.banners.findFirst({
    where: eq(banners.id, bannerId),
  });

  return banner;
}

/**
 * Create banner
 */
export async function createBanner(data: {
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText?: string;
  category?: string;
  subcategory?: string;
  badgeText?: string;
  productId?: number | null;
  active?: boolean;
  position?: number;
}) {
  const result = await db
    .insert(banners)
    .values({
      ...data,
      buttonText: data.buttonText || 'Shop Now',
      active: data.active ?? true,
      position: data.position || 0,
    })
    .returning();

  return result[0];
}

/**
 * Update banner
 */
export async function updateBanner(
  bannerId: number,
  data: {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    buttonText?: string;
    category?: string;
    subcategory?: string;
    badgeText?: string;
    productId?: number | null;
    active?: boolean;
    position?: number;
  }
) {
  const result = await db
    .update(banners)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(banners.id, bannerId))
    .returning();

  return result[0];
}

/**
 * Delete banner
 */
export async function deleteBanner(bannerId: number) {
  const result = await db.delete(banners).where(eq(banners.id, bannerId)).returning();

  return result[0];
}

/**
 * Update banner position
 */
export async function updateBannerPosition(bannerId: number, position: number) {
  const result = await db
    .update(banners)
    .set({
      position,
      updatedAt: new Date(),
    })
    .where(eq(banners.id, bannerId))
    .returning();

  return result[0];
}

/**
 * Toggle banner active status
 */
export async function toggleBannerActive(bannerId: number) {
  const banner = await getBannerById(bannerId);

  if (!banner) {
    throw new Error('Banner not found');
  }

  const result = await db
    .update(banners)
    .set({
      active: !banner.active,
      updatedAt: new Date(),
    })
    .where(eq(banners.id, bannerId))
    .returning();

  return result[0];
}
