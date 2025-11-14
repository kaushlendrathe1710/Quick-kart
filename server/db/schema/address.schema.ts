import {
  pgTable,
  text,
  decimal,
  serial,
  timestamp,
  varchar,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { users } from './user.schema';

/**
 * Addresses table
 * Stores user addresses for delivery
 * addressType is flexible string (home, office, work, school, college, etc.)
 */
export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  addressType: varchar('address_type', { length: 50 }).notNull(),
  addressLine: text('address_line').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }).notNull(),
  country: varchar('country', { length: 100 }).notNull().default('India'),
  landmark: text('landmark'),
  contactNumber: varchar('contact_number', { length: 15 }),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
