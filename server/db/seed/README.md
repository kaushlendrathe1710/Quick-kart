# Database Seed Data

This directory contains seed data for development and testing purposes.

## 🌱 Seed Files Structure

### Users (`dummyUsers.ts`)

- **buyer@test.com** - Test buyer account (ID: 1)
- **seller@test.com** - Test seller account (ID: 2) - Owns all seeded products
- **delivery@test.com** - Test delivery partner (ID: 3)
- **admin@test.com** - Test admin account (ID: 4)

**Development Mode**: These users bypass OTP verification. Use OTP `123456` or any OTP in development.

### Categories & Subcategories

- **5 Main Categories**: Electronics, Fashion, Home & Kitchen, Books, Sports & Fitness
- **17 Subcategories**: Distributed across main categories
  - Electronics: Smartphones, Laptops, Headphones, Cameras
  - Fashion: Men's Clothing, Women's Clothing, Footwear, Accessories
  - Home & Kitchen: Furniture, Kitchen Appliances, Home Decor
  - Books: Fiction, Non-Fiction, Children's Books
  - Sports: Gym Equipment, Outdoor Sports, Yoga & Fitness

### Products (`dummyProducts.ts`)

- Multiple products across all categories
- All products belong to **seller@test.com** (ID: 2)
- Products are pre-approved for immediate testing
- Include realistic pricing, descriptions, and images

### Product Variants (`dummyProductVariants.ts`)

Product variants with different:

- **Colors**: Black, Blue, White, Silver, Pink, etc.
- **Sizes**: S, M, L, XL for clothing; UK 8, 9, 10 for footwear; 128GB, 256GB for electronics
- **Stock Levels**: Varied inventory for testing stock management
- **Variant-specific Pricing**: Different prices for different variants

Example variants:

- Smartphones: Multiple storage options (128GB, 256GB) in different colors
- T-Shirts: Size variations (S, M, L) in multiple colors
- Shoes: Size and color combinations
- Yoga Mats: Thickness and color options

### Addresses (`dummyAddresses.ts`)

- 2 addresses for buyer (Home, Office)
- 1 address for seller (Warehouse)
- 1 address for delivery partner (Home)

### Orders (`dummyOrders.ts`)

4 test orders for buyer@test.com with different statuses:

- **Order 1**: Delivered (with tracking)
- **Order 2**: Shipped (in transit)
- **Order 3**: Processing
- **Order 4**: Pending (can be cancelled)

### Cart & Wishlist

- **Cart**: 3 items for buyer testing checkout flow
- **Wishlist**: 3 items for buyer testing wishlist functionality

## 🚀 Usage

### Seeding the Database

```bash
# Run seed command (configured in package.json)
npm run seed

# Or use the seed function directly
```

### Clearing Seed Data

```bash
# Clear all seed data
npm run seed:clear
```

## 🔐 Development Authentication

In **development mode** (NODE_ENV=development):

1. **No OTP Required**: Test users bypass email OTP verification
2. **Auto-Accept OTP**: Use any OTP (recommended: `123456`)
3. **Instant Login**: Login instantly with test user emails

### Test User Credentials

```
Buyer:
  Email: buyer@test.com
  OTP: 123456 (or any)

Seller:
  Email: seller@test.com
  OTP: 123456 (or any)

Delivery Partner:
  Email: delivery@test.com
  OTP: 123456 (or any)

Admin:
  Email: admin@test.com
  OTP: 123456 (or any)
```

## 📦 Data Relationships

```
Users (4)
├── Addresses (4)
├── Orders (4) [Buyer ↔ Seller]
│   └── Order Items (4)
├── Cart Items (3) [Buyer]
└── Wishlist Items (3) [Buyer]

Categories (5)
└── Subcategories (17)
    └── Products (15+) [All owned by Seller]
        └── Product Variants (17+)
```

## 🛠️ Seller Product Management

All seeded products belong to **seller@test.com** (ID: 2):

- Can edit product details
- Can manage inventory
- Can add/remove product variants
- Can update pricing
- Can approve/reject orders

## ⚙️ Customization

To add more seed data:

1. **Add Users**: Edit `dummyUsers.ts`
2. **Add Categories**: Edit `dummyCategories.ts` and `dummySubcategories.ts`
3. **Add Products**: Edit `dummyProducts.ts`
4. **Add Variants**: Edit `dummyProductVariants.ts`
5. **Add Orders**: Edit `dummyOrders.ts`

Then run `npm run seed` to populate the database.

## 📝 Notes

- All seed data is for **development only**
- Products are pre-approved to skip approval workflow
- Prices are in INR (Indian Rupees)
- Images use Unsplash placeholder URLs
- Foreign key relationships are automatically maintained
- Seed script is idempotent (checks if data exists before seeding)
