import { pgTable, text, serial, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { products } from './product.schema';
import { orders } from './order.schema';

/**
 * Reviews table
 * Stores product reviews from buyers
 */
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  orderId: integer('order_id').references(() => orders.id), // Optional - to verify purchase
  rating: integer('rating').notNull(), // 1-5 star rating
  review: text('review'), // Text review (optional)
  title: text('title'), // Review title/headline (optional)
  verifiedPurchase: boolean('verified_purchase').notNull().default(false),
  status: text('status').notNull().default('published'), // published, pending, rejected
  helpfulCount: integer('helpful_count').notNull().default(0), // Number of users who found this helpful
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Review Images table
 * Stores images attached to reviews (photo reviews)
 */
export const reviewImages = pgTable('review_images', {
  id: serial('id').primaryKey(),
  reviewId: integer('review_id')
    .notNull()
    .references(() => reviews.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Review Helpful Votes table
 * Tracks which users found which reviews helpful
 */
export const reviewHelpful = pgTable('review_helpful', {
  id: serial('id').primaryKey(),
  reviewId: integer('review_id')
    .notNull()
    .references(() => reviews.id, { onDelete: 'cascade' }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Review Replies table
 * Stores seller/admin responses to reviews
 */
export const reviewReplies = pgTable('review_replies', {
  id: serial('id').primaryKey(),
  reviewId: integer('review_id')
    .notNull()
    .references(() => reviews.id, { onDelete: 'cascade' }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  reply: text('reply').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
