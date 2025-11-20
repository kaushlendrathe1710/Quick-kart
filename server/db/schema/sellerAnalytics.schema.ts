import { pgTable, serial, integer, decimal, date, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

/**
 * Seller Analytics Schema
 * Stores aggregated analytics data for sellers
 * This table is updated periodically by a background job
 */
export const sellerAnalytics = pgTable('seller_analytics', {
  id: serial('id').primaryKey(),
  sellerId: integer('seller_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Date for the analytics record
  date: date('date').notNull(),
  period: varchar('period', { length: 20 }).notNull(), // 'daily', 'weekly', 'monthly'

  // Sales metrics
  totalRevenue: decimal('total_revenue', { precision: 12, scale: 2 }).default('0'),
  totalOrders: integer('total_orders').default(0),
  completedOrders: integer('completed_orders').default(0),
  cancelledOrders: integer('cancelled_orders').default(0),
  avgOrderValue: decimal('avg_order_value', { precision: 10, scale: 2 }).default('0'),

  // Product metrics
  totalProducts: integer('total_products').default(0),
  activeProducts: integer('active_products').default(0),
  outOfStockProducts: integer('out_of_stock_products').default(0),

  // Customer metrics
  uniqueCustomers: integer('unique_customers').default(0),
  returningCustomers: integer('returning_customers').default(0),

  // Return/refund metrics
  totalReturns: integer('total_returns').default(0),
  totalRefunds: decimal('total_refunds', { precision: 10, scale: 2 }).default('0'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type SellerAnalytics = typeof sellerAnalytics.$inferSelect;
export type InsertSellerAnalytics = typeof sellerAnalytics.$inferInsert;
