import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import * as rewardService from '../../db/services/reward.service';

/**
 * Adjust user reward points (admin)
 * POST /api/admin/rewards/points
 */
export async function adjustUserPoints(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId, points, description } = req.body;

    if (!userId || points === undefined || !description) {
      return res.status(400).json({ error: 'userId, points, and description are required' });
    }

    const result = await rewardService.adjustUserPoints({
      userId: parseInt(userId),
      points: parseInt(points),
      description,
      adminId: req.user!.id,
    });

    res.json({
      success: true,
      message: 'User points adjusted successfully',
      ...result,
    });
  } catch (error) {
    console.error('Error adjusting user points:', error);
    res.status(500).json({ error: 'Failed to adjust user points' });
  }
}

/**
 * Get reward statistics
 * GET /api/admin/rewards/statistics
 */
export async function getRewardStatistics(req: AuthenticatedRequest, res: Response) {
  try {
    const stats = await rewardService.getRewardStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching reward statistics:', error);
    res.status(500).json({ error: 'Failed to fetch reward statistics' });
  }
}

/**
 * Get user reward details
 * GET /api/admin/rewards/users/:userId
 */
export async function getUserRewardDetails(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const details = await rewardService.getUserRewardDetails(userId);
    res.json(details);
  } catch (error) {
    console.error('Error fetching user reward details:', error);
    res.status(500).json({ error: 'Failed to fetch user reward details' });
  }
}
