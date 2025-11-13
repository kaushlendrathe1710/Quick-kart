import { pgTable, serial, integer, text, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

/**
 * Delivery Partner Documents table
 * Stores KYC documents for delivery partners
 */
export const deliveryPartnerDocuments = pgTable(
  'delivery_partner_documents',
  {
    id: serial('id').primaryKey(),
    deliveryPartnerId: integer('delivery_partner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Document URLs stored in S3
    aadharCard: text('aadhar_card'), // Front and back combined or separate URLs
    panCard: text('pan_card'),
    drivingLicense: text('driving_license'),
    vehicleRegistration: text('vehicle_registration'),
    insuranceCertificate: text('insurance_certificate'),

    // Optional: Store document numbers for reference
    aadharNumber: text('aadhar_number'),
    panNumber: text('pan_number'),
    licenseNumber: text('license_number'),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    deliveryPartnerIdx: index('dp_documents_partner_idx').on(table.deliveryPartnerId),
  })
);

export type DeliveryPartnerDocument = typeof deliveryPartnerDocuments.$inferSelect;
export type NewDeliveryPartnerDocument = typeof deliveryPartnerDocuments.$inferInsert;
