import { db } from '../index';
import { users, products, orders } from '../schema';
import { eq, sql, desc, and, notInArray } from 'drizzle-orm';

/**
 * Get admin dashboard statistics
 */
export async function getDashboardStats() {
  try {
    // Get total users count
    const totalUsersResult = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get total products count (non-deleted)
    const totalProductsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.deleted, false));
    const totalProducts = totalProductsResult[0]?.count || 0;

    // Get total orders count
    const totalOrdersResult = await db.select({ count: sql<number>`count(*)::int` }).from(orders);
    const totalOrders = totalOrdersResult[0]?.count || 0;

    // Get total revenue (excluding cancelled, returned, refunded orders)
    const totalRevenueResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${orders.finalAmount}), 0)`,
      })
      .from(orders)
      .where(notInArray(orders.orderStatus, ['cancelled', 'refunded']));
    const totalRevenue = parseFloat(totalRevenueResult[0]?.total || '0');

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return empty stats instead of throwing to prevent dashboard failure
    return {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
    };
  }
}

/**
 * Get recent activity for admin dashboard
 */
export async function getRecentActivity() {
  try {
    const activities: Array<{
      id: string;
      type: string;
      description: string;
      amount?: string;
      status?: string;
      timestamp: Date;
    }> = [];

    // Get recent orders (last 5)
    const recentOrders = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        createdAt: orders.createdAt,
        orderStatus: orders.orderStatus,
        finalAmount: orders.finalAmount,
        userName: users.name,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt))
      .limit(5);

    recentOrders.forEach((order) => {
      activities.push({
        id: `order-${order.id}`,
        type: 'order',
        description: `New order #${order.id} placed by ${order.userName || 'Unknown User'}`,
        amount: order.finalAmount,
        status: order.orderStatus,
        timestamp: order.createdAt || new Date(),
      });
    });

    // Sort activities by timestamp (newest first)
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return activities;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

/**
 * Get product statistics
 */
export async function getProductStats() {
  try {
    // Get total products by status
    const productsByStatus = await db
      .select({
        deleted: products.deleted,
        count: sql<number>`count(*)::int`,
      })
      .from(products)
      .groupBy(products.deleted);

    const activeProducts = productsByStatus.find((p) => !p.deleted)?.count || 0;
    const deletedProducts = productsByStatus.find((p) => p.deleted)?.count || 0;

    // Get total products by seller
    const productsBySeller = await db
      .select({
        sellerId: products.sellerId,
        sellerName: users.name,
        count: sql<number>`count(*)::int`,
      })
      .from(products)
      .leftJoin(users, eq(products.sellerId, users.id))
      .where(eq(products.deleted, false))
      .groupBy(products.sellerId, users.name)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    // Get products by category
    const productsByCategory = await db
      .select({
        category: products.category,
        count: sql<number>`count(*)::int`,
      })
      .from(products)
      .where(eq(products.deleted, false))
      .groupBy(products.category)
      .orderBy(desc(sql`count(*)`));

    return {
      totalActive: activeProducts,
      totalDeleted: deletedProducts,
      totalProducts: activeProducts + deletedProducts,
      topSellers: productsBySeller,
      byCategory: productsByCategory,
    };
  } catch (error) {
    console.error('Error fetching product stats:', error);
    return {
      totalActive: 0,
      totalDeleted: 0,
      totalProducts: 0,
      topSellers: [],
      byCategory: [],
    };
  }
}
