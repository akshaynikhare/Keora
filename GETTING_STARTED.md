# Getting Started with Keora

Welcome to Keora - a comprehensive family tree platform! This guide will help you get up and running quickly.

## Table of Contents

1. [Quick Start](#quick-start)
2. [First Time Setup](#first-time-setup)
3. [Using Test Users](#using-test-users)
4. [Basic Features](#basic-features)
5. [Development Workflow](#development-workflow)
6. [Troubleshooting](#troubleshooting)
7. [Next Steps](#next-steps)

---

## Quick Start

Get Keora running in under 5 minutes:

```bash
# 1. Clone and install
git clone <repository-url>
cd Keora
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env and configure DATABASE_URL

# 3. Start database
docker-compose -f docker-compose.dev.yml up -d

# 4. Setup database (interactive)
npm run db:setup

# 5. Start development server
npm run dev
```

Open http://localhost:3000 🎉

---

## First Time Setup

### 1. Prerequisites

Before you begin, make sure you have installed:

- **Node.js 20+** - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/)

### 2. Clone the Repository

```bash
git clone <repository-url>
cd Keora
```

### 3. Install Dependencies

```bash
npm install
```

This will install all necessary packages including Next.js, Prisma, React, and more.

### 4. Environment Configuration

Create your environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure these essential variables:

```env
# Database (required)
DATABASE_URL="postgresql://postgres:password@localhost:5432/keora"

# Authentication (required)
JWT_SECRET="your-secret-key-change-this"
NEXTAUTH_URL="http://localhost:3000"

# Optional (for testing)
WHATSAPP_API_KEY=""
EMAIL_FROM="noreply@keora.local"
SENDGRID_API_KEY=""
```

### 5. Start Docker Services

Start PostgreSQL and Redis:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Verify services are running:**
```bash
docker-compose -f docker-compose.dev.yml ps
```

You should see `postgres` and `redis` with status "Up".

### 6. Setup Database (Interactive)

Run the interactive setup script:

```bash
npm run db:setup
```

This will:
1. ✅ Check your environment configuration
2. ✅ Generate Prisma Client
3. ✅ Push database schema
4. ✅ Ask if you want to create test users

**Example session:**
```
🚀 KEORA DATABASE SETUP
================================================================================

📝 Do you want to continue with database setup? (y/n): y

⏳ Generating Prisma Client...
✅ Generating Prisma Client - Done!

⏳ Pushing database schema...
✅ Pushing database schema - Done!

📝 Do you want to create test users? (y/n): y

⏳ Creating test users...
✅ Creating test users - Done!

✨ DATABASE SETUP COMPLETE!
```

### 7. Start Development Server

```bash
npm run dev
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3000/api

---

## Using Test Users

If you created test users during setup, you'll find credentials in `TEST_USERS.md`.

### Admin Users

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@test.com | SuperAdmin123! |
| Moderator | moderator@test.com | Moderator123! |
| Support | support@test.com | Support123! |

**Admin Dashboard:** http://localhost:3000/admin

### Regular Users

| Name | Email | Password | Status | Family Data |
|------|-------|----------|--------|-------------|
| John Doe | john.doe@test.com | JohnDoe123! | ⏳ Unverified | ❌ None |
| Jane Smith | jane.smith@test.com | JaneSmith123! | ✅ Verified | ❌ None |
| Michael Johnson | michael.johnson@test.com | Michael123! | ✅ Verified | ✅ Has family |
| Emily Davis | emily.davis@test.com | Emily123! | ✅ Verified | ✅ Has family |
| Robert Wilson | robert.wilson@test.com | Robert123! | ✅ Verified | ✅ Has family |

### Testing Scenarios

**1. Login Flow:**
```bash
# Visit: http://localhost:3000/login
# Use: jane.smith@test.com / JaneSmith123!
```

**2. Family Tree:**
```bash
# Visit: http://localhost:3000/dashboard
# Login with: michael.johnson@test.com / Michael123!
# You'll see pre-populated family members and relationships
```

**3. Admin Functions:**
```bash
# Visit: http://localhost:3000/admin
# Login with: superadmin@test.com / SuperAdmin123!
# Explore user management, moderation, and analytics
```

**4. OTP Verification (Unverified User):**
```bash
# Login with: john.doe@test.com / JohnDoe123!
# Test the OTP verification flow
```

---

## Basic Features

### For Users

**1. Authentication**
- Sign up with email and mobile
- Email and SMS OTP verification
- Password reset
- Secure JWT sessions

**2. Profile Management**
- Update personal information
- Upload profile photo
- Set privacy preferences

**3. Family Tree**
- Add family members
- Define relationships (parent, child, spouse, sibling)
- Interactive tree visualization
- Privacy controls (private, family, public)

**4. Connections**
- Send connection requests
- Accept/reject requests
- Build extended family network

**5. Notifications**
- Real-time notifications
- Connection requests
- Family tree updates

### For Admins

**1. User Management**
- View all users
- Suspend/unsuspend accounts
- Delete accounts
- View user details

**2. Dashboard**
- Total users statistics
- New user registrations
- Active users tracking
- System health monitoring

**3. Content Moderation**
- Review flagged content
- Handle user reports
- Manage inappropriate content

**4. Audit Logs**
- Track admin actions
- View system changes
- Security monitoring

---

## Development Workflow

### Daily Development

**Morning startup:**
```bash
# Start database
docker-compose -f docker-compose.dev.yml up -d

# Start dev server
npm run dev
```

**End of day:**
```bash
# Stop database (optional, saves resources)
docker-compose -f docker-compose.dev.yml down
```

### Making Changes

**1. Database Schema Changes:**

Edit `prisma/schema.prisma`, then:

```bash
# Quick update (dev only)
npx prisma db push

# OR create migration (recommended)
npx prisma migrate dev --name description_of_change

# Regenerate Prisma Client
npx prisma generate
```

**2. Code Changes:**

The dev server supports hot reload - your changes will automatically refresh!

**3. Adding Dependencies:**

```bash
# Production dependency
npm install <package-name>

# Dev dependency
npm install -D <package-name>
```

### Useful Commands

```bash
# Database
npm run db:generate    # Generate Prisma Client
npm run db:push        # Push schema to database
npm run db:migrate     # Create migration
npm run db:seed        # Seed test users
npm run db:studio      # Open Prisma Studio GUI

# Development
npm run dev            # Start dev server
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Run linter
npm run type-check     # TypeScript type checking
```

### Viewing Database

**Prisma Studio** (Database GUI):
```bash
npx prisma studio
```

Opens at http://localhost:5555

Browse tables, edit data, and run queries visually.

---

## Troubleshooting

### Issue: Port 3000 already in use

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Issue: Database connection failed

**Check if PostgreSQL is running:**
```bash
docker-compose -f docker-compose.dev.yml ps
```

**Restart database:**
```bash
docker-compose -f docker-compose.dev.yml restart postgres
```

**Check DATABASE_URL:**
Make sure `.env` has the correct connection string:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/keora"
```

### Issue: Prisma Client not found

**Solution:**
```bash
npx prisma generate
```

### Issue: Test users not created

**Solution:**
```bash
npm run db:seed
```

If it fails, check:
1. Database is running: `docker-compose -f docker-compose.dev.yml ps`
2. Schema is pushed: `npx prisma db push`
3. Prisma Client is generated: `npx prisma generate`

### Issue: Build fails after pulling changes

**Solution:**
```bash
# Clean install
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### Issue: Changes not reflecting

**Solution:**
```bash
# Restart dev server
# Press Ctrl+C, then:
npm run dev
```

### Issue: Can't login with test users

**Check credentials:**
1. Open `TEST_USERS.md`
2. Copy exact credentials
3. Make sure database was seeded: `npm run db:seed`

---

## Next Steps

Now that you're set up, explore these resources:

### Documentation

- **[USER_GUIDE.md](./USER_GUIDE.md)** - Complete user features guide
- **[ADMIN_GUIDE.md](./ADMIN_GUIDE.md)** - Admin dashboard documentation
- **[DEVELOPER.md](./DEVELOPER.md)** - Technical architecture and API reference
- **[LOCAL_DEV.md](./LOCAL_DEV.md)** - Detailed local development guide

### Learning Path

**1. Explore the UI** (5 minutes)
- Browse http://localhost:3000
- Check out the landing page
- Navigate to login/signup pages

**2. Try User Features** (15 minutes)
- Login with a test user
- Explore the dashboard
- Add a family member
- Create relationships

**3. Test Admin Dashboard** (10 minutes)
- Login as Super Admin
- View user management
- Check analytics dashboard
- Review audit logs

**4. Understand the Codebase** (30 minutes)
- Review project structure in `DEVELOPER.md`
- Check `prisma/schema.prisma` for database models
- Explore API routes in `app/api/`
- Review components in `components/`

**5. Make Your First Change** (20 minutes)
- Edit a component
- See hot reload in action
- Make a small feature addition
- Test it with test users

### Common Tasks

**Add a new page:**
```bash
# Create app/my-page/page.tsx
# Next.js will automatically route it to /my-page
```

**Add a new API endpoint:**
```bash
# Create app/api/my-endpoint/route.ts
# Access it at http://localhost:3000/api/my-endpoint
```

**Add a new database model:**
```bash
# Edit prisma/schema.prisma
npx prisma db push
npx prisma generate
```

### Getting Help

**Documentation:**
- Check the docs in this repository
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

**Debugging:**
```bash
# View logs
npm run dev  # Check console

# Database logs
docker-compose -f docker-compose.dev.yml logs -f postgres

# View data
npx prisma studio
```

**Ask the Team:**
- Reach out on Slack/Teams
- Check GitHub issues
- Review pull requests

---

## Quick Reference

### Essential URLs

| Service | URL |
|---------|-----|
| **App** | http://localhost:3000 |
| **Admin Dashboard** | http://localhost:3000/admin |
| **Login** | http://localhost:3000/login |
| **Signup** | http://localhost:3000/signup |
| **Prisma Studio** | http://localhost:5555 |
| **PostgreSQL** | localhost:5432 |
| **Redis** | localhost:6379 |

### Essential Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run db:setup` | Interactive database setup |
| `npm run db:seed` | Create test users |
| `npx prisma studio` | Open database GUI |
| `docker-compose -f docker-compose.dev.yml up -d` | Start services |
| `docker-compose -f docker-compose.dev.yml down` | Stop services |

### Test Credentials

**Quick Login:**
- **Admin:** superadmin@test.com / SuperAdmin123!
- **User:** jane.smith@test.com / JaneSmith123!

**Full list:** Check `TEST_USERS.md`

---

## Contributing

When you're ready to contribute:

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Follow existing patterns
   - Test your changes

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

4. **Create a pull request**

---

**Need help? Check the documentation or ask the team!**

**Happy coding! 🚀**
