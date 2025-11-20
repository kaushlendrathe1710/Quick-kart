import { db } from '../connect';
import { users, sellerInfo, type SellerInfo, type InsertSellerInfo } from '../schema';
import { eq, and } from 'drizzle-orm';
import { userRole } from '@shared/constants';

export const sellerService = {
  /**
   * Get all pending sellers
   */
  async getPendingSellers() {
    return db.query.users.findMany({
      where: and(
        eq(users.role, userRole.SELLER),
        eq(users.isApproved, false),
        eq(users.rejected, false)
      ),
      with: {
        sellerInfo: true,
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  },

  /**
   * Get all approved sellers
   */
  async getApprovedSellers() {
    return db.query.users.findMany({
      where: and(eq(users.role, userRole.SELLER), eq(users.isApproved, true)),
      with: {
        sellerInfo: true,
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  },

  /**
   * Get all rejected sellers
   */
  async getRejectedSellers() {
    return db.query.users.findMany({
      where: and(eq(users.role, userRole.SELLER), eq(users.rejected, true)),
      with: {
        sellerInfo: true,
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  },

  /**
   * Get seller by ID with full details
   */
  async getSellerById(userId: number) {
    return db.query.users.findFirst({
      where: and(eq(users.id, userId), eq(users.role, userRole.SELLER)),
      with: {
        sellerInfo: true,
      },
    });
  },

  /**
   * Approve a seller
   */
  async approveSeller(userId: number, approvedBy: number) {
    const [updatedUser] = await db
      .update(users)
      .set({
        isApproved: true,
        rejected: false,
        rejectionReason: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new Error('Seller not found');
    }

    // Update sellerInfo with approval details
    await db
      .update(sellerInfo)
      .set({
        approvedAt: new Date(),
        approvedBy: approvedBy,
        updatedAt: new Date(),
      })
      .where(eq(sellerInfo.userId, userId));

    return updatedUser;
  },

  /**
   * Reject a seller
   */
  async rejectSeller(userId: number, reason: string, rejectedBy: number) {
    const [updatedUser] = await db
      .update(users)
      .set({
        rejected: true,
        isApproved: false,
        rejectionReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new Error('Seller not found');
    }

    // Update sellerInfo with rejection details
    await db
      .update(sellerInfo)
      .set({
        rejectedAt: new Date(),
        rejectedBy: rejectedBy,
        updatedAt: new Date(),
      })
      .where(eq(sellerInfo.userId, userId));

    return updatedUser;
  },

  /**
   * Get or create seller info
   */
  async getOrCreateSellerInfo(userId: number): Promise<SellerInfo> {
    let info = await db.query.sellerInfo.findFirst({
      where: eq(sellerInfo.userId, userId),
    });

    if (!info) {
      const [newInfo] = await db.insert(sellerInfo).values({ userId }).returning();
      info = newInfo;
    }

    return info;
  },

  /**
   * Update seller info (business details)
   */
  async updateSellerInfo(userId: number, data: Partial<InsertSellerInfo>): Promise<SellerInfo> {
    const existingInfo = await db.query.sellerInfo.findFirst({
      where: eq(sellerInfo.userId, userId),
    });

    if (!existingInfo) {
      // Create new if doesn't exist
      const [newInfo] = await db
        .insert(sellerInfo)
        .values({ userId, ...data })
        .returning();
      return newInfo;
    }

    // Update existing
    const [updated] = await db
      .update(sellerInfo)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sellerInfo.userId, userId))
      .returning();

    return updated;
  },

  /**
   * Update banking information
   */
  async updateBankingInfo(
    userId: number,
    bankData: {
      bankName: string;
      bankState: string;
      bankCity: string;
      bankPincode: string;
      accountNumber: string;
      ifscCode: string;
    }
  ): Promise<SellerInfo> {
    return this.updateSellerInfo(userId, bankData);
  },

  /**
   * Get seller statistics
   */
  async getSellerStats() {
    const pending = await this.getPendingSellers();
    const approved = await this.getApprovedSellers();
    const rejected = await this.getRejectedSellers();

    return {
      pending: pending.length,
      approved: approved.length,
      rejected: rejected.length,
      total: pending.length + approved.length + rejected.length,
    };
  },
};
