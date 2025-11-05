# Fixes and Troubleshooting Guide

**Last Updated:** 2025-11-05
**Branch:** claude/setup-database-options-011CUpyfuwdcNG9EY8m4YkU3

## ✅ Issues Fixed

### 1. Unverified User Login (John Doe)
**Problem:** When logging in as an unverified user (john.doe@test.com), no message was shown.

**Solution:** ✅ Fixed
- Login page now handles 403 errors from the API
- Shows toast notification: "Email/Mobile Verification Required"
- Automatically redirects to `/verify` page with userId parameter
- User can complete verification process

**Test:**
```
Email: john.doe@test.com
Password: JohnDoe123!
Expected: See verification message and redirect to /verify
```

---

### 2. Admin Dashboard as Primary Entry Point
**Problem:** Admins were redirected to `/dashboard` instead of `/admin` after login.

**Solution:** ✅ Fixed
- Login now checks `data.user.isAdmin` flag
- Admins are redirected to `/admin` dashboard
- Regular users are redirected to `/dashboard`
- Admin dashboard clearly shows monitoring/stats focus

**Test:**
```
Email: superadmin@test.com
Password: SuperAdmin123!
Expected: Redirected to /admin dashboard
```

---

### 3. Missing Admin Pages (404 Errors)
**Problem:** Clicking on admin navigation links resulted in 404 errors and logout:
- `/admin/moderation` → 404
- `/admin/audit-logs` → 404
- `/admin/settings` → 404

**Solution:** ✅ Fixed
All three pages have been created with:
- Proper authentication (wrapped in admin layout)
- Empty states with helpful information
- Back navigation to admin dashboard
- Responsive design matching admin theme

**Files Created:**
- `app/admin/moderation/page.tsx` - Content moderation interface
- `app/admin/audit-logs/page.tsx` - Administrative activity logs
- `app/admin/settings/page.tsx` - System settings and configuration

**Test:**
```
1. Login as superadmin@test.com
2. Click "Content Moderation" → Should load page
3. Click "Audit Logs" → Should load page
4. Click back to Admin Dashboard
5. Navigate to /admin/settings → Should load page
Expected: No 404 errors, no logout
```

---

### 4. Unverified User Dashboard Restrictions
**Problem:** Unverified users could access family tree features from the dashboard.

**Solution:** ✅ Fixed
- Dashboard now shows a prominent warning banner for unverified users
- All quick action buttons are disabled for unverified users
- Getting Started guide buttons are also disabled
- API endpoints now check verification status before allowing member creation
- Clear "Verify Now" button redirects to verification page

**Test:**
```
Email: john.doe@test.com
Password: JohnDoe123!
Expected:
- See amber warning banner at top
- All family management buttons disabled
- "Verify Now" button present
- Clicking on disabled buttons does nothing
```

---

## ⚠️ Known Issue: Family Members Not Loading

### Problem
When logging in as users with family data (Michael Johnson, Emily Davis, Robert Wilson), the family tree appears empty even though the test data should include 12 family members each.

### Root Cause
The seed script (`prisma/seed.ts`) was updated to include the `gender` field for test users, but the database hasn't been re-seeded with the updated data. The Prisma client also needs to be regenerated.

### Solution Steps

#### Option 1: Run Database Setup (Recommended)
```bash
npm run db:setup
```
Follow the prompts:
1. Say "yes" to generate Prisma Client
2. Say "yes" to push schema to database
3. Say "yes" to create test users

This will:
- Generate fresh Prisma client
- Create/update database tables
- Seed all 8 test users with complete family trees

#### Option 2: Manual Steps
If the setup script has issues, run these commands individually:

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Push schema to database
npx prisma db push

# 3. Seed test data
npm run db:seed
```

When prompted during seeding:
- Answer "yes" to create test users

### What Gets Created
After successful seeding, you'll have:

**Admin Users (3):**
- superadmin@test.com / SuperAdmin123!
- moderator@test.com / Moderator123!
- support@test.com / Support123!

**Regular Users (5):**
- john.doe@test.com / JohnDoe123! (unverified)
- jane.smith@test.com / JaneSmith123! (verified, no family data)
- michael.johnson@test.com / Michael123! (verified, 12 family members)
- emily.davis@test.com / Emily123! (verified, 12 family members)
- robert.wilson@test.com / Robert123! (verified, 12 family members)
- sarah.martinez@test.com / Sarah123! (verified, 12 family members)
- david.brown@test.com / David123! (verified, 12 family members)
- lisa.anderson@test.com / Lisa123! (verified, 12 family members)

**For each user with family data:**
- 12 family members (self, grandparents, parents, siblings, spouse, children)
- 21 relationships connecting them
- Proper gender assignments
- Complete 3-generation family tree

### Testing After Re-seeding

**Test 1: Unverified User**
```bash
Login: john.doe@test.com / JohnDoe123!
Expected: Verification message and redirect to /verify
```

**Test 2: User Without Family**
```bash
Login: jane.smith@test.com / JaneSmith123!
Go to: /family/members
Expected: Empty state with "Add Your First Member" button
```

**Test 3: User With Family Tree**
```bash
Login: michael.johnson@test.com / Michael123!
Go to: /family/members
Expected: 12 family members displayed in grid

