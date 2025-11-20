import type { Express } from 'express';
import { PublicDeliveryRatingController } from '../../controllers/public/deliveryRating.controller';
import { validateRequest } from '../../middleware/validation.middleware';
import { idParamSchema } from '../../utils/deliveryPartner.validation';

/**
 * Register public delivery rating routes
 * No authentication required - public access to delivery partner ratings
 */
export function registerPublicDeliveryRatingRoutes(app: Express): void {
  // Get rating by ID
  app.get(
    '/api/public/delivery-rating/:id',
    validateRequest(idParamSchema),
    PublicDeliveryRatingController.getRatingById
  );

  // Get ratings by delivery partner ID (for public viewing of partner ratings)
  app.get(
    '/api/public/delivery-rating/partner/:partnerId',
    PublicDeliveryRatingController.getRatingsByPartnerId
  );
}
