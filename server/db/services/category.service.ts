import { db } from '@server/db/connect';
import { categories } from '@server/db/schema';
import { eq, like, sql, desc } from 'drizzle-orm';
import { ListCategoriesInput, PaginatedCategoriesResponse, Category } from '@shared/types';

/**
 * Category Service
 * Database operations for category management
 */

/**
 * List categories with pagination and search
 */
export async function listCategories(
  filters: ListCategoriesInput
): Promise<PaginatedCategoriesResponse> {
  const { page, limit, search, activeOnly } = filters;

  // Build where conditions
  const conditions = [];

  // Filter by active status
  if (activeOnly) {
    conditions.push(eq(categories.isActive, true));
  }

  // Search filter (name and description)
  if (search) {
    const searchPattern = `%${search}%`;
    conditions.push(
      sql`(${categories.name} ILIKE ${searchPattern} OR ${categories.description} ILIKE ${searchPattern})`
    );
  }

  // Combine all conditions
  const whereClause = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

  // Calculate offset
  const offset = (page - 1) * limit;

  // Execute query with pagination
  const [categoriesList, countResult] = await Promise.all([
    db
      .select()
      .from(categories)
      .where(whereClause)
      .orderBy(desc(categories.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(categories)
      .where(whereClause),
  ]);

  const totalCount = countResult[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    categories: categoriesList,
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
 * Get category by ID
 */
export async function getCategoryById(categoryId: number): Promise<Category | undefined> {
  const result = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);

  return result[0];
}

/**
 * Get all active categories (without pagination)
 */
export async function getAllActiveCategories(): Promise<Category[]> {
  return await db.select().from(categories).where(eq(categories.isActive, true));
}
