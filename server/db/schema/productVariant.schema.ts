import { pgTable, text, serial, timestamp, integer } from 'drizzle-orm/pg-core';
import { products } from './product.schema';

/**
 * Product Variants Table
 * Stores variant-specific information (color, size, stock) for products
 * Matches LeleKart product_variants structure
 */
export const productVariants = pgTable('product_variants', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  sku: text('sku'), // Variant-specific SKU
  color: text('color'), // Variant color
  size: text('size'), // Variant size
  price: integer('price').notNull(), // Variant-specific price
  mrp: integer('mrp'), // Variant-specific MRP
  stock: integer('stock').notNull().default(0), // Variant-specific stock
  images: text('images'), // Variant-specific images as JSON string
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Type exports
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
