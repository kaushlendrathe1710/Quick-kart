import { db } from '../index';
import { users } from '../schema';
import { eq, sql, desc, or, like, and } from 'drizzle-orm';

/**
 * Get all users (admin view)
 */
export async function getAllUsers(filters?: {
  role?: string;
  isApproved?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  let query = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      contactNumber: users.contactNumber,
      role: users.role,
      isApproved: users.isApproved,
      avatar: users.avatar,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .$dynamic();

  const conditions = [];

  if (filters?.role) {
    conditions.push(eq(users.role, filters.role));
  }

  if (filters?.isApproved !== undefined) {
    conditions.push(eq(users.isApproved, filters.isApproved));
  }

  if (filters?.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(
      or(
        like(users.name, searchTerm),
        like(users.email, searchTerm),
        like(users.contactNumber, searchTerm)
      )!
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  const data = await query;

  // Get total count with same conditions
  let countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .$dynamic();

  if (conditions.length > 0) {
    countQuery = countQuery.where(and(...conditions));
  }

  const totalResult = await countQuery;

  return {
    data,
    total: Number(totalResult[0]?.count || 0),
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return user;
}

/**
 * Update user role
 */
export async function updateUserRole(userId: number, role: string) {
  const result = await db
    .update(users)
    .set({
      role,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return result[0];
}

/**
 * Soft delete user (not supported in current schema - instead mark as rejected)
 */
export async function softDeleteUser(userId: number) {
  const result = await db
    .update(users)
    .set({
      rejected: true,
      rejectionReason: 'Account disabled by admin',
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return result[0];
}

/**
 * Recover deleted user (clear rejection status)
 */
export async function recoverUser(userId: number) {
  const result = await db
    .update(users)
    .set({
      rejected: false,
      rejectionReason: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return result[0];
}

/**
 * Get user statistics
 */
export async function getUserStats() {
  try {
    const stats = await db
      .select({
        role: users.role,
        isApproved: users.isApproved,
        rejected: users.rejected,
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .groupBy(users.role, users.isApproved, users.rejected);

    let totalUsers = 0;
    let activeUsers = 0;
    let rejectedUsers = 0;
    let pendingApproval = 0;
    const roleBreakdown: Record<string, number> = {};

    stats.forEach((stat) => {
      const count = stat.count;
      totalUsers += count;

      if (stat.rejected) {
        rejectedUsers += count;
      } else {
        activeUsers += count;
        if (!stat.isApproved && (stat.role === 'seller' || stat.role === 'deliveryPartner')) {
          pendingApproval += count;
        }
      }

      roleBreakdown[stat.role] = (roleBreakdown[stat.role] || 0) + count;
    });

    return {
      totalUsers,
      activeUsers,
      rejectedUsers,
      pendingApproval,
      roleBreakdown,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      rejectedUsers: 0,
      pendingApproval: 0,
      roleBreakdown: {},
    };
  }
}
