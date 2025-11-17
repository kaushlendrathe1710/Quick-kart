import { pgTable, text, serial, timestamp, varchar, boolean, integer } from 'drizzle-orm/pg-core';

/**
 * Categories table
 * Stores product categories for the e-commerce platform
 */
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: text('slug').notNull().unique(), // URL-friendly identifier
  description: text('description'),
  image: text('image'), // Category image URL
  displayOrder: integer('display_order').notNull().default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Subcategories table
 * Stores product subcategories under main categories
 */
export const subcategories = pgTable('subcategories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(), // URL-friendly identifier
  image: text('image'),
  description: text('description'),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  parentId: integer('parent_id'), // Self-reference for nested subcategories
  displayOrder: integer('display_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  featured: boolean('featured').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
