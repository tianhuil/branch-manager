# Refactoring Summary

This document summarizes the major refactoring that transformed this codebase into a monorepo structure.

## Overview

The codebase has been reorganized from a single Next.js application with embedded scripts into a **bun workspaces monorepo** with two distinct packages:

1. **`src/`** - The publishable `@db-branch/core` npm package
2. **`web/`** - The Next.js web application for testing

## Structure

```
neon-prototype/
├── src/                          # @db-branch/core package
│   ├── index.ts                  # CLI entry point (bm command)
│   ├── db.ts                     # Database operations
│   ├── preview.ts                # Preview database management
│   ├── logger.ts                 # Logging utilities
│   ├── util.ts                   # Shared utilities
│   ├── db.e2e.ts                 # E2E tests
│   ├── package.json              # Package configuration
│   ├── tsconfig.json             # TypeScript config
│   └── README.md                 # Package documentation
│
├── web/                          # Next.js application
│   ├── app/                      # Next.js app directory
│   ├── lib/                      # Database client & schema
│   ├── public/                   # Static assets
│   ├── package.json              # Web app dependencies
│   ├── tsconfig.json             # TypeScript config
│   ├── next.config.ts            # Next.js config
│   ├── drizzle.config.ts         # Drizzle ORM config
│   └── eslint.config.mjs         # ESLint config
│
├── .github/workflows/
│   ├── ci.yml                    # CI for src/ package
│   └── pr-deploy.yml             # PR preview deployments for web/
│
├── package.json                  # Root workspace config
├── tsconfig.json                 # Root TypeScript project references
├── vercel.json                   # Vercel deployment config
└── README.md                     # Main documentation (unchanged)
```

## Key Changes

### 1. Package Structure

- **`src/` (formerly `script/db-branch/`)**
  - Now a standalone, publishable npm package
  - Name: `@db-branch/core`
  - CLI command: `bm` (Branch Manager)
  - Can be published to npm for use in other projects
  - Includes its own `package.json`, `tsconfig.json`, and tests

- **`web/` (formerly root-level Next.js app)**
  - Moved all Next.js code to `web/` directory
  - Includes: `app/`, `lib/`, `public/`, configs
  - Uses `bm` from `src/` via workspace dependency
  - Maintains all original functionality

### 2. Workspace Configuration

Root `package.json` now defines workspaces:

```json
{
  "workspaces": ["src", "web"]
}
```

This enables:

- Shared dependencies at root level
- Per-package scripts and dependencies
- Efficient dependency management with bun

### 3. Scripts

**Root level:**

```bash
bun run dev          # Run web dev server
bun run build        # Build web app
bun run typecheck    # Type check both packages
bun run lint         # Lint both packages
bun run test:e2e     # Run e2e tests for src/
bun run bm           # Run bm CLI tool
```

**Package-specific:**

```bash
# In src/
bun run typecheck    # Type check src package
bun test             # Run tests

# In web/
bun run dev          # Next.js dev server
bun run build        # Build Next.js app
bun run db:push      # Push database schema
```

### 4. GitHub Actions

**`ci.yml`** - Tests the `src/` package:

- Runs on push/PR to staging/production
- Type checks and lints the core package
- Currently disabled (can be re-enabled)

**`pr-deploy.yml`** - Deploys `web/` with preview databases:

- Creates preview database using `bm` from `src/`
- Runs migrations in `web/`
- Deploys to Vercel
- Updated paths: `./src/index.ts` instead of `./script/db-branch/index.ts`
- Updated working directory for migrations: `cd web` before `drizzle-kit push`

### 5. Deployment

**Vercel** configuration updated in `vercel.json`:

```json
{
  "buildCommand": "cd web && bun install && bun run build",
  "devCommand": "cd web && bun run dev",
  "installCommand": "bun install",
  "outputDirectory": "web/.next"
}
```

This ensures Vercel:

- Installs workspace dependencies at root
- Builds from the `web/` directory
- Serves from `web/.next/`

### 6. Files Removed

The following were moved or consolidated:

- `script/db-branch/` → `src/`
- `app/` → `web/app/`
- `lib/` → `web/lib/`
- Root-level Next.js configs → `web/`
- `next-env.d.ts`, `tsconfig.tsbuildinfo` (deleted, regenerated as needed)

## Benefits

1. **Clear Separation of Concerns**
   - CLI tool (`src/`) is independent and publishable
   - Web app (`web/`) is for testing and demonstration

2. **Publishable Package**
   - `src/` can be published to npm as `@db-branch/core`
   - Other projects can install and use the `bm` CLI

3. **Better Development Experience**
   - Run commands in specific packages
   - Isolated dependencies
   - Faster CI/CD (test only what changed)

4. **Deployment Flexibility**
   - Web app can be deployed independently
   - CLI tool can be used in any environment
   - Vercel still works seamlessly

## Usage Examples

### Run bm CLI from root:

```bash
bun run bm preview create --branch-name my-feature
```

### Develop the web app:

```bash
bun run dev  # or: cd web && bun run dev
```

### Test the core package:

```bash
cd src
bun test
bun test:e2e  # requires ROOT_DATABASE_URL
```

### Type check everything:

```bash
bun run typecheck
```

## Migration Notes

- All import paths remain the same within each package
- GitHub Actions workflows updated to use new paths
- Vercel deployment configured for monorepo structure
- No changes to the main README.md (as requested)

## Future Enhancements

Consider these potential improvements:

- Add `turborepo` for better caching (currently using simpler bun workspaces)
- Publish `@db-branch/core` to npm registry
- Add more comprehensive tests
- Create separate deployment workflows for each package
