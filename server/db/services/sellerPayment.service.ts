import { db } from '@server/db/connect';
import { eq, desc, and, sql } from 'drizzle-orm';
import { sellerPayments } from '@server/db/schema';
import type { SellerPayment, NewSellerPayment } from '@server/db/schema';

/**
 * ==================== SELLER PAYMENT OPERATIONS ====================
 */

/**
 * Get all payment requests for a seller
 */
export async function getSellerPayments(
  sellerId: number,
  options?: { limit?: number; offset?: number; status?: string }
): Promise<SellerPayment[]> {
  const conditions = [eq(sellerPayments.sellerId, sellerId)];

  if (options?.status) {
    conditions.push(eq(sellerPayments.status, options.status));
  }

  let query = db
    .select()
    .from(sellerPayments)
    .where(and(...conditions))
    .orderBy(desc(sellerPayments.createdAt))
    .$dynamic();

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.offset(options.offset);
  }

  return await query;
}

/**
 * Get a single payment by ID
 */
export async function getSellerPayment(id: number): Promise<SellerPayment | undefined> {
  const result = await db.select().from(sellerPayments).where(eq(sellerPayments.id, id));
  return result[0];
}

/**
 * Create a payment request
 */
export async function createSellerPayment(data: NewSellerPayment): Promise<SellerPayment> {
  const [newPayment] = await db.insert(sellerPayments).values(data).returning();
  return newPayment;
}

/**
 * Update payment status
 */
export async function updateSellerPaymentStatus(
  id: number,
  status: string,
  data?: {
    paymentDate?: Date;
    referenceId?: string;
    paymentMethod?: string;
    notes?: string;
  }
): Promise<SellerPayment | undefined> {
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  if (status === 'completed' && !data?.paymentDate) {
    updateData.paymentDate = new Date();
  } else if (data?.paymentDate) {
    updateData.paymentDate = data.paymentDate;
  }

  if (data?.referenceId) {
    updateData.referenceId = data.referenceId;
  }
  if (data?.paymentMethod) {
    updateData.paymentMethod = data.paymentMethod;
  }
  if (data?.notes) {
    updateData.notes = data.notes;
  }

  const [updatedPayment] = await db
    .update(sellerPayments)
    .set(updateData)
    .where(eq(sellerPayments.id, id))
    .returning();

  return updatedPayment;
}

/**
 * Get payment summary for a seller (using SQL aggregation for better performance)
 */
export async function getSellerPaymentSummary(sellerId: number) {
  const stats = await db
    .select({
      totalPayments: sql<number>`count(*)::int`,
      totalAmount: sql<string>`coalesce(sum(${sellerPayments.amount}), 0)`,
      completedAmount: sql<string>`coalesce(sum(case when ${sellerPayments.status} = 'completed' then ${sellerPayments.amount} else 0 end), 0)`,
      pendingAmount: sql<string>`coalesce(sum(case when ${sellerPayments.status} = 'pending' then ${sellerPayments.amount} else 0 end), 0)`,
      processingAmount: sql<string>`coalesce(sum(case when ${sellerPayments.status} = 'processing' then ${sellerPayments.amount} else 0 end), 0)`,
      failedAmount: sql<string>`coalesce(sum(case when ${sellerPayments.status} = 'failed' then ${sellerPayments.amount} else 0 end), 0)`,
      pendingCount: sql<number>`count(case when ${sellerPayments.status} = 'pending' then 1 end)::int`,
      completedCount: sql<number>`count(case when ${sellerPayments.status} = 'completed' then 1 end)::int`,
      processingCount: sql<number>`count(case when ${sellerPayments.status} = 'processing' then 1 end)::int`,
      failedCount: sql<number>`count(case when ${sellerPayments.status} = 'failed' then 1 end)::int`,
    })
    .from(sellerPayments)
    .where(eq(sellerPayments.sellerId, sellerId));

  return stats[0];
}

/**
 * Get all seller withdrawals (admin view)
 */
export async function getAllSellerWithdrawals(options?: {
  limit?: number;
  offset?: number;
  status?: string;
  sellerId?: number;
}): Promise<SellerPayment[]> {
  const conditions = [];

  if (options?.status) {
    conditions.push(eq(sellerPayments.status, options.status));
  }
  if (options?.sellerId) {
    conditions.push(eq(sellerPayments.sellerId, options.sellerId));
  }

  let query = db.select().from(sellerPayments).orderBy(desc(sellerPayments.createdAt)).$dynamic();

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.offset(options.offset);
  }

  return await query;
}

export const sellerPaymentService = {
  getSellerPayments,
  getSellerPayment,
  createSellerPayment,
  updateSellerPaymentStatus,
  getSellerPaymentSummary,
  getAllSellerWithdrawals,
};
