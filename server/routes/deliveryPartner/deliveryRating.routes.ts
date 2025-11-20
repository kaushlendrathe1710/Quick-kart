import type { Express } from 'express';
import { DeliveryPartnerRatingController } from '../../controllers/deliveryPartner/deliveryRating.controller';
import { authenticate } from '../../middleware/auth.middleware';

/**
 * Register delivery partner rating routes
 * Delivery partners can view their ratings
 * All routes require authentication as delivery partner
 */
export function registerDeliveryPartnerRatingRoutes(app: Express): void {
  // Get current partner's ratings with stats
  app.get(
    '/api/deliveryPartner/delivery-rating/my-ratings',
    authenticate,
    DeliveryPartnerRatingController.getMyRatings
  );
}
