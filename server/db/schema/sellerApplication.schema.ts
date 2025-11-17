import { pgTable, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

export const sellerApplications = pgTable('seller_applications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),

  // Business Information
  businessName: varchar('business_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  businessAddress: text('business_address').notNull(),
  gstNumber: varchar('gst_number', { length: 15 }),
  panNumber: varchar('pan_number', { length: 10 }),

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

export type SellerApplication = typeof sellerApplications.$inferSelect;
export type NewSellerApplication = typeof sellerApplications.$inferInsert;
