import { PrismaClient, AdminRole, Gender } from '@prisma/client';
import { hashPassword } from '../lib/auth/password';
import * as readline from 'readline';

const prisma = new PrismaClient();

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

// Test user data
const TEST_USERS = {
  admins: [
    {
      name: 'Super Admin',
      email: 'superadmin@test.com',
      mobile: '+1234567890',
      password: 'SuperAdmin123!',
      isAdmin: true,
      adminRole: AdminRole.SUPER_ADMIN,
      bio: 'Super administrator with full system access',
    },
    {
      name: 'Moderator Admin',
      email: 'moderator@test.com',
      mobile: '+1234567891',
      password: 'Moderator123!',
      isAdmin: true,
      adminRole: AdminRole.MODERATOR,
      bio: 'Moderator for content and user management',
    },
    {
      name: 'Support Admin',
      email: 'support@test.com',
      mobile: '+1234567892',
      password: 'Support123!',
      isAdmin: true,
      adminRole: AdminRole.SUPPORT,
      bio: 'Customer support administrator',
    },
  ],
  appUsers: [
    {
      name: 'John Doe',
      email: 'john.doe@test.com',
      mobile: '+1234567900',
      password: 'JohnDoe123!',
      dob: new Date('1990-01-15'),
      bio: 'Unverified user - just signed up',
      location: 'New York, USA',
      isVerified: false,
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@test.com',
      mobile: '+1234567901',
      password: 'JaneSmith123!',
      dob: new Date('1985-05-20'),
      bio: 'Verified user - no family data yet',
      location: 'Los Angeles, USA',
      isVerified: true,
    },
    {
      name: 'Michael Johnson',
      email: 'michael.johnson@test.com',
      mobile: '+1234567902',
      password: 'Michael123!',
      dob: new Date('1980-03-10'),
      bio: 'Active user with family members',
      location: 'Chicago, USA',
      isVerified: true,
      hasFamily: true,
    },
    {
      name: 'Emily Davis',
      email: 'emily.davis@test.com',
      mobile: '+1234567903',
      password: 'Emily123!',
      dob: new Date('1992-07-25'),
      bio: 'Active user for testing relationships',
      location: 'Houston, USA',
      isVerified: true,
      hasFamily: true,
    },
    {
      name: 'Robert Wilson',
      email: 'robert.wilson@test.com',
      mobile: '+1234567904',
      password: 'Robert123!',
      dob: new Date('1975-11-30'),
      bio: 'Test user with multiple family connections',
      location: 'Phoenix, USA',
      isVerified: true,
      hasFamily: true,
    },
  ],
};

async function createTestUsers() {
  console.log('\n🌱 Starting database seed...\n');

  const hashedPassword = async (password: string) => await hashPassword(password);

  // Create admin users
  console.log('📝 Creating admin users...');
  const createdAdmins = [];

  for (const admin of TEST_USERS.admins) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: admin.email }, { mobile: admin.mobile }],
      },
    });

    if (existingUser) {
      console.log(`   ⚠️  ${admin.name} already exists - skipping`);
      createdAdmins.push(existingUser);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        name: admin.name,
        email: admin.email,
        mobile: admin.mobile,
        password: await hashedPassword(admin.password),
        isAdmin: admin.isAdmin,
        adminRole: admin.adminRole,
        bio: admin.bio,
        verifiedAt: new Date(), // Admins are pre-verified
      },
    });

    createdAdmins.push(user);
    console.log(`   ✅ Created ${admin.name} (${admin.adminRole})`);
  }

  // Create app users
  console.log('\n📝 Creating app users...');
  const createdUsers = [];

  for (const appUser of TEST_USERS.appUsers) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: appUser.email }, { mobile: appUser.mobile }],
      },
    });

    if (existingUser) {
      console.log(`   ⚠️  ${appUser.name} already exists - skipping`);
      createdUsers.push(existingUser);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        name: appUser.name,
        email: appUser.email,
        mobile: appUser.mobile,
        password: await hashedPassword(appUser.password),
        dob: appUser.dob,
        bio: appUser.bio,
        location: appUser.location,
        verifiedAt: appUser.isVerified ? new Date() : null,
      },
    });

    createdUsers.push(user);

    // Create family members if specified
    if (appUser.hasFamily) {
      await createFamilyMembers(user.id, appUser.name);
    }

    console.log(`   ✅ Created ${appUser.name} (${appUser.isVerified ? 'verified' : 'unverified'})`);
  }

  // Create tree settings for verified users
  console.log('\n📝 Creating tree settings...');
  for (const user of createdUsers.filter((u) =>
    TEST_USERS.appUsers.find((au) => au.email === u.email)?.isVerified
  )) {
    const existingSettings = await prisma.treeSettings.findUnique({
      where: { userId: user.id },
    });

    if (!existingSettings) {
      await prisma.treeSettings.create({
        data: {
          userId: user.id,
        },
      });
      console.log(`   ✅ Created tree settings for ${user.name}`);
    }
  }

  return { admins: createdAdmins, users: createdUsers };
}

