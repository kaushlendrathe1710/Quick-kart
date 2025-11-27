import { Express } from 'express';
import { Request, Response } from 'express';
import * as bannerService from '../../db/services/banner.service';

/**
 * Get active banners for homepage
 * Public route - no authentication required
 */
async function getActiveBanners(req: Request, res: Response) {
  try {
    const result = await bannerService.getAllBanners(100, 0); // Get up to 100 banners

    // Filter only active banners and sort by position
    const activeBanners = result.data
      .filter((banner) => banner.active)
      .sort((a, b) => a.position - b.position);

    res.json({
      success: true,
      data: activeBanners,
    });
  } catch (error) {
    console.error('Error fetching active banners:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch banners',
    });
  }
}

export function registerPublicBannerRoutes(app: Express) {
  // Get active banners for homepage
  app.get('/api/banners', getActiveBanners);
}
