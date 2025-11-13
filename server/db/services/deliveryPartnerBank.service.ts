import { db } from '@server/db/connect';
import { eq } from 'drizzle-orm';
import { deliveryPartnerBankDetails } from '@server/db/schema';
import type { DeliveryPartnerBankDetail, NewDeliveryPartnerBankDetail } from '@server/db/schema';

/**
 * Get bank details by ID
 */
export async function getBankDetailsById(
  id: number
): Promise<DeliveryPartnerBankDetail | undefined> {
  const result = await db
    .select()
    .from(deliveryPartnerBankDetails)
    .where(eq(deliveryPartnerBankDetails.id, id));
  return result[0];
}

/**
 * Get bank details by delivery partner ID
 */
export async function getBankDetailsByPartnerId(
  deliveryPartnerId: number
): Promise<DeliveryPartnerBankDetail | undefined> {
  const result = await db
    .select()
    .from(deliveryPartnerBankDetails)
    .where(eq(deliveryPartnerBankDetails.deliveryPartnerId, deliveryPartnerId));
  return result[0];
}

/**
 * Create bank details
 */
export async function createBankDetails(
  data: NewDeliveryPartnerBankDetail
): Promise<DeliveryPartnerBankDetail> {
  const [newBankDetails] = await db.insert(deliveryPartnerBankDetails).values(data).returning();
  return newBankDetails;
}

/**
 * Update bank details
 */
export async function updateBankDetails(
  id: number,
  data: Partial<Omit<NewDeliveryPartnerBankDetail, 'deliveryPartnerId'>>
): Promise<DeliveryPartnerBankDetail | undefined> {
  const [updatedBankDetails] = await db
    .update(deliveryPartnerBankDetails)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(deliveryPartnerBankDetails.id, id))
    .returning();
  return updatedBankDetails;
}

/**
 * Delete bank details
 */
export async function deleteBankDetails(id: number): Promise<boolean> {
  const result = await db
    .delete(deliveryPartnerBankDetails)
    .where(eq(deliveryPartnerBankDetails.id, id))
    .returning();
  return result.length > 0;
}

/**
 * Check if bank details exist for a delivery partner
 */
export async function bankDetailsExist(deliveryPartnerId: number): Promise<boolean> {
  const result = await db
    .select({ id: deliveryPartnerBankDetails.id })
    .from(deliveryPartnerBankDetails)
    .where(eq(deliveryPartnerBankDetails.deliveryPartnerId, deliveryPartnerId));
  return result.length > 0;
}

export const deliveryPartnerBankService = {
  getBankDetailsById,
  getBankDetailsByPartnerId,
  createBankDetails,
  updateBankDetails,
  deleteBankDetails,
  bankDetailsExist,
};
