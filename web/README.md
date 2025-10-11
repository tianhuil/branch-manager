# Web Demo App - Database Branch Manager

This Next.js application demonstrates the `@neon-prototype/db-branch` package functionality and serves as a testing/demo environment.

## 🚀 Deploying to Vercel

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **PostgreSQL Database**: A Neon or other PostgreSQL database with admin access
3. **Environment Variables**: Required credentials (see below)

### Deployment Steps

#### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Import Repository**

   ```bash
   # Push your code to GitHub
   git push origin feat/package
   ```

2. **Connect to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select the `feat/package` branch

3. **Configure Root Directory**
   - Set **Root Directory** to `web`
   - Vercel will auto-detect Next.js framework

4. **Set Environment Variables**

   Add these in Vercel Dashboard → Settings → Environment Variables:

   ```bash
   # Database Connection
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   DB_HOST=your-db-host.neon.tech

   # For Preview Database Management
   DB_PASSWORD_SEED=your-secret-seed-value
   ROOT_DATABASE_URL=postgresql://admin:password@host/postgres?sslmode=require

   # Optional: Logging
   LOG_LEVEL=info
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

#### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from web directory
cd web
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? [your account]
# - Link to existing project? N
# - Project name? db-branch-demo
# - Directory? ./
# - Override settings? N

# Set environment variables
vercel env add DATABASE_URL
vercel env add DB_HOST
vercel env add DB_PASSWORD_SEED
vercel env add ROOT_DATABASE_URL

# Deploy to production
vercel --prod
```

### Vercel Configuration

The app includes a `vercel.json` configuration file:

```json
{
  "buildCommand": "cd web && npm run build",
  "devCommand": "cd web && npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": "web/.next"
}
```

For monorepo setup, you may need to adjust the root directory in Vercel dashboard.

## 🔧 Local Development

### Setup

```bash
# From project root
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Start development server
bun run web:dev
```

The app will be available at `http://localhost:3000`

### Development Scripts

```bash
# From project root
bun run web:dev      # Start dev server with hot reload
bun run web:build    # Build for production
bun run web:start    # Start production server
```

### Environment Variables

Create a `.env.development` file in the project root:

```bash
# Database Connection
DATABASE_URL=postgresql://user:password@localhost:5432/mydb?sslmode=require
DB_HOST=localhost

# For Preview Database Features
DB_PASSWORD_SEED=development-seed-value
ROOT_DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres

# Development Settings
LOG_LEVEL=debug
NODE_ENV=development
```

## 📦 Using the Package in Web App

The web app imports and uses the main package from `../src`:

```typescript
// Import from parent src directory
import { PreviewDatabase } from "@/src/preview";
import { createDatabase } from "@/src/db";
import { createLogger } from "@/src/logger";

// Use in your components or API routes
const preview = new PreviewDatabase("my-branch");
await preview.create();
```

### Example: API Route

```typescript
// app/api/preview/create/route.ts
import { PreviewDatabase } from "@/src/preview";
import { NextResponse } from "next";

export async function POST(request: Request) {
  const { branchName } = await request.json();

  try {
    const preview = new PreviewDatabase(branchName);
    await preview.create();

    return NextResponse.json({
      success: true,
      databaseUrl: preview.databaseUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### Example: Server Component

```typescript
// app/databases/page.tsx
import { PreviewDatabase } from "@/src/preview";

export default async function DatabasesPage() {
  const preview = new PreviewDatabase("main");

  return (
    <div>
      <h1>Database Manager</h1>
      <p>Database: {preview.dbName}</p>
      <p>User: {preview.dbUser}</p>
    </div>
  );
}
```

## 🌿 Preview Deployments

Vercel automatically creates preview deployments for pull requests. To create isolated preview databases:

### Option 1: Manual Setup in Vercel

Add this script to your GitHub Actions workflow:

```yaml
- name: Create Preview Database
  env:
    DB_PASSWORD_SEED: ${{ secrets.DB_PASSWORD_SEED }}
    DB_HOST: ${{ secrets.DB_HOST }}
    ROOT_DATABASE_URL: ${{ secrets.ROOT_DATABASE_URL }}
    BRANCH_NAME: ${{ github.head_ref }}
  run: |
    cd web
    bunx db-branch preview create --branch-name $BRANCH_NAME
    DB_URL=$(bunx db-branch preview url --branch-name $BRANCH_NAME)
    echo "DATABASE_URL=$DB_URL" >> $GITHUB_ENV

- name: Deploy to Vercel
  env:
    DATABASE_URL: ${{ env.DATABASE_URL }}
  run: vercel deploy --env DATABASE_URL="$DATABASE_URL"
```

### Option 2: Build Command Hook

Update `vercel.json` to run database creation during build:

```json
{
  "buildCommand": "bunx db-branch preview create && cd web && npm run build"
}
```

## 🗄️ Database Schema

The app uses Drizzle ORM. To update the database schema:

```bash
# Generate migrations
cd web
bunx drizzle-kit generate

# Push changes to database
bunx drizzle-kit push

# Or run migrations
bunx drizzle-kit migrate
```

## 📁 Project Structure

```
web/
├── app/                  # Next.js App Router
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── api/             # API routes (if needed)
├── lib/
│   └── db/              # Database utilities
│       ├── client.ts    # Drizzle client
│       └── schema.ts    # Database schema
├── public/              # Static assets
├── next.config.ts       # Next.js configuration
├── drizzle.config.ts    # Drizzle ORM configuration
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

## 🔐 Security Best Practices

### Environment Variables

1. **Never commit** `.env` files
2. **Use Vercel secrets** for sensitive data
3. **Rotate credentials** regularly
4. **Use least privilege** - create separate database users for each environment

### Database Access

1. **Enable SSL** - Always use `sslmode=require`
2. **Connection pooling** - Use PgBouncer or similar for production
3. **IP restrictions** - Whitelist Vercel IPs in your database firewall

### Secrets Management

Store secrets in Vercel:

```bash
# Add production secrets
vercel env add DB_PASSWORD_SEED production

# Add preview secrets
vercel env add DB_PASSWORD_SEED preview

# Add development secrets
vercel env add DB_PASSWORD_SEED development
```

## 🐛 Troubleshooting

### Build Fails on Vercel

**Issue**: Cannot find module `@/src/...`

**Solution**: Ensure `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["../*"]
    }
  }
}
```

### Database Connection Timeout

**Issue**: Database connection fails during build

**Solution**:

1. Check `DATABASE_URL` is set in Vercel environment variables
2. Verify database allows connections from Vercel IPs
3. Ensure SSL is enabled (`?sslmode=require`)

### Preview Database Creation Fails

**Issue**: Cannot create preview database

**Solution**:

1. Verify `ROOT_DATABASE_URL` has admin privileges
2. Check `DB_PASSWORD_SEED` is set
3. Ensure database host allows connections
4. Check branch name is valid (alphanumeric and underscores only)

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Neon Database](https://neon.tech/docs)
- [Main Package README](../README.md)

## 🤝 Contributing

When making changes to the web app:

1. Test locally: `bun run web:dev`
2. Build successfully: `bun run web:build`
3. Run linting: `bun run check:fix`
4. Test deployment on Vercel preview branch

## 📄 License

MIT - See [LICENSE](../LICENSE) file for details
