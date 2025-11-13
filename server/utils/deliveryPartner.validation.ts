import { z } from 'zod';
import {
  VEHICLE_TYPES,
  FUEL_TYPES,
  ACCOUNT_TYPES,
  DELIVERY_STATUS,
  ISSUE_TYPES,
  TICKET_STATUS,
  MIN_RATING,
  MAX_RATING,
} from '@shared/constants';

/**
 * Delivery Partner Documents Validation Schemas
 */
export const createDocumentsSchema = z.object({
  body: z.object({
    aadharNumber: z.string().optional(),
    panNumber: z.string().optional(),
    licenseNumber: z.string().optional(),
  }),
});

export const updateDocumentsSchema = z.object({
  params: z.object({
    id: z.coerce.number().min(1),
  }),
  body: z.object({
    aadharNumber: z.string().optional(),
    panNumber: z.string().optional(),
    licenseNumber: z.string().optional(),
  }),
});

/**
 * Vehicle Details Validation Schemas
 */
export const createVehicleSchema = z.object({
  body: z.object({
    vehicleType: z.enum([
      VEHICLE_TYPES.MOTORCYCLE,
      VEHICLE_TYPES.SCOOTER,
      VEHICLE_TYPES.BICYCLE,
      VEHICLE_TYPES.CAR,
      VEHICLE_TYPES.VAN,
    ] as const),
    brand: z.string().min(1).max(100),
    model: z.string().min(1).max(100),
    registrationNumber: z.string().min(1).max(20),
    color: z.string().max(50).optional(),
    year: z.coerce
      .number()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .optional(),
    fuelType: z.enum([
      FUEL_TYPES.PETROL,
      FUEL_TYPES.DIESEL,
      FUEL_TYPES.ELECTRIC,
      FUEL_TYPES.CNG,
      FUEL_TYPES.HYBRID,
    ] as const),
  }),
});

export const updateVehicleSchema = z.object({
  params: z.object({
    id: z.coerce.number().min(1),
  }),
  body: z.object({
    vehicleType: z
      .enum([
        VEHICLE_TYPES.MOTORCYCLE,
        VEHICLE_TYPES.SCOOTER,
        VEHICLE_TYPES.BICYCLE,
        VEHICLE_TYPES.CAR,
        VEHICLE_TYPES.VAN,
      ] as const)
      .optional(),
    brand: z.string().min(1).max(100).optional(),
    model: z.string().min(1).max(100).optional(),
    registrationNumber: z.string().min(1).max(20).optional(),
    color: z.string().max(50).optional(),
    year: z.coerce
      .number()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .optional(),
    fuelType: z
      .enum([
        FUEL_TYPES.PETROL,
        FUEL_TYPES.DIESEL,
        FUEL_TYPES.ELECTRIC,
        FUEL_TYPES.CNG,
        FUEL_TYPES.HYBRID,
      ] as const)
      .optional(),
  }),
});

/**
 * Bank Details Validation Schemas
 */
export const createBankDetailsSchema = z.object({
  body: z.object({
    accountHolderName: z.string().min(1).max(200),
    accountNumber: z.string().min(8).max(30),
    ifscCode: z
      .string()
      .length(11)
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
    bankName: z.string().min(1).max(200),
    branchName: z.string().max(200).optional(),
    accountType: z.enum([ACCOUNT_TYPES.SAVINGS, ACCOUNT_TYPES.CURRENT] as const),
    upiId: z.string().max(100).optional(),
  }),
});

export const updateBankDetailsSchema = z.object({
  params: z.object({
    id: z.coerce.number().min(1),
  }),
  body: z.object({
    accountHolderName: z.string().min(1).max(200).optional(),
    accountNumber: z.string().min(8).max(30).optional(),
    ifscCode: z
      .string()
      .length(11)
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format')
      .optional(),
    bankName: z.string().min(1).max(200).optional(),
    branchName: z.string().max(200).optional(),
    accountType: z.enum([ACCOUNT_TYPES.SAVINGS, ACCOUNT_TYPES.CURRENT] as const).optional(),
    upiId: z.string().max(100).optional(),
  }),
});

