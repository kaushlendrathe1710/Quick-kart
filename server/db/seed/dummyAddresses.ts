/**
 * Dummy Addresses for Development Users
 */
export const dummyAddresses = [
  // Buyer addresses
  {
    userId: 1, // buyer@test.com
    addressType: 'Home',
    addressLine: '123 Main Street, Apartment 4B',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
    landmark: 'Near Gateway of India',
    contactNumber: '+919876543210',
    latitude: '18.9220',
    longitude: '72.8347',
    isDefault: true,
  },
  {
    userId: 1, // buyer@test.com
    addressType: 'Office',
    addressLine: '456 Business Park, Tower A, Floor 5',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400051',
    country: 'India',
    landmark: 'Near BKC Metro Station',
    contactNumber: '+919876543210',
    latitude: '19.0596',
    longitude: '72.8656',
    isDefault: false,
  },
  // Seller address
  {
    userId: 2, // seller@test.com
    addressType: 'Warehouse',
    addressLine: '789 Industrial Area, Godown 12',
    city: 'Pune',
    state: 'Maharashtra',
    postalCode: '411001',
    country: 'India',
    landmark: 'Near Pune Railway Station',
    contactNumber: '+919876543211',
    latitude: '18.5204',
    longitude: '73.8567',
    isDefault: true,
  },
  // Delivery Partner address
  {
    userId: 3, // delivery@test.com
    addressType: 'Home',
    addressLine: '321 Residential Colony, House 8',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560001',
    country: 'India',
    landmark: 'Near Cubbon Park',
    contactNumber: '+919876543212',
    latitude: '12.9716',
    longitude: '77.5946',
    isDefault: true,
  },
];
