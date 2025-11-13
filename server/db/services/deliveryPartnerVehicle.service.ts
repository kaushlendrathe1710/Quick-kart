import { db } from '@server/db/connect';
import { eq } from 'drizzle-orm';
import { deliveryPartnerVehicles } from '@server/db/schema';
import type { DeliveryPartnerVehicle, NewDeliveryPartnerVehicle } from '@server/db/schema';

/**
 * Get vehicle by ID
 */
export async function getVehicleById(id: number): Promise<DeliveryPartnerVehicle | undefined> {
  const result = await db
    .select()
    .from(deliveryPartnerVehicles)
    .where(eq(deliveryPartnerVehicles.id, id));
  return result[0];
}

/**
 * Get vehicle by delivery partner ID
 */
export async function getVehicleByPartnerId(
  deliveryPartnerId: number
): Promise<DeliveryPartnerVehicle | undefined> {
  const result = await db
    .select()
    .from(deliveryPartnerVehicles)
    .where(eq(deliveryPartnerVehicles.deliveryPartnerId, deliveryPartnerId));
  return result[0];
}

/**
 * Get vehicle by registration number
 */
export async function getVehicleByRegistration(
  registrationNumber: string
): Promise<DeliveryPartnerVehicle | undefined> {
  const result = await db
    .select()
    .from(deliveryPartnerVehicles)
    .where(eq(deliveryPartnerVehicles.registrationNumber, registrationNumber));
  return result[0];
}

/**
 * Create vehicle
 */
export async function createVehicle(
  data: NewDeliveryPartnerVehicle
): Promise<DeliveryPartnerVehicle> {
  const [newVehicle] = await db.insert(deliveryPartnerVehicles).values(data).returning();
  return newVehicle;
}

/**
 * Update vehicle
 */
export async function updateVehicle(
  id: number,
  data: Partial<Omit<NewDeliveryPartnerVehicle, 'deliveryPartnerId'>>
): Promise<DeliveryPartnerVehicle | undefined> {
  const [updatedVehicle] = await db
    .update(deliveryPartnerVehicles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(deliveryPartnerVehicles.id, id))
    .returning();
  return updatedVehicle;
}

/**
 * Delete vehicle
 */
export async function deleteVehicle(id: number): Promise<boolean> {
  const result = await db
    .delete(deliveryPartnerVehicles)
    .where(eq(deliveryPartnerVehicles.id, id))
    .returning();
  return result.length > 0;
}

/**
 * Check if vehicle exists for a delivery partner
 */
export async function vehicleExists(deliveryPartnerId: number): Promise<boolean> {
  const result = await db
    .select({ id: deliveryPartnerVehicles.id })
    .from(deliveryPartnerVehicles)
    .where(eq(deliveryPartnerVehicles.deliveryPartnerId, deliveryPartnerId));
  return result.length > 0;
}

export const deliveryPartnerVehicleService = {
  getVehicleById,
  getVehicleByPartnerId,
  getVehicleByRegistration,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  vehicleExists,
};
