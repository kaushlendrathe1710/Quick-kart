import { db } from '@server/db/connect';
import { eq, and, desc, sql } from 'drizzle-orm';
import { wallets, walletTransactions, withdrawalRequests, payouts } from '@server/db/schema';
import type {
  Wallet,
  NewWallet,
  WalletTransaction,
  NewWalletTransaction,
  WithdrawalRequest,
  NewWithdrawalRequest,
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
 * Get wallet by user ID (supports both seller and delivery partner)
 */
export async function getWalletByUserId(userId: number): Promise<Wallet | undefined> {
  const result = await db.select().from(wallets).where(eq(wallets.userId, userId));
  return result[0];
}

/**
 * Get or create wallet for a user
 */
export async function getOrCreateWallet(
  userId: number,
  userType: 'seller' | 'deliveryPartner'
): Promise<Wallet> {
  const existingWallet = await getWalletByUserId(userId);

  if (existingWallet) {
    return existingWallet;
  }

  const newWallet = await createWallet({
    userId,
    userType,
    balance: '0.00',
    withdrawableBalance: '0.00',
    totalEarnings: '0.00',
    totalWithdrawn: '0.00',
    pendingAmount: '0.00',
  });

  return newWallet;
}

/**
 * Create wallet
 */
export async function createWallet(data: NewWallet): Promise<Wallet> {
  const [newWallet] = await db.insert(wallets).values(data).returning();
  return newWallet;
}

/**
 * Update wallet balance (legacy method for backward compatibility)
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
  const newWithdrawable =
    type === 'add'
      ? Number(wallet.withdrawableBalance) + amount
      : Number(wallet.withdrawableBalance) - amount;

  const [updatedWallet] = await db
    .update(wallets)
    .set({
      balance: newBalance.toString(),
      withdrawableBalance: newWithdrawable.toString(),
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
 * Check if wallet exists for user
 */
export async function walletExists(userId: number): Promise<boolean> {
  const result = await db
    .select({ id: wallets.id })
    .from(wallets)
    .where(eq(wallets.userId, userId));
  return result.length > 0;
}

/**
 * Credit amount to wallet (with transaction recording)
 */
export async function creditWallet(
  walletId: number,
  amount: string,
  transactionData: {
    orderId?: number;
    deliveryId?: number;
    type: 'received' | 'pending' | 'bonus';
    category: string;
    description: string;
    referenceId?: string;
    metadata?: string;
  }
): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
  return await db.transaction(async (tx) => {
    const wallet = await getWalletById(walletId);
    if (!wallet) throw new Error('Wallet not found');

    const amountNum = parseFloat(amount);
    const currentBalance = parseFloat(wallet.balance);
    const currentWithdrawable = parseFloat(wallet.withdrawableBalance);
    const currentEarnings = parseFloat(wallet.totalEarnings);
    const currentPending = parseFloat(wallet.pendingAmount);

    let newBalance = currentBalance;
    let newWithdrawable = currentWithdrawable;
    let newEarnings = currentEarnings;
    let newPending = currentPending;

    if (transactionData.type === 'pending') {
      newPending = currentPending + amountNum;
    } else {
      newBalance = currentBalance + amountNum;
      newWithdrawable = currentWithdrawable + amountNum;
      newEarnings = currentEarnings + amountNum;
    }

    const [updatedWallet] = await tx
      .update(wallets)
      .set({
        balance: newBalance.toFixed(2),
        withdrawableBalance: newWithdrawable.toFixed(2),
        totalEarnings: newEarnings.toFixed(2),
        pendingAmount: newPending.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, walletId))
      .returning();

    const [transaction] = await tx
      .insert(walletTransactions)
      .values({
        walletId,
        orderId: transactionData.orderId,
        deliveryId: transactionData.deliveryId,
        amount: amount,
        type: transactionData.type,
        status: 'completed',
        transactionCategory: transactionData.category,
        description: transactionData.description,
        referenceId: transactionData.referenceId,
        metadata: transactionData.metadata,
      })
      .returning();

    return { wallet: updatedWallet, transaction };
  });
}

/**
 * Debit amount from wallet
 */
