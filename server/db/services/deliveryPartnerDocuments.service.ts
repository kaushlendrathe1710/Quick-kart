import { db } from '@server/db/connect';
import { eq, and } from 'drizzle-orm';
import { deliveryPartnerDocuments } from '@server/db/schema';
import type { DeliveryPartnerDocument, NewDeliveryPartnerDocument } from '@server/db/schema';

/**
 * Get delivery partner documents by ID
 */
export async function getDocumentsById(id: number): Promise<DeliveryPartnerDocument | undefined> {
  const result = await db
    .select()
    .from(deliveryPartnerDocuments)
    .where(eq(deliveryPartnerDocuments.id, id));
  return result[0];
}

/**
 * Get delivery partner documents by delivery partner ID
 */
export async function getDocumentsByPartnerId(
  deliveryPartnerId: number
): Promise<DeliveryPartnerDocument | undefined> {
  const result = await db
    .select()
    .from(deliveryPartnerDocuments)
    .where(eq(deliveryPartnerDocuments.deliveryPartnerId, deliveryPartnerId));
  return result[0];
}

/**
 * Create delivery partner documents
 */
export async function createDocuments(
  data: NewDeliveryPartnerDocument
): Promise<DeliveryPartnerDocument> {
  const [newDocument] = await db.insert(deliveryPartnerDocuments).values(data).returning();
  return newDocument;
}

/**
 * Update delivery partner documents
 */
export async function updateDocuments(
  id: number,
  data: Partial<Omit<NewDeliveryPartnerDocument, 'deliveryPartnerId'>>
): Promise<DeliveryPartnerDocument | undefined> {
  const [updatedDocument] = await db
    .update(deliveryPartnerDocuments)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(deliveryPartnerDocuments.id, id))
    .returning();
  return updatedDocument;
}

/**
 * Delete delivery partner documents
 */
export async function deleteDocuments(id: number): Promise<boolean> {
  const result = await db
    .delete(deliveryPartnerDocuments)
    .where(eq(deliveryPartnerDocuments.id, id))
    .returning();
  return result.length > 0;
}

/**
 * Check if documents exist for a delivery partner
 */
export async function documentsExist(deliveryPartnerId: number): Promise<boolean> {
  const result = await db
    .select({ id: deliveryPartnerDocuments.id })
    .from(deliveryPartnerDocuments)
    .where(eq(deliveryPartnerDocuments.deliveryPartnerId, deliveryPartnerId));
  return result.length > 0;
}

export const deliveryPartnerDocumentsService = {
  getDocumentsById,
  getDocumentsByPartnerId,
  createDocuments,
  updateDocuments,
  deleteDocuments,
  documentsExist,
};
