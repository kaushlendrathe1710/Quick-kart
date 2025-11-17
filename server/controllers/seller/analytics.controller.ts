import { Response } from 'express';
import { AuthenticatedRequest } from '@server/types';
import { analyticsService } from '@server/db/services/analytics.service';
import { z } from 'zod';

/**
 * Seller Analytics Controller
 * Handles analytics data retrieval and reporting
 */

// Validation schema
const getAnalyticsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  period: z.enum(['daily', 'weekly', 'monthly']).optional().default('daily'),
});

export class SellerAnalyticsController {
  /**
   * Get analytics for date range
   * GET /api/seller/analytics
   */
  static async getAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;

      // Validate query parameters
      const validated = getAnalyticsSchema.parse(req.query);

      // Default to last 30 days if no dates provided
      const endDate = validated.endDate ? new Date(validated.endDate) : new Date();
      const startDate = validated.startDate
        ? new Date(validated.startDate)
        : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      const analytics = await analyticsService.getSellerAnalytics(
        sellerId,
        startDate,
        endDate,
        validated.period
      );

      return res.status(200).json({
        success: true,
        message: 'Analytics retrieved successfully',
        data: {
          analytics,
          dateRange: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            period: validated.period,
          },
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: error.errors,
        });
      }

      console.error('Error getting analytics:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get dashboard summary
   * GET /api/seller/analytics/summary
   */
  static async getSummary(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;

      const summary = await analyticsService.getDashboardSummary(sellerId);

      return res.status(200).json({
        success: true,
        message: 'Analytics summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve analytics summary',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get revenue chart data
   * GET /api/seller/analytics/revenue-chart
   */
  static async getRevenueChart(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const days = parseInt(req.query.days as string) || 30;

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      const analytics = await analyticsService.getSellerAnalytics(
        sellerId,
        startDate,
        endDate,
        'daily'
      );

      // Format data for charts
      const chartData = analytics.map((day) => ({
        date: day.date,
        revenue: parseFloat(day.totalRevenue || '0'),
        orders: day.totalOrders || 0,
      }));

      return res.status(200).json({
        success: true,
        message: 'Revenue chart data retrieved successfully',
        data: chartData,
      });
    } catch (error) {
      console.error('Error getting revenue chart:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve revenue chart data',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get product performance data
   * GET /api/seller/analytics/product-performance
   */
  static async getProductPerformance(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const days = parseInt(req.query.days as string) || 30;

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      // Get live analytics for the period
      const liveAnalytics = await analyticsService.calculateLiveAnalytics(
        sellerId,
        startDate,
        endDate
      );

      return res.status(200).json({
        success: true,
        message: 'Product performance retrieved successfully',
        data: {
          period: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            days,
          },
          metrics: {
            totalProducts: liveAnalytics.totalProducts,
            activeProducts: liveAnalytics.activeProducts,
            outOfStockProducts: liveAnalytics.outOfStockProducts,
            totalOrders: liveAnalytics.totalOrders,
            completedOrders: liveAnalytics.completedOrders,
            cancelledOrders: liveAnalytics.cancelledOrders,
            totalReturns: liveAnalytics.totalReturns,
          },
        },
      });
    } catch (error) {
      console.error('Error getting product performance:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve product performance',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get customer insights
   * GET /api/seller/analytics/customer-insights
   */
  static async getCustomerInsights(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const days = parseInt(req.query.days as string) || 30;

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      const liveAnalytics = await analyticsService.calculateLiveAnalytics(
        sellerId,
        startDate,
        endDate
      );

      return res.status(200).json({
        success: true,
        message: 'Customer insights retrieved successfully',
        data: {
          period: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            days,
          },
          insights: {
            uniqueCustomers: liveAnalytics.uniqueCustomers,
            returningCustomers: liveAnalytics.returningCustomers,
            avgOrderValue: liveAnalytics.avgOrderValue,
            totalRevenue: liveAnalytics.totalRevenue,
            customerRetentionRate:
              liveAnalytics.uniqueCustomers > 0
                ? (
                    (liveAnalytics.returningCustomers / liveAnalytics.uniqueCustomers) *
                    100
                  ).toFixed(2)
                : '0',
          },
        },
      });
    } catch (error) {
      console.error('Error getting customer insights:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve customer insights',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
