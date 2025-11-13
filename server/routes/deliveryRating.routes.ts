import type { Express } from 'express';
import { DeliveryRatingController } from '../controllers';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createDeliveryRatingSchema,
  updateDeliveryRatingSchema,
  idParamSchema,
} from '../utils/deliveryPartner.validation';

/**
 * Register delivery rating routes
 * All routes require authentication
 */
export function registerDeliveryRatingRoutes(app: Express): void {
  // Get current partner's ratings
  app.get('/api/delivery/ratings/my-ratings', authenticate, DeliveryRatingController.getMyRatings);

  // Get rating by ID
  app.get(
    '/api/delivery/ratings/:id',
    authenticate,
    validateRequest(idParamSchema),
    DeliveryRatingController.getRatingById
  );

  // Get ratings by delivery partner ID
  app.get(
    '/api/delivery/ratings/partner/:partnerId',
    authenticate,
    DeliveryRatingController.getRatingsByPartnerId
  );

  // Create rating
  app.post(
    '/api/delivery/ratings',
    authenticate,
    validateRequest(createDeliveryRatingSchema),
    DeliveryRatingController.createRating
  );

  // Update rating
  app.patch(
    '/api/delivery/ratings/:id',
    authenticate,
    validateRequest(updateDeliveryRatingSchema),
    DeliveryRatingController.updateRating
  );

  // Delete rating
  app.delete(
    '/api/delivery/ratings/:id',
    authenticate,
    validateRequest(idParamSchema),
    DeliveryRatingController.deleteRating
  );
}
