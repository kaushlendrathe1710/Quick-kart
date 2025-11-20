import { Request, Response } from 'express';
import {
  getSubcategoriesByCategoryId,
  getAllSubcategories,
} from '@server/db/services/category.service';
import { db } from '@server/db/connect';
import { subcategories } from '@server/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Public Subcategory Controller
 * Handles public subcategory-related API requests (no authentication required)
 */

export class PublicSubcategoryController {
  /**
   * Get all active subcategories
   * GET /api/subcategories
   */
  static async listSubcategories(req: Request, res: Response) {
    try {
      const result = await db
        .select({
          id: subcategories.id,
          name: subcategories.name,
          slug: subcategories.slug,
          image: subcategories.image,
          description: subcategories.description,
          categoryId: subcategories.categoryId,
          displayOrder: subcategories.displayOrder,
          active: subcategories.active,
          createdAt: subcategories.createdAt,
        })
        .from(subcategories)
        .where(eq(subcategories.active, true))
        .orderBy(subcategories.displayOrder, subcategories.name);

      return res.status(200).json({
        success: true,
        message: 'Subcategories retrieved successfully',
        data: result,
      });
    } catch (error) {
      console.error('Error listing subcategories:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve subcategories',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get subcategories for a specific category
   * GET /api/categories/:categoryId/subcategories
   */
  static async getSubcategoriesByCategory(req: Request, res: Response) {
    try {
      const categoryId = parseInt(req.params.categoryId);

      if (isNaN(categoryId) || categoryId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID',
        });
      }

      const result = await getSubcategoriesByCategoryId(categoryId);

      return res.status(200).json({
        success: true,
        message: 'Subcategories retrieved successfully',
        data: result,
      });
    } catch (error) {
      console.error('Error getting subcategories by category:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve subcategories',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get subcategory by ID
   * GET /api/subcategories/:id
   */
  static async getSubcategoryById(req: Request, res: Response) {
    try {
      const subcategoryId = parseInt(req.params.id);

      if (isNaN(subcategoryId) || subcategoryId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subcategory ID',
        });
      }

      const result = await db
        .select()
        .from(subcategories)
        .where(eq(subcategories.id, subcategoryId))
        .limit(1);

      if (!result || result.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Subcategory not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Subcategory retrieved successfully',
        data: result[0],
      });
    } catch (error) {
      console.error('Error getting subcategory:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve subcategory',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
