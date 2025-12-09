import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  decimal,
  pgEnum,
  json,
} from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { addresses } from './address.schema';
import { products } from './product.schema';

/**
 * Order Status Enum
 */
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'refunded',
]);

/**
 * Payment Status Enum
 */
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
]);

/**
 * Orders table
 * Stores order information (placeholder for future implementation)
 */
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  sellerId: integer('seller_id').references(() => users.id), // Primary seller for the order
  addressId: integer('address_id')
    .notNull()
    .references(() => addresses.id),
  orderStatus: orderStatusEnum('order_status').notNull().default('pending'),
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0'),
  shippingCharges: decimal('shipping_charges', { precision: 10, scale: 2 }).default('0'), // This is the delivery fee paid to delivery partner
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0'),
  finalAmount: decimal('final_amount', { precision: 10, scale: 2 }).notNull(),

  // Razorpay payment details
  razorpayOrderId: text('razorpay_order_id'),
  razorpayPaymentId: text('razorpay_payment_id'),
  razorpaySignature: text('razorpay_signature'),
  paymentMethod: text('payment_method'), // 'card', 'upi', 'netbanking', 'wallet', etc.

  // Commission and earnings breakdown (calculated from finalAmount)
  platformCommission: decimal('platform_commission', { precision: 10, scale: 2 }).default('0'),
  sellerEarnings: decimal('seller_earnings', { precision: 10, scale: 2 }).default('0'),

  // Shipping information
  deliveryPartnerId: integer('delivery_partner_id').references(() => users.id),
  trackingNumber: text('tracking_number'),
  courierName: text('courier_name'),

  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Order Items table
 * Stores individual items in an order
 */
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  sellerId: integer('seller_id').references(() => users.id), // Track seller for each item
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0'),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0'),
  finalPrice: decimal('final_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
