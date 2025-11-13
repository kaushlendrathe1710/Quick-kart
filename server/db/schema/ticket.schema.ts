import { pgTable, serial, integer, text, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './user.schema';
import { issueTypeEnum, ticketStatusEnum } from './enums';

/**
 * Tickets table
 * Support ticket system for delivery partners
 */
export const tickets = pgTable(
  'tickets',
  {
    id: serial('id').primaryKey(),
    deliveryPartnerId: integer('delivery_partner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    issueType: issueTypeEnum('issue_type').notNull(),
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
    partnerIdx: index('ticket_partner_idx').on(table.deliveryPartnerId),
    statusIdx: index('ticket_status_idx').on(table.status),
    issueTypeIdx: index('ticket_issue_type_idx').on(table.issueType),
    createdAtIdx: index('ticket_created_at_idx').on(table.createdAt),
  })
);

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
