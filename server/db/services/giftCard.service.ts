import { db } from '../index';
import { giftCards, giftCardTemplates, giftCardTransactions, users } from '../schema';
import { eq, desc, and, sql } from 'drizzle-orm';

/**
 * Get all gift cards (admin)
 */
export async function getAllGiftCards(filters?: {
  isActive?: boolean;
  limit?: number;
  offset?: number;
}) {
  let query = db
    .select({
      id: giftCards.id,
      code: giftCards.code,
      initialValue: giftCards.initialValue,
      currentBalance: giftCards.currentBalance,
      issuedTo: giftCards.issuedTo,
      purchasedBy: giftCards.purchasedBy,
      isActive: giftCards.isActive,
      expiryDate: giftCards.expiryDate,
      createdAt: giftCards.createdAt,
      lastUsed: giftCards.lastUsed,
      recipientEmail: giftCards.recipientEmail,
      recipientName: giftCards.recipientName,
    })
    .from(giftCards)
    .orderBy(desc(giftCards.createdAt))
    .$dynamic();

  if (filters?.isActive !== undefined) {
    query = query.where(eq(giftCards.isActive, filters.isActive));
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  const data = await query;

  // Get total count
  let countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(giftCards)
    .$dynamic();

  if (filters?.isActive !== undefined) {
    countQuery = countQuery.where(eq(giftCards.isActive, filters.isActive));
  }

  const totalResult = await countQuery;

  return {
    data,
    total: Number(totalResult[0]?.count || 0),
  };
}

/**
 * Create gift card
 */
export async function createGiftCard(data: {
  code: string;
  initialValue: number;
  currentBalance: number;
  issuedTo?: number | null;
  purchasedBy?: number | null;
  expiryDate?: Date | null;
  recipientEmail?: string;
  recipientName?: string;
  message?: string;
  designTemplate?: string;
}) {
  const result = await db.insert(giftCards).values(data).returning();

  return result[0];
}

/**
 * Toggle gift card status
 */
export async function toggleGiftCardStatus(giftCardId: number) {
  const giftCard = await db.query.giftCards.findFirst({
    where: eq(giftCards.id, giftCardId),
  });

  if (!giftCard) {
    throw new Error('Gift card not found');
  }

  const result = await db
    .update(giftCards)
    .set({
      isActive: !giftCard.isActive,
    })
    .where(eq(giftCards.id, giftCardId))
    .returning();

  return result[0];
}

/**
 * Get all gift card templates
 */
export async function getAllGiftCardTemplates() {
  return await db.select().from(giftCardTemplates).orderBy(desc(giftCardTemplates.createdAt));
}

/**
 * Create gift card template
 */
export async function createGiftCardTemplate(data: {
  name: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
}) {
  const result = await db
    .insert(giftCardTemplates)
    .values({
      ...data,
      active: data.active ?? true,
    })
    .returning();

  return result[0];
}

/**
 * Update gift card template
 */
export async function updateGiftCardTemplate(
  templateId: number,
  data: {
    name?: string;
    description?: string;
    imageUrl?: string;
    active?: boolean;
  }
) {
  const result = await db
    .update(giftCardTemplates)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(giftCardTemplates.id, templateId))
    .returning();

  return result[0];
}

/**
 * Delete gift card template
 */
export async function deleteGiftCardTemplate(templateId: number) {
  const result = await db
    .delete(giftCardTemplates)
    .where(eq(giftCardTemplates.id, templateId))
    .returning();

  return result[0];
}
