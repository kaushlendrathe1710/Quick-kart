import { pgTable, serial, integer, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

/**
 * Seller Settings Schema
 * Stores seller-specific configuration and settings
 */
export const sellerSettings = pgTable('seller_settings', {
  id: serial('id').primaryKey(),
  sellerId: integer('seller_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),

  // Pickup address for shipping (JSON format)
  pickupAddress: jsonb('pickup_address'),

  // Tax settings
  taxEnabled: boolean('tax_enabled').default(true),
  defaultTaxRate: text('default_tax_rate'), // Percentage as string

  // Notification preferences
  emailNotifications: boolean('email_notifications').default(true),
  orderNotifications: boolean('order_notifications').default(true),
  lowStockAlerts: boolean('low_stock_alerts').default(true),

  // Store settings
  storeDescription: text('store_description'),
  storeLogo: text('store_logo'), // URL to logo
  storeBanner: text('store_banner'), // URL to banner

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type SellerSettings = typeof sellerSettings.$inferSelect;
export type InsertSellerSettings = typeof sellerSettings.$inferInsert;
