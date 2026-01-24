/**
 * Seller Ticket Types
 */

// Seller Ticket Issue Types
export type SellerIssueType =
  | 'product_related'
  | 'order_issue'
  | 'payment_issue'
  | 'account_related'
  | 'technical_problem'
  | 'payout_issue'
  | 'other';

// Ticket Status (shared with delivery partner tickets)
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

/**
 * Seller Ticket Data Interface
 */
export interface SellerTicketData {
  sellerId: number;
  issueType: SellerIssueType;
  subject: string;
  description: string;
  status: TicketStatus;
  adminResponse?: string;
  adminId?: number;
}

/**
 * Create Seller Ticket Request
 */
export interface CreateSellerTicketRequest {
  issueType: SellerIssueType;
  subject: string;
  description: string;
}

/**
 * Update Seller Ticket Request (Admin)
 */
export interface UpdateSellerTicketRequest {
  status?: TicketStatus;
  adminResponse?: string;
}
