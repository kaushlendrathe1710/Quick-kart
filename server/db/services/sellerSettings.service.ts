import { db } from '../connect';
import { sellerSettings, type SellerSettings, type InsertSellerSettings } from '../schema';
import { eq } from 'drizzle-orm';

export const sellerSettingsService = {
  /**
   * Get seller settings by seller ID
   */
  async getSettingsBySellerId(sellerId: number): Promise<SellerSettings | undefined> {
    return db.query.sellerSettings.findFirst({
      where: eq(sellerSettings.sellerId, sellerId),
    });
  },

  /**
   * Create seller settings
   */
  async createSettings(data: InsertSellerSettings): Promise<SellerSettings> {
    const [settings] = await db.insert(sellerSettings).values(data).returning();
    return settings;
  },

  /**
   * Update seller settings
   */
  async updateSettings(
    sellerId: number,
    data: Partial<InsertSellerSettings>
  ): Promise<SellerSettings> {
    const [updated] = await db
      .update(sellerSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sellerSettings.sellerId, sellerId))
      .returning();

    if (!updated) {
      throw new Error('Seller settings not found');
    }

    return updated;
  },

  /**
   * Get or create seller settings
   * Ensures every seller has settings
   */
  async getOrCreateSettings(sellerId: number): Promise<SellerSettings> {
    let settings = await this.getSettingsBySellerId(sellerId);

    if (!settings) {
      settings = await this.createSettings({ sellerId });
    }

    return settings;
  },

  /**
   * Update pickup address (one-time only)
   * For security, pickup address can only be set once
   */
  async updatePickupAddress(sellerId: number, pickupAddress: any): Promise<SellerSettings> {
    const settings = await this.getOrCreateSettings(sellerId);

    // Check if pickup address is already set (for security)
    if (settings.pickupAddress) {
      throw new Error('Pickup address can only be set once. Please contact support to update.');
    }

    return this.updateSettings(sellerId, {
      pickupAddress,
    });
  },

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    sellerId: number,
    preferences: {
      emailNotifications?: boolean;
      orderNotifications?: boolean;
      lowStockAlerts?: boolean;
    }
  ): Promise<SellerSettings> {
    return this.updateSettings(sellerId, preferences);
  },
};
