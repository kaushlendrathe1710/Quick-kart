import { db } from '../index';
import { products, users } from '../schema';
import { eq, sql, desc, and, or } from 'drizzle-orm';

/**
 * Get all products for admin (with filters)
 */
export async function getAllProductsForAdmin(filters?: {
  approved?: boolean;
  rejected?: boolean;
  deleted?: boolean;
  sellerId?: number;
  category?: string;
  limit?: number;
  offset?: number;
}) {
  let query = db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      mrp: products.mrp,
      category: products.category,
      subcategory1: products.subcategory1,
      thumbnail: products.thumbnail,
      sellerId: products.sellerId,
      sellerName: users.name,
      stock: products.stock,
      approved: products.approved,
      rejected: products.rejected,
      deleted: products.deleted,
      isDraft: products.isDraft,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(users, eq(products.sellerId, users.id))
    .orderBy(desc(products.createdAt))
    .$dynamic();

  // Apply filters
  const conditions = [];

  if (filters?.approved !== undefined) {
    conditions.push(eq(products.approved, filters.approved));
  }

  if (filters?.rejected !== undefined) {
    conditions.push(eq(products.rejected, filters.rejected));
  }

  if (filters?.deleted !== undefined) {
    conditions.push(eq(products.deleted, filters.deleted));
  }

  if (filters?.sellerId) {
    conditions.push(eq(products.sellerId, filters.sellerId));
  }

  if (filters?.category) {
    conditions.push(eq(products.category, filters.category));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  const data = await query;

  // Get total count with same conditions
  let countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .$dynamic();

  if (conditions.length > 0) {
    countQuery = countQuery.where(and(...conditions));
  }

  const totalResult = await countQuery;

  return {
    data,
    total: Number(totalResult[0]?.count || 0),
  };
}

/**
 * Get detailed product statistics
 */
export async function getDetailedProductStats() {
  try {
    // Get counts by approval status
    const statusCounts = await db
      .select({
        approved: products.approved,
        rejected: products.rejected,
        deleted: products.deleted,
        count: sql<number>`count(*)::int`,
      })
      .from(products)
      .groupBy(products.approved, products.rejected, products.deleted);

    let totalProducts = 0;
    let approvedProducts = 0;
    let rejectedProducts = 0;
    let pendingProducts = 0;
    let deletedProducts = 0;

    statusCounts.forEach((stat) => {
      const count = stat.count;
      totalProducts += count;

      if (stat.deleted) {
        deletedProducts += count;
      } else if (stat.approved) {
        approvedProducts += count;
      } else if (stat.rejected) {
        rejectedProducts += count;
      } else {
        pendingProducts += count;
      }
    });

    // Get products by seller (top 10)
    const productsBySeller = await db
      .select({
        sellerId: products.sellerId,
        sellerName: users.name,
        sellerEmail: users.email,
        totalProducts: sql<number>`count(*)::int`,
        approvedProducts: sql<number>`sum(case when ${products.approved} then 1 else 0 end)::int`,
      })
      .from(products)
      .leftJoin(users, eq(products.sellerId, users.id))
      .where(eq(products.deleted, false))
      .groupBy(products.sellerId, users.name, users.email)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    // Get products by category
    const productsByCategory = await db
      .select({
        category: products.category,
        totalProducts: sql<number>`count(*)::int`,
        approvedProducts: sql<number>`sum(case when ${products.approved} then 1 else 0 end)::int`,
      })
      .from(products)
      .where(eq(products.deleted, false))
      .groupBy(products.category)
      .orderBy(desc(sql`count(*)`));

    return {
      totalProducts,
      approvedProducts,
      rejectedProducts,
      pendingProducts,
      deletedProducts,
      productsBySeller,
      productsByCategory,
    };
  } catch (error) {
    console.error('Error fetching detailed product stats:', error);
    return {
      totalProducts: 0,
      approvedProducts: 0,
      rejectedProducts: 0,
      pendingProducts: 0,
      deletedProducts: 0,
      productsBySeller: [],
      productsByCategory: [],
    };
  }
}

/**
 * Approve a product
 */
export async function approveProduct(productId: number) {
  const result = await db
    .update(products)
    .set({
      approved: true,
      rejected: false,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId))
    .returning();

  return result[0];
}

/**
 * Reject a product
 */
export async function rejectProduct(productId: number) {
  const result = await db
    .update(products)
    .set({
      approved: false,
      rejected: true,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId))
    .returning();

  return result[0];
}

/**
 * Soft delete a product
 */
export async function deleteProduct(productId: number) {
  const result = await db
    .update(products)
    .set({
      deleted: true,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId))
    .returning();

  return result[0];
}

/**
 * Restore a deleted product
 */
export async function restoreProduct(productId: number) {
  const result = await db
    .update(products)
    .set({
      deleted: false,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId))
    .returning();

  return result[0];
}

/**
 * Bulk approve products
 */
export async function bulkApproveProducts(productIds: number[]) {
  if (productIds.length === 0) {
    throw new Error('No products selected');
  }

  const results = [];
  let approvedCount = 0;
  let errorCount = 0;

  for (const id of productIds) {
    try {
      // Check if product exists and is not deleted
      const product = await db.query.products.findFirst({
        where: and(eq(products.id, id), eq(products.deleted, false)),
      });

      if (!product) {
        results.push({
          id,
          success: false,
          error: 'Product not found or has been deleted',
        });
        errorCount++;
        continue;
      }

      // Approve the product
      await db
        .update(products)
        .set({
          approved: true,
          rejected: false,
          updatedAt: new Date(),
        })
        .where(and(eq(products.id, id), eq(products.deleted, false)));

      results.push({ id, success: true });
      approvedCount++;
    } catch (error) {
      console.error(`Error approving product ${id}:`, error);
      results.push({
        id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      errorCount++;
    }
  }

  return {
    success: approvedCount > 0,
    results,
    summary: {
      total: productIds.length,
      approved: approvedCount,
      failed: errorCount,
    },
  };
}

/**
 * Bulk reject products
 */
export async function bulkRejectProducts(productIds: number[]) {
  if (productIds.length === 0) {
    throw new Error('No products selected');
  }

  const results = [];
  let rejectedCount = 0;
  let errorCount = 0;

  for (const id of productIds) {
    try {
      // Check if product exists and is not deleted
      const product = await db.query.products.findFirst({
        where: and(eq(products.id, id), eq(products.deleted, false)),
      });

      if (!product) {
        results.push({
          id,
          success: false,
          error: 'Product not found or has been deleted',
        });
        errorCount++;
        continue;
      }

      // Reject the product
      await db
        .update(products)
        .set({
          approved: false,
          rejected: true,
          updatedAt: new Date(),
        })
        .where(and(eq(products.id, id), eq(products.deleted, false)));

      results.push({ id, success: true });
      rejectedCount++;
    } catch (error) {
      console.error(`Error rejecting product ${id}:`, error);
      results.push({
        id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      errorCount++;
    }
  }

  return {
    success: rejectedCount > 0,
    results,
    summary: {
      total: productIds.length,
      rejected: rejectedCount,
      failed: errorCount,
    },
  };
}
