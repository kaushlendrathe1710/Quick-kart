import type { Express } from 'express';
import { PaymentController } from '../../controllers/buyer/payment.controller';
import { authenticate } from '../../middleware/auth.middleware';

/**
 * Register payment method routes
 * All routes require authentication
 */
export function registerPaymentRoutes(app: Express): void {
  // Get all payment methods for authenticated user
  app.get('/api/payment-methods', authenticate, PaymentController.getAllPaymentMethods);

  // Get a single payment method by ID
  app.get('/api/payment-methods/:id', authenticate, PaymentController.getPaymentMethod);

  // Create a new payment method
  app.post('/api/payment-methods', authenticate, PaymentController.createPaymentMethod);

  // Update an existing payment method
  app.put('/api/payment-methods/:id', authenticate, PaymentController.updatePaymentMethod);

  // Delete a payment method
  app.delete('/api/payment-methods/:id', authenticate, PaymentController.deletePaymentMethod);

  // Set a payment method as default
  app.patch(
    '/api/payment-methods/:id/default',
    authenticate,
    PaymentController.setDefaultPaymentMethod
  );
}
