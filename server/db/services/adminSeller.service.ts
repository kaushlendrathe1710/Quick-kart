import { db } from '../index';
import { users, sellerApplications, sellerWithdrawals } from '../schema';
import { eq, desc, and, sql } from 'drizzle-orm';

/**
 * Get all sellers
 */
export async function getSellers() {
  return await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      contactNumber: users.contactNumber,
      isApproved: users.isApproved,
      rejected: users.rejected,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, 'seller'))
    .orderBy(desc(users.createdAt));
}

/**
 * Approve a seller
 */
export async function approveSeller(sellerId: number) {
  const result = await db
    .update(users)
    .set({
      isApproved: true,
      rejected: false,
      updatedAt: new Date(),
    })
    .where(and(eq(users.id, sellerId), eq(users.role, 'seller')))
    .returning();

  return result[0];
}

/**
 * Reject a seller
 */
export async function rejectSeller(sellerId: number) {
  const result = await db
    .update(users)
    .set({
      isApproved: false,
      rejected: true,
      updatedAt: new Date(),
    })
    .where(and(eq(users.id, sellerId), eq(users.role, 'seller')))
    .returning();

  return result[0];
}

/**
 * Get all seller applications
 */
export async function getSellerApplications(status?: string) {
  let query = db
    .select({
      id: sellerApplications.id,
      businessName: sellerApplications.businessName,
      email: sellerApplications.email,
      phone: sellerApplications.phone,
      businessAddress: sellerApplications.businessAddress,
      gstNumber: sellerApplications.gstNumber,
      panNumber: sellerApplications.panNumber,
      status: sellerApplications.status,
      adminNotes: sellerApplications.adminNotes,
      reviewedBy: sellerApplications.reviewedBy,
      reviewedAt: sellerApplications.reviewedAt,
      createdAt: sellerApplications.createdAt,
      reviewedByName: users.name,
    })
    .from(sellerApplications)
    .leftJoin(users, eq(sellerApplications.reviewedBy, users.id))
    .orderBy(desc(sellerApplications.createdAt))
    .$dynamic();

  if (status && status !== 'all') {
    query = query.where(eq(sellerApplications.status, status));
  }

  return await query;
}

/**
 * Approve seller application
 */
export async function approveApplication(
  applicationId: number,
  adminId: number,
  adminNotes?: string
) {
  // Update application status
  const application = await db
    .update(sellerApplications)
    .set({
      status: 'approved',
      adminNotes: adminNotes || null,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(sellerApplications.id, applicationId))
    .returning();

  if (!application[0]) {
    throw new Error('Application not found');
  }

  const app = application[0];

  // Update user approval status
  const updatedUser = await db
    .update(users)
    .set({
      isApproved: true,
      rejected: false,
      rejectionReason: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, app.userId))
    .returning();

  return {
    application: app,
    user: updatedUser[0],
  };
}

/**
 * Reject seller application
 */
export async function rejectApplication(
  applicationId: number,
  adminId: number,
  adminNotes?: string,
  rejectionReason?: string
) {
  const application = await db
    .update(sellerApplications)
    .set({
      status: 'rejected',
      adminNotes: adminNotes || null,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(sellerApplications.id, applicationId))
    .returning();

  if (!application[0]) {
    throw new Error('Application not found');
  }

  const app = application[0];

  // Update user rejection status
  const updatedUser = await db
    .update(users)
    .set({
      isApproved: false,
      rejected: true,
      rejectionReason: rejectionReason || adminNotes || 'Application rejected',
      updatedAt: new Date(),
    })
    .where(eq(users.id, app.userId))
    .returning();

  return {
    application: app,
    user: updatedUser[0],
  };
}

/**
 * Get seller application statistics
 */
export async function getApplicationStats() {
  const stats = await db
    .select({
      status: sellerApplications.status,
      count: sql<number>`count(*)::int`,
    })
    .from(sellerApplications)
    .groupBy(sellerApplications.status);

  const result = {
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  };

  stats.forEach((stat) => {
    result[stat.status as keyof typeof result] = stat.count;
    result.total += stat.count;
  });

  return result;
}

/**
 * Get all seller withdrawals (admin view)
 */
export async function getSellerWithdrawalsForAdmin(filters?: {
  status?: string;
  sellerId?: number;
}) {
  let query = db
    .select({
      id: sellerWithdrawals.id,
      sellerId: sellerWithdrawals.sellerId,
      amount: sellerWithdrawals.amount,
      status: sellerWithdrawals.status,
      paymentMethod: sellerWithdrawals.paymentMethod,
      accountDetails: sellerWithdrawals.accountDetails,
      referenceId: sellerWithdrawals.referenceId,
      adminNotes: sellerWithdrawals.adminNotes,
      processedBy: sellerWithdrawals.processedBy,
      processedAt: sellerWithdrawals.processedAt,
      requestedAt: sellerWithdrawals.requestedAt,
      createdAt: sellerWithdrawals.createdAt,
      sellerName: users.name,
      sellerEmail: users.email,
      sellerContactNumber: users.contactNumber,
    })
    .from(sellerWithdrawals)
    .leftJoin(users, eq(sellerWithdrawals.sellerId, users.id))
    .orderBy(desc(sellerWithdrawals.requestedAt))
    .$dynamic();

  if (filters?.status && filters.status !== 'all') {
    query = query.where(eq(sellerWithdrawals.status, filters.status));
  }

  if (filters?.sellerId) {
    query = query.where(eq(sellerWithdrawals.sellerId, filters.sellerId));
  }

  return await query;
}

/**
 * Update withdrawal status
 */
export async function updateWithdrawalStatus(
  withdrawalId: number,
  status: string,
  adminId: number,
  adminNotes?: string,
  referenceId?: string
) {
  const result = await db
    .update(sellerWithdrawals)
    .set({
      status,
      adminNotes: adminNotes || null,
      referenceId: referenceId || null,
      processedBy: adminId,
      processedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(sellerWithdrawals.id, withdrawalId))
    .returning();

  if (!result[0]) {
    throw new Error('Withdrawal not found');
  }

  return result[0];
}

/**
 * Update withdrawal details
 */
export async function updateWithdrawal(
  withdrawalId: number,
  data: {
    amount?: string;
    paymentMethod?: string;
    accountDetails?: string;
    referenceId?: string;
    status?: string;
    adminNotes?: string;
  }
) {
  const result = await db
    .update(sellerWithdrawals)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(sellerWithdrawals.id, withdrawalId))
    .returning();

  if (!result[0]) {
    throw new Error('Withdrawal not found');
  }

  return result[0];
}
