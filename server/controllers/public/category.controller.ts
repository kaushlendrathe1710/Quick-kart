import { Request, Response } from 'express';
import { listCategoriesSchema, ListCategoriesInput } from '@shared/types';
import { listCategories, getCategoryById } from '@server/db/services/category.service';
import { z } from 'zod';

/**
 * Public Category Controller
 * Handles public category-related API requests (no authentication required)
 */

export class PublicCategoryController {
  /**
   * List categories with pagination and search
   * GET /api/public/categories
   */
  static async listCategories(req: Request, res: Response) {
    try {
      // Validate and parse query parameters
      const filters: ListCategoriesInput = listCategoriesSchema.parse(req.query);

      // Fetch categories from database
      const result = await listCategories(filters);

      return res.status(200).json({
        success: true,
        message: 'Categories retrieved successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: error.errors,
        });
      }

      console.error('Error listing categories:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve categories',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get category by ID
   * GET /api/public/categories/:id
   */
  static async getCategoryById(req: Request, res: Response) {
    try {
      const categoryId = parseInt(req.params.id);

      if (isNaN(categoryId) || categoryId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID',
        });
      }

      const category = await getCategoryById(categoryId);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Category retrieved successfully',
        data: category,
      });
    } catch (error) {
      console.error('Error getting category:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve category',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