Go to: /family/tree
Expected: Members organized by generation:
- Grandparents (4)
- Parents & Aunts/Uncles (2)
- Your Generation (4 - self, siblings, spouse)
- Children (2)
```

**Test 4: Link Requests**
```bash
Login: emily.davis@test.com / Emily123!
Go to: /family/links
Expected:
- Received tab: 0 pending requests
- Sent tab: 1 approved request (to Michael Johnson)
```

**Test 5: Admin Dashboard**
```bash
Login: superadmin@test.com / SuperAdmin123!
Expected:
- User Statistics showing 8+ total users
- Family Members count showing 72+ (12 members × 6 users)
- Relationships count showing 126+ (21 × 6 users)
- Recent Users list
- No "Failed to fetch" error
```

---

## 📝 Database Schema Requirements

Ensure your `.env` file has a valid `DATABASE_URL`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/keora"
```

For local development with Docker:
```bash
docker-compose up -d  # Start PostgreSQL
```

---

## 🐛 Troubleshooting Common Issues

### Issue: "Failed to fetch dashboard stats" on Admin Dashboard
**Cause:** Prisma client not generated or database not seeded
**Fix:** Run `npm run db:setup` or manually generate client and seed

### Issue: Family members page shows empty state
**Cause:** Test data not seeded or user has no family members
**Fix:** Use a test user that should have family (michael.johnson@test.com) and ensure database is seeded

### Issue: "Unauthorized" error on admin pages
**Cause:** Not logged in as admin or session expired
**Fix:** Login as superadmin@test.com and try again

### Issue: 404 on admin pages
**Cause:** Branch not up to date
**Fix:** Pull latest changes: `git pull origin claude/setup-database-options-011CUpyfuwdcNG9EY8m4YkU3`

### Issue: Cannot generate Prisma client
**Cause:** Network issues downloading Prisma binaries
**Fix:** Ensure internet connection, or use `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate`

### Issue: API returns 500 error when creating family members
**Cause:** Either Prisma client not generated, or user attempting to create member while unverified
**Fix:**
- Ensure database is set up: `npm run db:setup`
- Ensure user is verified before attempting to create family members
- Check server logs for detailed error messages (now includes error details in response)

---

## ✨ Summary of All Completed Features

### Authentication & User Management ✅
- User registration with email/mobile verification
- Login with credential validation
- Unverified user handling with verification flow
- Admin vs regular user role detection
- Session management (7-day expiration)

### Family Tree Features ✅
- Add/edit/delete family members (with photos, DOB, gender, bio)
- Family tree visualization (generation-based view)
- Relationship management (parent, child, spouse, sibling)
- Privacy settings (Private/Family/Public visibility)
- Search settings and information visibility controls

### Link Requests ✅
- Send connection requests to other users
- Approve/reject/withdraw requests
- Status tracking (Pending/Approved/Rejected/Withdrawn)
- Notification system for link request events

### Admin Features ✅
- Platform monitoring dashboard with statistics
- User management (verify, suspend, reset password)
- Content moderation interface (placeholder)
- Audit logs interface (placeholder)
- System settings view (read-only)

### UI/UX ✅
- Interactive onboarding tutorial (6 steps)
- Responsive design across all pages
- Loading states and error handling
- Toast notifications for user feedback
- Empty states with helpful guidance

---

## 📚 Quick Reference - Test User Credentials

All passwords follow the pattern: `Name123!`

**For Testing Verification:**
- john.doe@test.com / JohnDoe123!

**For Testing Empty Tree:**
- jane.smith@test.com / JaneSmith123!

**For Testing Full Family Trees:**
- michael.johnson@test.com / Michael123!
- emily.davis@test.com / Emily123!
- robert.wilson@test.com / Robert123!

**For Testing Admin:**
- superadmin@test.com / SuperAdmin123!
- moderator@test.com / Moderator123!
- support@test.com / Support123!

---

## 🚀 Next Steps

1. **Re-seed the database** to get family members loading
2. **Test all features** with the test users listed above
3. **Review the admin pages** to ensure they match requirements
4. **Customize admin pages** if you need real functionality beyond placeholders

---

## 📞 Need Help?

If you encounter issues not covered here:
1. Check the console for error messages
2. Verify database connection in `.env`
3. Ensure all dependencies are installed: `npm install`
4. Try restarting the dev server: `npm run dev`

For detailed implementation status, see `IMPLEMENTATION_STATUS.md`
