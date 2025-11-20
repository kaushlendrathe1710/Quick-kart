import { Express } from 'express';
import { authenticate, isAdmin } from '../../middleware/auth.middleware';
import * as categoryController from '../../controllers/admin/category.controller';

export function registerAdminCategoryRoutes(app: Express) {
  // Category Management
  app.post('/api/admin/categories', authenticate, isAdmin, categoryController.createCategory);
  app.put('/api/admin/categories/:id', authenticate, isAdmin, categoryController.updateCategory);
  app.delete('/api/admin/categories/:id', authenticate, isAdmin, categoryController.deleteCategory);

  // Subcategory Management
  app.get(
    '/api/admin/subcategories',
    authenticate,
    isAdmin,
    categoryController.getAllSubcategories
  );
  app.post('/api/admin/subcategories', authenticate, isAdmin, categoryController.createSubcategory);
  app.put(
    '/api/admin/subcategories/:id',
    authenticate,
    isAdmin,
    categoryController.updateSubcategory
  );
  app.delete(
    '/api/admin/subcategories/:id',
    authenticate,
    isAdmin,
    categoryController.deleteSubcategory
  );
}
