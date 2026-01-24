import type { Express } from 'express';
import { SellerTicketController } from '../../controllers/seller/ticket.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { createSellerTicketSchema, idParamSchema } from '../../utils/seller.validation';

/**
 * Register seller ticket routes
 * All routes require authentication
 */
export function registerSellerTicketRoutes(app: Express): void {
  // Get ticket by ID
  app.get(
    '/api/seller/ticket/:id',
    authenticate,
    validateRequest(idParamSchema),
    SellerTicketController.getTicketById
  );

  // Get current seller's tickets
  app.get('/api/seller/ticket', authenticate, SellerTicketController.getMyTickets);

  // Create ticket
  app.post(
    '/api/seller/ticket',
    authenticate,
    validateRequest(createSellerTicketSchema),
    SellerTicketController.createTicket
  );
}
