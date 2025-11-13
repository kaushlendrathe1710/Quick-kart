import { db } from '@server/db/connect';
import { eq, and, desc, sql } from 'drizzle-orm';
import { wallets, walletTransactions, payouts } from '@server/db/schema';
import type {
  Wallet,
  NewWallet,
  WalletTransaction,
  NewWalletTransaction,
  Payout,
  NewPayout,
} from '@server/db/schema';

/**
 * ==================== WALLET OPERATIONS ====================
 */

/**
 * Get wallet by ID
 */
export async function getWalletById(id: number): Promise<Wallet | undefined> {
  const result = await db.select().from(wallets).where(eq(wallets.id, id));
  return result[0];
}

/**
 * Get wallet by delivery partner ID
 */
export async function getWalletByPartnerId(deliveryPartnerId: number): Promise<Wallet | undefined> {
  const result = await db
    .select()
    .from(wallets)
    .where(eq(wallets.deliveryPartnerId, deliveryPartnerId));
  return result[0];
}

/**
 * Create wallet
 */
export async function createWallet(data: NewWallet): Promise<Wallet> {
  const [newWallet] = await db.insert(wallets).values(data).returning();
  return newWallet;
}

/**
 * Update wallet balance
 */
export async function updateWalletBalance(
  id: number,
  amount: number,
  type: 'add' | 'deduct'
): Promise<Wallet | undefined> {
  const wallet = await getWalletById(id);
  if (!wallet) return undefined;

  const newBalance =
    type === 'add' ? Number(wallet.balance) + amount : Number(wallet.balance) - amount;

  const [updatedWallet] = await db
    .update(wallets)
    .set({
      balance: newBalance.toString(),
      totalEarnings:
        type === 'add' ? (Number(wallet.totalEarnings) + amount).toString() : wallet.totalEarnings,
      totalWithdrawn:
        type === 'deduct'
          ? (Number(wallet.totalWithdrawn) + amount).toString()
          : wallet.totalWithdrawn,
      updatedAt: new Date(),
    })
    .where(eq(wallets.id, id))
    .returning();

  return updatedWallet;
}

/**
 * Check if wallet exists for delivery partner
 */
export async function walletExists(deliveryPartnerId: number): Promise<boolean> {
  const result = await db
    .select({ id: wallets.id })
    .from(wallets)
    .where(eq(wallets.deliveryPartnerId, deliveryPartnerId));
  return result.length > 0;
}

/**
 * ==================== TRANSACTION OPERATIONS ====================
 */

/**
 * Get transaction by ID
 */
export async function getTransactionById(id: number): Promise<WalletTransaction | undefined> {
  const result = await db.select().from(walletTransactions).where(eq(walletTransactions.id, id));
  return result[0];
}

/**
 * Get transactions by wallet ID
 */
export async function getTransactionsByWalletId(
  walletId: number,
  options?: { limit?: number; offset?: number }
): Promise<WalletTransaction[]> {
  const query = db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.walletId, walletId))
    .orderBy(desc(walletTransactions.createdAt));

  if (options?.limit) {
    query.limit(options.limit);
  }
  if (options?.offset) {
    query.offset(options.offset);
  }

  return await query;
}

/**
 * Create transaction
 */
export async function createTransaction(data: NewWalletTransaction): Promise<WalletTransaction> {
  const [newTransaction] = await db.insert(walletTransactions).values(data).returning();

  // Update wallet balance based on transaction type
  if (data.status === 'completed') {
    if (data.type === 'received' || data.type === 'bonus') {
      await updateWalletBalance(data.walletId, Number(data.amount), 'add');
    } else if (data.type === 'deducted') {
      await updateWalletBalance(data.walletId, Number(data.amount), 'deduct');
    }
  }

  return newTransaction;
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  id: number,
  status: string
): Promise<WalletTransaction | undefined> {
  const [updatedTransaction] = await db
    .update(walletTransactions)
    .set({
      status: status as any,
      updatedAt: new Date(),
    })
    .where(eq(walletTransactions.id, id))
    .returning();
  return updatedTransaction;
}

