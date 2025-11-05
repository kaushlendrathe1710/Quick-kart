import { db } from '@server/db/connect';
import { categories, products, users } from '@server/db/schema';
import { dummyCategories } from './dummyCategories';
import { dummyProducts } from './dummyProducts';
import { eq } from 'drizzle-orm';
import { userRole } from '@shared/constants';

/**
 * Seed Database
 * Populates the database with dummy categories and products
 */
export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Check if categories already exist
    const existingCategories = await db.select().from(categories);

    if (existingCategories.length > 0) {
      console.log('✅ Database already seeded. Skipping...');
      return;
    }

    // 1. Seed Categories
    console.log('📦 Seeding categories...');
    const insertedCategories = await db.insert(categories).values(dummyCategories).returning();
    console.log(`✅ Inserted ${insertedCategories.length} categories`);

    // 2. Find or create a seller user for products
    console.log('👤 Finding seller user...');
    let sellerUser = await db.select().from(users).where(eq(users.role, userRole.SELLER)).limit(1);

    if (sellerUser.length === 0) {
      // Create a demo seller if none exists
      console.log('👤 Creating demo seller...');
      const [newSeller] = await db
        .insert(users)
        .values({
          email: 'seller@quickkart.com',
          name: 'Demo Seller',
          role: userRole.SELLER,
          isApproved: true,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seller',
        })
        .returning();
      sellerUser = [newSeller];
    }

    const sellerId = sellerUser[0].id;
    console.log(`✅ Using seller ID: ${sellerId}`);

    // 3. Seed Products
    console.log('🛍️  Seeding products...');
    const productsToInsert = dummyProducts.map((product) => ({
      ...product,
      sellerId,
      categoryId: insertedCategories[product.categoryId - 1].id,
    }));

    const insertedProducts = await db.insert(products).values(productsToInsert).returning();
    console.log(`✅ Inserted ${insertedProducts.length} products`);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

/**
 * Optional: Clear all seed data
 */
export async function clearSeedData() {
  console.log('🗑️  Clearing seed data...');

  try {
    // Delete in reverse order due to foreign key constraints
    await db.delete(products);
    await db.delete(categories);

    console.log('✅ Seed data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing seed data:', error);
    throw error;
  }
}
