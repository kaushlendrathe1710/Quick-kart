import { clearSeedData } from './index';

/**
 * Clear Seed Data Runner
 * Run with: npm run db:seed:clear
 */
async function main() {
  console.log('🚀 Starting seed data cleanup...\n');

  // Ask for confirmation
  const confirmation = process.argv.includes('--force');

  if (!confirmation) {
    console.log('⚠️  WARNING: This will delete all seed data from the database!');
    console.log('To proceed, run: npm run db:seed:clear -- --force\n');
    process.exit(0);
  }

  try {
    await clearSeedData();
    console.log('\n✅ Cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  }
}

main();
