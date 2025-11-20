import { Express } from 'express';
import { authenticate, isAdmin } from '../../middleware/auth.middleware';
import * as dashboardController from '../../controllers/admin/dashboard.controller';

export function registerAdminDashboardRoutes(app: Express) {
  // Dashboard Statistics
  app.get(
    '/api/admin/dashboard/stats',
    authenticate,
    isAdmin,
    dashboardController.getDashboardStats
  );
  app.get(
    '/api/admin/recent-activity',
    authenticate,
    isAdmin,
    dashboardController.getRecentActivity
  );
  app.get('/api/admin/product-stats', authenticate, isAdmin, dashboardController.getProductStats);
}
