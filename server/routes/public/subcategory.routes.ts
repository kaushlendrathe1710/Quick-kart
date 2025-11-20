import type { Express } from 'express';
import { PublicSubcategoryController } from '@server/controllers/public/subcategory.controller';

/**
 * Public Subcategory Routes
 * No authentication required for viewing subcategories
 */
export function registerSubcategoryRoutes(app: Express) {
  // Get all active subcategories
  app.get('/api/subcategories', PublicSubcategoryController.listSubcategories);

  // Get subcategories by category ID
  app.get(
    '/api/categories/:categoryId/subcategories',
    PublicSubcategoryController.getSubcategoriesByCategory
  );

  // Get single subcategory by ID
  app.get('/api/subcategories/:id', PublicSubcategoryController.getSubcategoryById);
}
