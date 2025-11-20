import { db } from '../index';
import { users, deliveryPartnerApplications } from '../schema';
import { eq, desc, sql } from 'drizzle-orm';

/**
 * Get all delivery partners with pagination
 */
export async function getDeliveryPartners(limit?: number, offset?: number) {
  const data = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      contactNumber: users.contactNumber,
      isApproved: users.isApproved,
      rejected: users.rejected,
      rejectionReason: users.rejectionReason,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, 'deliveryPartner'))
    .orderBy(desc(users.createdAt))
    .limit(limit || 100)
    .offset(offset || 0);

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, 'deliveryPartner'));

  return {
    data,
    total: Number(totalResult[0]?.count || 0),
  };
}

/**
 * Get all delivery partner applications
 */
export async function getDeliveryPartnerApplications(status?: string) {
  let query = db
    .select({
      id: deliveryPartnerApplications.id,
      userId: deliveryPartnerApplications.userId,
      fullName: deliveryPartnerApplications.fullName,
      email: deliveryPartnerApplications.email,
      phone: deliveryPartnerApplications.phone,
      address: deliveryPartnerApplications.address,
      vehicleType: deliveryPartnerApplications.vehicleType,
      vehicleNumber: deliveryPartnerApplications.vehicleNumber,
      documentsSubmitted: deliveryPartnerApplications.documentsSubmitted,
      profileCompleted: deliveryPartnerApplications.profileCompleted,
      status: deliveryPartnerApplications.status,
      adminNotes: deliveryPartnerApplications.adminNotes,
      reviewedBy: deliveryPartnerApplications.reviewedBy,
      reviewedAt: deliveryPartnerApplications.reviewedAt,
      createdAt: deliveryPartnerApplications.createdAt,
      reviewedByName: users.name,
    })
    .from(deliveryPartnerApplications)
    .leftJoin(users, eq(deliveryPartnerApplications.reviewedBy, users.id))
    .orderBy(desc(deliveryPartnerApplications.createdAt))
    .$dynamic();

  if (status && status !== 'all') {
    query = query.where(eq(deliveryPartnerApplications.status, status));
  }

  return await query;
}

/**
 * Approve delivery partner application
 */
export async function approveDeliveryPartnerApplication(
  applicationId: number,
  adminId: number,
  adminNotes?: string
) {
  // Update application status
  const application = await db
    .update(deliveryPartnerApplications)
    .set({
      status: 'approved',
      adminNotes: adminNotes || null,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(deliveryPartnerApplications.id, applicationId))
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
 * Reject delivery partner application
 */
export async function rejectDeliveryPartnerApplication(
  applicationId: number,
  adminId: number,
  adminNotes?: string,
  rejectionReason?: string
) {
  // Update application status
  const application = await db
    .update(deliveryPartnerApplications)
    .set({
      status: 'rejected',
      adminNotes: adminNotes || null,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(deliveryPartnerApplications.id, applicationId))
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
 * Get delivery partner application statistics
 */
export async function getDeliveryPartnerApplicationStats() {
  const stats = await db
    .select({
      status: deliveryPartnerApplications.status,
      count: sql<number>`count(*)::int`,
    })
    .from(deliveryPartnerApplications)
    .groupBy(deliveryPartnerApplications.status);

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
 * Approve a delivery partner directly (bypass application)
 */
export async function approveDeliveryPartner(deliveryPartnerId: number) {
  const result = await db
    .update(users)
    .set({
      isApproved: true,
      rejected: false,
      rejectionReason: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, deliveryPartnerId))
    .returning();

  return result[0];
}

/**
 * Reject a delivery partner directly
 */
export async function rejectDeliveryPartner(deliveryPartnerId: number, rejectionReason?: string) {
  const result = await db
    .update(users)
    .set({
      isApproved: false,
      rejected: true,
      rejectionReason: rejectionReason || 'Rejected by admin',
      updatedAt: new Date(),
    })
    .where(eq(users.id, deliveryPartnerId))
    .returning();

  return result[0];
}
