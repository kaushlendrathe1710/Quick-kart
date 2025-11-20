import { Response } from 'express';
import { AuthenticatedRequest } from '@server/types';
import { db } from '@server/db/connect';
import { products, users } from '@server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import * as productVariantService from '@server/db/services/productVariant.service';
import { getPaginationParams, createPaginatedResponse } from '@server/utils/pagination.utils';
import { PAGINATION_UPPER_LIMIT } from '@server/constants';

/**
 * Seller Product Controller
 * Handles product management for sellers - matches LeleKart schema structure
 */

// Validation schema matching LeleKart product structure
const productSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  specifications: z.string().optional(),
  sku: z.string().optional(),
  mrp: z.number().int().positive().optional(),
  purchasePrice: z.number().int().positive().optional(),
  price: z.number().int().positive(),
  category: z.string(),
  categoryId: z.number().int().positive().optional(),
  subcategoryId: z.number().int().positive().optional().nullable(),
  subcategory1: z.string().optional(),
  subcategory2: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  thumbnail: z.string().optional(),
  imageUrls: z.string().optional(), // JSON string
  stock: z.number().int().min(0).default(0),
  gstRate: z.string().optional(),
  weight: z.string().optional(),
  length: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  warranty: z.number().int().optional(),
  returnPolicy: z.string().optional(),
  isDraft: z.boolean().default(false),
  deliveryCharges: z.number().int().default(0),
  variants: z.string().optional(), // JSON string of variants array
});

