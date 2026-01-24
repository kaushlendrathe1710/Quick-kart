import { db } from '@server/db/connect';
import { eq, desc, and, or } from 'drizzle-orm';
import { sellerTickets } from '@server/db/schema';
import type { SellerTicket, NewSellerTicket } from '@server/db/schema';

/**
 * Get seller ticket by ID
 */
export async function getSellerTicketById(id: number): Promise<SellerTicket | undefined> {
  const result = await db.select().from(sellerTickets).where(eq(sellerTickets.id, id));
  return result[0];
}

/**
 * Get tickets by seller ID
 */
export async function getTicketsBySellerId(
  sellerId: number,
  options?: { limit?: number; offset?: number; status?: string }
): Promise<SellerTicket[]> {
  const conditions = [eq(sellerTickets.sellerId, sellerId)];

  if (options?.status) {
    conditions.push(eq(sellerTickets.status, options.status as any));
  }

  const query = db
    .select()
    .from(sellerTickets)
    .where(and(...conditions))
    .orderBy(desc(sellerTickets.createdAt))
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
 * Get all seller tickets (admin view)
 */
export async function getAllSellerTickets(options?: {
  limit?: number;
  offset?: number;
  status?: string;
  issueType?: string;
}): Promise<SellerTicket[]> {
  // Build conditions
  const conditions = [];
  if (options?.status) {
    conditions.push(eq(sellerTickets.status, options.status as any));
  }
  if (options?.issueType) {
    conditions.push(eq(sellerTickets.issueType, options.issueType as any));
  }

  const queryBuilder = db
    .select()
    .from(sellerTickets)
    .orderBy(desc(sellerTickets.createdAt))
    .$dynamic();

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
 * Get open seller tickets
 */
export async function getOpenSellerTickets(options?: {
  limit?: number;
  offset?: number;
}): Promise<SellerTicket[]> {
  const query = db
    .select()
    .from(sellerTickets)
    .where(or(eq(sellerTickets.status, 'open'), eq(sellerTickets.status, 'in_progress')))
    .orderBy(desc(sellerTickets.createdAt));

  if (options?.limit) {
    query.limit(options.limit);
  }
  if (options?.offset) {
    query.offset(options.offset);
  }

  return await query;
}

/**
 * Create seller ticket
 */
export async function createSellerTicket(data: NewSellerTicket): Promise<SellerTicket> {
  const [newTicket] = await db.insert(sellerTickets).values(data).returning();
  return newTicket;
}

/**
 * Update seller ticket
 */
export async function updateSellerTicket(
  id: number,
  data: Partial<Omit<NewSellerTicket, 'sellerId' | 'issueType'>>
): Promise<SellerTicket | undefined> {
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
    .update(sellerTickets)
    .set(updateData)
    .where(eq(sellerTickets.id, id))
    .returning();
  return updatedTicket;
}

/**
 * Add admin response to seller ticket
 */
export async function addAdminResponseToSellerTicket(
  id: number,
  adminId: number,
  adminResponse: string,
  status?: string
): Promise<SellerTicket | undefined> {
  const updateData: any = {
    adminResponse,
    adminId,
    status: status || 'in_progress',
    updatedAt: new Date(),
  };

  const [updatedTicket] = await db
    .update(sellerTickets)
    .set(updateData)
    .where(eq(sellerTickets.id, id))
    .returning();
  return updatedTicket;
}

/**
 * Resolve seller ticket
 */
export async function resolveSellerTicket(
  id: number,
  adminResponse?: string
): Promise<SellerTicket | undefined> {
  const updateData: any = {
    status: 'resolved',
    resolvedAt: new Date(),
    updatedAt: new Date(),
  };

  if (adminResponse) {
    updateData.adminResponse = adminResponse;
  }

  const [resolvedTicket] = await db
    .update(sellerTickets)
    .set(updateData)
    .where(eq(sellerTickets.id, id))
    .returning();
  return resolvedTicket;
}

/**
 * Close seller ticket
 */
export async function closeSellerTicket(id: number): Promise<SellerTicket | undefined> {
  const [closedTicket] = await db
    .update(sellerTickets)
    .set({
      status: 'closed',
      closedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(sellerTickets.id, id))
    .returning();
  return closedTicket;
}

/**
 * Delete seller ticket
 */
export async function deleteSellerTicket(id: number): Promise<boolean> {
  const result = await db.delete(sellerTickets).where(eq(sellerTickets.id, id)).returning();
  return result.length > 0;
}

export const sellerTicketService = {
  getSellerTicketById,
  getTicketsBySellerId,
  getAllSellerTickets,
  getOpenSellerTickets,
  createSellerTicket,
  updateSellerTicket,
  addAdminResponseToSellerTicket,
  resolveSellerTicket,
  closeSellerTicket,
  deleteSellerTicket,
};
