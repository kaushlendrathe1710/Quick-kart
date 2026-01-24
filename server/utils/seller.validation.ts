import { z } from 'zod';

/**
 * Seller Ticket Issue Types
 */
export const SELLER_ISSUE_TYPES = {
  PRODUCT_RELATED: 'product_related',
  ORDER_ISSUE: 'order_issue',
  PAYMENT_ISSUE: 'payment_issue',
  ACCOUNT_RELATED: 'account_related',
  TECHNICAL_PROBLEM: 'technical_problem',
  PAYOUT_ISSUE: 'payout_issue',
  OTHER: 'other',
} as const;

/**
 * Ticket Status
 */
export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

/**
 * Seller Ticket Validation Schemas
 */
export const createSellerTicketSchema = z.object({
  body: z.object({
    issueType: z.enum([
      SELLER_ISSUE_TYPES.PRODUCT_RELATED,
      SELLER_ISSUE_TYPES.ORDER_ISSUE,
      SELLER_ISSUE_TYPES.PAYMENT_ISSUE,
      SELLER_ISSUE_TYPES.ACCOUNT_RELATED,
      SELLER_ISSUE_TYPES.TECHNICAL_PROBLEM,
      SELLER_ISSUE_TYPES.PAYOUT_ISSUE,
      SELLER_ISSUE_TYPES.OTHER,
    ] as const),
    subject: z.string().min(1).max(200),
    description: z.string().min(10).max(2000),
  }),
});

export const updateSellerTicketSchema = z.object({
  params: z.object({
    id: z.coerce.number().min(1),
  }),
  body: z.object({
    status: z
      .enum([
        TICKET_STATUS.OPEN,
        TICKET_STATUS.IN_PROGRESS,
        TICKET_STATUS.RESOLVED,
        TICKET_STATUS.CLOSED,
      ] as const)
      .optional(),
    adminResponse: z.string().max(2000).optional(),
    adminId: z.number().min(1).optional(),
  }),
});

/**
 * Common param schemas
 */
export const idParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().min(1),
  }),
});
