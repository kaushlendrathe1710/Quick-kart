import { pgTable, serial, integer, smallint, text, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { deliveries } from './delivery.schema';

/**
 * Delivery Ratings table
 * Stores ratings and feedback for delivery partners
 */
export const deliveryRatings = pgTable(
  'delivery_ratings',
  {
    id: serial('id').primaryKey(),
    deliveryId: integer('delivery_id')
      .notNull()
      .references(() => deliveries.id, { onDelete: 'cascade' })
      .unique(),
    deliveryPartnerId: integer('delivery_partner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    buyerId: integer('buyer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    rating: smallint('rating').notNull(), // 1-5
    feedback: text('feedback'),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    deliveryIdx: index('delivery_rating_delivery_idx').on(table.deliveryId),
    partnerIdx: index('delivery_rating_partner_idx').on(table.deliveryPartnerId),
    buyerIdx: index('delivery_rating_buyer_idx').on(table.buyerId),
  })
);

export type DeliveryRating = typeof deliveryRatings.$inferSelect;
export type NewDeliveryRating = typeof deliveryRatings.$inferInsert;
