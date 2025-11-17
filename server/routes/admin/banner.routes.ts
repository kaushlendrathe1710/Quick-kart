import { Express } from 'express';
import { authenticate, isAdmin } from '../../middleware/auth.middleware';
import * as bannerController from '../../controllers/admin/banner.controller';

export function registerAdminBannerRoutes(app: Express) {
  // Banner Management
  app.get('/api/admin/banners', authenticate, isAdmin, bannerController.getAllBanners);
  app.post('/api/admin/banners', authenticate, isAdmin, bannerController.createBanner);
  app.put('/api/admin/banners/:id', authenticate, isAdmin, bannerController.updateBanner);
  app.delete('/api/admin/banners/:id', authenticate, isAdmin, bannerController.deleteBanner);
  app.patch(
    '/api/admin/banners/:id/position',
    authenticate,
    isAdmin,
    bannerController.updateBannerPosition
  );
  app.patch(
    '/api/admin/banners/:id/toggle-active',
    authenticate,
    isAdmin,
    bannerController.toggleBannerActive
  );
}
