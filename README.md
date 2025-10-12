# Database Branch Manager - Core Logic

[![CI](https://github.com/tianhuil/neon-prototype/actions/workflows/ci.yml/badge.svg)](https://github.com/tianhuil/neon-prototype/actions/workflows/ci.yml)

## Motivation

Vercel accelerates development by creating an independent branch app per pull request on Github. However, if the branch has an updated SQL database schema, the code on the branch app will fail. Branch Manager aims to automate creating of simple **"DB branches"**.

Branch Manager is a lightweight alternative to fancy **branches** provided by vendors like [Neon](https://neon.com/) or [PlanetScale](https://planetscale.com/). It has two advantages:

- Vendor branches are a new abstraction. Branch Manager creates plain old [postgres databases](https://www.postgresql.org/docs/7.4/manage-ag-createdb.html). No new abstractions to learn.
- While Vendor tools help you to create user (aka roles), it doesn't help grant the right permissions for those roles. Branch Manager automatically creates user and roles with permissions isolated to your DB branch.

## Install

### Install from GitHub

Choose your preferred package manager:

```bash
# Bun
bun add github:tianhuil/neon-prototype

# npm
npm install github:tianhuil/neon-prototype

# yarn
yarn add github:tianhuil/neon-prototype

# pnpm
pnpm add github:tianhuil/neon-prototype
```

### Run the CLI

After installation:

```bash
# Run from node_modules
npx bm preview --help

# Or run directly from GitHub without installing
npx github:tianhuil/neon-prototype bm preview --help
bunx --bun github:tianhuil/neon-prototype bm preview --help
```

## Cli Overview

Branch Manager (`bm`) provides two command groups:

### `bm preview` - Branch-specific databases (recommended)

Automatically creates databases tied to Git branches with pseudo-random segregated credentials. It is meant for preview branches that are generated on the fly and ephemeral.

```bash
# Create for specific branch
bm preview create --branch-name feat/new-feature

# Get connection URL for a branch
bm preview url --branch-name feat/new-feature

# Delete preview database
bm preview delete --branch-name feat/new-feature
```

For these, you supply a random but fixed `--db-password-seed` which cryptographically creates a pseudo-random password based on the branch name. This prevents

### `bm db` - Direct database operations (advanced)

This is a low-level API. It is useful for setting up permanent environments (e.g. staging, canary, production, testing, qa) with with segregated credentials.

```bash
# Create database with explicit credentials
bm db create \
  --db-name my-db \
  --db-user my-user \
  --db-password my-pass

# Get connection URL
bm db url \
  --db-name my-db \
  --db-user my-user \
  --db-password my-pass \
  --db-host db.example.com

# Delete database
bm db delete --db-name my-db --db-user my-user
```

Here, you can specify the password, user, and database name manually for greater control and security.

### Architecture

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
       │
       ▼
   PostgreSQL
```

## Code Structure

This is a **bun workspaces monorepo** with two packages:

### `src/` - Core Package (`@db-branch/core`)

The publishable npm package containing the database branch manager CLI tool. Includes the `bm` command-line interface, database operations (`db.ts`), preview database management (`preview.ts`), and utility functions. This package can be installed independently in any project.

### `web/` - Test Application

A Next.js application used for testing and demonstrating the database branch manager. Contains a sample database schema with Drizzle ORM and serves as a real-world integration test environment. Each PR automatically gets its own preview database via GitHub Actions (see `.github/workflows/pr-deploy.yml` for more).
