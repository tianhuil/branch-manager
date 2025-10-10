# @neon-prototype/db-branch

A lightweight database branch manager for PostgreSQL that creates isolated preview databases for Git branches in CI/CD pipelines.

## Features

- ✅ **No New Abstractions** - Creates plain PostgreSQL databases, no vendor lock-in
- 🔒 **Automatic Permissions** - Creates users with proper role-based permissions
- 🔑 **Deterministic Credentials** - Stateless password generation from a single seed
- 🌿 **Git Branch Mapping** - Automatically maps Git branches to databases
- 🚀 **CI/CD Ready** - Perfect for Vercel preview deployments and GitHub Actions
- 💻 **CLI & Programmatic API** - Use as a command-line tool or import as a library

## Installation

```bash
# With bun
bun add @neon-prototype/db-branch

# With npm
npm install @neon-prototype/db-branch

# With yarn
yarn add @neon-prototype/db-branch
```

## Quick Start

### As a CLI Tool

```bash
# Create a preview database for the current Git branch
bm preview create

# Get the database connection URL
bm preview url --branch-name feat/new-feature

# Delete a preview database
bm preview delete --branch-name feat/new-feature
```

### As a Library

```typescript
import { PreviewDatabase } from "@neon-prototype/db-branch";

// Create a preview database
const preview = new PreviewDatabase("feat/new-feature");
await preview.create();

// Get the connection URL
console.log(preview.databaseUrl);

// Delete the database
await preview.delete();
```

## CLI Commands

### `bm preview` - Branch-specific databases (recommended)

Automatically creates databases tied to Git branches with pseudo-random segregated credentials.

```bash
# Create for current branch (auto-detected from git)
bm preview create

# Create for specific branch
bm preview create --branch-name feat/new-feature

# Get connection URL
bm preview url --branch-name feat/new-feature

# Delete preview database
bm preview delete --branch-name feat/new-feature
```

**Required Environment Variables:**

- `DB_PASSWORD_SEED` - A secret seed for deterministic password generation
- `DB_HOST` - PostgreSQL host
- `ROOT_DATABASE_URL` - Admin connection URL for creating databases

### `bm db` - Direct database operations (advanced)

Low-level API for setting up permanent environments (staging, production, etc.).

```bash
# Create database with explicit credentials
bm db create \
  --db-name my-db \
  --db-user my-user \
  --db-password my-pass \
  --root-database-url postgresql://admin:pass@host/postgres

# Get connection URL
bm db url \
  --db-name my-db \
  --db-user my-user \
  --db-password my-pass \
  --db-host db.example.com

# Delete database and user
bm db delete \
  --db-name my-db \
  --db-user my-user \
  --root-database-url postgresql://admin:pass@host/postgres
```

## Programmatic API

### PreviewDatabase

```typescript
import { PreviewDatabase } from "@neon-prototype/db-branch";

// Environment variables required:
// - DB_PASSWORD_SEED
// - DB_HOST
// - ROOT_DATABASE_URL

const preview = new PreviewDatabase("feat/my-feature");

// Properties
preview.dbName; // "preview_feat_my_feature"
preview.dbUser; // "preview_feat_my_feature"
preview.dbPassword; // Deterministically generated
preview.databaseUrl; // Full PostgreSQL connection URL

// Methods
await preview.create(); // Create database and user
await preview.delete(); // Delete database and user
```

### Direct Database Functions

```typescript
import {
  createDatabase,
  deleteDatabase,
  getDatabaseUrl,
} from "@neon-prototype/db-branch/db";

// Create a database
await createDatabase({
  dbName: "my_database",
  dbUser: "my_user",
  dbPassword: "secure_password",
  rootDatabaseUrl: "postgresql://admin:pass@host/postgres",
});

// Delete a database
await deleteDatabase({
  dbName: "my_database",
  dbUser: "my_user",
  rootDatabaseUrl: "postgresql://admin:pass@host/postgres",
});

// Generate connection URL
const url = getDatabaseUrl({
  dbName: "my_database",
  dbUser: "my_user",
  dbPassword: "secure_password",
  dbHost: "db.example.com",
});
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Deploy Preview

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Create preview database
        env:
          DB_PASSWORD_SEED: ${{ secrets.DB_PASSWORD_SEED }}
          DB_HOST: ${{ secrets.DB_HOST }}
          ROOT_DATABASE_URL: ${{ secrets.ROOT_DATABASE_URL }}
          BRANCH_NAME: ${{ github.head_ref }}
        run: bunx db-branch preview create

      - name: Get database URL
        id: db
        env:
          DB_PASSWORD_SEED: ${{ secrets.DB_PASSWORD_SEED }}
          DB_HOST: ${{ secrets.DB_HOST }}
          BRANCH_NAME: ${{ github.head_ref }}
        run: |
          URL=$(bunx db-branch preview url --branch-name ${{ github.head_ref }})
          echo "DATABASE_URL=$URL" >> $GITHUB_OUTPUT

      - name: Deploy to Vercel
        env:
          DATABASE_URL: ${{ steps.db.outputs.DATABASE_URL }}
        run: vercel deploy --build-env DATABASE_URL="$DATABASE_URL"
```

### Vercel Integration

Add to your `vercel.json`:

```json
{
  "buildCommand": "bunx db-branch preview create && bun run build",
  "env": {
    "DB_PASSWORD_SEED": "@db-password-seed",
    "DB_HOST": "@db-host",
    "ROOT_DATABASE_URL": "@root-database-url"
  }
}
```

## How It Works

### Deterministic Password Generation

Instead of storing passwords for every branch database, we use a single secret `DB_PASSWORD_SEED` to deterministically generate passwords:

```typescript
// Pseudo-code
password = PBKDF2(
  password: DB_PASSWORD_SEED,
  salt: branchName,
  iterations: 1000,
  keyLength: 64,
  digest: 'sha512'
).toString('base64url');
```

This means:

- ✅ Same branch always gets the same password
- ✅ No need to store passwords anywhere
- ✅ CI pipelines can recreate credentials across jobs
- ✅ Secure (one-way function, password seed never exposed)

### Database Isolation

Each preview database gets:

1. A dedicated PostgreSQL database
2. A dedicated user (role) with the same name
3. Permissions isolated to that database only
4. Automatic schema privileges (USAGE, CREATE on public schema)

## Security Considerations

- Keep `DB_PASSWORD_SEED` secret and rotate it periodically
- Use `ROOT_DATABASE_URL` with a PostgreSQL superuser that can create databases/users
- Consider using connection pooling for production workloads
- Preview databases use SSL with channel binding by default

## Architecture

```text
┌─────────────────┐
│  CLI (index.ts) │  Command-line interface
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  preview.ts     │  Git branch → Database mapping
│                 │  Deterministic credential generation
└────────┬────────┘
         │ uses
         ▼
┌─────────────────┐
│    db.ts        │  PostgreSQL database creation/deletion
│                 │  User management & permissions
└────────┬────────┘
         │
         ▼
    PostgreSQL
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or pull request.

## Credits

Built with:

- [commander](https://github.com/tj/commander.js) - CLI framework
- [@neondatabase/serverless](https://github.com/neondatabase/serverless) - PostgreSQL driver
- [pino](https://github.com/pinojs/pino) - Logging
