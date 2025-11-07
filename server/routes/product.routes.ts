import type { Express } from 'express';
import { ProductController } from '../controllers/product.controller';

/**
 * Register product routes
 * Public routes - no authentication required for browsing products
 */
export function registerProductRoutes(app: Express): void {
  // List all products with filters and pagination
  app.get('/api/products', ProductController.listProducts);

  // Get single product by ID
  app.get('/api/products/:id', ProductController.getProductById);
}
