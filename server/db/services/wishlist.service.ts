import { db } from '../index';
import { wishlists, products, users } from '../schema';
import { eq, and, sql } from 'drizzle-orm';

export class WishlistService {
  /**
   * Get all wishlist items for a user with product details and pagination
   */
  static async getUserWishlist(userId: number, limit = 20, offset = 0) {
    const wishlistItems = await db
      .select({
        id: wishlists.id,
        userId: wishlists.userId,
        productId: wishlists.productId,
        dateAdded: wishlists.dateAdded,
        product: {
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          mrp: products.mrp,
          thumbnail: products.thumbnail,
          imageUrls: products.imageUrls,
          category: products.category,
          stock: products.stock,
          rating: products.rating,
          reviewCount: products.reviewCount,
          approved: products.approved,
        },
      })
      .from(wishlists)
      .innerJoin(products, eq(wishlists.productId, products.id))
      .where(eq(wishlists.userId, userId))
      .orderBy(wishlists.dateAdded)
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(wishlists)
      .where(eq(wishlists.userId, userId));

    return {
      data: wishlistItems,
      total: Number(totalResult[0]?.count || 0),
    };
  }

  /**
   * Add a product to wishlist
   */
  static async addToWishlist(userId: number, productId: number) {
    // Check if already in wishlist
    const existing = await db
      .select()
      .from(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)))
      .limit(1);

    if (existing.length > 0) {
      throw new Error('Product already in wishlist');
    }

    // Add to wishlist
    const [wishlistItem] = await db
      .insert(wishlists)
      .values({
        userId,
        productId,
      })
      .returning();

    return wishlistItem;
  }

  /**
   * Remove a product from wishlist
   */
  static async removeFromWishlist(userId: number, productId: number) {
    const result = await db
      .delete(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)))
      .returning();

    if (result.length === 0) {
      throw new Error('Product not found in wishlist');
    }

    return result[0];
  }

  /**
   * Check if a product is in user's wishlist
   */
  static async isInWishlist(userId: number, productId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)))
      .limit(1);

    return result.length > 0;
  }

  /**
   * Clear user's entire wishlist
   */
  static async clearWishlist(userId: number) {
    await db.delete(wishlists).where(eq(wishlists.userId, userId));
  }

  /**
   * Get wishlist count for a user
   */
  static async getWishlistCount(userId: number): Promise<number> {
    const result = await db.select().from(wishlists).where(eq(wishlists.userId, userId));

    return result.length;
  }
}
