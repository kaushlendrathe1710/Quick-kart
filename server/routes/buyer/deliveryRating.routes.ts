import type { Express } from 'express';
import { BuyerDeliveryRatingController } from '../../controllers/buyer/deliveryRating.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import {
  createDeliveryRatingSchema,
  updateDeliveryRatingSchema,
  idParamSchema,
} from '../../utils/deliveryPartner.validation';

/**
 * Register buyer delivery rating routes
 * Buyers can rate delivery partners after delivery completion
 * All routes require authentication as buyer
 */
export function registerBuyerDeliveryRatingRoutes(app: Express): void {
  // Get buyer's own ratings
  app.get(
    '/api/buyer/delivery-rating/my-ratings',
    authenticate,
    BuyerDeliveryRatingController.getMyRatings
  );

  // Create rating for a delivery
  app.post(
    '/api/buyer/delivery-rating',
    authenticate,
    validateRequest(createDeliveryRatingSchema),
    BuyerDeliveryRatingController.createRating
  );

  // Update rating
  app.patch(
    '/api/buyer/delivery-rating/:id',
    authenticate,
    validateRequest(updateDeliveryRatingSchema),
    BuyerDeliveryRatingController.updateRating
  );

  // Delete rating
  app.delete(
    '/api/buyer/delivery-rating/:id',
    authenticate,
    validateRequest(idParamSchema),
    BuyerDeliveryRatingController.deleteRating
  );
}
