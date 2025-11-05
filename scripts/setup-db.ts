#!/usr/bin/env tsx
import { execSync } from 'child_process';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

// Helper function to ask yes/no questions
function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    })
  );
}

// Execute command and display output
function runCommand(command: string, description: string) {
  console.log(`\n⏳ ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} - Done!`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} - Failed!`);
    return false;
  }
}

// Check if .env file exists
function checkEnvFile(): boolean {
  const envPath = path.join(process.cwd(), '.env');
  return fs.existsSync(envPath);
}

// Check if DATABASE_URL is configured
function checkDatabaseUrl(): boolean {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return false;

  const envContent = fs.readFileSync(envPath, 'utf8');
  return envContent.includes('DATABASE_URL=') && !envContent.includes('DATABASE_URL=""');
}

async function main() {
  console.clear();
  console.log('='.repeat(80));
  console.log('🚀 KEORA DATABASE SETUP');
  console.log('='.repeat(80));
  console.log('\nThis script will help you set up your database for local development.');
  console.log('\n📋 Steps:');
  console.log('   1. Check environment configuration');
  console.log('   2. Generate Prisma Client');
  console.log('   3. Push database schema');
  console.log('   4. Seed test users (optional)');
  console.log('\n' + '='.repeat(80) + '\n');

  // Step 1: Check environment
  console.log('📝 Step 1: Checking environment configuration...\n');

  if (!checkEnvFile()) {
    console.log('❌ .env file not found!\n');
    console.log('Please create a .env file first:');
    console.log('   1. Copy .env.example: cp .env.example .env');
    console.log('   2. Configure DATABASE_URL and other variables');
    console.log('   3. Run this script again\n');
    process.exit(1);
  }

  if (!checkDatabaseUrl()) {
    console.log('❌ DATABASE_URL not configured in .env file!\n');
    console.log('Please configure your database connection:');
    console.log('   DATABASE_URL="postgresql://user:password@localhost:5432/keora"\n');
    process.exit(1);
  }

  console.log('✅ Environment configuration looks good!\n');

  // Ask if user wants to proceed
  const proceed = await askQuestion('📝 Do you want to continue with database setup? (y/n): ');
  if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
    console.log('\n⏭️  Setup cancelled.\n');
    process.exit(0);
  }

  // Step 2: Generate Prisma Client
  console.log('\n' + '─'.repeat(80));
  console.log('📝 Step 2: Generating Prisma Client...');
  console.log('─'.repeat(80));

  if (!runCommand('npx prisma generate', 'Generating Prisma Client')) {
    console.log('\n❌ Failed to generate Prisma Client. Please check the error above.\n');
    process.exit(1);
  }

  // Step 3: Push schema to database
  console.log('\n' + '─'.repeat(80));
  console.log('📝 Step 3: Pushing database schema...');
  console.log('─'.repeat(80));
  console.log('\n⚠️  This will create/update database tables based on your Prisma schema.');

  const pushSchema = await askQuestion('\n📝 Do you want to push the schema to the database? (y/n): ');
  if (pushSchema.toLowerCase() === 'y' || pushSchema.toLowerCase() === 'yes') {
    if (!runCommand('npx prisma db push', 'Pushing database schema')) {
      console.log('\n❌ Failed to push schema. Please check the error above.\n');
      process.exit(1);
    }
  } else {
    console.log('\n⏭️  Skipping schema push.');
  }

  // Step 4: Seed test users
  console.log('\n' + '─'.repeat(80));
  console.log('📝 Step 4: Seed test users and sample data...');
  console.log('─'.repeat(80));
  console.log('\n📋 This will create comprehensive test data for development:');
  console.log('\n👥 Admin Users (3):');
  console.log('   • Super Admin - Full system access');
  console.log('   • Moderator - Content moderation');
  console.log('   • Support - User support functions');
  console.log('\n👤 App Users (8):');
  console.log('   • 1 Unverified user (for testing signup/verification)');
  console.log('   • 1 Verified user (no family data - for testing tree creation)');
  console.log('   • 6 Verified users with complete family trees');
  console.log('\n🌳 Family Data:');
  console.log('   • Each user with family data gets 12 members (3 generations)');
  console.log('   • Includes grandparents, parents, siblings, spouse, children');
  console.log('   • Complete relationships between all family members');
  console.log('\n🔗 Link Requests:');
  console.log('   • Sample pending, approved, and rejected link requests');
  console.log('   • Tests connection functionality between users');
  console.log('\n🔔 Notifications:');
  console.log('   • Welcome messages and link request notifications');
  console.log('   • Tests notification system');

  const seedUsers = await askQuestion('\n📝 Do you want to create all this test data? (y/n): ');
  if (seedUsers.toLowerCase() === 'y' || seedUsers.toLowerCase() === 'yes') {
    if (!runCommand('npm run db:seed', 'Creating comprehensive test data')) {
      console.log('\n⚠️  Warning: Failed to seed test data. You can run it later with: npm run db:seed\n');
    }
  } else {
    console.log('\n⏭️  Skipping test data creation.');
    console.log('\n💡 You can create test data later by running: npm run db:seed\n');
  }

  // Final summary
  console.log('\n' + '='.repeat(80));
  console.log('✨ DATABASE SETUP COMPLETE!');
  console.log('='.repeat(80));
  console.log('\n📋 Next steps:');
  console.log('   1. Start the development server: npm run dev');
  console.log('   2. Open http://localhost:3000');

  if (seedUsers.toLowerCase() === 'y' || seedUsers.toLowerCase() === 'yes') {
    console.log('   3. Check TEST_USERS.md for login credentials');
    console.log('   4. Try logging in with a test user');
  } else {
    console.log('   3. Create your first user account');
  }

  console.log('\n💡 Useful commands:');
  console.log('   • View database: npx prisma studio');
  console.log('   • Seed test users: npm run db:seed');
  console.log('   • Reset database: npx prisma migrate reset');
  console.log('\n📖 Documentation:');
  console.log('   • Getting Started: GETTING_STARTED.md');
  console.log('   • Local Development: LOCAL_DEV.md');
  console.log('   • Developer Guide: DEVELOPER.md');
  console.log('\n✅ Happy coding! 🚀\n');
}

main().catch((error) => {
  console.error('\n❌ Setup failed:', error);
  process.exit(1);
});
