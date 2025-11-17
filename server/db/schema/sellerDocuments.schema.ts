import { pgTable, serial, integer, text, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

export const documentTypeEnum = pgEnum('document_type', [
  'gst_certificate',
  'pan_card',
  'aadhaar',
  'bank_statement',
  'business_license',
  'cancelled_cheque',
  'address_proof',
  'other',
]);

/**
 * Seller Documents Schema
 * Stores uploaded documents for seller verification
 */
export const sellerDocuments = pgTable('seller_documents', {
  id: serial('id').primaryKey(),
  sellerId: integer('seller_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  documentType: documentTypeEnum('document_type').notNull(),
  documentName: varchar('document_name', { length: 255 }).notNull(),
  documentUrl: text('document_url').notNull(), // S3/storage URL
  fileSize: integer('file_size'), // in bytes
  mimeType: varchar('mime_type', { length: 100 }),

  // Metadata
  description: text('description'),

  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

export type SellerDocument = typeof sellerDocuments.$inferSelect;
export type InsertSellerDocument = typeof sellerDocuments.$inferInsert;
