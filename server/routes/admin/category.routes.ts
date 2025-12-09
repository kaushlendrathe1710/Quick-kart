import { Express } from 'express';
import { authenticate, isAdmin } from '../../middleware/auth.middleware';
import * as categoryController from '../../controllers/admin/category.controller';
import { categoryIconUpload, subcategoryImageUpload } from '../../config/multer';

export function registerAdminCategoryRoutes(app: Express) {
  // Category Management
  app.post('/api/admin/categories', authenticate, isAdmin, categoryController.createCategory);
  app.put('/api/admin/categories/:id', authenticate, isAdmin, categoryController.updateCategory);
  app.delete('/api/admin/categories/:id', authenticate, isAdmin, categoryController.deleteCategory);

  // Category Icon Upload
  app.post(
    '/api/admin/categories/upload-icon',
    authenticate,
    isAdmin,
    categoryIconUpload.single('icon'),
    categoryController.uploadCategoryIcon
  );

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

  // Subcategory Image Upload
  app.post(
    '/api/admin/subcategories/upload-image',
    authenticate,
    isAdmin,
    subcategoryImageUpload.single('image'),
    categoryController.uploadSubcategoryImage
  );
}
