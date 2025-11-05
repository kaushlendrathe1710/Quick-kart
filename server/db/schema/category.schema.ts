import { pgTable, text, serial, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';

/**
 * Categories table
 * Stores product categories for the e-commerce platform
 */
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  image: text('image'), // Category image URL
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
