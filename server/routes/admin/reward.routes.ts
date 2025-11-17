import { Express } from 'express';
import { authenticate, isAdmin } from '../../middleware/auth.middleware';
import * as rewardController from '../../controllers/admin/reward.controller';

export function registerAdminRewardRoutes(app: Express) {
  // Reward Management
  app.post('/api/admin/rewards/points', authenticate, isAdmin, rewardController.adjustUserPoints);
  app.get(
    '/api/admin/rewards/statistics',
    authenticate,
    isAdmin,
    rewardController.getRewardStatistics
  );
  app.get(
    '/api/admin/rewards/users/:userId',
    authenticate,
    isAdmin,
    rewardController.getUserRewardDetails
  );
}
