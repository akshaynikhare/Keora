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
      gender: Gender.MALE,
      bio: 'New user testing signup flow',
      location: 'New York, USA',
      isVerified: false,
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@test.com',
      mobile: '+1234567901',
      password: 'JaneSmith123!',
      dob: new Date('1985-05-20'),
      gender: Gender.FEMALE,
      bio: 'Verified user ready to build family tree',
      location: 'Los Angeles, USA',
      isVerified: true,
    },
    {
      name: 'Michael Johnson',
      email: 'michael.johnson@test.com',
      mobile: '+1234567902',
      password: 'Michael123!',
      dob: new Date('1980-03-10'),
      gender: Gender.MALE,
      bio: 'Family historian with extensive tree',
      location: 'Chicago, USA',
      isVerified: true,
      hasFamily: true,
      treeVisibility: 'PUBLIC',
    },
    {
      name: 'Emily Davis',
      email: 'emily.davis@test.com',
      mobile: '+1234567903',
      password: 'Emily123!',
      dob: new Date('1992-07-25'),
      gender: Gender.FEMALE,
      bio: 'Active genealogy researcher',
      location: 'Houston, USA',
      isVerified: true,
      hasFamily: true,
      treeVisibility: 'FAMILY',
    },
    {
      name: 'Robert Wilson',
      email: 'robert.wilson@test.com',
      mobile: '+1234567904',
      password: 'Robert123!',
      dob: new Date('1975-11-30'),
      gender: Gender.MALE,
      bio: 'Experienced user with multi-generational tree',
      location: 'Phoenix, USA',
      isVerified: true,
      hasFamily: true,
      treeVisibility: 'PUBLIC',
    },
    {
      name: 'Sarah Martinez',
      email: 'sarah.martinez@test.com',
      mobile: '+1234567905',
      password: 'Sarah123!',
      dob: new Date('1988-09-14'),
      gender: Gender.FEMALE,
      bio: 'Privacy-focused user',
      location: 'Miami, USA',
      isVerified: true,
      hasFamily: true,
      treeVisibility: 'PRIVATE',
    },
    {
      name: 'David Brown',
      email: 'david.brown@test.com',
      mobile: '+1234567906',
      password: 'David123!',
      dob: new Date('1995-12-03'),
      gender: Gender.MALE,
      bio: 'Young professional exploring family history',
      location: 'Seattle, USA',
      isVerified: true,
      hasFamily: true,
      treeVisibility: 'FAMILY',
    },
    {
      name: 'Lisa Anderson',
      email: 'lisa.anderson@test.com',
      mobile: '+1234567907',
      password: 'Lisa123!',
      dob: new Date('1983-04-22'),
      gender: Gender.FEMALE,
      bio: 'Genealogy enthusiast connecting families',
      location: 'Boston, USA',
      isVerified: true,
      hasFamily: true,
      treeVisibility: 'PUBLIC',
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
      const appUser = TEST_USERS.appUsers.find((au) => au.email === user.email);
      const visibility = appUser?.treeVisibility || 'PRIVATE';

      await prisma.treeSettings.create({
        data: {
          userId: user.id,
          visibility: visibility as any,
          allowSearch: visibility === 'PUBLIC',
        },
      });
      console.log(`   ✅ Created tree settings for ${user.name} (${visibility})`);
    }
  }

  // Create family members for users with hasFamily flag
  console.log('\n📝 Creating family members and relationships...');
  for (const user of createdUsers) {
    const appUser = TEST_USERS.appUsers.find((au) => au.email === user.email);
    if (appUser?.hasFamily) {
      await createFamilyMembers(user.id, appUser.name, appUser.gender);
    }
  }

  return { admins: createdAdmins, users: createdUsers };
}

