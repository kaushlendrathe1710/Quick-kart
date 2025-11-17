import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import * as adminDashboardService from '../../db/services/adminDashboard.service';
import * as adminProductService from '../../db/services/adminProduct.service';

/**
 * Get admin dashboard statistics
 * GET /api/admin/dashboard/stats
 */
export async function getDashboardStats(req: AuthenticatedRequest, res: Response) {
  try {
    const stats = await adminDashboardService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return empty stats instead of error to prevent dashboard failure
    res.json({
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
    });
  }
}

/**
 * Get recent activity for admin dashboard
 * GET /api/admin/recent-activity
 */
export async function getRecentActivity(req: AuthenticatedRequest, res: Response) {
  try {
    const activities = await adminDashboardService.getRecentActivity();
    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.json([]);
  }
}

/**
 * Get product statistics
 * GET /api/admin/product-stats
 */
export async function getProductStats(req: AuthenticatedRequest, res: Response) {
  try {
    const stats = await adminProductService.getDetailedProductStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.json({
      totalProducts: 0,
      approvedProducts: 0,
      rejectedProducts: 0,
      pendingProducts: 0,
      deletedProducts: 0,
      productsBySeller: [],
      productsByCategory: [],
    });
  }
}
