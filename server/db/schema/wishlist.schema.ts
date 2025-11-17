import { pgTable, serial, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { products } from './product.schema';

/**
 * Wishlists table
 * Stores user wishlist items (favorite/saved products)
 */
export const wishlists = pgTable('wishlists', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  dateAdded: timestamp('date_added').notNull().defaultNow(),
});

export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = typeof wishlists.$inferInsert;