/**
 * Delivery Validation Schemas
 */
const locationSchema = z.object({
  address: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
});

export const createDeliverySchema = z.object({
  body: z.object({
    orderId: z.number().min(1),
    deliveryPartnerId: z.number().min(1).optional(),
    pickupLocation: locationSchema,
    dropLocation: locationSchema,
    buyerId: z.number().min(1),
    deliveryFee: z.number().min(0),
    status: z
      .enum([
        DELIVERY_STATUS.PENDING,
        DELIVERY_STATUS.ASSIGNED,
        DELIVERY_STATUS.IN_PROGRESS,
        DELIVERY_STATUS.PICKED_UP,
        DELIVERY_STATUS.OUT_FOR_DELIVERY,
        DELIVERY_STATUS.DELIVERED,
        DELIVERY_STATUS.CANCELLED,
        DELIVERY_STATUS.FAILED,
      ] as const)
      .optional(),
  }),
});

export const updateDeliverySchema = z.object({
  params: z.object({
    id: z.coerce.number().min(1),
  }),
  body: z.object({
    deliveryPartnerId: z.number().min(1).optional(),
    status: z
      .enum([
        DELIVERY_STATUS.PENDING,
        DELIVERY_STATUS.ASSIGNED,
        DELIVERY_STATUS.IN_PROGRESS,
        DELIVERY_STATUS.PICKED_UP,
        DELIVERY_STATUS.OUT_FOR_DELIVERY,
        DELIVERY_STATUS.DELIVERED,
        DELIVERY_STATUS.CANCELLED,
        DELIVERY_STATUS.FAILED,
      ] as const)
      .optional(),
    tip: z.number().min(0).optional(),
    cancellationReason: z.string().optional(),
  }),
});

/**
 * Delivery Rating Validation Schemas
 */
export const createDeliveryRatingSchema = z.object({
  body: z.object({
    deliveryId: z.number().min(1),
    deliveryPartnerId: z.number().min(1),
    rating: z.number().min(MIN_RATING).max(MAX_RATING),
    feedback: z.string().max(1000).optional(),
  }),
});

export const updateDeliveryRatingSchema = z.object({
  params: z.object({
    id: z.coerce.number().min(1),
  }),
  body: z.object({
    rating: z.number().min(MIN_RATING).max(MAX_RATING).optional(),
    feedback: z.string().max(1000).optional(),
  }),
});

/**
 * Wallet Validation Schemas
 */
export const createWalletSchema = z.object({
  body: z.object({
    deliveryPartnerId: z.number().min(1),
  }),
});

/**
 * Payout Validation Schemas
 */
export const applyPayoutSchema = z.object({
  body: z.object({
    amount: z.number().min(1),
  }),
});

export const updatePayoutSchema = z.object({
  params: z.object({
    id: z.coerce.number().min(1),
  }),
  body: z.object({
    paymentReferenceId: z.string().optional(),
    paymentMethod: z.string().optional(),
    rejectionReason: z.string().optional(),
  }),
});

/**
 * Ticket Validation Schemas
 */
export const createTicketSchema = z.object({
  body: z.object({
    issueType: z.enum([
      ISSUE_TYPES.PAYMENT_ISSUE,
      ISSUE_TYPES.TECHNICAL_PROBLEM,
      ISSUE_TYPES.ACCOUNT_RELATED,
      ISSUE_TYPES.DELIVERY_ISSUE,
      ISSUE_TYPES.VEHICLE_ISSUE,
      ISSUE_TYPES.OTHER,
    ] as const),
    subject: z.string().min(1).max(200),
    description: z.string().min(10).max(2000),
  }),
});

export const updateTicketSchema = z.object({
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
