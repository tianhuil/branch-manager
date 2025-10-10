# Quick Start Guide

## For Package Consumers

### Installation

```bash
# With bun
bun add @neon-prototype/db-branch

# With npm
npm install @neon-prototype/db-branch

# With yarn
yarn add @neon-prototype/db-branch
```

### CLI Usage

```bash
# Create a preview database for current branch
bm preview create

# Create for specific branch
bm preview create --branch-name feat/new-feature

# Get connection URL
bm preview url --branch-name feat/new-feature

# Delete preview database
bm preview delete --branch-name feat/new-feature

# Show help
bm --help
bm preview --help
bm db --help
```

### Programmatic Usage

```typescript
import { PreviewDatabase } from "@neon-prototype/db-branch";

// Set environment variables
process.env.DB_PASSWORD_SEED = "your-secret-seed";
process.env.DB_HOST = "your-postgres-host.neon.tech";
process.env.ROOT_DATABASE_URL = "postgresql://admin:pass@host/postgres";

// Create preview database
const preview = new PreviewDatabase("feat/my-feature");
await preview.create();

// Get connection URL
console.log(preview.databaseUrl);

// Delete when done
await preview.delete();
```

## For Package Developers

### Setup

```bash
# Clone repository
git clone <repo-url>
cd feat/package

# Install dependencies
bun install
```

### Development Workflow

```bash
# 1. Make changes to src/ files
vim src/preview.ts

# 2. Run type checking
bun run typecheck

# 3. Run linting and formatting
bun run check:fix

# 4. Build the package
bun run build

# 5. Test CLI locally
bun dist/index.js --help
```

### Testing with Web App

```bash
# Start development server
bun run web:dev

# Build for production
bun run web:build

# Start production server
bun run web:start
```

### Publishing

```bash
# Build and publish (prepublishOnly hook runs automatically)
npm publish

# Or with bun
bun publish
```

## Project Structure

```
/
├── src/              # 📦 Package source (what you develop)
├── dist/             # 📦 Built package (auto-generated)
├── web/              # 🌐 Testing/demo Next.js app
├── script/           # 🛠️ Development scripts
└── package.json      # 📦 Package configuration
```

## Environment Variables

Create `.env` file for development:

```bash
# Required for preview databases
DB_PASSWORD_SEED=your-secret-seed-value-here
DB_HOST=your-postgres-host.neon.tech
ROOT_DATABASE_URL=postgresql://admin:password@host/postgres

# Optional
LOG_LEVEL=info
NODE_ENV=development
```

## Common Tasks

### Add a new export

1. Create new file in `src/`
2. Add export to `package.json`:

```json
{
  "exports": {
    "./my-module": {
      "types": "./dist/my-module.d.ts",
      "default": "./dist/my-module.js"
    }
  }
}
```

3. Build: `bun run build`

### Update dependencies

```bash
# Add new dependency
bun add <package>

# Add dev dependency
bun add -d <package>

# Update all
bun update
```

### Run tests (when added)

```bash
# Unit tests
bun test

# E2E tests (requires database)
bun run test:e2e
```

## Validation

Ensure everything works:

```bash
# Type check
bun run typecheck

# Lint and format
bun run check:fix

# Build
bun run build

# Test CLI
bun dist/index.js --help
```

All commands should complete without errors.

## Resources

- **README.md** - Comprehensive documentation
- **PACKAGE_STRUCTURE.md** - Detailed structure explanation
- **RESTRUCTURING_SUMMARY.md** - Migration guide
- **script/db-branch/README.md** - Original implementation docs

## Support

For issues or questions:

1. Check existing documentation
2. Review code comments
3. Open an issue on GitHub
4. Contact maintainers

## Best Practices

1. **Always run checks before committing**: `bun run check:fix`
2. **Build before testing CLI**: `bun run build`
3. **Keep src/ and web/ separate**: Don't cross-import
4. **Document all public APIs**: Add JSDoc comments
5. **Follow TypeScript strict mode**: No `any` types
6. **Use functional patterns**: Prefer immutability
7. **Test thoroughly**: Add unit and E2E tests

## Next Steps

1. Add unit tests for all functions
2. Set up CI/CD pipeline
3. Add changelog
4. Create example projects
5. Publish to npm
