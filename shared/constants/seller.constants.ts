/**
 * Seller Constants
 */

// Seller Issue Types
export const SELLER_ISSUE_TYPES = {
  PRODUCT_RELATED: 'product_related',
  ORDER_ISSUE: 'order_issue',
  PAYMENT_ISSUE: 'payment_issue',
  ACCOUNT_RELATED: 'account_related',
  TECHNICAL_PROBLEM: 'technical_problem',
  PAYOUT_ISSUE: 'payout_issue',
  OTHER: 'other',
} as const;

// Note: TICKET_STATUS is exported from deliveryPartner.constants.ts to avoid duplication

// Seller Issue Type Labels
export const SELLER_ISSUE_TYPE_LABELS: Record<string, string> = {
  product_related: 'Product Related',
  order_issue: 'Order Issue',
  payment_issue: 'Payment Issue',
  account_related: 'Account Related',
  technical_problem: 'Technical Problem',
  payout_issue: 'Payout Issue',
  other: 'Other',
};

// Note: TICKET_STATUS_LABELS is exported from deliveryPartner.constants.ts to avoid duplication
