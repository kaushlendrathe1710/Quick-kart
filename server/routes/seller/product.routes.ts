import { Application } from 'express';
import { SellerProductController } from '@server/controllers/seller/product.controller';
import { ProductMediaController } from '@server/controllers/seller/productMedia.controller';
import { authenticate, isSeller } from '@server/middleware/auth.middleware';
import { requireSellerApproval } from '@server/middleware/sellerApproval.middleware';
import { productImageUpload } from '@server/config/multer';

/**
 * Seller Product Routes
 * All routes require authentication + seller role + approved status
 */
export function registerSellerProductRoutes(app: Application) {
  const middleware = [authenticate, isSeller, requireSellerApproval];

  /**
   * @route   GET /api/seller/products
   * @desc    Get seller's products with filters
   * @access  Private (Seller - Approved)
   * @query   page, limit, isDraft, approved, category
   */
  app.get('/api/seller/products', ...middleware, SellerProductController.getProducts);

  /**
   * @route   GET /api/seller/products/:id
   * @desc    Get single product details
   * @access  Private (Seller - Approved)
   */
  app.get('/api/seller/products/:id', ...middleware, SellerProductController.getProduct);

  /**
   * @route   POST /api/seller/products
   * @desc    Create new product
   * @access  Private (Seller - Approved)
   * @body    Product data matching LeleKart schema
   */
  app.post('/api/seller/products', ...middleware, SellerProductController.createProduct);

  /**
   * @route   PUT /api/seller/products/:id
   * @desc    Update product
   * @access  Private (Seller - Approved)
   * @body    Product data (partial update supported)
   */
  app.put('/api/seller/products/:id', ...middleware, SellerProductController.updateProduct);

  /**
   * @route   PATCH /api/seller/products/:id/stock
   * @desc    Update product stock only
   * @access  Private (Seller - Approved)
   * @body    { stock: number }
   */
  app.patch(
    '/api/seller/products/:id/stock',
    ...middleware,
    SellerProductController.updateProductStock
  );

  /**
   * @route   DELETE /api/seller/products/:id
   * @desc    Soft delete product
   * @access  Private (Seller - Approved)
   */
  app.delete('/api/seller/products/:id', ...middleware, SellerProductController.deleteProduct);

  /**
   * @route   GET /api/seller/products/:id/variants
   * @desc    Get product variants
   * @access  Private (Seller - Approved)
   */
  app.get('/api/seller/products/:id/variants', ...middleware, SellerProductController.getVariants);

  /**
   * @route   POST /api/seller/products/:id/variants
   * @desc    Create or update product variants (bulk operation)
   * @access  Private (Seller - Approved)
   * @body    Array of variant objects
   */
  app.post(
    '/api/seller/products/:id/variants',
    ...middleware,
    SellerProductController.createOrUpdateVariants
  );

  /**
   * @route   PATCH /api/seller/products/:productId/variants/:variantId
   * @desc    Update single product variant
   * @access  Private (Seller - Approved)
   * @body    Variant update data (price, mrp, stock, color, size, images)
   */
  app.patch(
    '/api/seller/products/:productId/variants/:variantId',
    ...middleware,
    SellerProductController.updateVariant
  );

  // ============================================
  // PRODUCT MEDIA ROUTES (Images Only)
  // ============================================

  /**
   * @route   GET /api/seller/products/:productId/media
   * @desc    Get product media information (thumbnail, imageUrls, limits)
   * @access  Private (Seller - Approved)
   */
  app.get(
    '/api/seller/products/:productId/media',
    ...middleware,
    ProductMediaController.getProductMedia
  );

  /**
   * @route   POST /api/seller/products/:productId/images
   * @desc    Upload product images to S3
   * @access  Private (Seller - Approved)
   * @upload  Multipart form-data, field name: 'images', max 10 files
   */
  app.post(
    '/api/seller/products/:productId/images',
    ...middleware,
    productImageUpload.array('images', 10),
    ProductMediaController.uploadImages
  );

  /**
   * @route   DELETE /api/seller/products/:productId/images
   * @desc    Delete product image from S3 and database
   * @access  Private (Seller - Approved)
   * @body    { imageUrl: string }
   */
  app.delete(
    '/api/seller/products/:productId/images',
    ...middleware,
    ProductMediaController.deleteImage
  );

  /**
   * @route   PUT /api/seller/products/:productId/thumbnail
   * @desc    Set product thumbnail (main image)
   * @access  Private (Seller - Approved)
   * @body    { imageUrl: string }
   */
  app.put(
    '/api/seller/products/:productId/thumbnail',
    ...middleware,
    ProductMediaController.setThumbnail
  );
}
