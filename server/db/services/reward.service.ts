import { db } from '../index';
import { rewards, rewardTransactions, users } from '../schema';
import { eq, sql, desc } from 'drizzle-orm';

/**
 * Adjust user reward points (admin)
 */
export async function adjustUserPoints(data: {
  userId: number;
  points: number;
  description: string;
  adminId: number;
}) {
  // Get or create reward record
  let userReward = await db.query.rewards.findFirst({
    where: eq(rewards.userId, data.userId),
  });

  if (!userReward) {
    // Create new reward record
    const newReward = await db
      .insert(rewards)
      .values({
        userId: data.userId,
        points: 0,
        lifetimePoints: 0,
      })
      .returning();
    userReward = newReward[0];
  }

  // Calculate new points
  const newPoints = Math.max(0, userReward.points + data.points);
  const newLifetimePoints =
    data.points > 0 ? userReward.lifetimePoints + data.points : userReward.lifetimePoints;

  // Update reward points
  await db
    .update(rewards)
    .set({
      points: newPoints,
      lifetimePoints: newLifetimePoints,
      lastUpdated: new Date(),
    })
    .where(eq(rewards.userId, data.userId));

  // Create transaction record
  const transaction = await db
    .insert(rewardTransactions)
    .values({
      userId: data.userId,
      points: data.points,
      type: 'admin_adjustment',
      description: data.description,
      status: 'active',
    })
    .returning();

  return {
    reward: {
      ...userReward,
      points: newPoints,
      lifetimePoints: newLifetimePoints,
    },
    transaction: transaction[0],
  };
}

/**
 * Get reward statistics
 */
export async function getRewardStatistics() {
  try {
    // Total points distributed
    const totalPointsResult = await db
      .select({
        totalPoints: sql<number>`COALESCE(SUM(${rewards.lifetimePoints}), 0)::int`,
        activePoints: sql<number>`COALESCE(SUM(${rewards.points}), 0)::int`,
      })
      .from(rewards);

    // Transaction stats
    const transactionStats = await db
      .select({
        type: rewardTransactions.type,
        count: sql<number>`count(*)::int`,
        totalPoints: sql<number>`COALESCE(SUM(${rewardTransactions.points}), 0)::int`,
      })
      .from(rewardTransactions)
      .groupBy(rewardTransactions.type);

    // Top users by points
    const topUsers = await db
      .select({
        userId: rewards.userId,
        userName: users.name,
        userEmail: users.email,
        points: rewards.points,
        lifetimePoints: rewards.lifetimePoints,
      })
      .from(rewards)
      .leftJoin(users, eq(rewards.userId, users.id))
      .orderBy(desc(rewards.points))
      .limit(10);

    const transactionBreakdown: Record<string, { count: number; points: number }> = {};
    transactionStats.forEach((stat) => {
      transactionBreakdown[stat.type] = {
        count: stat.count,
        points: stat.totalPoints,
      };
    });

    return {
      totalLifetimePoints: totalPointsResult[0]?.totalPoints || 0,
      activePoints: totalPointsResult[0]?.activePoints || 0,
      transactionBreakdown,
      topUsers,
    };
  } catch (error) {
    console.error('Error fetching reward statistics:', error);
    return {
      totalLifetimePoints: 0,
      activePoints: 0,
      transactionBreakdown: {},
      topUsers: [],
    };
  }
}

/**
 * Get user reward details
 */
export async function getUserRewardDetails(userId: number) {
  const reward = await db.query.rewards.findFirst({
    where: eq(rewards.userId, userId),
  });

  const transactions = await db
    .select()
    .from(rewardTransactions)
    .where(eq(rewardTransactions.userId, userId))
    .orderBy(desc(rewardTransactions.transactionDate))
    .limit(50);

  return {
    reward,
    transactions,
  };
}
