import { seedDatabase } from './index';

/**
 * Seed Database Runner
 * Run with: npm run db:seed
 */
async function main() {
  console.log('🚀 Starting database seed process...\n');

  try {
    await seedDatabase();
    console.log('\n✅ Seed process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed process failed:', error);
    process.exit(1);
  }
}

main();
