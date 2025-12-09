import { db } from '@server/db/connect';
import { categories, subcategories } from '@server/db/schema';
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

/**
 * Create a new category (Admin only)
 */
export async function createCategory(data: {
  name: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}): Promise<Category> {
  // Generate slug from name
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const updateData: any = { ...data, slug };
  // Map icon parameter to image field (schema uses 'image')
  if (data.icon !== undefined) {
    updateData.image = data.icon;
    delete updateData.icon;
  }

  const result = await db.insert(categories).values(updateData).returning();
  return result[0];
}

/**
 * Update a category (Admin only)
 */
export async function updateCategory(
  categoryId: number,
  data: {
    name?: string;
    description?: string;
    icon?: string;
    isActive?: boolean;
  }
): Promise<Category | undefined> {
  const updateData: any = { ...data, updatedAt: new Date() };
  // Map icon parameter to image field (schema uses 'image')
  if (data.icon !== undefined) {
    updateData.image = data.icon;
    delete updateData.icon;
  }

  const result = await db
    .update(categories)
    .set(updateData)
    .where(eq(categories.id, categoryId))
    .returning();

  return result[0];
}

/**
 * Delete a category (Admin only)
 */
export async function deleteCategory(categoryId: number): Promise<boolean> {
  const result = await db.delete(categories).where(eq(categories.id, categoryId)).returning();
  return result.length > 0;
}

/**
 * Get all subcategories for a category
 */
export async function getSubcategoriesByCategoryId(categoryId: number) {
  return await db
    .select()
    .from(subcategories)
    .where(eq(subcategories.categoryId, categoryId))
    .orderBy(subcategories.name);
}

/**
 * Get all subcategories (admin view)
 */
export async function getAllSubcategories() {
  return await db
    .select({
      id: subcategories.id,
      name: subcategories.name,
      slug: subcategories.slug,
      image: subcategories.image,
      description: subcategories.description,
      categoryId: subcategories.categoryId,
      categoryName: categories.name,
      displayOrder: subcategories.displayOrder,
      active: subcategories.active,
      createdAt: subcategories.createdAt,
    })
    .from(subcategories)
    .leftJoin(categories, eq(subcategories.categoryId, categories.id))
    .orderBy(desc(subcategories.createdAt));
}

/**
 * Create a new subcategory (Admin only)
 */
export async function createSubcategory(data: {
  name: string;
  categoryId: number;
  description?: string;
  image?: string;
  active?: boolean;
}) {
  // Generate slug from name
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const result = await db
    .insert(subcategories)
    .values({
      ...data,
      slug,
    })
    .returning();
  return result[0];
}

/**
 * Update a subcategory (Admin only)
 */
export async function updateSubcategory(
  subcategoryId: number,
  data: {
    name?: string;
    categoryId?: number;
    description?: string;
    image?: string;
    displayOrder?: number;
    active?: boolean;
  }
) {
  const updateData: any = { ...data };

  // Generate new slug if name is being updated
  if (data.name) {
    updateData.slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  updateData.updatedAt = new Date();

  const result = await db
    .update(subcategories)
    .set(updateData)
    .where(eq(subcategories.id, subcategoryId))
    .returning();

  return result[0];
}

/**
 * Delete a subcategory (Admin only)
 */
export async function deleteSubcategory(subcategoryId: number): Promise<boolean> {
  const result = await db
    .delete(subcategories)
    .where(eq(subcategories.id, subcategoryId))
    .returning();
  return result.length > 0;
}
