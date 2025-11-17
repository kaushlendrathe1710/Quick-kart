import { db } from '../index';
import { orders, users, orderItems, products } from '../schema';
import { eq, sql, desc, and, or, like } from 'drizzle-orm';

/**
 * Get all orders (admin view)
 */
export async function getAllOrders(filters?: {
  orderStatus?: string;
  userId?: number;
  sellerId?: number;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  let query = db
    .select({
      id: orders.id,
      userId: orders.userId,
      userName: users.name,
      userEmail: users.email,
      totalAmount: orders.totalAmount,
      orderStatus: orders.orderStatus,
      paymentStatus: orders.paymentStatus,
      addressId: orders.addressId,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt))
    .$dynamic();

  const conditions = [];

  if (filters?.orderStatus) {
    conditions.push(sql`${orders.orderStatus} = ${filters.orderStatus}`);
  }

  if (filters?.userId) {
    conditions.push(eq(orders.userId, filters.userId));
  }

  if (filters?.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(
      or(
        like(users.name, searchTerm),
        like(users.email, searchTerm),
        sql`CAST(${orders.id} AS TEXT) LIKE ${searchTerm}`
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
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
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
 * Get order by ID with full details
 */
export async function getOrderById(orderId: number) {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          contactNumber: true,
        },
      },
    },
  });

  return order;
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: number, orderStatus: string) {
  const result = await db
    .update(orders)
    .set({
      orderStatus: orderStatus as any, // Cast to any since it's an enum
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
    .returning();

  return result[0];
}

/**
 * Get order statistics
 */
export async function getOrderStats() {
  try {
    const stats = await db
      .select({
        orderStatus: orders.orderStatus,
        count: sql<number>`count(*)::int`,
        totalAmount: sql<number>`sum(${orders.totalAmount})::int`,
      })
      .from(orders)
      .groupBy(orders.orderStatus);

    let totalOrders = 0;
    let totalRevenue = 0;
    const statusBreakdown: Record<string, { count: number; revenue: number }> = {};

    stats.forEach((stat) => {
      totalOrders += stat.count;
      totalRevenue += stat.totalAmount || 0;
      statusBreakdown[stat.orderStatus] = {
        count: stat.count,
        revenue: stat.totalAmount || 0,
      };
    });

    return {
      totalOrders,
      totalRevenue,
      statusBreakdown,
    };
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      statusBreakdown: {},
    };
  }
}