async function createFamilyMembers(userId: string, userName: string) {
  // Create family members for the user
  const members = [
    {
      name: `${userName} (Self)`,
      gender: Gender.MALE,
      isPrimary: true,
      bio: 'Primary family member profile',
    },
    {
      name: `${userName}'s Parent`,
      gender: Gender.MALE,
      dob: new Date('1950-01-01'),
      bio: 'Parent in family tree',
    },
    {
      name: `${userName}'s Spouse`,
      gender: Gender.FEMALE,
      dob: new Date('1982-06-15'),
      bio: 'Spouse in family tree',
    },
  ];

  const createdMembers = [];
  for (const member of members) {
    const familyMember = await prisma.familyMember.create({
      data: {
        userId,
        name: member.name,
        gender: member.gender,
        dob: member.dob,
        bio: member.bio,
        isPrimary: member.isPrimary || false,
      },
    });
    createdMembers.push(familyMember);
  }

  // Create relationships between family members
  if (createdMembers.length >= 3) {
    // Parent-Child relationship
    await prisma.relationship.create({
      data: {
        memberId1: createdMembers[1].id, // Parent
        memberId2: createdMembers[0].id, // Self
        relationshipType: 'PARENT',
      },
    });

    // Spouse relationship
    await prisma.relationship.create({
      data: {
        memberId1: createdMembers[0].id, // Self
        memberId2: createdMembers[2].id, // Spouse
        relationshipType: 'SPOUSE',
      },
    });
  }
}

async function displayCredentials() {
  console.log('\n' + '='.repeat(80));
  console.log('🔑 TEST USER CREDENTIALS');
  console.log('='.repeat(80));

  console.log('\n📋 ADMIN USERS:');
  console.log('─'.repeat(80));
  TEST_USERS.admins.forEach((admin) => {
    console.log(`\n${admin.name} (${admin.adminRole}):`);
    console.log(`  Email:    ${admin.email}`);
    console.log(`  Password: ${admin.password}`);
  });

  console.log('\n\n📋 APP USERS:');
  console.log('─'.repeat(80));
  TEST_USERS.appUsers.forEach((user) => {
    console.log(`\n${user.name}:`);
    console.log(`  Email:    ${user.email}`);
    console.log(`  Password: ${user.password}`);
    console.log(`  Status:   ${user.isVerified ? 'Verified' : 'Unverified'}`);
    console.log(`  Family:   ${user.hasFamily ? 'Has family members' : 'No family data'}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('\n💡 TIP: All credentials are also saved in TEST_USERS.md\n');
}

async function saveCredentialsToFile() {
  const fs = require('fs');
  const path = require('path');

  let content = '# Test User Credentials\n\n';
  content += 'This file contains credentials for all test users created during database seeding.\n\n';
  content += '⚠️ **WARNING:** These are test credentials only. Never use these in production!\n\n';
  content += '---\n\n';

  content += '## Admin Users\n\n';
  TEST_USERS.admins.forEach((admin) => {
    content += `### ${admin.name} (${admin.adminRole})\n\n`;
    content += `- **Email:** ${admin.email}\n`;
    content += `- **Mobile:** ${admin.mobile}\n`;
    content += `- **Password:** \`${admin.password}\`\n`;
    content += `- **Role:** ${admin.adminRole}\n`;
    content += `- **Bio:** ${admin.bio}\n\n`;
  });

  content += '---\n\n';
  content += '## App Users\n\n';
  TEST_USERS.appUsers.forEach((user) => {
    content += `### ${user.name}\n\n`;
    content += `- **Email:** ${user.email}\n`;
    content += `- **Mobile:** ${user.mobile}\n`;
    content += `- **Password:** \`${user.password}\`\n`;
    content += `- **DOB:** ${user.dob.toISOString().split('T')[0]}\n`;
    content += `- **Location:** ${user.location}\n`;
    content += `- **Status:** ${user.isVerified ? '✅ Verified' : '⏳ Unverified'}\n`;
    content += `- **Family Data:** ${user.hasFamily ? '✅ Has family members and relationships' : '❌ No family data'}\n`;
    content += `- **Bio:** ${user.bio}\n\n`;
  });

  content += '---\n\n';
  content += '## Usage\n\n';
  content += '1. Start the development server: `npm run dev`\n';
  content += '2. Navigate to: http://localhost:3000/login\n';
  content += '3. Use any of the credentials above to log in\n\n';
  content += '### Admin Access\n\n';
  content += '- **Admin Dashboard:** http://localhost:3000/admin\n';
  content += '- Only admin users can access the admin dashboard\n\n';
  content += '### Testing Scenarios\n\n';
  content += '- **Signup Flow:** Use john.doe@test.com to test OTP verification\n';
  content += '- **Family Tree:** Use michael.johnson@test.com, emily.davis@test.com, or robert.wilson@test.com\n';
  content += '- **Admin Functions:** Use any admin account to test moderation features\n\n';

  const filePath = path.join(process.cwd(), 'TEST_USERS.md');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`\n📄 Credentials saved to: ${filePath}`);
}

async function main() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🌱 KEORA DATABASE SEED');
    console.log('='.repeat(80) + '\n');

    // Ask user if they want to create test users
    const answer = await askQuestion(
      '❓ Do you want to create test users for development? (y/n): '
    );

    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('\n⏭️  Skipping test user creation.\n');
      return;
    }

    console.log('\n✅ Creating test users...\n');

    const { admins, users } = await createTestUsers();

    console.log('\n' + '='.repeat(80));
    console.log('✨ SEED COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(80));
    console.log(`\n📊 Summary:`);
    console.log(`   - Admins created: ${admins.length}`);
    console.log(`   - App users created: ${users.length}`);

    // Display credentials
    await displayCredentials();

    // Save credentials to file
    await saveCredentialsToFile();

    console.log('✅ Database seeding complete!\n');
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
