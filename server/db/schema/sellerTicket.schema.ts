import { pgTable, serial, integer, text, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { sellerIssueTypeEnum, ticketStatusEnum } from './enums';

/**
 * Seller Tickets table
 * Support ticket system for sellers
 */
export const sellerTickets = pgTable(
  'seller_tickets',
  {
    id: serial('id').primaryKey(),
    sellerId: integer('seller_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    issueType: sellerIssueTypeEnum('issue_type').notNull(),
    subject: text('subject').notNull(),
    description: text('description').notNull(),
    status: ticketStatusEnum('status').notNull().default('open'),

    // Admin response
    adminResponse: text('admin_response'),
    adminId: integer('admin_id').references(() => users.id, { onDelete: 'set null' }),

    // Resolution
    resolvedAt: timestamp('resolved_at'),
    closedAt: timestamp('closed_at'),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    sellerIdx: index('seller_ticket_seller_idx').on(table.sellerId),
    statusIdx: index('seller_ticket_status_idx').on(table.status),
    issueTypeIdx: index('seller_ticket_issue_type_idx').on(table.issueType),
    createdAtIdx: index('seller_ticket_created_at_idx').on(table.createdAt),
  })
);

export type SellerTicket = typeof sellerTickets.$inferSelect;
export type NewSellerTicket = typeof sellerTickets.$inferInsert;
