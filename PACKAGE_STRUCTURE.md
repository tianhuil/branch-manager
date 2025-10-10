# Package Structure

This document describes the restructured package layout for npm publishing.

## Directory Structure

```
/
├── src/                    # Main package source (npm installable)
│   ├── index.ts           # CLI entry point with bin commands
│   ├── db.ts              # Database creation/deletion functions
│   ├── preview.ts         # PreviewDatabase class for branch management
│   ├── logger.ts          # Logging utilities
│   └── util.ts            # Helper functions
│
├── dist/                  # Compiled package (auto-generated, npm published)
│   ├── *.js               # Compiled JavaScript
│   ├── *.d.ts             # TypeScript declarations
│   └── *.map              # Source maps
│
├── web/                   # Next.js demo/test app (not published)
│   ├── app/               # Next.js app directory
│   ├── lib/db/            # Database client & schema for testing
│   ├── public/            # Static assets
│   ├── next.config.ts     # Next.js configuration
│   ├── drizzle.config.ts  # Drizzle ORM configuration
│   └── tsconfig.json      # TypeScript config for web app
│
├── script/                # Development scripts (not published)
│   └── db-branch/         # Original implementation (kept for reference)
│
├── package.json           # Package configuration with proper exports
├── tsconfig.json          # Main TypeScript configuration
├── tsconfig.build.json    # Build-specific TypeScript config
├── .npmignore             # Files to exclude from npm package
└── README.md              # Package documentation
```

## Package Configuration

### Exports

The package provides multiple entry points:

- **Main Entry**: `@neon-prototype/db-branch` - CLI and full API
- **Database**: `@neon-prototype/db-branch/db` - Database operations only
- **Preview**: `@neon-prototype/db-branch/preview` - PreviewDatabase class
- **Logger**: `@neon-prototype/db-branch/logger` - Logging utilities
- **Util**: `@neon-prototype/db-branch/util` - Helper functions

### CLI Binaries

- `db-branch` - Main CLI command
- `bm` - Short alias for convenience

### Scripts

#### Package Scripts

- `bun run build` - Build the package for npm publishing
- `bun run typecheck` - Type check all TypeScript files
- `bun run check:fix` - Run linter, formatter, and spell checker with auto-fix

#### Web App Scripts

- `bun run web:dev` - Start Next.js development server
- `bun run web:build` - Build Next.js app for production
- `bun run web:start` - Start Next.js production server

## Publishing Workflow

1. **Build**: `bun run build` - Compiles TypeScript to dist/
2. **Pre-publish**: `prepublishOnly` hook automatically runs build
3. **Publish**: `npm publish` - Publishes to npm registry

## Files Included in NPM Package

- `dist/` - All compiled files
- `README.md` - Documentation
- `LICENSE` - License file (if present)

## Files Excluded from NPM Package

- Source files (`src/`)
- Test files (`**/*.test.ts`, `**/*.e2e.ts`)
- Web app (`web/`)
- Development scripts (`script/`)
- Configuration files (`.env*`, etc.)
- Build artifacts (`node_modules/`, `bun.lock`)

## Development Workflow

### Working on the Package

1. Edit source files in `src/`
2. Run `bun run check:fix` to lint and format
3. Run `bun run build` to compile
4. Test the compiled package in `dist/`

### Working on the Web App

1. Edit files in `web/`
2. Run `bun run web:dev` to test changes
3. The web app uses the same database utilities as the package

## Migration from Old Structure

### Before (Original Structure)

```
/
├── app/                   # Next.js app
├── lib/                   # Database utilities
├── script/db-branch/      # Package source
└── package.json           # Monolithic config
```

### After (New Structure)

```
/
├── src/                   # Package source (extracted from script/db-branch)
├── web/                   # Next.js app (moved from app/ and lib/)
├── dist/                  # Built package (auto-generated)
└── package.json           # Configured for npm publishing
```

## Best Practices Applied

1. **Separation of Concerns**: Package source (`src/`) is separate from demo app (`web/`)
2. **Standard Entry Points**: Following Node.js package conventions with proper `exports`
3. **TypeScript Declarations**: Full type definitions generated for TypeScript users
4. **CLI Support**: Binary entry points for command-line usage
5. **Monorepo-friendly**: Clear separation allows for future monorepo migration
6. **Tree-shakeable**: ES modules with proper exports for optimal bundling
7. **Development Experience**: Source maps and declaration maps for debugging

## Usage Examples

### As a CLI Tool

```bash
# Install globally
npm install -g @neon-prototype/db-branch

# Use the CLI
bm preview create --branch-name feat/new-feature
db-branch preview url --branch-name feat/new-feature
```

### As a Library

```typescript
import { PreviewDatabase } from "@neon-prototype/db-branch";
import { createDatabase } from "@neon-prototype/db-branch/db";

// Use the PreviewDatabase class
const preview = new PreviewDatabase("my-branch");
await preview.create();

// Or use database functions directly
await createDatabase({
  dbName: "my_db",
  dbUser: "my_user",
  dbPassword: "secure",
  rootDatabaseUrl: "postgresql://...",
});
```

## Next Steps

1. **Testing**: Add unit tests for package functions
2. **CI/CD**: Set up automated testing and publishing
3. **Documentation**: Expand examples and use cases
4. **Versioning**: Follow semantic versioning for releases
5. **Changelog**: Maintain a changelog for version history