export class SellerProductController {
  /**
   * Get seller's products with pagination and filters
   * GET /api/seller/products?page=1&limit=20&isDraft=false&approved=true&category=electronics
   */
  static async getProducts(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const { page, limit, offset } = getPaginationParams(req);

      // Filters
      const isDraft =
        req.query.isDraft === 'true' ? true : req.query.isDraft === 'false' ? false : undefined;
      const approved =
        req.query.approved === 'true' ? true : req.query.approved === 'false' ? false : undefined;
      const category = req.query.category as string | undefined;

      // Build where conditions
      const conditions = [
        eq(products.sellerId, sellerId),
        eq(products.deleted, false), // Don't show deleted products
      ];

      if (isDraft !== undefined) conditions.push(eq(products.isDraft, isDraft));
      if (approved !== undefined) conditions.push(eq(products.approved, approved));
      if (category) conditions.push(eq(products.category, category));

      const sellerProducts = await db.query.products.findMany({
        where: and(...conditions),
        orderBy: [desc(products.createdAt)],
        limit,
        offset,
      });

      // Get total count
      const allProducts = await db.query.products.findMany({
        where: and(...conditions),
      });

      return res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        ...createPaginatedResponse(sellerProducts, page, limit, allProducts.length),
      });
    } catch (error) {
      console.error('Error getting seller products:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve products',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Create product
   * POST /api/seller/products
   */
  static async createProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;

      // Check if seller is approved
      const seller = await db.query.users.findFirst({
        where: eq(users.id, sellerId),
      });

      if (!seller || seller.role !== 'seller') {
        return res.status(403).json({
          success: false,
          message: 'Only sellers can create products',
        });
      }

      if (!seller.isApproved) {
        return res.status(403).json({
          success: false,
          message: 'Your seller account is pending approval',
        });
      }

      // Validate product data
      const validatedData = productSchema.parse(req.body);

      // Create product - all new products pending approval unless draft
      const [newProduct] = await db
        .insert(products)
        .values({
          ...validatedData,
          sellerId,
          approved: false, // Needs admin approval
          rejected: false,
          deleted: false,
        })
        .returning();

      return res.status(201).json({
        success: true,
        message: validatedData.isDraft
          ? 'Product saved as draft'
          : 'Product created and pending approval',
        data: newProduct,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Error creating product:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update product
   * PUT /api/seller/products/:id
   */
  static async updateProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const productId = parseInt(req.params.id);

      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID',
        });
      }

      // Check product ownership
      const product = await db.query.products.findFirst({
        where: and(eq(products.id, productId), eq(products.sellerId, sellerId)),
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Validate update data
      const updateData = productSchema.partial().parse(req.body);

      // If product was draft and now being published, reset approval
      const finalUpdateData: any = { ...updateData };
      if (product.isDraft && updateData.isDraft === false) {
        finalUpdateData.approved = false; // Needs approval when publishing
        finalUpdateData.rejected = false;
      }

      finalUpdateData.updatedAt = new Date();

      // Update product
      const [updatedProduct] = await db
        .update(products)
        .set(finalUpdateData)
        .where(eq(products.id, productId))
        .returning();

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Error updating product:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete product (soft delete)
   * DELETE /api/seller/products/:id
   */
  static async deleteProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const productId = parseInt(req.params.id);

      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID',
        });
      }

      // Check product ownership
      const product = await db.query.products.findFirst({
        where: and(eq(products.id, productId), eq(products.sellerId, sellerId)),
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Soft delete - mark as deleted
      await db
        .update(products)
        .set({
          deleted: true,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));

      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get single product details
   * GET /api/seller/products/:id
   */
  static async getProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const productId = parseInt(req.params.id);

      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID',
        });
      }

      // Get product with ownership verification
      const product = await db.query.products.findFirst({
        where: and(
          eq(products.id, productId),
          eq(products.sellerId, sellerId),
          eq(products.deleted, false)
        ),
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Product retrieved successfully',
        data: product,
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

  /**
   * Get product variants
   * GET /api/seller/products/:id/variants
   */
  static async getVariants(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const productId = parseInt(req.params.id);

      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID',
        });
      }

      // Verify product ownership
      const product = await db.query.products.findFirst({
        where: and(
          eq(products.id, productId),
          eq(products.sellerId, sellerId),
          eq(products.deleted, false)
        ),
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Get variants
      const variants = await productVariantService.getProductVariants(productId);

      return res.status(200).json({
        success: true,
        message: 'Variants retrieved successfully',
        data: variants,
      });
    } catch (error) {
      console.error('Error getting product variants:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve product variants',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Create or update product variants
   * POST /api/seller/products/:id/variants
   */
  static async createOrUpdateVariants(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const productId = parseInt(req.params.id);
      const variants = req.body;

      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID',
        });
      }

      if (!Array.isArray(variants)) {
        return res.status(400).json({
          success: false,
          message: 'Expected an array of variants',
        });
      }

      // Verify product ownership
      const product = await db.query.products.findFirst({
        where: and(
          eq(products.id, productId),
          eq(products.sellerId, sellerId),
          eq(products.deleted, false)
        ),
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Get existing variants
      const existingVariants = await productVariantService.getProductVariants(productId);
      const existingVariantIds = existingVariants.map((v) => v.id);

      const results = {
        created: [] as any[],
        updated: [] as any[],
      };

      let variantsToCreate: any[] = [];

      // Process each variant
      for (const variant of variants) {
        // Process the variant to ensure all fields are properly formatted
        const processedVariant = {
          ...variant,
          productId,
          price:
            typeof variant.price === 'string'
              ? parseFloat(variant.price)
              : Number(variant.price) || 0,
          mrp:
            typeof variant.mrp === 'string'
              ? parseFloat(variant.mrp)
              : Number(variant.mrp) || undefined,
          stock:
            typeof variant.stock === 'string'
              ? parseInt(variant.stock)
              : Number(variant.stock) || 0,
          images: Array.isArray(variant.images) ? JSON.stringify(variant.images) : variant.images,
        };

        // Check if this is an existing variant that needs updating
        if (variant.id && existingVariantIds.includes(variant.id)) {
          // Update existing variant
          const updatedVariant = await productVariantService.updateProductVariant(
            variant.id,
            processedVariant
          );
          if (updatedVariant) results.updated.push(updatedVariant);
        } else {
          // Prepare for bulk creation - remove any client-side temporary IDs
          const { id, ...variantWithoutId } = processedVariant;
          variantsToCreate.push({
            ...variantWithoutId,
            productId,
          });
        }
      }

      // Bulk create new variants if any
      if (variantsToCreate.length > 0) {
        try {
          const newVariants =
            await productVariantService.createProductVariantsBulk(variantsToCreate);
          results.created = newVariants;
        } catch (error) {
          console.error('Error in bulk creation of variants:', error);
          // Fall back to individual creation
          for (const variant of variantsToCreate) {
            try {
              const newVariant = await productVariantService.createProductVariant(variant);
              results.created.push(newVariant);
            } catch (createError) {
              console.error('Failed to create individual variant:', createError);
            }
          }
        }
      }

      // Fetch all current variants to return in response
      const updatedVariants = await productVariantService.getProductVariants(productId);

      return res.status(200).json({
        success: true,
        message: `Successfully processed variants: ${results.created.length} created, ${results.updated.length} updated`,
        data: {
          variants: updatedVariants,
          created: results.created.length,
          updated: results.updated.length,
        },
      });
    } catch (error) {
      console.error('Error saving product variants:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save product variants',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update a single product variant
   * PATCH /api/seller/products/:productId/variants/:variantId
   */
  static async updateVariant(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const productId = parseInt(req.params.productId);
      const variantId = parseInt(req.params.variantId);

      if (isNaN(productId) || isNaN(variantId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product or variant ID',
        });
      }

      // Verify product ownership
      const product = await db.query.products.findFirst({
        where: and(
          eq(products.id, productId),
          eq(products.sellerId, sellerId),
          eq(products.deleted, false)
        ),
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Get the variant to verify it exists and belongs to this product
      const variant = await productVariantService.getProductVariant(variantId);

      if (!variant || variant.productId !== productId) {
        return res.status(404).json({
          success: false,
          message: 'Variant not found or does not belong to this product',
        });
      }

      // Extract and validate the update data
      const { price, mrp, stock, color, size, images } = req.body;

      // Prepare the update data
      const updateData: any = {};

      if (price !== undefined) {
        updateData.price = Number(price);
      }

      if (mrp !== undefined) {
        updateData.mrp = Number(mrp);
      }

      if (stock !== undefined) {
        updateData.stock = Number(stock);
      }

      if (color !== undefined) {
        updateData.color = color;
      }

      if (size !== undefined) {
        updateData.size = size;
      }

      if (images !== undefined && Array.isArray(images)) {
        updateData.images = JSON.stringify(images);
      }

      // Update the variant
      const updatedVariant = await productVariantService.updateProductVariant(
        variantId,
        updateData
      );

      return res.status(200).json({
        success: true,
        message: 'Variant updated successfully',
        data: updatedVariant,
      });
    } catch (error) {
      console.error('Error updating product variant:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update product variant',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
