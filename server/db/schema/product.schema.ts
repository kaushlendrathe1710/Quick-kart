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
import { categories, subcategories } from './category.schema';
import { users } from './user.schema';

/**
 * Products table
 * Stores product information for the e-commerce platform
 * Matches LeleKart schema structure
 */
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  specifications: text('specifications'), // Technical specifications as text
  sku: text('sku'), // Stock Keeping Unit (unique product identifier)

  // Pricing
  mrp: integer('mrp'), // Maximum Retail Price (original price before discount)
  purchasePrice: integer('purchase_price'), // Purchase Price (cost price)
  price: integer('price').notNull(), // Selling price

  // Category
  category: text('category').notNull(), // Category name for quick access
  categoryId: integer('category_id').references(() => categories.id),
  subcategoryId: integer('subcategory_id').references(() => subcategories.id),
  subcategory1: text('subcategory1'), // Free text subcategory 1
  subcategory2: text('subcategory2'), // Free text subcategory 2

  // Media (Images only)
  thumbnail: text('thumbnail'), // Main/primary product image (thumbnail)
  imageUrls: text('image_urls'), // Array of product images as JSON string

  // Seller
  sellerId: integer('seller_id').references(() => users.id),

  // Stock
  stock: integer('stock').notNull().default(0),

  // Tax information
  gstRate: decimal('gst_rate', { precision: 5, scale: 2 }).default('0.00'), // Product-specific GST rate

  // Approval system
  approved: boolean('approved').notNull().default(false),
  rejected: boolean('rejected').notNull().default(false), // Flag to mark explicitly rejected products
  deleted: boolean('deleted').notNull().default(false), // Soft delete flag
  isDraft: boolean('is_draft').notNull().default(false), // Flag to mark product as draft

  // Dimensions for shipping
  weight: decimal('weight', { precision: 10, scale: 3 }), // Product weight in kg
  length: decimal('length', { precision: 10, scale: 2 }), // Product length in cm
  width: decimal('width', { precision: 10, scale: 2 }), // Product width in cm
  height: decimal('height', { precision: 10, scale: 2 }), // Product height in cm

  // Additional product info
  warranty: integer('warranty'), // Warranty period in months
  returnPolicy: text('return_policy'), // Return policy details

  // Ratings and reviews
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  reviewCount: integer('review_count').default(0),

  // Delivery
  deliveryCharges: integer('delivery_charges').notNull().default(0), // Delivery charges for this product

  // Status
  isActive: boolean('is_active').default(true),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
