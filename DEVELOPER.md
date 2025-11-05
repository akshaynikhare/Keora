# Keora Developer Guide

Complete technical documentation for developers working on the Keora platform.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Setup](#development-setup)
3. [Database Management](#database-management)
4. [API Reference](#api-reference)
5. [Authentication System](#authentication-system)
6. [State Management](#state-management)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Best Practices](#best-practices)

---

## Architecture Overview

### Technology Stack

**Frontend:**
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library built on Radix UI
- **Zustand** - Lightweight state management
- **React Flow** - Interactive tree visualization

**Backend:**
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Relational database
- **Redis** - Caching and session storage

**Infrastructure:**
- **Docker** - Containerization
- **Nginx** - Reverse proxy and load balancer
- **AWS S3 / Cloudinary** - File storage

### Project Structure

```
Keora/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth-related pages
│   │   ├── login/
│   │   ├── signup/
│   │   ├── verify/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── dashboard/                # User dashboard
│   ├── admin/                    # Admin dashboard
│   │   ├── layout.tsx            # Admin layout
│   │   ├── page.tsx              # Admin overview
│   │   ├── users/                # User management
│   │   ├── moderation/           # Content moderation
│   │   └── settings/             # System settings
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── users/                # User management
│   │   ├── members/              # Family member CRUD
│   │   ├── relationships/        # Relationship management
│   │   ├── admin/                # Admin endpoints
│   │   └── notifications/        # Notification endpoints
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/
│   ├── auth/                     # Auth components
│   │   └── protected-route.tsx   # Route protection HOC
│   ├── ui/                       # shadcn/ui components
│   ├── tree/                     # Tree visualization components
│   └── admin/                    # Admin UI components
├── lib/
│   ├── auth/                     # Authentication utilities
│   │   ├── jwt.ts                # JWT token handling
│   │   ├── password.ts           # Password hashing/verification
│   │   ├── otp.ts                # OTP generation/validation
│   │   └── middleware.ts         # Auth middleware
│   ├── integrations/             # External services
│   │   ├── email.ts              # Email service
│   │   ├── whatsapp.ts           # WhatsApp service
│   │   └── storage.ts            # File storage
│   ├── prisma.ts                 # Prisma client
│   └── utils.ts                  # Utility functions
├── store/
│   ├── auth-store.ts             # Authentication state
│   ├── tree-store.ts             # Family tree state
│   └── notification-store.ts     # Notifications state
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript type definitions
└── public/                       # Static assets
```

---

## Development Setup

### Prerequisites

- Node.js 20+ and npm/yarn
- Docker and Docker Compose
- Git
- PostgreSQL (optional, can use Docker)

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Keora
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment configuration:**
   ```bash
   cp .env.example .env
   ```

   Configure the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://postgres:password@localhost:5432/keora"

   # Auth
   JWT_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"

   # WhatsApp (optional in development)
   WHATSAPP_API_KEY=""
   WHATSAPP_API_URL=""
   WHATSAPP_SENDER_ID=""

   # Email (optional in development)
   EMAIL_FROM="noreply@keora.com"
   SENDGRID_API_KEY=""
   ```

4. **Start PostgreSQL (Docker):**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d postgres redis
   ```

5. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

6. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

7. **Seed database (optional):**
   ```bash
   npx prisma db seed
   ```

8. **Start development server:**
   ```bash
   npm run dev
   ```

   Access the app at http://localhost:3000

### Development Tools

- **Prisma Studio** - Database GUI
  ```bash
  npx prisma studio
  ```
  Opens at http://localhost:5555

- **TypeScript compiler**
  ```bash
  npm run type-check
  ```

- **ESLint**
  ```bash
  npm run lint
  ```

- **Format code**
  ```bash
  npm run format
  ```

---

## Database Management

### Prisma Workflow

**Schema Changes:**
1. Modify `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name description`
3. Generate client: `npx prisma generate`

**Reset Database:**
```bash
npx prisma migrate reset
```

**Push schema without migrations (dev only):**
```bash
npx prisma db push
```

### Database Schema

#### User Model
```prisma
model User {
  id              String    @id @default(cuid())
  mobile          String    @unique
  email           String    @unique
  name            String
  password        String
  photoUrl        String?
  dob             DateTime?
  bio             String?
  location        String?
  verifiedAt      DateTime?
  lastLogin       DateTime?

  // Admin fields
  isAdmin         Boolean   @default(false)
  adminRole       AdminRole?
  isSuspended     Boolean   @default(false)
  suspendedAt     DateTime?
  suspendedReason String?
  loginAttempts   Int       @default(0)
  lockedUntil     DateTime?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

#### Session Model
```prisma
model Session {
  id         String   @id @default(cuid())
  userId     String
  token      String   @unique
  device     String?
  ipAddress  String?
  userAgent  String?
  expiresAt  DateTime
  lastActive DateTime @default(now())
  createdAt  DateTime @default(now())
}
```

See `prisma/schema.prisma` for complete schema.

---

## API Reference

### Authentication Endpoints

#### POST /api/auth/signup
Create a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "+1234567890",
  "password": "SecurePass123!",
  "dob": "1990-01-01"
}
```

**Response:**
```json
{
  "userId": "clxxx...",
  "message": "Account created successfully"
}
```

#### POST /api/auth/login
Login with email/mobile and password.

**Request:**
```json
{
  "emailOrMobile": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "clxxx...",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "+1234567890",
    "verifiedAt": "2025-01-01T00:00:00.000Z",
    "isAdmin": false
  }
}
```

#### POST /api/auth/verify-otp
Verify email and mobile with OTP codes.

**Request:**
```json
{
  "userId": "clxxx...",
  "mobileOTP": "123456",
  "emailOTP": "654321"
}
```

**Response:**
```json
{
  "message": "Account verified successfully",
  "user": { ... }
}
```

#### POST /api/auth/forgot-password
Request password reset.

**Request:**
```json
{
  "emailOrMobile": "john@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset instructions sent"
}
```

#### POST /api/auth/reset-password
Reset password with OTP token.

**Request:**
```json
{
  "token": "123456",
  "password": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

#### POST /api/auth/resend-otp
Resend OTP code.

**Request:**
```json
{
  "userId": "clxxx...",
  "type": "email" // or "mobile"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully"
}
```

### Admin Endpoints

All admin endpoints require `Authorization: Bearer <token>` header and admin role.

#### GET /api/admin/dashboard
Get dashboard statistics.

**Response:**
```json
{
  "totalUsers": 1234,
  "newUsers": 45,
  "activeUsers": 890,
  "flaggedContent": 3,
  "recentActivity": [...]
}
```

---

## Authentication System

### JWT Token Structure

**Payload:**
```typescript
{
  userId: string;
  email: string;
  iat: number;  // Issued at
  exp: number;  // Expiry (7 days)
}
```

**Usage in API:**
```typescript
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  const user = await requireAuth(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Your logic here
}
```

### Password Security

- **Hashing:** bcrypt with salt rounds = 10
- **Minimum length:** 8 characters
- **Requirements:** Enforced on frontend
- **Reset:** Invalidates all sessions

### OTP System

- **Length:** 6 digits
- **Expiry:** 10 minutes
- **Delivery:** Email + WhatsApp
- **Rate limiting:** 1 per minute
- **Max attempts:** 5 before lockout

---

## State Management

### Zustand Stores

#### Auth Store
```typescript
import { useAuthStore } from '@/store/auth-store';

// In component
const { user, token, isAuthenticated, login, logout } = useAuthStore();

// Login
login(userData, jwtToken);

// Logout
logout();
```

#### Tree Store
```typescript
import { useTreeStore } from '@/store/tree-store';

const {
  members,
  relationships,
  selectedMember,
  setMembers,
  addMember,
  updateMember,
  deleteMember,
} = useTreeStore();
```

#### Notification Store
```typescript
import { useNotificationStore } from '@/store/notification-store';

const {
  notifications,
  unreadCount,
  addNotification,
  markAsRead,
} = useNotificationStore();
```

---

## Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Structure
```
tests/
├── unit/
│   ├── auth/
│   ├── api/
│   └── components/
├── integration/
│   └── api/
└── e2e/
    └── user-flows/
```

---

## Deployment

### Docker Deployment

**Build:**
```bash
docker-compose build
```

**Start services:**
```bash
docker-compose up -d
```

**Run migrations:**
```bash
docker-compose exec app npx prisma migrate deploy
```

**View logs:**
```bash
docker-compose logs -f app
```

### Environment-Specific Configs

- **Development:** `docker-compose.dev.yml`
- **Production:** `docker-compose.yml`
- **Staging:** `docker-compose.staging.yml`

---

## Best Practices

### Code Style
- Use TypeScript for all new files
- Follow ESLint rules strictly
- Use Prettier for consistent formatting
- Write descriptive commit messages

### Component Guidelines
- Keep components small and focused
- Use TypeScript interfaces for props
- Extract reusable logic into custom hooks
- Use shadcn/ui components when possible

### API Development
- Always validate inputs with Zod
- Return consistent error responses
- Use HTTP status codes correctly
- Log errors with context

### Database
- Use Prisma transactions for related operations
- Index frequently queried fields
- Avoid N+1 query problems
- Use proper relations and cascades

### Security
- Never log sensitive data
- Validate and sanitize all inputs
- Use prepared statements (Prisma does this)
- Implement rate limiting
- Keep dependencies updated

### Performance
- Use React.memo for expensive components
- Implement pagination for lists
- Optimize images (Next.js Image component)
- Use server components when possible
- Implement proper caching

---

## Troubleshooting

### Common Issues

**Prisma client not generated:**
```bash
npx prisma generate
```

**Database connection failed:**
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Verify credentials

**Port already in use:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Build fails:**
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)

---

**Last Updated:** January 2025
