import { db } from '@server/db/connect';
import { eq } from 'drizzle-orm';
import { businessDetails, bankingInformation } from '@server/db/schema';
import type {
  BusinessDetails,
  NewBusinessDetails,
  BankingInformation,
  NewBankingInformation,
} from '@server/db/schema';

/**
 * ==================== BUSINESS DETAILS OPERATIONS ====================
 */

/**
 * Get business details for a seller
 */
export async function getBusinessDetails(sellerId: number): Promise<BusinessDetails | undefined> {
  const result = await db
    .select()
    .from(businessDetails)
    .where(eq(businessDetails.sellerId, sellerId));
  return result[0];
}

/**
 * Create business details
 */
export async function createBusinessDetails(data: NewBusinessDetails): Promise<BusinessDetails> {
  const [newDetails] = await db.insert(businessDetails).values(data).returning();
  return newDetails;
}

/**
 * Update business details (or create if doesn't exist)
 */
export async function updateBusinessDetails(
  sellerId: number,
  data: Partial<BusinessDetails>
): Promise<BusinessDetails> {
  // Check if business details exist
  const existing = await getBusinessDetails(sellerId);

  if (existing) {
    // Update existing details
    const [updatedDetails] = await db
      .update(businessDetails)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(businessDetails.sellerId, sellerId))
      .returning();
    return updatedDetails;
  } else {
    // Create new business details
    return await createBusinessDetails({
      sellerId,
      businessName: data.businessName || '',
      gstNumber: data.gstNumber,
      panNumber: data.panNumber,
      businessType: data.businessType,
    });
  }
}

/**
 * Delete business details
 */
export async function deleteBusinessDetails(sellerId: number): Promise<void> {
  await db.delete(businessDetails).where(eq(businessDetails.sellerId, sellerId));
}

/**
 * ==================== BANKING INFORMATION OPERATIONS ====================
 */

/**
 * Get banking information for a seller
 */
export async function getBankingInformation(
  sellerId: number
): Promise<BankingInformation | undefined> {
  const result = await db
    .select()
    .from(bankingInformation)
    .where(eq(bankingInformation.sellerId, sellerId));
  return result[0];
}

/**
 * Create banking information
 */
export async function createBankingInformation(
  data: NewBankingInformation
): Promise<BankingInformation> {
  const [newInfo] = await db.insert(bankingInformation).values(data).returning();
  return newInfo;
}

/**
 * Update banking information (or create if doesn't exist)
 */
export async function updateBankingInformation(
  sellerId: number,
  data: Partial<BankingInformation>
): Promise<BankingInformation> {
  // Check if banking information exists
  const existing = await getBankingInformation(sellerId);

  if (existing) {
    // Update existing information
    const [updatedInfo] = await db
      .update(bankingInformation)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(bankingInformation.sellerId, sellerId))
      .returning();
    return updatedInfo;
  } else {
    // Create new banking information
    return await createBankingInformation({
      sellerId,
      accountHolderName: data.accountHolderName || '',
      accountNumber: data.accountNumber || '',
      bankName: data.bankName || '',
      ifscCode: data.ifscCode || '',
    });
  }
}

/**
 * Delete banking information
 */
export async function deleteBankingInformation(sellerId: number): Promise<void> {
  await db.delete(bankingInformation).where(eq(bankingInformation.sellerId, sellerId));
}

export const sellerBusinessService = {
  getBusinessDetails,
  createBusinessDetails,
  updateBusinessDetails,
  deleteBusinessDetails,
  getBankingInformation,
  createBankingInformation,
  updateBankingInformation,
  deleteBankingInformation,
};