/**
 * ==================== PAYOUT OPERATIONS ====================
 */

/**
 * Get payout by ID
 */
export async function getPayoutById(id: number): Promise<Payout | undefined> {
  const result = await db.select().from(payouts).where(eq(payouts.id, id));
  return result[0];
}

/**
 * Get payouts by wallet ID
 */
export async function getPayoutsByWalletId(
  walletId: number,
  options?: { limit?: number; offset?: number }
): Promise<Payout[]> {
  const query = db
    .select()
    .from(payouts)
    .where(eq(payouts.walletId, walletId))
    .orderBy(desc(payouts.appliedAt));

  if (options?.limit) {
    query.limit(options.limit);
  }
  if (options?.offset) {
    query.offset(options.offset);
  }

  return await query;
}

/**
 * Get pending payouts
 */
export async function getPendingPayouts(options?: {
  limit?: number;
  offset?: number;
}): Promise<Payout[]> {
  const query = db
    .select()
    .from(payouts)
    .where(eq(payouts.status, 'applied'))
    .orderBy(desc(payouts.appliedAt));

  if (options?.limit) {
    query.limit(options.limit);
  }
  if (options?.offset) {
    query.offset(options.offset);
  }

  return await query;
}

/**
 * Create payout (apply for payout)
 */
export async function createPayout(data: NewPayout): Promise<Payout> {
  const [newPayout] = await db.insert(payouts).values(data).returning();
  return newPayout;
}

/**
 * Update payout status
 */
export async function updatePayoutStatus(
  id: number,
  status: string,
  data?: {
    paymentReferenceId?: string;
    paymentMethod?: string;
    rejectionReason?: string;
  }
): Promise<Payout | undefined> {
  const updateData: any = {
    status: status as any,
    updatedAt: new Date(),
  };

  if (status === 'processing') {
    updateData.processedAt = new Date();
  } else if (status === 'paid') {
    updateData.paidAt = new Date();
  }

  if (data?.paymentReferenceId) {
    updateData.paymentReferenceId = data.paymentReferenceId;
  }
  if (data?.paymentMethod) {
    updateData.paymentMethod = data.paymentMethod;
  }
  if (data?.rejectionReason) {
    updateData.rejectionReason = data.rejectionReason;
  }

  const [updatedPayout] = await db
    .update(payouts)
    .set(updateData)
    .where(eq(payouts.id, id))
    .returning();

  // If payout is paid, deduct from wallet balance
  if (status === 'paid' && updatedPayout) {
    await updateWalletBalance(updatedPayout.walletId, Number(updatedPayout.amount), 'deduct');
  }

  return updatedPayout;
}

/**
 * Get payout statistics
 */
export async function getPayoutStats(walletId: number) {
  const stats = await db
    .select({
      totalPayouts: sql<number>`count(*)::int`,
      totalPaidAmount: sql<string>`coalesce(sum(case when ${payouts.status} = 'paid' then ${payouts.amount} else 0 end), 0)`,
      pendingPayouts: sql<number>`count(case when ${payouts.status} = 'applied' then 1 end)::int`,
      pendingAmount: sql<string>`coalesce(sum(case when ${payouts.status} = 'applied' then ${payouts.amount} else 0 end), 0)`,
    })
    .from(payouts)
    .where(eq(payouts.walletId, walletId));

  return stats[0];
}

export const walletService = {
  // Wallet
  getWalletById,
  getWalletByPartnerId,
  createWallet,
  updateWalletBalance,
  walletExists,
  // Transactions
  getTransactionById,
  getTransactionsByWalletId,
  createTransaction,
  updateTransactionStatus,
  // Payouts
  getPayoutById,
  getPayoutsByWalletId,
  getPendingPayouts,
  createPayout,
  updatePayoutStatus,
  getPayoutStats,
};
