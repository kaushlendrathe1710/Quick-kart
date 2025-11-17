import { pgTable, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

export const deliveryPartnerApplications = pgTable('delivery_partner_applications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),

  // Personal Information
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  address: text('address').notNull(),

  // Vehicle Information (from deliveryPartnerVehicle)
  vehicleType: varchar('vehicle_type', { length: 50 }), // bike, scooter, car, etc.
  vehicleNumber: varchar('vehicle_number', { length: 50 }),

  // Document Status Summary
  documentsSubmitted: text('documents_submitted'), // JSON array of submitted document types
  profileCompleted: text('profile_completed').notNull().default('false'), // "true" or "false"

  // Application Status
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, approved, rejected
  adminNotes: text('admin_notes'),
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type DeliveryPartnerApplication = typeof deliveryPartnerApplications.$inferSelect;
export type NewDeliveryPartnerApplication = typeof deliveryPartnerApplications.$inferInsert;
