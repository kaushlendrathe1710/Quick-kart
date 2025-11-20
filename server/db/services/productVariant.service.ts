import { db } from '@server/db/connect';
import { eq, and } from 'drizzle-orm';
import { productVariants } from '@server/db/schema';
import type { ProductVariant, NewProductVariant } from '@server/db/schema';

/**
 * Get all variants for a specific product
 */
export async function getProductVariants(productId: number): Promise<ProductVariant[]> {
  return await db.select().from(productVariants).where(eq(productVariants.productId, productId));
}

/**
 * Get a single product variant by ID
 */
export async function getProductVariant(id: number): Promise<ProductVariant | undefined> {
  const result = await db.select().from(productVariants).where(eq(productVariants.id, id));
  return result[0];
}

/**
 * Create a single product variant
 */
export async function createProductVariant(data: NewProductVariant): Promise<ProductVariant> {
  const [newVariant] = await db.insert(productVariants).values(data).returning();
  return newVariant;
}

/**
 * Create multiple product variants in bulk
 */
export async function createProductVariantsBulk(
  data: NewProductVariant[]
): Promise<ProductVariant[]> {
  if (data.length === 0) return [];
  return await db.insert(productVariants).values(data).returning();
}

/**
 * Update a product variant
 */
export async function updateProductVariant(
  id: number,
  data: Partial<NewProductVariant>
): Promise<ProductVariant | undefined> {
  const [updatedVariant] = await db
    .update(productVariants)
    .set(data)
    .where(eq(productVariants.id, id))
    .returning();
  return updatedVariant;
}

/**
 * Delete a product variant
 */
export async function deleteProductVariant(id: number): Promise<void> {
  await db.delete(productVariants).where(eq(productVariants.id, id));
}

/**
 * Delete all variants for a product
 */
export async function deleteProductVariants(productId: number): Promise<void> {
  await db.delete(productVariants).where(eq(productVariants.productId, productId));
}

export const productVariantService = {
  getProductVariants,
  getProductVariant,
  createProductVariant,
  createProductVariantsBulk,
  updateProductVariant,
  deleteProductVariant,
  deleteProductVariants,
};
