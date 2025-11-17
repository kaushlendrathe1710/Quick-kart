import { pgTable, serial, integer, text, timestamp, decimal, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './user.schema';
import { orders } from './order.schema';
import { products } from './product.schema';
import { categories } from './category.schema';

// Rewards table - main points balance for each user
export const rewards = pgTable('rewards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  points: integer('points').notNull().default(0),
  lifetimePoints: integer('lifetime_points').notNull().default(0),
  lastUpdated: timestamp('last_updated').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Reward transactions - track all point movements
export const rewardTransactions = pgTable('reward_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'set null' }),
  productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
  points: integer('points').notNull(),
  type: text('type').notNull(), // earn, redeem, expire, bonus, referral, review, admin_adjustment
  description: text('description'),
  transactionDate: timestamp('transaction_date').defaultNow(),
  expiryDate: timestamp('expiry_date'),
  status: text('status').notNull().default('active'), // active, used, expired
  createdAt: timestamp('created_at').defaultNow(),
});

// Reward rules - admin-configurable rules for earning points
export const rewardRules = pgTable('reward_rules', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // purchase, signup, review, referral, birthday
  pointsAwarded: integer('points_awarded').notNull(),
  minimumOrderValue: integer('minimum_order_value'),
  percentageValue: decimal('percentage_value'), // For purchase-based rewards
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  validFrom: timestamp('valid_from'),
  validTo: timestamp('valid_to'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const rewardsRelations = relations(rewards, ({ one }) => ({
  user: one(users, {
    fields: [rewards.userId],
    references: [users.id],
  }),
}));

export const rewardTransactionsRelations = relations(rewardTransactions, ({ one }) => ({
  user: one(users, {
    fields: [rewardTransactions.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [rewardTransactions.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [rewardTransactions.productId],
    references: [products.id],
  }),
}));

export const rewardRulesRelations = relations(rewardRules, ({ one }) => ({
  category: one(categories, {
    fields: [rewardRules.categoryId],
    references: [categories.id],
  }),
}));

// Schemas
export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
  createdAt: true,
});

export const insertRewardTransactionSchema = createInsertSchema(rewardTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertRewardRuleSchema = createInsertSchema(rewardRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type RewardTransaction = typeof rewardTransactions.$inferSelect;
export type InsertRewardTransaction = z.infer<typeof insertRewardTransactionSchema>;
export type RewardRule = typeof rewardRules.$inferSelect;
export type InsertRewardRule = z.infer<typeof insertRewardRuleSchema>;
