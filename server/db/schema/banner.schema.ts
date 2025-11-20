import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { products } from './product.schema';

export const banners = pgTable('banners', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull(),
  imageUrl: text('image_url').notNull(),
  buttonText: text('button_text').notNull().default('Shop Now'),
  category: text('category'),
  subcategory: text('subcategory'),
  badgeText: text('badge_text'),
  productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
  active: boolean('active').notNull().default(true),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const insertBannerSchema = createInsertSchema(banners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateBannerSchema = createInsertSchema(banners)
  .omit({
    id: true,
    createdAt: true,
  })
  .partial();

export type Banner = typeof banners.$inferSelect;
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type UpdateBanner = z.infer<typeof updateBannerSchema>;
