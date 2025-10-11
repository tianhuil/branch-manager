# Tests

This directory contains tests for the database branch manager package.

## Test Structure

```
test/
├── db.e2e.ts           # End-to-end database tests
└── README.md           # This file
```

## Running Tests

### E2E Tests

End-to-end tests require a real PostgreSQL database with admin credentials.

```bash
# Set up environment variables
export ROOT_DATABASE_URL="postgresql://admin:pass@host/postgres"
export DB_HOST="your-db-host.neon.tech"

# Run E2E tests
bun run test:e2e

# Or with dotenvx
dotenvx run -f .env.root.local -f .env -- bun run test:e2e
```

### Unit Tests (Future)

```bash
# Run all tests
bun test

# Run specific test file
bun test test/unit/preview.test.ts

# Watch mode
bun test --watch
```

## E2E Test Coverage

The `db.e2e.ts` file tests:

1. **Database Creation**
   - Creates a new database with user and privileges
   - Verifies idempotent operations
   - Tests schema migrations with Drizzle

2. **Database Isolation**
   - Verifies users cannot access other databases
   - Tests privilege restrictions
   - Confirms proper permission setup

3. **Database Deletion**
   - Removes databases cleanly
   - Deletes users
   - Verifies cleanup is complete

## Test Database Naming

E2E tests use the following naming convention:

- `test_db_1`, `test_user_1` - First test database
- `test_db_2`, `test_user_2` - Second test database

These are automatically created and cleaned up by the test suite.

## Environment Variables

Required for E2E tests:

```bash
# Admin database connection with superuser privileges
ROOT_DATABASE_URL=postgresql://admin:password@host:5432/postgres

# Database host (for generating connection URLs)
DB_HOST=your-db-host.example.com

# Optional: For preview database tests
DB_PASSWORD_SEED=test-seed-value
```

## Writing New Tests

### Unit Test Example

```typescript
// test/unit/preview.test.ts
import { describe, expect, test } from "bun:test";
import { PreviewDatabase } from "@/src/preview";

describe("PreviewDatabase", () => {
  test("should sanitize branch names", () => {
    const preview = new PreviewDatabase("feat/my-feature");
    expect(preview.dbName).toBe("preview_feat_my_feature");
  });
});
```

### E2E Test Example

```typescript
// test/e2e/preview-flow.e2e.ts
import { describe, expect, test } from "bun:test";
import { PreviewDatabase } from "@/src/preview";

describe("Preview Database Flow", () => {
  test("should create and delete preview database", async () => {
    const preview = new PreviewDatabase("test-branch");

    await preview.create();
    // Add assertions

    await preview.delete();
    // Verify cleanup
  });
});
```

## Test Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up created resources
3. **Real Data**: E2E tests use real databases
4. **Fast Units**: Keep unit tests fast and focused
5. **Clear Names**: Use descriptive test names

## CI/CD Integration

Tests can be run in GitHub Actions:

```yaml
- name: Run E2E Tests
  env:
    ROOT_DATABASE_URL: ${{ secrets.ROOT_DATABASE_URL }}
    DB_HOST: ${{ secrets.DB_HOST }}
  run: bun run test:e2e
```

## Troubleshooting

### Connection Timeout

**Issue**: Tests fail with connection timeout

**Solution**:

- Verify `ROOT_DATABASE_URL` is correct
- Check database allows connections from your IP
- Ensure SSL is configured (`?sslmode=require`)

### Permission Denied

**Issue**: Tests fail with "permission denied" errors

**Solution**:

- Ensure `ROOT_DATABASE_URL` has superuser privileges
- User must be able to create databases and roles
- Check `pg_hba.conf` allows connections

### Cleanup Failures

**Issue**: Test databases remain after tests

**Solution**:

- Run cleanup manually: `bun run script/cleanup-test-dbs.ts`
- Check for active connections: `SELECT * FROM pg_stat_activity`
- Terminate connections before dropping database

## See Also

- [Package Source (`src/`)](../src/) - Implementation being tested
- [Scripts (`script/`)](../script/) - Example scripts
- [Web App (`web/`)](../web/) - Integration tests
