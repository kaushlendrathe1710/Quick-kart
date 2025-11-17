import { db } from '../connect';
import { sellerDocuments, type SellerDocument, type InsertSellerDocument } from '../schema';
import { eq, and, desc } from 'drizzle-orm';

export const sellerDocumentService = {
  /**
   * Get all documents for a seller
   */
  async getDocumentsBySellerId(sellerId: number): Promise<SellerDocument[]> {
    return db.query.sellerDocuments.findMany({
      where: eq(sellerDocuments.sellerId, sellerId),
      orderBy: [desc(sellerDocuments.uploadedAt)],
    });
  },

  /**
   * Get a specific document by ID
   */
  async getDocumentById(documentId: number, sellerId: number): Promise<SellerDocument | undefined> {
    return db.query.sellerDocuments.findFirst({
      where: and(eq(sellerDocuments.id, documentId), eq(sellerDocuments.sellerId, sellerId)),
    });
  },

  /**
   * Create a new document
   */
  async createDocument(data: InsertSellerDocument): Promise<SellerDocument> {
    const [document] = await db.insert(sellerDocuments).values(data).returning();
    return document;
  },

  /**
   * Delete a document
   */
  async deleteDocument(documentId: number, sellerId: number): Promise<SellerDocument | undefined> {
    const [deleted] = await db
      .delete(sellerDocuments)
      .where(and(eq(sellerDocuments.id, documentId), eq(sellerDocuments.sellerId, sellerId)))
      .returning();
    return deleted;
  },

  /**
   * Get documents by type
   */
  async getDocumentsByType(sellerId: number, documentType: string): Promise<SellerDocument[]> {
    return db.query.sellerDocuments.findMany({
      where: and(
        eq(sellerDocuments.sellerId, sellerId),
        eq(sellerDocuments.documentType, documentType as any)
      ),
      orderBy: [desc(sellerDocuments.uploadedAt)],
    });
  },
};
