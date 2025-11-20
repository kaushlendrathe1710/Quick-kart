import { Response } from 'express';
import { AuthenticatedRequest } from '@server/types';
import { db } from '@server/db/connect';
import { products } from '@server/db/schema';
import { eq, and } from 'drizzle-orm';
import { uploadMultipleWithPath, deleteFile, UPLOAD_PATHS } from '@server/utils/s3.utils';
import { PRODUCT_MEDIA_CONFIG } from '@server/constants';

/**
 * Product Media Controller
 * Handles image uploads for products using S3
 * Schema fields: thumbnail (main image), imageUrls (array of images)
 */
export class ProductMediaController {
  /**
   * Upload product images to S3
   * POST /api/seller/products/:productId/images
   * Accepts multiple files via multipart/form-data
   */
  static async uploadImages(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const productId = parseInt(req.params.productId);

      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID',
        });
      }

      // Verify product ownership
      const product = await db.query.products.findFirst({
        where: and(eq(products.id, productId), eq(products.sellerId, sellerId)),
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or you do not have permission to edit it',
        });
      }

      // Get uploaded files
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded',
        });
      }

      // Check file count limit
      if (files.length > PRODUCT_MEDIA_CONFIG.IMAGE.MAX_FILES) {
        return res.status(400).json({
          success: false,
          message: `Maximum ${PRODUCT_MEDIA_CONFIG.IMAGE.MAX_FILES} images allowed`,
        });
      }

      // Parse existing images
      let existingImages: string[] = [];
      if (product.imageUrls) {
        try {
          existingImages =
            typeof product.imageUrls === 'string'
              ? JSON.parse(product.imageUrls)
              : (product.imageUrls as any);
        } catch (err) {
          console.error('Error parsing existing images:', err);
        }
      }

      // Check total image count
      if (existingImages.length + files.length > PRODUCT_MEDIA_CONFIG.IMAGE.MAX_FILES) {
        return res.status(400).json({
          success: false,
          message: `Total images would exceed maximum of ${PRODUCT_MEDIA_CONFIG.IMAGE.MAX_FILES}. Current: ${existingImages.length}, Uploading: ${files.length}`,
        });
      }

      // Upload images to S3
      const uploadPath = UPLOAD_PATHS.SELLER_PRODUCT_IMAGES(sellerId, productId);
      const imageUrls = await uploadMultipleWithPath({
        files,
        uploadPath,
        allowedMimeTypes: PRODUCT_MEDIA_CONFIG.IMAGE.ALLOWED_MIME_TYPES as unknown as string[],
        maxFileSize: PRODUCT_MEDIA_CONFIG.IMAGE.MAX_FILE_SIZE,
      });

      // Update product with new images
      const updatedImages = [...existingImages, ...imageUrls];
      const [updatedProduct] = await db
        .update(products)
        .set({
          imageUrls: JSON.stringify(updatedImages),
          // Set thumbnail to first image if not already set
          thumbnail: product.thumbnail || updatedImages[0],
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId))
        .returning();

      return res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        data: {
          uploadedUrls: imageUrls,
          allImages: updatedImages,
          thumbnail: updatedProduct.thumbnail,
          product: updatedProduct,
        },
      });
    } catch (error) {
      console.error('Error uploading product images:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload images',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete product image from S3 and database
   * DELETE /api/seller/products/:productId/images
   * Body: { imageUrl: string }
   */
  static async deleteImage(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const productId = parseInt(req.params.productId);
      const { imageUrl } = req.body;

      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID',
        });
      }

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          message: 'Image URL is required',
        });
      }

      // Verify product ownership
      const product = await db.query.products.findFirst({
        where: and(eq(products.id, productId), eq(products.sellerId, sellerId)),
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or you do not have permission to edit it',
        });
      }

      // Parse existing images
      let existingImages: string[] = [];
      if (product.imageUrls) {
        try {
          existingImages =
            typeof product.imageUrls === 'string'
              ? JSON.parse(product.imageUrls)
              : (product.imageUrls as any);
        } catch (err) {
          console.error('Error parsing existing images:', err);
        }
      }

      // Check if image exists
      if (!existingImages.includes(imageUrl)) {
        return res.status(404).json({
          success: false,
          message: 'Image not found in product',
        });
      }

      // Delete from S3
      try {
        await deleteFile(imageUrl);
      } catch (s3Error) {
        console.error('Error deleting from S3:', s3Error);
        // Continue even if S3 deletion fails
      }

      // Remove from array
      const updatedImages = existingImages.filter((url) => url !== imageUrl);

      // Update product
      const updateData: any = {
        imageUrls: JSON.stringify(updatedImages),
        updatedAt: new Date(),
      };

      // If deleted image was the thumbnail, set to next available or null
      if (product.thumbnail === imageUrl) {
        updateData.thumbnail = updatedImages.length > 0 ? updatedImages[0] : null;
      }

      const [updatedProduct] = await db
        .update(products)
        .set(updateData)
        .where(eq(products.id, productId))
        .returning();

      return res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
        data: {
          deletedUrl: imageUrl,
          remainingImages: updatedImages,
          thumbnail: updatedProduct.thumbnail,
          product: updatedProduct,
        },
      });
    } catch (error) {
      console.error('Error deleting product image:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete image',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Set product thumbnail (main image)
   * PUT /api/seller/products/:productId/thumbnail
   * Body: { imageUrl: string }
   */
  static async setThumbnail(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const productId = parseInt(req.params.productId);
      const { imageUrl } = req.body;

      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID',
        });
      }

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          message: 'Image URL is required',
        });
      }

      // Verify product ownership
      const product = await db.query.products.findFirst({
        where: and(eq(products.id, productId), eq(products.sellerId, sellerId)),
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or you do not have permission to edit it',
        });
      }

      // Parse existing images
      let existingImages: string[] = [];
      if (product.imageUrls) {
        try {
          existingImages =
            typeof product.imageUrls === 'string'
              ? JSON.parse(product.imageUrls)
              : (product.imageUrls as any);
        } catch (err) {
          console.error('Error parsing existing images:', err);
        }
      }

      // Verify image exists in product images
      if (!existingImages.includes(imageUrl)) {
        return res.status(400).json({
          success: false,
          message: 'Selected image is not in the product image list',
        });
      }

      // Update thumbnail
      const [updatedProduct] = await db
        .update(products)
        .set({
          thumbnail: imageUrl,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId))
        .returning();

      return res.status(200).json({
        success: true,
        message: 'Thumbnail updated successfully',
        data: {
          thumbnail: updatedProduct.thumbnail,
          product: updatedProduct,
        },
      });
    } catch (error) {
      console.error('Error setting thumbnail:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to set thumbnail',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get product media information
   * GET /api/seller/products/:productId/media
   */
  static async getProductMedia(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const productId = parseInt(req.params.productId);

      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID',
        });
      }

      // Verify product ownership
      const product = await db.query.products.findFirst({
        where: and(eq(products.id, productId), eq(products.sellerId, sellerId)),
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or you do not have permission to view it',
        });
      }

      // Parse images
      let images: string[] = [];
      if (product.imageUrls) {
        try {
          images =
            typeof product.imageUrls === 'string'
              ? JSON.parse(product.imageUrls)
              : (product.imageUrls as any);
        } catch (err) {
          console.error('Error parsing images:', err);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Product media retrieved successfully',
        data: {
          productId: product.id,
          thumbnail: product.thumbnail,
          imageUrls: images,
          limits: {
            maxImages: PRODUCT_MEDIA_CONFIG.IMAGE.MAX_FILES,
            currentImages: images.length,
            remainingImages: PRODUCT_MEDIA_CONFIG.IMAGE.MAX_FILES - images.length,
          },
        },
      });
    } catch (error) {
      console.error('Error getting product media:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get product media',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
