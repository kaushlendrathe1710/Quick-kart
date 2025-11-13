import {
  pgTable,
  serial,
  integer,
  text,
  json,
  decimal,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { orders } from './order.schema';
import { deliveryStatusEnum } from './enums';

/**
 * Deliveries table
 * Tracks delivery assignments and their status
 */
export const deliveries = pgTable(
  'deliveries',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' })
      .unique(),
    deliveryPartnerId: integer('delivery_partner_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    // Location details stored as JSON {address, lat, lng, contactName, contactPhone}
    pickupLocation: json('pickup_location').notNull(),
    dropLocation: json('drop_location').notNull(),

    buyerId: integer('buyer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    status: deliveryStatusEnum('status').notNull().default('pending'),

    // Delivery timing
    assignedAt: timestamp('assigned_at'),
    pickedUpAt: timestamp('picked_up_at'),
    deliveredAt: timestamp('delivered_at'),

    // Ratings and tip
    ratingId: integer('rating_id'), // Will reference delivery_ratings
    tip: decimal('tip', { precision: 10, scale: 2 }).default('0.00'),

    // Delivery fee
    deliveryFee: decimal('delivery_fee', { precision: 10, scale: 2 }).notNull(),

    // Cancellation details
    cancellationReason: text('cancellation_reason'),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    orderIdx: index('delivery_order_idx').on(table.orderId),
    partnerIdx: index('delivery_partner_idx').on(table.deliveryPartnerId),
    buyerIdx: index('delivery_buyer_idx').on(table.buyerId),
    statusIdx: index('delivery_status_idx').on(table.status),
  })
);

export type Delivery = typeof deliveries.$inferSelect;
export type NewDelivery = typeof deliveries.$inferInsert;
