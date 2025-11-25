import { Request, Response } from 'express';
import { listProductsSchema, ListProductsInput } from '@shared/types';
import {
  listProducts,
  getProductById,
  getProductVariants,
} from '@server/db/services/product.service';
import { z } from 'zod';

/**
 * Product Controller
 * Handles product-related API requests
 */

export class ProductController {
  /**
   * List products with filters, search, and pagination
   * GET /api/products
   */
  static async listProducts(req: Request, res: Response) {
    try {
      // Validate and parse query parameters
      const filters: ListProductsInput = listProductsSchema.parse(req.query);

      // Fetch products from database
      const result = await listProducts(filters);

      return res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
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

      console.error('Error listing products:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve products',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get product by ID
   * GET /api/products/:id
   */
  static async getProductById(req: Request, res: Response) {
    try {
      const productId = parseInt(req.params.id);

      if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID',
        });
      }

      const product = await getProductById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Fetch variants for this product
      const variants = await getProductVariants(productId);

      return res.status(200).json({
        success: true,
        message: 'Product retrieved successfully',
        data: {
          ...product,
          variants: variants,
        },
      });
    } catch (error) {
      console.error('Error getting product:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve product',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
