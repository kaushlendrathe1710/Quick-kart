/**
 * Dummy Products Data
 * 10 sample products for seeding the database
 * Note: categoryId and sellerId will be set dynamically during seeding
 */

export const dummyProducts = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
    categoryId: 1, // Electronics
    price: '79.99',
    discount: '15',
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400',
    ],
    specifications: {
      brand: 'AudioTech',
      color: 'Black',
      connectivity: 'Bluetooth 5.0',
      batteryLife: '30 hours',
      weight: '250g',
    },
    rating: '4.5',
    reviewCount: 128,
    isActive: true,
  },
  {
    name: 'Smart Watch Series 5',
    description: 'Advanced fitness tracker with heart rate monitor and GPS',
    categoryId: 1, // Electronics
    price: '299.99',
    discount: '10',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400',
    ],
    specifications: {
      brand: 'TechWear',
      display: '1.4 inch AMOLED',
      waterResistant: 'Yes',
      batteryLife: '7 days',
      features: 'GPS, Heart Rate Monitor, Sleep Tracking',
    },
    rating: '4.7',
    reviewCount: 256,
    isActive: true,
  },
  {
    name: "Men's Cotton Polo Shirt",
    description: 'Classic fit polo shirt made from 100% premium cotton',
    categoryId: 2, // Fashion
    price: '29.99',
    discount: '20',
    stock: 100,
    images: ['https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400'],
    specifications: {
      brand: 'StyleCo',
      material: '100% Cotton',
      fit: 'Classic',
      sizes: 'S, M, L, XL, XXL',
      colors: 'White, Blue, Black, Navy',
    },
    rating: '4.3',
    reviewCount: 89,
    isActive: true,
  },
  {
    name: "Women's Running Shoes",
    description: 'Lightweight and comfortable running shoes with cushioned sole',
    categoryId: 2, // Fashion
    price: '89.99',
    discount: '25',
    stock: 75,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400',
    ],
    specifications: {
      brand: 'SportFit',
      type: 'Running Shoes',
      material: 'Mesh Upper',
      sizes: '5, 6, 7, 8, 9, 10',
      colors: 'Pink, White, Black',
    },
    rating: '4.6',
    reviewCount: 145,
    isActive: true,
  },
  {
    name: 'Stainless Steel Cookware Set',
    description: '10-piece professional-grade stainless steel cookware set',
    categoryId: 3, // Home & Kitchen
    price: '199.99',
    discount: '30',
    stock: 25,
    images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=400'],
    specifications: {
      brand: 'ChefPro',
      pieces: '10',
      material: 'Stainless Steel',
      dishwasherSafe: 'Yes',
      includes: 'Pots, Pans, Lids',
    },
    rating: '4.8',
    reviewCount: 78,
    isActive: true,
  },
  {
    name: 'Coffee Maker Machine',
    description: 'Programmable coffee maker with 12-cup capacity and thermal carafe',
    categoryId: 3, // Home & Kitchen
    price: '79.99',
    discount: '0',
    stock: 40,
    images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400'],
    specifications: {
      brand: 'BrewMaster',
      capacity: '12 cups',
      features: 'Programmable, Auto Shut-off',
      type: 'Drip Coffee Maker',
      color: 'Black/Silver',
    },
    rating: '4.4',
    reviewCount: 156,
    isActive: true,
  },
  {
    name: 'The Psychology of Money',
    description: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel',
    categoryId: 4, // Books
    price: '16.99',
    discount: '0',
    stock: 150,
    images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400'],
    specifications: {
      author: 'Morgan Housel',
      publisher: 'Harriman House',
      pages: '256',
      format: 'Paperback',
      language: 'English',
    },
    rating: '4.9',
    reviewCount: 2340,
    isActive: true,
  },
  {
    name: 'Atomic Habits',
    description: 'An easy & proven way to build good habits & break bad ones by James Clear',
    categoryId: 4, // Books
    price: '14.99',
    discount: '10',
    stock: 200,
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'],
    specifications: {
      author: 'James Clear',
      publisher: 'Avery',
      pages: '320',
      format: 'Paperback',
      language: 'English',
    },
    rating: '4.8',
    reviewCount: 5678,
    isActive: true,
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Non-slip, eco-friendly yoga mat with carrying strap',
    categoryId: 5, // Sports & Fitness
    price: '39.99',
    discount: '15',
    stock: 80,
    images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400'],
    specifications: {
      brand: 'ZenFit',
      dimensions: '72" x 24"',
      thickness: '6mm',
      material: 'TPE (Eco-friendly)',
      colors: 'Purple, Blue, Pink, Green',
    },
    rating: '4.5',
    reviewCount: 234,
    isActive: true,
  },
  {
    name: 'Adjustable Dumbbell Set',
    description: '40lb adjustable dumbbell set perfect for home workouts',
    categoryId: 5, // Sports & Fitness
    price: '149.99',
    discount: '20',
    stock: 35,
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400'],
    specifications: {
      brand: 'PowerFit',
      maxWeight: '40 lbs per dumbbell',
      adjustable: 'Yes (5-40 lbs)',
      material: 'Cast Iron with Rubber Coating',
      includes: 'Dumbbells, Weight Plates, Tray',
    },
    rating: '4.7',
    reviewCount: 189,
    isActive: true,
  },
];
