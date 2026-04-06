# 🧑🏻‍💼 Database Branch Manager

[![CI](https://github.com/tianhuil/branch-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/tianhuil/branch-manager/actions/workflows/ci.yml)

## Motivation

Vercel accelerates development by creating an independent branch app per pull
request on Github. However, if they point to the same DB and the branch app has
an updated SQL database schema, it will fail. Branch Manager aims to automate
creating of simple **"DB branches"**.

Branch Manager is a lightweight alternative to fancy **vendor branches**
provided by vendors like [Neon](https://neon.com/) or
[PlanetScale](https://planetscale.com/). It has three advantages:

- ✅ Branch Manager is Vendor agnostic 🎉! Avoid vendor lock-in by relying
  solely on open source Postgres primitives.

- ✅ No new abstractions to learn 🎉! Vendor branches are a new abstraction that
  may not work as expected. When Branch Manager creates a DB branch, it's just
  running
  [`CREATE DATABASE`](https://www.postgresql.org/docs/7.4/manage-ag-createdb.html)
  within the same Postgres DB.

- ✅ Branch Manager is a complete solution 🎉! While Vendor tools help you to
  create users (aka roles), it doesn't help grant the right permissions for
  those roles. Branch Manager automatically creates user and roles with
  permissions isolated to your DB branch.

There is one main drawback to using Branch Manager:

- ❌ Vendor branches copy data from the parent branch. Branch Manger expects a
  user to run a seeding script post branch creation. We believe that having a
  seeding script is a best practice for development so this is not a big
  downside.

## Install and Setup

### Install from GitHub

Choose your preferred package manager:

```bash
# Bun
bun add github:tianhuil/branch-manager

# npm
npm install github:tianhuil/branch-manager

# yarn
yarn add github:tianhuil/branch-manager

# pnpm
pnpm add github:tianhuil/branch-manager
```

### Basic CLI Usage

After installation:

```bash
# Run from node_modules
npx bm preview --help

# Or run directly from GitHub without installing
npx github:tianhuil/branch-manager bm preview --help
bunx --bun github:tianhuil/branch-manager bm preview --help
```

## Automatically creating branch databases on Pull Requests via Github Actions

See the file `.github/workflows/pr-deploy.yml` for the reference example. On
Pull Requests with updates to the migration folder, it automatically:

- Uses branch manager to create a new database and saves the new database's URL.
- Runs `drizzle push` on this new branch and executes the seeding script
- Updates the preview database env variable on that branch in Vercel (otherwise,
  the default staging database is used)
- Triggers a Vercel redeployment to update the new env variable
- Adds a comment to Github Pull Request to document this

You can see the result on
[this Pull Request](https://github.com/tianhuil/branch-manager/pull/10).

## Cli Overview

Branch Manager (`bm`) provides two command groups:

### `bm preview` - Branch-specific databases (recommended)

Automatically creates databases tied to Git branches with pseudo-random
segregated credentials. It is meant for preview branches that are generated on
the fly and ephemeral.

```bash
# Create for specific branch
bm preview create \
  --branch-name feat/new-feature \
  --db-password-seed your-secret-seed \
  --root-database-url postgresql://user:pass@host/db

# Or using environment variables:
BRANCH_NAME=feat/new-feature \
  DB_PASSWORD_SEED=your-secret-seed \
  ROOT_DATABASE_URL=postgresql://user:pass@host/db \
  bm preview create

# Get connection URL for a branch
bm preview url \
  --branch-name feat/new-feature \
  --db-password-seed your-secret-seed \
  --db-host db.example.com

# Or using environment variables:
BRANCH_NAME=feat/new-feature \
  DB_PASSWORD_SEED=your-secret-seed \
  DB_HOST=db.example.com \
  bm preview url

# Delete preview database
bm preview delete \
  --branch-name feat/new-feature \
  --db-password-seed your-secret-seed \
  --root-database-url postgresql://user:pass@host/db

# Or using environment variables:
BRANCH_NAME=feat/new-feature \
  DB_PASSWORD_SEED=your-secret-seed \
  ROOT_DATABASE_URL=postgresql://user:pass@host/db \
  bm preview delete
```

For these, you supply a random but fixed `--db-password-seed` which
cryptographically creates a pseudo-random password based on the branch name.
This prevents

### `bm db` - Direct database operations (advanced)

This is a low-level API. It is useful for setting up permanent environments
(e.g. staging, canary, production, testing, qa) with segregated credentials.

```bash
# Create database with explicit credentials
bm db create \
  --db-name my_db \
  --db-user my_user \
  --db-password my_pass \
  --root-database-url postgresql://user:pass@host/db

# Or using environment variables:
DB_NAME=my_db \
  DB_USER=my_user \
  DB_PASSWORD=my_pass \
  ROOT_DATABASE_URL=postgresql://user:pass@host/db \
  bm db create

# Get connection URL
bm db url \
  --db-name my_db \
  --db-user my_user \
  --db-password my_pass \
  --db-host db.example.com

# Or using environment variables:
DB_NAME=my_db \
  DB_USER=my_user \
  DB_PASSWORD=my_pass \
  DB_HOST=db.example.com \
  bm db url

# Or using root-database-url or ROOT_DATABASE_URL (host is extracted from it):
bm db url \
  --db-name my_db \
  --db-user my_user \
  --db-password my_pass \
  --root-database-url postgresql://user:pass@host/db

# Delete database
bm db delete \
  --db-name my_db \
  --db-user my_user \
  --root-database-url postgresql://user:pass@host/db

# Or using environment variables:
DB_NAME=my_db \
  DB_USER=my_user \
  ROOT_DATABASE_URL=postgresql://user:pass@host/db \
  bm db delete
```

Here, you can specify the password, user, and database name manually for greater
control and security.

### Architecture

At a high level, the code is organized with `preview.ts` calling `db.ts`, which
have the respective commands for the cli.

```text
┌─────────────┐
│  preview.ts │  Git branch → Database mapping
│             │  Deterministic credential generation
└──────┬──────┘
       │ uses
       ▼
┌─────────────┐
│   db.ts     │  PostgreSQL database creation/deletion
│             │  User management & permissions
└──────┬──────┘
       │ uses
       ▼
   PostgreSQL
```

## Code Structure

This is a **bun workspaces monorepo** with two packages:

### `src/` - Core Package (`@tianhuil/branch-manager`)

The publishable npm package containing the database branch manager CLI tool.
Includes the `bm` command-line interface, database operations (`db.ts`), preview
database management (`preview.ts`), and utility functions. This package can be
installed independently in any project.

### `web/` - Test Application

A Next.js application used for testing and demonstrating the database branch
manager. Contains a sample database schema with Drizzle ORM and serves as a
real-world integration test environment. Each PR automatically gets its own
preview database via GitHub Actions (see `.github/workflows/pr-deploy.yml` for
more).

## Development

For development, run

```bash
# Type check (eslint, prettier, typechecking, spellchecker)
bun run check
```

### Testing

We have two comprehensive e2e test suites:

```bash
# Run all e2e tests:
bun run test:e2e
```

- `src/db.test.ts`: tests the core database branch functionality with real
  PostgreSQL operations (we can create and delete a database with isolated
  permissions). This requires `ROOT_DATABASE_URL` and `DB_HOST` environment
  variables.
- `src/install.test.ts`: tests installing the package. We build the package with
  `bun run pack` and then test installing the compressed archive on the major
  node package managers (`npm`, `yarn`, `pnpm`, and `bun`). This requires no
  environment variables.

### Secrets Management

This repo use [dotenvx](https://dotenvx.com/) to manage secrets for the demo web
app on a neon database (you don't have to; branch manager is agnostic to your
choice of secrets manager and Postgres DB).

Each of the following files represents the encrypted credentials for an
environment (same keys, different values):

```text
.env.development
.env.production
.env.staging
```

They are meant to be used with the `.env` file to construct the `DATABASE_URL`,
e.g.

```bash
VERCEL_ENV=production bun run db:create
VERCEL_ENV=staging bun run db:migrate
```

The CI environment `.env.ci` also contains:

- Vercel credentials for deploying Vercel.
- Secrets `ROOT_DATABASE_URL` and `DB_PASSWORD_SEED` to make changes to the
  database in the Github Actions environment.

## Direct TypeScript Deployment (Bun)

This library uses the "Direct TS" deployment approach—shipping pure TypeScript
source code without a build step. Since Bun has a built-in transpiler, consumers
get instant type checking and IDE autocompletion directly from the source.

### Package.json Configuration

The key is pointing `main`, `module`, `types`, and `exports` directly at `.ts`
files:

```json
{
  "name": "@tianhuil/branch-manager",
  "type": "module",
  "main": "./src/index.ts",
  "module": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

Pointing `types` to the `.ts` file gives consumers perfect IDE autocompletion
because TypeScript can read types directly from source code.

### Versioning without npm

Since we're not using a registry, **Git Tags** are used for versioning:

```bash
# Commit changes
git commit -m "feat: add feature"

# Create a tag
git tag v1.0.0

# Push the tag
git push origin v1.0.0
```

To install a specific version:

```bash
bun add github:tianhuil/branch-manager#v1.0.0
```

If you omit the `#tag`, Bun will grab the latest commit from the default branch.

### Installing from a Monorepo

If the library lives inside a monorepo, use the `path:` syntax:

```bash
bun add "github:tianhuil/branch-manager#path:packages/my-lib"
```

> **Note:** If `path:` syntax causes issues, consider keeping the library in its
> own dedicated repository.

### Should you compile to JS?

**No.** Using `postinstall` to run `bun build` requires consumers to have
`devDependencies` like `typescript` installed. Instead, this library ships pure
TypeScript source code, and Bun handles the transpilation transparently.
