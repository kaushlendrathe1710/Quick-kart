import type { Express } from 'express';
import { AdminSellerTicketController } from '../../controllers/admin/sellerTicket.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { updateSellerTicketSchema, idParamSchema } from '../../utils/seller.validation';

/**
 * Register admin seller ticket routes
 * All routes require authentication as admin
 */
export function registerAdminSellerTicketRoutes(app: Express): void {
  // Get all seller tickets
  app.get(
    '/api/admin/seller-ticket',
    authenticate,
    AdminSellerTicketController.getAllSellerTickets
  );

  // Get open seller tickets
  app.get(
    '/api/admin/seller-ticket/open',
    authenticate,
    AdminSellerTicketController.getOpenSellerTickets
  );

  // Get seller ticket by ID
  app.get(
    '/api/admin/seller-ticket/:id',
    authenticate,
    validateRequest(idParamSchema),
    AdminSellerTicketController.getSellerTicketById
  );

  // Update seller ticket
  app.patch(
    '/api/admin/seller-ticket/:id',
    authenticate,
    validateRequest(updateSellerTicketSchema),
    AdminSellerTicketController.updateSellerTicket
  );

  // Add admin response to seller ticket
  app.post(
    '/api/admin/seller-ticket/:id/response',
    authenticate,
    AdminSellerTicketController.addAdminResponse
  );

  // Resolve seller ticket
  app.post(
    '/api/admin/seller-ticket/:id/resolve',
    authenticate,
    AdminSellerTicketController.resolveSellerTicket
  );

  // Close seller ticket
  app.post(
    '/api/admin/seller-ticket/:id/close',
    authenticate,
    AdminSellerTicketController.closeSellerTicket
  );

  // Delete seller ticket
  app.delete(
    '/api/admin/seller-ticket/:id',
    authenticate,
    validateRequest(idParamSchema),
    AdminSellerTicketController.deleteSellerTicket
  );
}
