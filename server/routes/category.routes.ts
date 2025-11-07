import type { Express } from 'express';
import { CategoryController } from '../controllers/category.controller';

/**
 * Register category routes
 * Public routes - no authentication required for browsing categories
 */
export function registerCategoryRoutes(app: Express): void {
  // List all categories with pagination
  app.get('/api/categories', CategoryController.listCategories);

  // Get single category by ID
  app.get('/api/categories/:id', CategoryController.getCategoryById);
}
