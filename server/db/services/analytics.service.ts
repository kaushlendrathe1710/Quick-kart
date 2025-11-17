import { db } from '../connect';
import { sellerAnalytics, orders, orderItems, products } from '../schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

/**
 * Analytics Service
 * Provides data aggregation and analytics for sellers
 */
export const analyticsService = {
  /**
   * Get analytics for a seller within a date range
   */
  async getSellerAnalytics(
    sellerId: number,
    startDate: Date,
    endDate: Date,
    period: 'daily' | 'weekly' | 'monthly' = 'daily'
  ) {
    return db.query.sellerAnalytics.findMany({
      where: and(
        eq(sellerAnalytics.sellerId, sellerId),
        gte(sellerAnalytics.date, startDate.toISOString().split('T')[0]),
        lte(sellerAnalytics.date, endDate.toISOString().split('T')[0]),
        eq(sellerAnalytics.period, period)
      ),
      orderBy: (sellerAnalytics, { asc }) => [asc(sellerAnalytics.date)],
    });
  },

  /**
   * Get latest analytics record for a seller
   */
  async getLatestAnalytics(sellerId: number, period: 'daily' | 'weekly' | 'monthly' = 'daily') {
    return db.query.sellerAnalytics.findFirst({
      where: and(eq(sellerAnalytics.sellerId, sellerId), eq(sellerAnalytics.period, period)),
      orderBy: (sellerAnalytics, { desc }) => [desc(sellerAnalytics.date)],
    });
  },

  /**
   * Create or update analytics record
   */
  async upsertAnalytics(data: {
    sellerId: number;
    date: Date;
    period: 'daily' | 'weekly' | 'monthly';
    totalRevenue: string;
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    avgOrderValue: string;
    totalProducts: number;
    activeProducts: number;
    outOfStockProducts: number;
    uniqueCustomers: number;
    returningCustomers: number;
    totalReturns: number;
    totalRefunds: string;
  }) {
    const dateStr = data.date.toISOString().split('T')[0];

    // Check if record exists
    const existing = await db.query.sellerAnalytics.findFirst({
      where: and(
        eq(sellerAnalytics.sellerId, data.sellerId),
        eq(sellerAnalytics.date, dateStr),
        eq(sellerAnalytics.period, data.period)
      ),
    });

    if (existing) {
      // Update existing
      const [updated] = await db
        .update(sellerAnalytics)
        .set({
          ...data,
          date: dateStr,
          updatedAt: new Date(),
        })
        .where(eq(sellerAnalytics.id, existing.id))
        .returning();
      return updated;
    }

    // Insert new
    const [created] = await db
      .insert(sellerAnalytics)
      .values({
        ...data,
        date: dateStr,
      })
      .returning();
    return created;
  },

  /**
   * Calculate real-time analytics for a seller
   * This is used when analytics records don't exist or need refresh
   */
  async calculateLiveAnalytics(sellerId: number, startDate: Date, endDate: Date) {
    // Get all orders for the seller in the date range
    const sellerOrders = await db.query.orders.findMany({
      where: and(
        eq(orders.sellerId, sellerId),
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate)
      ),
      with: {
        orderItems: {
          where: eq(orderItems.sellerId, sellerId),
        },
      },
    });

    // Calculate metrics
    const totalOrders = sellerOrders.length;
    const completedOrders = sellerOrders.filter((o) => o.orderStatus === 'delivered').length;
    const cancelledOrders = sellerOrders.filter((o) => o.orderStatus === 'cancelled').length;

    const totalRevenue = sellerOrders
      .filter((o) => o.orderStatus === 'delivered')
      .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get unique customer count
    const uniqueCustomerIds = new Set(sellerOrders.map((o) => o.userId));
    const uniqueCustomers = uniqueCustomerIds.size;

    // Get product stats
    const sellerProducts = await db.query.products.findMany({
      where: eq(products.sellerId, sellerId),
    });

    const totalProducts = sellerProducts.length;
    const activeProducts = sellerProducts.filter((p) => p.stock > 0).length;
    const outOfStockProducts = sellerProducts.filter((p) => p.stock === 0).length;

    // Count returning customers (customers with more than 1 order)
    const customerOrderCounts = new Map<number, number>();
    sellerOrders.forEach((order) => {
      customerOrderCounts.set(order.userId, (customerOrderCounts.get(order.userId) || 0) + 1);
    });
    const returningCustomers = Array.from(customerOrderCounts.values()).filter(
      (count) => count > 1
    ).length;

    // Returns and refunds (based on order status)
    // Note: 'refunded' status indicates both returns and refunds
    const totalReturns = sellerOrders.filter((o) => o.orderStatus === 'refunded').length;
    const totalRefunds = sellerOrders
      .filter((o) => o.orderStatus === 'refunded')
      .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

    return {
      totalRevenue: totalRevenue.toFixed(2),
      totalOrders,
      completedOrders,
      cancelledOrders,
      avgOrderValue: avgOrderValue.toFixed(2),
      totalProducts,
      activeProducts,
      outOfStockProducts,
      uniqueCustomers,
      returningCustomers,
      totalReturns,
      totalRefunds: totalRefunds.toFixed(2),
    };
  },

  /**
   * Get dashboard summary for seller
   */
  async getDashboardSummary(sellerId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's analytics
    const todayAnalytics = await this.getLatestAnalytics(sellerId, 'daily');

    // Get live data for today
    const liveData = await this.calculateLiveAnalytics(sellerId, today, tomorrow);

    // Get last 7 days for trends
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const weeklyData = await this.getSellerAnalytics(sellerId, last7Days, today, 'daily');

    // Calculate trends
    const weeklyRevenue = weeklyData.reduce((sum, day) => {
      return sum + parseFloat(day.totalRevenue || '0');
    }, 0);
    const weeklyOrders = weeklyData.reduce((sum, day) => {
      return sum + (day.totalOrders || 0);
    }, 0);

    return {
      today: liveData,
      stored: todayAnalytics,
      weekly: {
        revenue: weeklyRevenue.toFixed(2),
        orders: weeklyOrders,
        data: weeklyData,
      },
    };
  },

  /**
   * Generate analytics for a specific date range
   * This is typically run by a cron job
   */
  async generateAnalytics(sellerId: number, date: Date, period: 'daily' | 'weekly' | 'monthly') {
    let startDate = new Date(date);
    let endDate = new Date(date);

    // Set date range based on period
    if (period === 'daily') {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'weekly') {
      // Start from Monday
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'monthly') {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(startDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
    }

    // Calculate analytics
    const analytics = await this.calculateLiveAnalytics(sellerId, startDate, endDate);

    // Upsert record
    return this.upsertAnalytics({
      sellerId,
      date: startDate,
      period,
      ...analytics,
    });
  },
};
