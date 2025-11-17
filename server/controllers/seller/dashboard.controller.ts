import { Response } from 'express';
import { AuthenticatedRequest } from '@server/types';
import { analyticsService } from '@server/db/services/analytics.service';
import { db } from '@server/db/connect';
import { orders, products } from '@server/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

/**
 * Seller Dashboard Controller
 * Handles seller dashboard data and overview
 */
export class SellerDashboardController {
  /**
   * Get seller dashboard overview
   * GET /api/seller/dashboard
   */
  static async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;

      // Get dashboard summary with analytics
      const summary = await analyticsService.getDashboardSummary(sellerId);

      // Get pending product approvals count
      const pendingProducts = await db.query.products.findMany({
        where: and(eq(products.sellerId, sellerId), eq(products.approved, false)),
      });

      // Get recent orders (last 5)
      const recentOrders = await db.query.orders.findMany({
        where: eq(orders.sellerId, sellerId),
        orderBy: [desc(orders.createdAt)],
        limit: 5,
        with: {
          user: {
            columns: {
              name: true,
              email: true,
            },
          },
          orderItems: {
            with: {
              product: {
                columns: {
                  name: true,
                  thumbnail: true,
                  imageUrls: true,
                },
              },
            },
          },
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: {
          analytics: summary,
          pendingProductsCount: pendingProducts.length,
          recentOrders,
        },
      });
    } catch (error) {
      console.error('Error getting seller dashboard:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard data',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get recent orders with pagination
   * GET /api/seller/dashboard/orders
   */
  static async getRecentOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const sellerOrders = await db.query.orders.findMany({
        where: eq(orders.sellerId, sellerId),
        orderBy: [desc(orders.createdAt)],
        limit,
        offset,
        with: {
          user: {
            columns: {
              name: true,
              email: true,
              contactNumber: true,
            },
          },
          address: true,
          orderItems: {
            where: eq(orders.sellerId, sellerId),
            with: {
              product: {
                columns: {
                  name: true,
                  thumbnail: true,
                  imageUrls: true,
                },
              },
            },
          },
        },
      });

      // Get total count for pagination
      const totalOrders = await db.query.orders.findMany({
        where: eq(orders.sellerId, sellerId),
      });

      return res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: {
          orders: sellerOrders,
          pagination: {
            page,
            limit,
            total: totalOrders.length,
            totalPages: Math.ceil(totalOrders.length / limit),
          },
        },
      });
    } catch (error) {
      console.error('Error getting seller orders:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve orders',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get top performing products
   * GET /api/seller/dashboard/top-products
   */
  static async getTopProducts(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 5;

      // Get products with order count
      const sellerProducts = await db.query.products.findMany({
        where: eq(products.sellerId, sellerId),
        with: {
          orderItems: true,
        },
      });

      // Calculate sales for each product
      const productsWithSales = sellerProducts
        .map((product) => ({
          id: product.id,
          name: product.name,
          thumbnail: product.thumbnail,
          imageUrls: product.imageUrls,
          price: product.price,
          stock: product.stock,
          totalSold: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
          revenue: product.orderItems.reduce(
            (sum, item) => sum + item.quantity * parseFloat(item.price),
            0
          ),
        }))
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, limit);

      return res.status(200).json({
        success: true,
        message: 'Top products retrieved successfully',
        data: productsWithSales,
      });
    } catch (error) {
      console.error('Error getting top products:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve top products',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get low stock alerts
   * GET /api/seller/dashboard/low-stock
   */
  static async getLowStockProducts(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const threshold = parseInt(req.query.threshold as string) || 10;

      const lowStockProducts = await db.query.products.findMany({
        where: and(eq(products.sellerId, sellerId), eq(products.approved, true)),
      });

      // Filter products with stock below threshold
      const filtered = lowStockProducts
        .filter((p) => p.stock <= threshold && p.stock > 0)
        .sort((a, b) => a.stock - b.stock);

      return res.status(200).json({
        success: true,
        message: 'Low stock products retrieved successfully',
        data: filtered,
      });
    } catch (error) {
      console.error('Error getting low stock products:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve low stock products',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
