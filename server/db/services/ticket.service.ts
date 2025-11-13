import { db } from '@server/db/connect';
import { eq, desc, and, or } from 'drizzle-orm';
import { tickets } from '@server/db/schema';
import type { Ticket, NewTicket } from '@server/db/schema';

/**
 * Get ticket by ID
 */
export async function getTicketById(id: number): Promise<Ticket | undefined> {
  const result = await db.select().from(tickets).where(eq(tickets.id, id));
  return result[0];
}

/**
 * Get tickets by delivery partner ID
 */
export async function getTicketsByPartnerId(
  deliveryPartnerId: number,
  options?: { limit?: number; offset?: number; status?: string }
): Promise<Ticket[]> {
  const conditions = [eq(tickets.deliveryPartnerId, deliveryPartnerId)];

  if (options?.status) {
    conditions.push(eq(tickets.status, options.status as any));
  }

  const query = db
    .select()
    .from(tickets)
    .where(and(...conditions))
    .orderBy(desc(tickets.createdAt))
    .$dynamic();

  if (options?.limit) {
    query.limit(options.limit);
  }
  if (options?.offset) {
    query.offset(options.offset);
  }

  return await query;
}

/**
 * Get all tickets (admin view)
 */
export async function getAllTickets(options?: {
  limit?: number;
  offset?: number;
  status?: string;
  issueType?: string;
}): Promise<Ticket[]> {
  // Build conditions
  const conditions = [];
  if (options?.status) {
    conditions.push(eq(tickets.status, options.status as any));
  }
  if (options?.issueType) {
    conditions.push(eq(tickets.issueType, options.issueType as any));
  }

  const queryBuilder = db.select().from(tickets).orderBy(desc(tickets.createdAt)).$dynamic();

  if (conditions.length > 0) {
    queryBuilder.where(and(...conditions));
  }

  if (options?.limit) {
    queryBuilder.limit(options.limit);
  }
  if (options?.offset) {
    queryBuilder.offset(options.offset);
  }

  return await queryBuilder;
}

/**
 * Get open tickets
 */
export async function getOpenTickets(options?: {
  limit?: number;
  offset?: number;
}): Promise<Ticket[]> {
  const query = db
    .select()
    .from(tickets)
    .where(or(eq(tickets.status, 'open'), eq(tickets.status, 'in_progress')))
    .orderBy(desc(tickets.createdAt));

  if (options?.limit) {
    query.limit(options.limit);
  }
  if (options?.offset) {
    query.offset(options.offset);
  }

  return await query;
}

/**
 * Create ticket
 */
export async function createTicket(data: NewTicket): Promise<Ticket> {
  const [newTicket] = await db.insert(tickets).values(data).returning();
  return newTicket;
}

/**
 * Update ticket
 */
export async function updateTicket(
  id: number,
  data: Partial<Omit<NewTicket, 'deliveryPartnerId' | 'issueType'>>
): Promise<Ticket | undefined> {
  const updateData: any = {
    ...data,
    updatedAt: new Date(),
  };

  // Set resolved/closed timestamps
  if (data.status === 'resolved' && !updateData.resolvedAt) {
    updateData.resolvedAt = new Date();
  } else if (data.status === 'closed' && !updateData.closedAt) {
    updateData.closedAt = new Date();
  }

  const [updatedTicket] = await db
    .update(tickets)
    .set(updateData)
    .where(eq(tickets.id, id))
    .returning();
  return updatedTicket;
}

/**
 * Add admin response to ticket
 */
export async function addAdminResponse(
  id: number,
  adminId: number,
  adminResponse: string,
  status?: string
): Promise<Ticket | undefined> {
  const updateData: any = {
    adminResponse,
    adminId,
    status: status || 'in_progress',
    updatedAt: new Date(),
  };

  const [updatedTicket] = await db
    .update(tickets)
    .set(updateData)
    .where(eq(tickets.id, id))
    .returning();
  return updatedTicket;
}

/**
 * Resolve ticket
 */
export async function resolveTicket(
  id: number,
  adminResponse?: string
): Promise<Ticket | undefined> {
  const updateData: any = {
    status: 'resolved',
    resolvedAt: new Date(),
    updatedAt: new Date(),
  };

  if (adminResponse) {
    updateData.adminResponse = adminResponse;
  }

  const [resolvedTicket] = await db
    .update(tickets)
    .set(updateData)
    .where(eq(tickets.id, id))
    .returning();
  return resolvedTicket;
}

/**
 * Close ticket
 */
export async function closeTicket(id: number): Promise<Ticket | undefined> {
  const [closedTicket] = await db
    .update(tickets)
    .set({
      status: 'closed',
      closedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, id))
    .returning();
  return closedTicket;
}

/**
 * Delete ticket
 */
export async function deleteTicket(id: number): Promise<boolean> {
  const result = await db.delete(tickets).where(eq(tickets.id, id)).returning();
  return result.length > 0;
}

export const ticketService = {
  getTicketById,
  getTicketsByPartnerId,
  getAllTickets,
  getOpenTickets,
  createTicket,
  updateTicket,
  addAdminResponse,
  resolveTicket,
  closeTicket,
  deleteTicket,
};
