import { userRole } from '@shared/constants';
import {
  pgTable,
  text,
  serial,
  boolean,
  timestamp,
  varchar,
  json,
  index,
  pgEnum,
  integer,
} from 'drizzle-orm/pg-core';

const userRoles = Object.values(userRole) as [string, ...string[]];

export const userRoleEnum = pgEnum('user_role', userRoles);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  contactNumber: varchar('contact_number', { length: 15 }),
  avatar: text('avatar'),
  isApproved: boolean('is_approved').default(false),
  role: userRoleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * User Payment Methods table
 * Stores payment information for regular users
 */
export const userPaymentMethods = pgTable('user_payment_methods', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  paymentType: varchar('payment_type', { length: 20 }).notNull(), // 'credit_card' | 'upi'
  // Credit Card fields
  cardHolderName: text('card_holder_name'),
  cardNumber: varchar('card_number', { length: 19 }), // Encrypted
  expiryMonth: varchar('expiry_month', { length: 2 }),
  expiryYear: varchar('expiry_year', { length: 4 }),
  // UPI fields
  upiId: varchar('upi_id', { length: 100 }),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Seller Information table
 * Stores business and payment details for sellers
 */
export const sellerInfo = pgTable('seller_info', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  businessName: text('business_name'),
  businessAddress: text('business_address'),
  gstNumber: varchar('gst_number', { length: 15 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Delivery Partner Documents table
 * Stores uploaded documents for delivery partners
 */
export const deliveryPartnerDocuments = pgTable('delivery_partner_documents', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  aadharCard: text('aadhar_card'), // Image URL
  panCard: text('pan_card'), // Image URL
  drivingLicense: text('driving_license'), // Image URL
  vehicleRegistration: text('vehicle_registration'), // Image URL
  insurance: text('insurance'), // Image URL
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Delivery Partner Vehicle Info table
 * Stores vehicle details for delivery partners
 */
export const deliveryPartnerVehicleInfo = pgTable('delivery_partner_vehicle_info', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  vehicleType: varchar('vehicle_type', { length: 50 }),
  brand: varchar('brand', { length: 50 }),
  model: varchar('model', { length: 50 }),
  registrationNumber: varchar('registration_number', { length: 20 }),
  color: varchar('color', { length: 30 }),
  year: integer('year'),
  fuel: varchar('fuel', { length: 20 }), // 'petrol' | 'diesel' | 'electric' | 'cng'
  insuranceExpiry: timestamp('insurance_expiry'),
  pucCertificateExpiry: timestamp('puc_certificate_expiry'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Delivery Partner Payment Info table
 * Stores bank account details for delivery partners
 */
export const deliveryPartnerPaymentInfo = pgTable('delivery_partner_payment_info', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  accountHolderName: text('account_holder_name'),
  accountNumber: varchar('account_number', { length: 20 }),
  ifscCode: varchar('ifsc_code', { length: 11 }),
  bankName: text('bank_name'),
  branchName: text('branch_name'),
  accountType: varchar('account_type', { length: 20 }), // 'savings' | 'current'
  upiId: varchar('upi_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type UserPaymentMethod = typeof userPaymentMethods.$inferSelect;
export type InsertUserPaymentMethod = typeof userPaymentMethods.$inferInsert;
export type SellerInfo = typeof sellerInfo.$inferSelect;
export type InsertSellerInfo = typeof sellerInfo.$inferInsert;
export type DeliveryPartnerDocuments = typeof deliveryPartnerDocuments.$inferSelect;
export type InsertDeliveryPartnerDocuments = typeof deliveryPartnerDocuments.$inferInsert;
export type DeliveryPartnerVehicleInfo = typeof deliveryPartnerVehicleInfo.$inferSelect;
export type InsertDeliveryPartnerVehicleInfo = typeof deliveryPartnerVehicleInfo.$inferInsert;
export type DeliveryPartnerPaymentInfo = typeof deliveryPartnerPaymentInfo.$inferSelect;
export type InsertDeliveryPartnerPaymentInfo = typeof deliveryPartnerPaymentInfo.$inferInsert;

// this is not used explicitly in the current codebase, but used via express-session
export const session = pgTable(
  'session',
  {
    sid: varchar('sid').primaryKey(), // character varying NOT NULL
    sess: json('sess').notNull(), // json NOT NULL
    expire: timestamp('expire', { precision: 6 }).notNull(), // timestamp without time zone NOT NULL
  },
  (table) => {
    return {
      expireIndex: index('IDX_session_expire').on(table.expire),
    };
  }
);
