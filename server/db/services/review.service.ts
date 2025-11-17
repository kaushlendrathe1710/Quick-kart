import { db } from '@server/db/connect';
import {
  reviews,
  reviewImages,
  reviewHelpful,
  reviewReplies,
  products,
  users,
} from '@server/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

/**
 * Review Service
 * Handles all review-related database operations
 */

export class ReviewService {
  /**
   * Create a new review
   */
  static async createReview(data: {
    userId: number;
    productId: number;
    orderId?: number;
    rating: number;
    review?: string;
    title?: string;
    verifiedPurchase?: boolean;
  }) {
    const [newReview] = await db
      .insert(reviews)
      .values({
        ...data,
        status: 'published',
        helpfulCount: 0,
      })
      .returning();

    // Update product rating
    await this.updateProductRating(data.productId);

    return newReview;
  }

  /**
   * Add images to a review
   */
  static async addReviewImages(reviewId: number, imageUrls: string[]) {
    if (imageUrls.length === 0) return [];

    const imagesToInsert = imageUrls.map((url) => ({
      reviewId,
      imageUrl: url,
    }));

    return await db.insert(reviewImages).values(imagesToInsert).returning();
  }

  /**
   * Get reviews for a product with pagination
   */
  static async getProductReviews(productId: number, limit = 10, offset = 0) {
    const reviewsData = await db.query.reviews.findMany({
      where: eq(reviews.productId, productId),
      orderBy: [desc(reviews.createdAt)],
      limit,
      offset,
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        images: true,
        replies: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    // Get total count
    const totalReviews = await db.query.reviews.findMany({
      where: eq(reviews.productId, productId),
    });

    return {
      reviews: reviewsData,
      total: totalReviews.length,
    };
  }

  /**
   * Get review by ID
   */
  static async getReviewById(reviewId: number) {
    return await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          columns: {
            id: true,
            name: true,
            sellerId: true,
          },
        },
        images: true,
        replies: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get reviews by user with pagination
   */
  static async getUserReviews(userId: number, limit = 20, offset = 0) {
    const reviewsData = await db.query.reviews.findMany({
      where: eq(reviews.userId, userId),
      orderBy: [desc(reviews.createdAt)],
      limit,
      offset,
      with: {
        product: {
          columns: {
            id: true,
            name: true,
            thumbnail: true,
          },
        },
        images: true,
      },
    });

    // Get total count
    const totalReviews = await db.query.reviews.findMany({
      where: eq(reviews.userId, userId),
    });

    return {
      reviews: reviewsData,
      total: totalReviews.length,
    };
  }

  /**
   * Update review
   */
  static async updateReview(
    reviewId: number,
    data: {
      rating?: number;
      review?: string;
      title?: string;
    }
  ) {
    const [updatedReview] = await db
      .update(reviews)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, reviewId))
      .returning();

    // Update product rating if rating changed
    if (data.rating !== undefined) {
      const review = await db.query.reviews.findFirst({
        where: eq(reviews.id, reviewId),
      });
      if (review) {
        await this.updateProductRating(review.productId);
      }
    }

    return updatedReview;
  }

  /**
   * Delete review
   */
  static async deleteReview(reviewId: number) {
    // Get product ID before deleting
    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
    });

    if (!review) return null;

    // Delete review (cascade will delete images, replies, helpful votes)
    await db.delete(reviews).where(eq(reviews.id, reviewId));

    // Update product rating
    await this.updateProductRating(review.productId);

    return review;
  }

  /**
   * Mark review as helpful
   */
  static async markReviewHelpful(reviewId: number, userId: number) {
    // Check if already marked helpful
    const existing = await db.query.reviewHelpful.findFirst({
      where: and(eq(reviewHelpful.reviewId, reviewId), eq(reviewHelpful.userId, userId)),
    });

    if (existing) {
      return { alreadyMarked: true, data: existing };
    }

    // Add helpful vote
    const [helpfulVote] = await db
      .insert(reviewHelpful)
      .values({
        reviewId,
        userId,
      })
      .returning();

    // Increment helpful count
    await db
      .update(reviews)
      .set({
        helpfulCount: sql`${reviews.helpfulCount} + 1`,
      })
      .where(eq(reviews.id, reviewId));

    return { alreadyMarked: false, data: helpfulVote };
  }

  /**
   * Unmark review as helpful
   */
  static async unmarkReviewHelpful(reviewId: number, userId: number) {
    const deleted = await db
      .delete(reviewHelpful)
      .where(and(eq(reviewHelpful.reviewId, reviewId), eq(reviewHelpful.userId, userId)))
      .returning();

    if (deleted.length > 0) {
      // Decrement helpful count
      await db
        .update(reviews)
        .set({
          helpfulCount: sql`${reviews.helpfulCount} - 1`,
        })
        .where(eq(reviews.id, reviewId));
    }

    return deleted.length > 0;
  }

  /**
   * Check if user marked review as helpful
   */
  static async isReviewHelpfulByUser(reviewId: number, userId: number) {
    const result = await db.query.reviewHelpful.findFirst({
      where: and(eq(reviewHelpful.reviewId, reviewId), eq(reviewHelpful.userId, userId)),
    });

    return !!result;
  }

  /**
   * Add reply to review (seller/admin)
   */
  static async addReviewReply(reviewId: number, userId: number, reply: string) {
    const [newReply] = await db
      .insert(reviewReplies)
      .values({
        reviewId,
        userId,
        reply,
      })
      .returning();

    return newReply;
  }

  /**
   * Update review reply
   */
  static async updateReviewReply(replyId: number, reply: string) {
    const [updatedReply] = await db
      .update(reviewReplies)
      .set({
        reply,
        updatedAt: new Date(),
      })
      .where(eq(reviewReplies.id, replyId))
      .returning();

    return updatedReply;
  }

  /**
   * Delete review reply
   */
  static async deleteReviewReply(replyId: number) {
    await db.delete(reviewReplies).where(eq(reviewReplies.id, replyId));
  }

  /**
   * Get review replies
   */
  static async getReviewReplies(reviewId: number) {
    return await db.query.reviewReplies.findMany({
      where: eq(reviewReplies.reviewId, reviewId),
      orderBy: [desc(reviewReplies.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Get product rating summary
   */
  static async getProductRatingSummary(productId: number) {
    const allReviews = await db.query.reviews.findMany({
      where: and(eq(reviews.productId, productId), eq(reviews.status, 'published')),
    });

    const totalReviews = allReviews.length;
    const averageRating =
      totalReviews > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;

    // Count ratings by star
    const ratingCounts = {
      5: allReviews.filter((r) => r.rating === 5).length,
      4: allReviews.filter((r) => r.rating === 4).length,
      3: allReviews.filter((r) => r.rating === 3).length,
      2: allReviews.filter((r) => r.rating === 2).length,
      1: allReviews.filter((r) => r.rating === 1).length,
    };

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      ratingCounts,
    };
  }

  /**
   * Update product rating (recalculate from all reviews)
   */
  static async updateProductRating(productId: number) {
    const summary = await this.getProductRatingSummary(productId);

    await db
      .update(products)
      .set({
        rating: summary.averageRating.toString(),
        reviewCount: summary.totalReviews,
      })
      .where(eq(products.id, productId));
  }

  /**
   * Check if user purchased product
   */
  static async hasUserPurchasedProduct(userId: number, productId: number): Promise<boolean> {
    // This would check if user has an order with this product
    // For now, return false - implement when order system is complete
    return false;
  }
}
