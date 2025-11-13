import { pgTable, serial, integer, text, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { vehicleTypeEnum, fuelTypeEnum } from './enums';

/**
 * Delivery Partner Vehicle table
 * Stores vehicle information for delivery partners
 */
export const deliveryPartnerVehicles = pgTable(
  'delivery_partner_vehicles',
  {
    id: serial('id').primaryKey(),
    deliveryPartnerId: integer('delivery_partner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    vehicleType: vehicleTypeEnum('vehicle_type').notNull(),
    brand: varchar('brand', { length: 100 }).notNull(),
    model: varchar('model', { length: 100 }).notNull(),
    registrationNumber: varchar('registration_number', { length: 20 }).notNull().unique(),
    color: varchar('color', { length: 50 }),
    year: integer('year'),
    fuelType: fuelTypeEnum('fuel_type').notNull(),

    // Document URLs stored in S3
    insuranceCertificate: text('insurance_certificate'),
    pucCertificate: text('puc_certificate'), // Pollution Under Control Certificate

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    deliveryPartnerIdx: index('dp_vehicle_partner_idx').on(table.deliveryPartnerId),
    registrationIdx: index('dp_vehicle_reg_idx').on(table.registrationNumber),
  })
);

export type DeliveryPartnerVehicle = typeof deliveryPartnerVehicles.$inferSelect;
export type NewDeliveryPartnerVehicle = typeof deliveryPartnerVehicles.$inferInsert;
