import { db } from '@server/db/connect';
import {
  categories,
  subcategories,
  products,
  productVariants,
  users,
  addresses,
  orders,
  orderItems,
  carts,
  cartItems,
  wishlists,
} from '@server/db/schema';
import { dummyCategories } from './dummyCategories';
import { dummySubcategories } from './dummySubcategories';
import { dummyProducts } from './dummyProducts';
import { dummyProductVariants } from './dummyProductVariants';
import { dummyUsers } from './dummyUsers';
import { dummyAddresses } from './dummyAddresses';
import { dummyOrders, dummyOrderItems } from './dummyOrders';
import { dummyCartItems } from './dummyCart';
import { dummyWishlistItems } from './dummyWishlist';
import { eq } from 'drizzle-orm';
import { userRole } from '@shared/constants';

/**
 * Seed Database
 * Populates the database with dummy data for development
 * Includes: Users, Categories, Subcategories, Products, Product Variants, Addresses, Orders, Cart, Wishlist
 */
export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Check if data already exists
    const existingUsers = await db.select().from(users);

    if (existingUsers.length > 0) {
      console.log('✅ Database already seeded. Skipping...');
      return;
    }

    // 1. Seed Development Users (buyer, seller, delivery partner, admin)
    console.log('👥 Seeding development users...');
    const insertedUsers = await db.insert(users).values(dummyUsers).returning();
    console.log(`✅ Inserted ${insertedUsers.length} users`);

    const sellerId = insertedUsers.find((u) => u.role === userRole.SELLER)?.id || 2;
    console.log(
      `📌 Seller ID: ${sellerId} (${insertedUsers.find((u) => u.id === sellerId)?.email})`
    );

    // 2. Seed Addresses
    console.log('📍 Seeding addresses...');
    const insertedAddresses = await db.insert(addresses).values(dummyAddresses).returning();
    console.log(`✅ Inserted ${insertedAddresses.length} addresses`);

    // 3. Seed Categories
    console.log('📦 Seeding categories...');
    const insertedCategories = await db.insert(categories).values(dummyCategories).returning();
    console.log(`✅ Inserted ${insertedCategories.length} categories`);

    // 4. Seed Subcategories
    console.log('📂 Seeding subcategories...');
    const subcategoriesToInsert = dummySubcategories.map((subcat) => {
      const { categoryIndex, ...subcatData } = subcat;
      return {
        ...subcatData,
        categoryId: insertedCategories[categoryIndex].id,
      };
    });
    const insertedSubcategories = await db
      .insert(subcategories)
      .values(subcategoriesToInsert)
      .returning();
    console.log(`✅ Inserted ${insertedSubcategories.length} subcategories`);

    // 5. Seed Products (assign to seller user ID: 2)
    console.log('🛍️  Seeding products...');
    const productsToInsert = dummyProducts.map((product) => {
      const categoryIndex = Math.min(product.categoryId - 1, insertedCategories.length - 1);
      const { discount, specifications, images, ...productWithoutDiscountAndSpecs } = product;
      const rawPrice =
        typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price);
      const price = Math.round(rawPrice);

      // Find appropriate subcategory
      const subcategoryForCategory = insertedSubcategories.find(
        (sc) => sc.categoryId === insertedCategories[categoryIndex]?.id
      );

      return {
        ...productWithoutDiscountAndSpecs,
        price,
        specifications: specifications ? JSON.stringify(specifications) : null,
        imageUrls: images ? JSON.stringify(images) : null,
        thumbnail: images && images.length > 0 ? images[0] : null,
        sellerId,
        categoryId: insertedCategories[categoryIndex]?.id || insertedCategories[0].id,
        category: insertedCategories[categoryIndex]?.name || insertedCategories[0].name,
        subcategoryId: subcategoryForCategory?.id || null,
        approved: true, // Pre-approve for testing
      };
    });

    const insertedProducts = await db.insert(products).values(productsToInsert).returning();
    console.log(`✅ Inserted ${insertedProducts.length} products`);

    // 6. Seed Product Variants
    console.log('🎨 Seeding product variants...');
    const variantsToInsert = dummyProductVariants.map((variant) => {
      const { productIndex, ...variantData } = variant;
      return {
        ...variantData,
        productId: insertedProducts[productIndex % insertedProducts.length].id,
      };
    });
    const insertedVariants = await db.insert(productVariants).values(variantsToInsert).returning();
    console.log(`✅ Inserted ${insertedVariants.length} product variants`);

    // 7. Seed Orders
    console.log('📦 Seeding orders...');
    const ordersToInsert = dummyOrders.map((order, index) => ({
      ...order,
      addressId: insertedAddresses[0].id, // Use first buyer address
    }));
    const insertedOrders = await db.insert(orders).values(ordersToInsert).returning();
    console.log(`✅ Inserted ${insertedOrders.length} orders`);

    // 8. Seed Order Items (map to actual product IDs)
    console.log('📝 Seeding order items...');
    const orderItemsToInsert = dummyOrderItems.map((item, index) => ({
      ...item,
      orderId: insertedOrders[item.orderId - 1]?.id || insertedOrders[0].id,
      productId: insertedProducts[index % insertedProducts.length].id, // Cycle through products
    }));
    const insertedOrderItems = await db.insert(orderItems).values(orderItemsToInsert).returning();
    console.log(`✅ Inserted ${insertedOrderItems.length} order items`);

    // 9. Seed Cart (for buyer)
    console.log('🛒 Seeding cart...');
    const [buyerCart] = await db
      .insert(carts)
      .values({ userId: 1 }) // buyer@test.com
      .returning();
    console.log(`✅ Created cart for buyer`);

    // 10. Seed Cart Items
    console.log('🛒 Seeding cart items...');
    const cartItemsToInsert = dummyCartItems.map((item, index) => ({
      cartId: buyerCart.id,
      productId: insertedProducts[(index + 4) % insertedProducts.length].id,
      quantity: item.quantity,
      price: insertedProducts[(index + 4) % insertedProducts.length].price.toString(),
    }));
    const insertedCartItems = await db.insert(cartItems).values(cartItemsToInsert).returning();
    console.log(`✅ Inserted ${insertedCartItems.length} cart items`);

    // 11. Seed Wishlist Items (for buyer)
    console.log('❤️  Seeding wishlist items...');
    const wishlistItemsToInsert = dummyWishlistItems.map((item, index) => ({
      ...item,
      productId: insertedProducts[(index + 7) % insertedProducts.length].id,
    }));
    const insertedWishlistItems = await db
      .insert(wishlists)
      .values(wishlistItemsToInsert)
      .returning();
    console.log(`✅ Inserted ${insertedWishlistItems.length} wishlist items`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Development Users Created:');
    console.log('   Buyer:    buyer@test.com (no OTP required)');
    console.log(`   Seller:   seller@test.com (no OTP required) - ID: ${sellerId}`);
    console.log('   Delivery: delivery@test.com (no OTP required)');
    console.log('   Admin:    admin@test.com (no OTP required)');
    console.log('\n📊 Data Summary:');
    console.log(`   Categories: ${insertedCategories.length}`);
    console.log(`   Subcategories: ${insertedSubcategories.length}`);
    console.log(`   Products: ${insertedProducts.length}`);
    console.log(`   Product Variants: ${insertedVariants.length}`);
    console.log(`   Orders: ${insertedOrders.length}`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

/**
 * Clear all seed data
 */
export async function clearSeedData() {
  console.log('🗑️  Clearing seed data...');

  try {
    // Delete in reverse order due to foreign key constraints
    await db.delete(wishlists);
    await db.delete(cartItems);
    await db.delete(carts);
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(productVariants);
    await db.delete(products);
    await db.delete(subcategories);
    await db.delete(addresses);
    await db.delete(categories);
    await db.delete(users);

    console.log('✅ Seed data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing seed data:', error);
    throw error;
  }
}
