# Database Branch Manager - Core Logic

## Motivation

Vercel accelerates development by creating an independent branch app per pull request on Github. However, if the branch has an updated SQL database schema, the code on the branch app will fail. Branch Manager aims to automate creating of simple **"DB branches"**.

Branch Manager is a lightweight alternative to fancy **branches** provided by vendors like [Neon](https://neon.com/) or [PlanetScale](https://planetscale.com/). It has two advantages:

- Vendor branches are a new abstraction. Branch Manager creates plain old [postgres databases](https://www.postgresql.org/docs/7.4/manage-ag-createdb.html). No new abstractions to learn.
- While Vendor tools help you to create user (aka roles), it doesn't help grant the right permissions for those roles. Branch Manager automatically creates user and roles with permissions isolated to your DB branch.

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
  --db-name mydb \
  --db-user myuser \
  --db-password mypass

# Get connection URL
bm db url \
  --db-name mydb \
  --db-user myuser \
  --db-password mypass \
  --db-host db.example.com

# Delete database
bm db delete --db-name mydb --db-user myuser
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
