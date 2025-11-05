# Local Development Guide

Quick setup guide for developers to get Keora running locally.

## Quick Start (5 minutes)

### Prerequisites

Install these before starting:
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)
- Code editor (VS Code recommended)

### Step-by-Step Setup

**1. Clone and Install**
```bash
git clone <repository-url>
cd Keora
npm install
```

**2. Environment Setup**
```bash
cp .env.example .env
```

Edit `.env` and set:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/keora"
JWT_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

**3. Start Database**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

This starts PostgreSQL and Redis in Docker.

**4. Setup Database**
```bash
npx prisma generate
npx prisma db push
```

**5. Run Development Server**
```bash
npm run dev
```

Open http://localhost:3000 🎉

---

## Development Workflow

### Daily Development

**Start work:**
```bash
# Pull latest changes
git pull

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

### Making Database Changes

**1. Edit schema:**
Edit `prisma/schema.prisma`

**2. Apply changes:**
```bash
npx prisma db push          # Fast (dev only)
# OR
npx prisma migrate dev      # Creates migration (recommended)
```

**3. Regenerate client:**
```bash
npx prisma generate
```

### Viewing Database

**Prisma Studio (GUI):**
```bash
npx prisma studio
```
Opens at http://localhost:5555

---

## Common Tasks

### Reset Database
```bash
npx prisma migrate reset
```
⚠️ This deletes all data!

### Add New Dependency
```bash
npm install <package-name>
```

### Add Dev Dependency
```bash
npm install -D <package-name>
```

### Run Type Checking
```bash
npm run type-check
```

### Run Linter
```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

### Format Code
```bash
npm run format
```

---

## Troubleshooting

### Issue: Port 3000 already in use

**Solution:**
```bash
# Find and kill process
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

### Issue: Prisma Client not generated

**Solution:**
```bash
npx prisma generate
```

### Issue: Build fails after pulling changes

**Solution:**
```bash
# Clean install
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### Issue: Database schema out of sync

**Solution:**
```bash
npx prisma db push
```

### Issue: Hot reload not working

**Solution:**
```bash
# Restart dev server
# Kill and run again
npm run dev
```

---

## VS Code Setup

### Recommended Extensions

Install these for the best experience:

1. **ESLint** - `dbaeumer.vscode-eslint`
2. **Prettier** - `esbenp.prettier-vscode`
3. **Prisma** - `Prisma.prisma`
4. **Tailwind CSS IntelliSense** - `bradlc.vscode-tailwindcss`
5. **TypeScript Error Translator** - `mattpocock.ts-error-translator`

### Settings

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

---

## Docker Commands

### Start services
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Stop services
```bash
docker-compose -f docker-compose.dev.yml down
```

### View logs
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Restart service
```bash
docker-compose -f docker-compose.dev.yml restart postgres
```

### Remove volumes (⚠️ deletes data)
```bash
docker-compose -f docker-compose.dev.yml down -v
```

---

## Testing Locally

### Run Tests
```bash
npm run test           # Unit tests
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage
```

### Test API Endpoints

Use tools like:
- **Thunder Client** (VS Code extension)
- **Postman**
- **curl**

Example:
```bash
# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "mobile": "+1234567890",
    "password": "TestPass123!"
  }'
```

---

## Environment Variables

### Required (Development)
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/keora"
JWT_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Optional (For Testing Features)
```env
# Email (uses Ethereal test account if not set)
EMAIL_FROM="noreply@keora.local"
SENDGRID_API_KEY=""

# WhatsApp (mocked in dev if not set)
WHATSAPP_API_KEY=""
WHATSAPP_API_URL=""
WHATSAPP_SENDER_ID=""

# File Storage (uses local storage if not set)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET=""
```

---

## Git Workflow

### Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### Commit Changes
```bash
git add .
git commit -m "feat: add new feature"
```

### Push Changes
```bash
git push origin feature/your-feature-name
```

### Update from Main
```bash
git checkout main
git pull
git checkout feature/your-feature-name
git merge main
```

---

## Performance Tips

### Speed up npm install
```bash
# Use npm ci for faster installs
npm ci
```

### Speed up builds
```bash
# Disable telemetry
npx next telemetry disable
```

### Use Turbo for faster reloads
Already configured in `next.config.mjs`

---

## Useful Links

### Local Services
- **App:** http://localhost:3000
- **Prisma Studio:** http://localhost:5555
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://prisma.io/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

---

## Getting Help

1. **Check logs:**
   ```bash
   npm run dev  # See console output
   docker-compose -f docker-compose.dev.yml logs -f
   ```

2. **Search issues:**
   Check if others had the same problem

3. **Ask the team:**
   Reach out on Slack/Teams

4. **Consult documentation:**
   See README.md and DEVELOPER.md

---

**Happy coding! 🚀**
