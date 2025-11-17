import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './user.schema';
import { orders } from './order.schema';

// Gift cards table
export const giftCards = pgTable('gift_cards', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  initialValue: integer('initial_value').notNull(),
  currentBalance: integer('current_balance').notNull(),
  issuedTo: integer('issued_to').references(() => users.id, { onDelete: 'set null' }),
  purchasedBy: integer('purchased_by').references(() => users.id, { onDelete: 'set null' }),
  isActive: boolean('is_active').notNull().default(true),
  expiryDate: timestamp('expiry_date'),
  createdAt: timestamp('created_at').defaultNow(),
  lastUsed: timestamp('last_used'),
  recipientEmail: text('recipient_email'),
  recipientName: text('recipient_name'),
  message: text('message'),
  designTemplate: text('design_template').default('default'),
});

// Gift card transactions table
export const giftCardTransactions = pgTable('gift_card_transactions', {
  id: serial('id').primaryKey(),
  giftCardId: integer('gift_card_id')
    .references(() => giftCards.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'set null' }),
  amount: integer('amount').notNull(),
  type: text('type').notNull(), // purchase, redemption, refund
  transactionDate: timestamp('transaction_date').defaultNow(),
  note: text('note'),
});

// Gift card templates for admin management
export const giftCardTemplates = pgTable('gift_card_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const giftCardsRelations = relations(giftCards, ({ one, many }) => ({
  issuedToUser: one(users, {
    fields: [giftCards.issuedTo],
    references: [users.id],
  }),
  purchasedByUser: one(users, {
    fields: [giftCards.purchasedBy],
    references: [users.id],
  }),
  transactions: many(giftCardTransactions),
}));

export const giftCardTransactionsRelations = relations(giftCardTransactions, ({ one }) => ({
  giftCard: one(giftCards, {
    fields: [giftCardTransactions.giftCardId],
    references: [giftCards.id],
  }),
  user: one(users, {
    fields: [giftCardTransactions.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [giftCardTransactions.orderId],
    references: [orders.id],
  }),
}));

// Schemas
export const insertGiftCardSchema = createInsertSchema(giftCards).omit({
  id: true,
  createdAt: true,
});

export const insertGiftCardTransactionSchema = createInsertSchema(giftCardTransactions).omit({
  id: true,
});

export const insertGiftCardTemplateSchema = createInsertSchema(giftCardTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type GiftCard = typeof giftCards.$inferSelect;
export type InsertGiftCard = z.infer<typeof insertGiftCardSchema>;
export type GiftCardTransaction = typeof giftCardTransactions.$inferSelect;
export type InsertGiftCardTransaction = z.infer<typeof insertGiftCardTransactionSchema>;
export type GiftCardTemplate = typeof giftCardTemplates.$inferSelect;
export type InsertGiftCardTemplate = z.infer<typeof insertGiftCardTemplateSchema>;
