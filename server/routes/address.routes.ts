import type { Express } from 'express';
import { AddressController } from '../controllers/address.controller';
import { authenticate } from '../middleware/auth.middleware';

/**
 * Register address routes
 * All routes require authentication
 */
export function registerAddressRoutes(app: Express): void {
  // Get all addresses for authenticated user
  app.get('/api/addresses', authenticate, AddressController.getAllAddresses);

  // Get a single address by ID
  app.get('/api/addresses/:id', authenticate, AddressController.getAddress);

  // Create a new address
  app.post('/api/addresses', authenticate, AddressController.createAddress);

  // Update an existing address
  app.put('/api/addresses/:id', authenticate, AddressController.updateAddress);

  // Delete an address
  app.delete('/api/addresses/:id', authenticate, AddressController.deleteAddress);

  // Set an address as default
  app.patch('/api/addresses/:id/default', authenticate, AddressController.setDefaultAddress);
}
