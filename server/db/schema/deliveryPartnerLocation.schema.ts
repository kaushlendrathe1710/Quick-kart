import { pgTable, serial, integer, decimal, timestamp, index, text } from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { orders } from './order.schema';

/**
 * Delivery Partner Locations table
 * Tracks real-time location updates from delivery partners
 * Used for live tracking during order delivery
 */
export const deliveryPartnerLocations = pgTable(
  'delivery_partner_locations',
  {
    id: serial('id').primaryKey(),
    deliveryPartnerId: integer('delivery_partner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orderId: integer('order_id').references(() => orders.id, { onDelete: 'set null' }),

    // Geographic coordinates
    latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
    longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull(),

    // Additional tracking metadata
    accuracy: decimal('accuracy', { precision: 10, scale: 2 }), // in meters
    heading: decimal('heading', { precision: 5, scale: 2 }), // compass direction (0-360)
    speed: decimal('speed', { precision: 8, scale: 2 }), // in km/h

    // Timestamps
    recordedAt: timestamp('recorded_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    // Index for quick lookup by delivery partner
    partnerIdx: index('dp_location_partner_idx').on(table.deliveryPartnerId),
    // Index for order-based queries
    orderIdx: index('dp_location_order_idx').on(table.orderId),
    // Composite index for partner + time-based queries
    partnerTimeIdx: index('dp_location_partner_time_idx').on(
      table.deliveryPartnerId,
      table.recordedAt
    ),
    // Index for latest location queries
    recordedAtIdx: index('dp_location_recorded_at_idx').on(table.recordedAt),
  })
);

export type DeliveryPartnerLocation = typeof deliveryPartnerLocations.$inferSelect;
export type NewDeliveryPartnerLocation = typeof deliveryPartnerLocations.$inferInsert;
