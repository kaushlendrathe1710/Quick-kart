import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import * as adminProductService from '../../db/services/adminProduct.service';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination.utils';

/**
 * Get all products (admin view) with pagination
 * GET /api/admin/products?page=1&limit=20&approved=true
 */
export async function getAllProducts(req: AuthenticatedRequest, res: Response) {
  try {
    const { approved, rejected, deleted, sellerId, category } = req.query;
    const { page, limit, offset } = getPaginationParams(req);

    const filters = {
      approved: approved === 'true' ? true : approved === 'false' ? false : undefined,
      rejected: rejected === 'true' ? true : rejected === 'false' ? false : undefined,
      deleted: deleted === 'true' ? true : deleted === 'false' ? false : undefined,
      sellerId: sellerId ? parseInt(sellerId as string) : undefined,
      category: category as string,
      limit,
      offset,
    };

    const result = await adminProductService.getAllProductsForAdmin(filters);

    // If service returns paginated data
    if (result && typeof result === 'object' && 'data' in result && 'total' in result) {
      res.json(createPaginatedResponse(result.data, page, limit, result.total));
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

/**
 * Get detailed product statistics
 * GET /api/admin/products/stats
 */
export async function getProductStats(req: AuthenticatedRequest, res: Response) {
  try {
    const stats = await adminProductService.getDetailedProductStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({ error: 'Failed to fetch product statistics' });
  }
}

/**
 * Approve a product
 * POST /api/admin/products/:id/approve
 */
export async function approveProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await adminProductService.approveProduct(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product approved successfully',
      product,
    });
  } catch (error) {
    console.error('Error approving product:', error);
    res.status(500).json({ error: 'Failed to approve product' });
  }
}

/**
 * Reject a product
 * POST /api/admin/products/:id/reject
 */
export async function rejectProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await adminProductService.rejectProduct(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product rejected successfully',
      product,
    });
  } catch (error) {
    console.error('Error rejecting product:', error);
    res.status(500).json({ error: 'Failed to reject product' });
  }
}

/**
 * Delete a product (soft delete)
 * DELETE /api/admin/products/:id
 */
export async function deleteProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await adminProductService.deleteProduct(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      product,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
}

/**
 * Restore a deleted product
 * POST /api/admin/products/:id/restore
 */
export async function restoreProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await adminProductService.restoreProduct(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product restored successfully',
      product,
    });
  } catch (error) {
    console.error('Error restoring product:', error);
    res.status(500).json({ error: 'Failed to restore product' });
  }
}

/**
 * Bulk approve products
 * POST /api/admin/products/bulk/approve
 */
export async function bulkApproveProducts(req: AuthenticatedRequest, res: Response) {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds)) {
      return res.status(400).json({ error: 'Invalid input: productIds must be an array' });
    }

    if (productIds.length === 0) {
      return res
        .status(400)
        .json({ error: 'No products selected: please select at least one product to approve' });
    }

    // Convert to numbers
    const validIds: number[] = [];
    const invalidIds: any[] = [];

    for (const id of productIds) {
      const numId = Number(id);
      if (!isNaN(numId) && Number.isInteger(numId) && numId > 0) {
        validIds.push(numId);
      } else {
        invalidIds.push(id);
      }
    }

    if (validIds.length === 0) {
      return res.status(400).json({ error: 'No valid product IDs provided' });
    }

    const result = await adminProductService.bulkApproveProducts(validIds);

    res.json(result);
  } catch (error) {
    console.error('Error in bulk product approval:', error);
    res.status(500).json({
      error: 'Failed to process bulk approval request',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Bulk reject products
 * POST /api/admin/products/bulk/reject
 */
export async function bulkRejectProducts(req: AuthenticatedRequest, res: Response) {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds)) {
      return res.status(400).json({ error: 'Invalid input: productIds must be an array' });
    }

    if (productIds.length === 0) {
      return res
        .status(400)
        .json({ error: 'No products selected: please select at least one product to reject' });
    }

    // Convert to numbers
    const validIds: number[] = [];
    const invalidIds: any[] = [];

    for (const id of productIds) {
      const numId = Number(id);
      if (!isNaN(numId) && Number.isInteger(numId) && numId > 0) {
        validIds.push(numId);
      } else {
        invalidIds.push(id);
      }
    }

    if (validIds.length === 0) {
      return res.status(400).json({ error: 'No valid product IDs provided' });
    }

    const result = await adminProductService.bulkRejectProducts(validIds);

    res.json(result);
  } catch (error) {
    console.error('Error in bulk product rejection:', error);
    res.status(500).json({
      error: 'Failed to process bulk rejection request',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
