import { pgTable, serial, integer, text, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { accountTypeEnum } from './enums';

/**
 * Delivery Partner Bank Details table
 * Stores bank account information for payment settlements
 */
export const deliveryPartnerBankDetails = pgTable(
  'delivery_partner_bank_details',
  {
    id: serial('id').primaryKey(),
    deliveryPartnerId: integer('delivery_partner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    accountHolderName: varchar('account_holder_name', { length: 200 }).notNull(),
    accountNumber: varchar('account_number', { length: 30 }).notNull(),
    ifscCode: varchar('ifsc_code', { length: 11 }).notNull(),
    bankName: varchar('bank_name', { length: 200 }).notNull(),
    branchName: varchar('branch_name', { length: 200 }),
    accountType: accountTypeEnum('account_type').notNull().default('savings'),
    upiId: varchar('upi_id', { length: 100 }),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    deliveryPartnerIdx: index('dp_bank_partner_idx').on(table.deliveryPartnerId),
  })
);

export type DeliveryPartnerBankDetail = typeof deliveryPartnerBankDetails.$inferSelect;
export type NewDeliveryPartnerBankDetail = typeof deliveryPartnerBankDetails.$inferInsert;