async function createFamilyMembers(userId: string, userName: string, userGender?: string) {
  const gender = userGender || Gender.MALE;
  const spouseGender = gender === Gender.MALE ? Gender.FEMALE : Gender.MALE;

  // Get user's DOB to calculate relative ages
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const userDob = user?.dob || new Date('1985-01-01');
  const userBirthYear = userDob.getFullYear();

  // Create comprehensive family tree
  const members = [
    // Self (Primary member)
    {
      name: userName,
      gender: gender,
      dob: userDob,
      isPrimary: true,
      bio: 'Primary family member (myself)',
      location: user?.location,
    },
    // Paternal Grandparents
    {
      name: `${userName.split(' ')[1] || 'Grandfather'}`,
      gender: Gender.MALE,
      dob: new Date(userBirthYear - 65, 3, 15),
      bio: 'Paternal grandfather',
    },
    {
      name: `${userName.split(' ')[1] || 'Grandmother'}`,
      gender: Gender.FEMALE,
      dob: new Date(userBirthYear - 63, 7, 22),
      bio: 'Paternal grandmother',
    },
    // Maternal Grandparents
    {
      name: 'Maternal Grandfather',
      gender: Gender.MALE,
      dob: new Date(userBirthYear - 68, 1, 10),
      bio: 'Maternal grandfather',
    },
    {
      name: 'Maternal Grandmother',
      gender: Gender.FEMALE,
      dob: new Date(userBirthYear - 66, 11, 5),
      bio: 'Maternal grandmother',
    },
    // Father
    {
      name: `${userName.split(' ')[1] || 'Father'}`,
      gender: Gender.MALE,
      dob: new Date(userBirthYear - 35, 5, 12),
      bio: 'Father',
    },
    // Mother
    {
      name: 'Mother',
      gender: Gender.FEMALE,
      dob: new Date(userBirthYear - 33, 8, 20),
      bio: 'Mother',
    },
    // Siblings
    {
      name: `${gender === Gender.MALE ? 'Brother' : 'Sister'}`,
      gender: gender,
      dob: new Date(userBirthYear - 3, 2, 8),
      bio: 'Older sibling',
    },
    {
      name: `${gender === Gender.MALE ? 'Sister' : 'Brother'}`,
      gender: spouseGender,
      dob: new Date(userBirthYear + 2, 10, 15),
      bio: 'Younger sibling',
    },
    // Spouse
    {
      name: 'Spouse',
      gender: spouseGender,
      dob: new Date(userBirthYear - 1, 6, 25),
      bio: 'Life partner',
    },
    // Children
    {
      name: 'First Child',
      gender: Gender.MALE,
      dob: new Date(userBirthYear + 25, 4, 10),
      bio: 'Eldest child',
    },
    {
      name: 'Second Child',
      gender: Gender.FEMALE,
      dob: new Date(userBirthYear + 28, 9, 18),
      bio: 'Younger child',
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
        location: member.location,
        isPrimary: member.isPrimary || false,
      },
    });
    createdMembers.push(familyMember);
  }

  // Create relationships
  const [self, paternalGF, paternalGM, maternalGF, maternalGM, father, mother, olderSibling, youngerSibling, spouse, child1, child2] = createdMembers;

  const relationships = [
    // Grandparents to Parents
    { from: paternalGF, to: father, type: 'PARENT' },
    { from: paternalGM, to: father, type: 'PARENT' },
    { from: maternalGF, to: mother, type: 'PARENT' },
    { from: maternalGM, to: mother, type: 'PARENT' },
    // Grandparents as spouses
    { from: paternalGF, to: paternalGM, type: 'SPOUSE' },
    { from: maternalGF, to: maternalGM, type: 'SPOUSE' },
    // Parents to Self
    { from: father, to: self, type: 'PARENT' },
    { from: mother, to: self, type: 'PARENT' },
    // Parents as spouses
    { from: father, to: mother, type: 'SPOUSE' },
    // Parents to Siblings
    { from: father, to: olderSibling, type: 'PARENT' },
    { from: mother, to: olderSibling, type: 'PARENT' },
    { from: father, to: youngerSibling, type: 'PARENT' },
    { from: mother, to: youngerSibling, type: 'PARENT' },
    // Siblings
    { from: self, to: olderSibling, type: 'SIBLING' },
    { from: self, to: youngerSibling, type: 'SIBLING' },
    // Spouse
    { from: self, to: spouse, type: 'SPOUSE' },
    // Children
    { from: self, to: child1, type: 'PARENT' },
    { from: spouse, to: child1, type: 'PARENT' },
    { from: self, to: child2, type: 'PARENT' },
    { from: spouse, to: child2, type: 'PARENT' },
    // Children as siblings
    { from: child1, to: child2, type: 'SIBLING' },
  ];

  for (const rel of relationships) {
    try {
      await prisma.relationship.create({
        data: {
          memberId1: rel.from.id,
          memberId2: rel.to.id,
          relationshipType: rel.type as any,
        },
      });
    } catch (error) {
      // Skip if relationship already exists
    }
  }

  console.log(`      ✅ Created ${createdMembers.length} family members and ${relationships.length} relationships for ${userName}`);
}

async function createLinkRequests(users: any[]) {
  console.log('\n📝 Creating link requests between users...');

  // Create some link requests between users
  const linkRequests = [
    // Michael -> Emily (Approved - they are cousins)
    {
      senderId: users.find((u: any) => u.email === 'michael.johnson@test.com')?.id,
      receiverId: users.find((u: any) => u.email === 'emily.davis@test.com')?.id,
      relationshipType: 'SIBLING' as any,
      message: 'Hi Emily! We are cousins from the Johnson family. Let\'s connect our trees!',
      status: 'APPROVED' as any,
    },
    // Robert -> Lisa (Pending - distant relatives)
    {
      senderId: users.find((u: any) => u.email === 'robert.wilson@test.com')?.id,
      receiverId: users.find((u: any) => u.email === 'lisa.anderson@test.com')?.id,
      relationshipType: 'SIBLING' as any,
      message: 'Hello Lisa, I believe we share a common ancestor. Would love to connect!',
      status: 'PENDING' as any,
    },
    // Sarah -> David (Rejected - no relation found)
    {
      senderId: users.find((u: any) => u.email === 'sarah.martinez@test.com')?.id,
      receiverId: users.find((u: any) => u.email === 'david.brown@test.com')?.id,
      relationshipType: 'SIBLING' as any,
      message: 'Hi David, checking if we might be related?',
      status: 'REJECTED' as any,
    },
    // David -> Michael (Pending - exploring connection)
    {
      senderId: users.find((u: any) => u.email === 'david.brown@test.com')?.id,
      receiverId: users.find((u: any) => u.email === 'michael.johnson@test.com')?.id,
      relationshipType: 'SIBLING' as any,
      message: 'Hi Michael, I found your tree while researching. Let\'s connect!',
      status: 'PENDING' as any,
    },
  ];

  let createdCount = 0;
  for (const request of linkRequests) {
    if (request.senderId && request.receiverId) {
      const existing = await prisma.linkRequest.findFirst({
        where: {
          senderId: request.senderId,
          receiverId: request.receiverId,
        },
      });

      if (!existing) {
        await prisma.linkRequest.create({
          data: request,
        });
        createdCount++;
      }
    }
  }

  console.log(`   ✅ Created ${createdCount} link requests`);
}

