import { z } from 'zod';
import { wallets, walletTransactions, withdrawalRequests } from '@server/db/schema';

// TypeScript types
export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = typeof walletTransactions.$inferInsert;

export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = typeof withdrawalRequests.$inferInsert;

// Transaction types
export type TransactionType = 'received' | 'pending' | 'deducted' | 'bonus';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'reversed';
export type TransactionCategory =
  | 'order_earning'
  | 'delivery_fee'
  | 'withdrawal'
  | 'bonus'
  | 'refund'
  | 'adjustment';

// Withdrawal status types
export type WithdrawalStatus =
  | 'pending'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'rejected'
  | 'cancelled';

// User type for wallet
export type WalletUserType = 'seller' | 'deliveryPartner';

// Payment method types
export type PaymentMethodType = 'bank_transfer' | 'upi' | 'razorpayx';

// Validation schemas
export const createWithdrawalRequestSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
  paymentMethod: z.enum(['bank_transfer', 'upi']),
  accountDetails: z.string().min(1, 'Account details are required'),
});

export const bankAccountDetailsSchema = z.object({
  accountNumber: z.string().min(9).max(18),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
  accountHolderName: z.string().min(2).max(100),
  bankName: z.string().min(2).max(100),
});

export const upiDetailsSchema = z.object({
  upiId: z.string().regex(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID'),
  upiHolderName: z.string().min(2).max(100),
});

// Request/Response types
export interface WalletSummary {
  wallet: Wallet;
  recentTransactions: WalletTransaction[];
  pendingWithdrawals: WithdrawalRequest[];
}

export interface TransactionListResponse {
  transactions: WalletTransaction[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages?: number;
  };
}

export interface WithdrawalListResponse {
  withdrawalRequests: WithdrawalRequest[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages?: number;
  };
}

export interface CreateWithdrawalRequestInput {
  amount: string;
  paymentMethod: PaymentMethodType;
  accountDetails: string; // JSON string
}

export interface ApproveWithdrawalInput {
  adminNotes?: string;
  payoutReferenceId?: string;
  razorpayPayoutId?: string;
}

export interface RejectWithdrawalInput {
  rejectionReason: string;
  adminNotes?: string;
}

export type CreateWithdrawalRequest = z.infer<typeof createWithdrawalRequestSchema>;
export type BankAccountDetails = z.infer<typeof bankAccountDetailsSchema>;
export type UpiDetails = z.infer<typeof upiDetailsSchema>;
