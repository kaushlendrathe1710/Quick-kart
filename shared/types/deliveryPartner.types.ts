/**
 * Delivery Partner Types
 */

// Vehicle Types
export type VehicleType = 'motorcycle' | 'scooter' | 'bicycle' | 'car' | 'van';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'cng' | 'hybrid';
export type AccountType = 'savings' | 'current';

// Delivery Status
export type DeliveryStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'failed';

// Transaction Types
export type TransactionType = 'received' | 'pending' | 'deducted' | 'bonus';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'reversed';

// Payout Status
export type PayoutStatus = 'applied' | 'processing' | 'paid' | 'rejected';

// Ticket Types
export type IssueType =
  | 'payment_issue'
  | 'technical_problem'
  | 'account_related'
  | 'delivery_issue'
  | 'vehicle_issue'
  | 'other';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

/**
 * Location Interface
 */
export interface Location {
  address: string;
  lat: number;
  lng: number;
  contactName?: string;
  contactPhone?: string;
}

/**
 * Delivery Partner Document Types
 */
export interface DeliveryPartnerDocumentData {
  deliveryPartnerId: number;
  aadharCard?: string;
  panCard?: string;
  drivingLicense?: string;
  vehicleRegistration?: string;
  insuranceCertificate?: string;
  aadharNumber?: string;
  panNumber?: string;
  licenseNumber?: string;
}

/**
 * Vehicle Details Types
 */
export interface VehicleDetailsData {
  deliveryPartnerId: number;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  registrationNumber: string;
  color?: string;
  year?: number;
  fuelType: FuelType;
  insuranceCertificate?: string;
  pucCertificate?: string;
}

/**
 * Bank Details Types
 */
export interface BankDetailsData {
  deliveryPartnerId: number;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
  accountType: AccountType;
  upiId?: string;
}

/**
 * Delivery Types
 */
export interface DeliveryData {
  orderId: number;
  deliveryPartnerId?: number;
  pickupLocation: Location;
  dropLocation: Location;
  buyerId: number;
  status: DeliveryStatus;
  deliveryFee: number;
  tip?: number;
  ratingId?: number;
  cancellationReason?: string;
}

/**
 * Delivery Rating Types
 */
export interface DeliveryRatingData {
  deliveryId: number;
  deliveryPartnerId: number;
  buyerId: number;
  rating: number;
  feedback?: string;
}

/**
 * Wallet Types
 */
export interface WalletData {
  deliveryPartnerId: number;
  balance: number;
  totalEarnings: number;
  totalWithdrawn: number;
}

/**
 * Wallet Transaction Types
 */
export interface WalletTransactionData {
  walletId: number;
  deliveryId?: number;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
  referenceId?: string;
}

/**
 * Payout Types
 */
export interface PayoutData {
  walletId: number;
  amount: number;
  status: PayoutStatus;
  paymentReferenceId?: string;
  paymentMethod?: string;
  rejectionReason?: string;
}

/**
 * Ticket Types
 */
export interface TicketData {
  deliveryPartnerId: number;
  issueType: IssueType;
  subject: string;
  description: string;
  status: TicketStatus;
  adminResponse?: string;
  adminId?: number;
}