async function createNotifications(users: any[]) {
  console.log('\n📝 Creating notifications for users...');

  const notifications = [
    // Notification for Emily about approved link request
    {
      userId: users.find((u: any) => u.email === 'emily.davis@test.com')?.id,
      type: 'LINK_APPROVED' as any,
      title: 'Link Request Approved',
      content: 'Michael Johnson accepted your link request. Your trees are now connected!',
      link: '/dashboard',
    },
    // Notification for Lisa about pending request
    {
      userId: users.find((u: any) => u.email === 'lisa.anderson@test.com')?.id,
      type: 'LINK_REQUEST' as any,
      title: 'New Link Request',
      content: 'Robert Wilson wants to connect with you. Review the request to accept or decline.',
      link: '/dashboard',
    },
    // Notification for David about rejected request
    {
      userId: users.find((u: any) => u.email === 'david.brown@test.com')?.id,
      type: 'LINK_REJECTED' as any,
      title: 'Link Request Declined',
      content: 'Sarah Martinez declined your link request.',
      link: '/dashboard',
    },
    // Notification for Michael about new request
    {
      userId: users.find((u: any) => u.email === 'michael.johnson@test.com')?.id,
      type: 'LINK_REQUEST' as any,
      title: 'New Link Request',
      content: 'David Brown wants to connect with you. Review the request.',
      link: '/dashboard',
    },
    // System notification for Jane
    {
      userId: users.find((u: any) => u.email === 'jane.smith@test.com')?.id,
      type: 'SYSTEM' as any,
      title: 'Welcome to Keora!',
      content: 'Start building your family tree by adding your first family member.',
      link: '/getting-started',
    },
  ];

  let createdCount = 0;
  for (const notification of notifications) {
    if (notification.userId) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId: notification.userId,
          title: notification.title,
        },
      });

      if (!existing) {
        await prisma.notification.create({
          data: notification,
        });
        createdCount++;
      }
    }
  }

  console.log(`   ✅ Created ${createdCount} notifications`);
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
    content += `- **Gender:** ${user.gender}\n`;
    content += `- **Location:** ${user.location}\n`;
    content += `- **Status:** ${user.isVerified ? '✅ Verified' : '⏳ Unverified'}\n`;
    content += `- **Tree Visibility:** ${user.treeVisibility || 'N/A'}\n`;
    content += `- **Family Data:** ${user.hasFamily ? '✅ Has 12 family members with multi-generational tree' : '❌ No family data'}\n`;
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
  content += '#### New User Experience\n';
  content += '- **Unverified User:** john.doe@test.com - Test OTP verification flow\n';
  content += '- **Fresh User:** jane.smith@test.com - Test getting started and building first tree\n\n';
  content += '#### Family Tree Features\n';
  content += '- **Complete Tree:** michael.johnson@test.com - 12 members, 3 generations, PUBLIC visibility\n';
  content += '- **Private Tree:** sarah.martinez@test.com - Full tree with PRIVATE visibility\n';
  content += '- **Family Visibility:** emily.davis@test.com or david.brown@test.com - FAMILY visibility\n';
  content += '- **Multi-Gen Tree:** robert.wilson@test.com or lisa.anderson@test.com - Complex relationships\n\n';
  content += '#### Link Requests\n';
  content += '- **Approved Link:** michael.johnson@test.com ↔️ emily.davis@test.com\n';
  content += '- **Pending Requests:** Check robert.wilson@test.com and david.brown@test.com\n';
  content += '- **Rejected Request:** sarah.martinez@test.com rejected david.brown@test.com\n\n';
  content += '#### Admin Functions\n';
  content += '- **Super Admin:** superadmin@test.com - Full system access\n';
  content += '- **Moderator:** moderator@test.com - Content moderation\n';
  content += '- **Support:** support@test.com - User support functions\n\n';
  content += '#### Notifications\n';
  content += '- Users with notifications: emily.davis@test.com, lisa.anderson@test.com, david.brown@test.com, michael.johnson@test.com, jane.smith@test.com\n\n';

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

    // Create link requests between users
    await createLinkRequests(users);

    // Create notifications for users
    await createNotifications(users);

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
