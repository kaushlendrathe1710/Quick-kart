import type { Express } from 'express';
import { DeliveryPartnerTicketController } from '../../controllers/deliveryPartner/ticket.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import {
  createTicketSchema,
  updateTicketSchema,
  idParamSchema,
} from '../../utils/deliveryPartner.validation';

/**
 * Register ticket routes
 * All routes require authentication
 */
export function registerTicketRoutes(app: Express): void {
  // Get ticket by ID
  app.get(
    '/api/delivery-partner/ticket/:id',
    authenticate,
    validateRequest(idParamSchema),
    DeliveryPartnerTicketController.getTicketById
  );

  // Get current partner's tickets
  app.get(
    '/api/delivery-partner/ticket',
    authenticate,
    DeliveryPartnerTicketController.getMyTickets
  );

  // Create ticket
  app.post(
    '/api/delivery-partner/ticket',
    authenticate,
    validateRequest(createTicketSchema),
    DeliveryPartnerTicketController.createTicket
  );
}