export async function debitWallet(
  walletId: number,
  amount: string,
  transactionData: {
    type: 'deducted';
    category: string;
    description: string;
    referenceId?: string;
    metadata?: string;
  }
): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
  return await db.transaction(async (tx) => {
    const wallet = await getWalletById(walletId);
    if (!wallet) throw new Error('Wallet not found');

    const amountNum = parseFloat(amount);
    const currentWithdrawable = parseFloat(wallet.withdrawableBalance);

    if (currentWithdrawable < amountNum) {
      throw new Error('Insufficient withdrawable balance');
    }

    const newBalance = parseFloat(wallet.balance) - amountNum;
    const newWithdrawable = currentWithdrawable - amountNum;
    const newTotalWithdrawn = parseFloat(wallet.totalWithdrawn) + amountNum;

    const [updatedWallet] = await tx
      .update(wallets)
      .set({
        balance: newBalance.toFixed(2),
        withdrawableBalance: newWithdrawable.toFixed(2),
        totalWithdrawn: newTotalWithdrawn.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, walletId))
      .returning();

    const [transaction] = await tx
      .insert(walletTransactions)
      .values({
        walletId,
        amount: amount,
        type: transactionData.type,
        status: 'completed',
        transactionCategory: transactionData.category,
        description: transactionData.description,
        referenceId: transactionData.referenceId,
        metadata: transactionData.metadata,
      })
      .returning();

    return { wallet: updatedWallet, transaction };
  });
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
  options?: { limit?: number; offset?: number; category?: string }
): Promise<WalletTransaction[]> {
  let query = db
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
 * ==================== WITHDRAWAL REQUEST OPERATIONS ====================
 */

/**
 * Create withdrawal request
 */
export async function createWithdrawalRequest(data: {
  walletId: number;
  userId: number;
  userType: 'seller' | 'deliveryPartner';
  amount: string;
  paymentMethod: string;
  accountDetails: string;
}): Promise<WithdrawalRequest> {
  const wallet = await getWalletById(data.walletId);

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  const amountNum = parseFloat(data.amount);
  const withdrawableBalance = parseFloat(wallet.withdrawableBalance);

  if (withdrawableBalance < amountNum) {
    throw new Error('Insufficient withdrawable balance');
  }

  const [withdrawalRequest] = await db
    .insert(withdrawalRequests)
    .values({
      walletId: data.walletId,
      userId: data.userId,
      userType: data.userType,
      amount: data.amount,
      status: 'pending',
      paymentMethod: data.paymentMethod,
      accountDetails: data.accountDetails,
    })
    .returning();

  return withdrawalRequest;
}

/**
 * Get withdrawal requests by user
 */
export async function getWithdrawalRequestsByUser(
  userId: number,
  options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }
): Promise<WithdrawalRequest[]> {
  let query = db
    .select()
    .from(withdrawalRequests)
    .where(eq(withdrawalRequests.userId, userId))
    .orderBy(desc(withdrawalRequests.requestedAt));

  if (options?.limit) {
    query.limit(options.limit);
  }
  if (options?.offset) {
    query.offset(options.offset);
  }

  return await query;
}

/**
 * Get withdrawal request by ID
 */
export async function getWithdrawalRequestById(id: number): Promise<WithdrawalRequest | undefined> {
  const result = await db.select().from(withdrawalRequests).where(eq(withdrawalRequests.id, id));
  return result[0];
}

/**
 * Update withdrawal request status
 */
export async function updateWithdrawalRequestStatus(
  id: number,
  status: string,
  data?: {
    processedBy?: number;
    adminNotes?: string;
    rejectionReason?: string;
    razorpayPayoutId?: string;
    payoutReferenceId?: string;
  }
): Promise<WithdrawalRequest> {
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  if (status === 'processing' || status === 'approved') {
    updateData.processedAt = new Date();
  }

  if (status === 'completed') {
    updateData.completedAt = new Date();
  }

  if (data?.processedBy) updateData.processedBy = data.processedBy;
  if (data?.adminNotes) updateData.adminNotes = data.adminNotes;
  if (data?.rejectionReason) updateData.rejectionReason = data.rejectionReason;
  if (data?.razorpayPayoutId) updateData.razorpayPayoutId = data.razorpayPayoutId;
  if (data?.payoutReferenceId) updateData.payoutReferenceId = data.payoutReferenceId;

  const [updated] = await db
    .update(withdrawalRequests)
    .set(updateData)
    .where(eq(withdrawalRequests.id, id))
    .returning();

  return updated;
}

/**
 * Get all withdrawal requests (for admin)
 */
export async function getAllWithdrawalRequests(options?: {
  limit?: number;
  offset?: number;
  status?: string;
  userType?: string;
}): Promise<WithdrawalRequest[]> {
  let query = db.select().from(withdrawalRequests).orderBy(desc(withdrawalRequests.requestedAt));

  if (options?.limit) {
    query.limit(options.limit);
  }
  if (options?.offset) {
    query.offset(options.offset);
  }

  return await query;
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
 * Get all payouts with optional status filter (for admin)
 */
export async function getAllPayouts(options?: {
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<Payout[]> {
  const baseQuery = db.select().from(payouts);

  let query: any = baseQuery;

  if (options?.status) {
    query = query.where(eq(payouts.status, options.status as any));
  }

  query = query.orderBy(desc(payouts.appliedAt));

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.offset(options.offset);
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
  getWalletByUserId,
  getOrCreateWallet,
  createWallet,
  updateWalletBalance,
  walletExists,
  creditWallet,
  debitWallet,
  // Transactions
  getTransactionById,
  getTransactionsByWalletId,
  createTransaction,
  updateTransactionStatus,
  // Withdrawal Requests
  createWithdrawalRequest,
  getWithdrawalRequestsByUser,
  getWithdrawalRequestById,
  updateWithdrawalRequestStatus,
  getAllWithdrawalRequests,
  // Payouts (legacy, for backward compatibility)
  getPayoutById,
  getPayoutsByWalletId,
  getPendingPayouts,
  getAllPayouts,
  createPayout,
  updatePayoutStatus,
  getPayoutStats,
};
