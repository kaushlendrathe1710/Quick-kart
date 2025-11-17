import { Express } from 'express';
import { authenticate, isAdmin } from '../../middleware/auth.middleware';
import * as giftCardController from '../../controllers/admin/giftCard.controller';

export function registerAdminGiftCardRoutes(app: Express) {
  // Gift Card Management
  app.get('/api/admin/gift-cards', authenticate, isAdmin, giftCardController.getAllGiftCards);
  app.post('/api/admin/gift-cards', authenticate, isAdmin, giftCardController.createGiftCard);
  app.put(
    '/api/admin/gift-cards/:id/toggle-status',
    authenticate,
    isAdmin,
    giftCardController.toggleGiftCardStatus
  );

  // Gift Card Templates
  app.get(
    '/api/admin/gift-card-templates',
    authenticate,
    isAdmin,
    giftCardController.getAllGiftCardTemplates
  );
  app.post(
    '/api/admin/gift-card-templates',
    authenticate,
    isAdmin,
    giftCardController.createGiftCardTemplate
  );
  app.put(
    '/api/admin/gift-card-templates/:id',
    authenticate,
    isAdmin,
    giftCardController.updateGiftCardTemplate
  );
  app.delete(
    '/api/admin/gift-card-templates/:id',
    authenticate,
    isAdmin,
    giftCardController.deleteGiftCardTemplate
  );
}
