import { db } from '@server/db/connect';
import { eq } from 'drizzle-orm';
import { User } from '@shared/types/index';
import { users } from '@server/db/schema';
import { userRole } from '@shared/constants';
import session from 'express-session';
import connectPg from 'connect-pg-simple';

const PostgresSessionStore = connectPg(session);
export const sessionStore = new PostgresSessionStore({
  conObject: {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
  createTableIfMissing: true,
});

// User operations
export async function getUserById(id: number): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0];
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.email, email));
  return result[0];
}

/**
 * Create a basic user with only email (for OTP flow)
 */
export async function createBasicUser(email: string): Promise<User> {
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      role: userRole.USER,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      isApproved: false,
    })
    .returning();

  return newUser;
}

/**
 * Update user profile with name and contact number
 */
export async function updateUserProfile(
  userId: number,
  data: {
    name: string;
    contactNumber: string;
    role?: string;
  }
): Promise<User | undefined> {
  const [updatedUser] = await db
    .update(users)
    .set({
      name: data.name,
      contactNumber: data.contactNumber,
      role: data.role || userRole.USER,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return updatedUser;
}

/**
 * Check if user has completed profile
 */
export async function hasCompletedProfile(userId: number): Promise<boolean> {
  const user = await getUserById(userId);
  return !!(user && user.name && user.contactNumber);
}

// Export a grouped service object for convenience while keeping named exports
export const userService = {
  // session store
  sessionStore,

  // user functions
  getUserById,
  getUserByEmail,
  createBasicUser,
  updateUserProfile,
  hasCompletedProfile,
};
