import { db } from '@server/db/connect';
import { products, categories, productVariants } from '@server/db/schema';
import { eq, and, gte, lte, like, or, desc, asc, sql, SQL } from 'drizzle-orm';
import { ListProductsInput, PaginatedProductsResponse, Product } from '@shared/types';

/**
 * Product Service
 * Database operations for product management
 */

/**
 * List products with filters, search, and pagination
 */
export async function listProducts(filters: ListProductsInput): Promise<PaginatedProductsResponse> {
  const {
    category,
    subcategory,
    minPrice,
    maxPrice,
    discount,
    inStock,
    rating,
    search,
    page,
    limit,
    sortBy,
    sortOrder,
  } = filters;

  // Build where conditions
  const conditions: SQL[] = [];

  // Filter by active and approved products only
  conditions.push(eq(products.isActive, true));
  conditions.push(eq(products.approved, true));

  // Category filter
  if (category) {
    conditions.push(eq(products.categoryId, category));
  }

  // Subcategory filter
  if (subcategory) {
    conditions.push(eq(products.subcategoryId, subcategory));
  }

  // Price range filter
  if (minPrice !== undefined) {
    conditions.push(gte(products.price, minPrice));
  }
  if (maxPrice !== undefined) {
    conditions.push(lte(products.price, maxPrice));
  }

  // Stock availability filter
  if (inStock) {
    conditions.push(sql`${products.stock} > 0`);
  }

  // Rating filter (minimum rating)
  if (rating !== undefined) {
    conditions.push(gte(products.rating, rating.toString()));
  }

  // Search filter (name and description)
  if (search) {
    const searchPattern = `%${search}%`;
    conditions.push(
      or(like(products.name, searchPattern), like(products.description, searchPattern))!
    );
  }

  // Combine all conditions
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Determine sort column and order
  let orderByClause;
  const orderDirection = sortOrder === 'asc' ? asc : desc;

  switch (sortBy) {
    case 'price':
      orderByClause = orderDirection(products.price);
      break;
    case 'rating':
      orderByClause = orderDirection(products.rating);
      break;
    case 'name':
      orderByClause = orderDirection(products.name);
      break;
    case 'createdAt':
    default:
      orderByClause = orderDirection(products.createdAt);
      break;
  }

  // Calculate offset
  const offset = (page - 1) * limit;

  // Execute query with pagination
  const [productsList, countResult] = await Promise.all([
    db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(whereClause),
  ]);

  const totalCount = countResult[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    products: productsList,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Get product by ID with variants
 */
export async function getProductById(productId: number): Promise<Product | undefined> {
  const result = await db
    .select()
    .from(products)
    .where(and(eq(products.id, productId), eq(products.approved, true)))
    .limit(1);

  return result[0];
}

/**
 * Get product variants by product ID
 */
export async function getProductVariants(productId: number) {
  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId));

  return variants;
}

/**
 * Get products by IDs (bulk fetch)
 */
export async function getProductsByIds(productIds: number[]): Promise<Product[]> {
  if (productIds.length === 0) return [];

  const result = await db
    .select()
    .from(products)
    .where(sql`${products.id} = ANY(${productIds})`);

  return result;
}

/**
 * Check if product has sufficient stock
 */
export async function checkProductStock(productId: number, quantity: number): Promise<boolean> {
  const product = await getProductById(productId);
  if (!product) return false;
  return product.stock >= quantity;
}

/**
 * Update product stock (for order processing)
 */
export async function updateProductStock(productId: number, quantityChange: number): Promise<void> {
  await db
    .update(products)
    .set({
      stock: sql`${products.stock} + ${quantityChange}`,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));
}
