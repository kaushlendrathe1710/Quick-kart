import {
  pgTable,
  text,
  serial,
  timestamp,
  varchar,
  integer,
  decimal,
  boolean,
  json,
} from 'drizzle-orm/pg-core';
import { categories } from './category.schema';
import { users } from './user.schema';

/**
 * Products table
 * Stores product information for the e-commerce platform
 */
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  sellerId: integer('seller_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 5, scale: 2 }).default('0'), // Percentage discount
  stock: integer('stock').default(0).notNull(),
  images: json('images').$type<string[]>(), // Array of image URLs
  specifications: json('specifications'), // Product specifications as JSON
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  reviewCount: integer('review_count').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
