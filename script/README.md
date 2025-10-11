# Scripts

This directory contains example scripts and utilities for development.

## Example Scripts

### `db-proto.ts`

Example script demonstrating how to use the database client to query data.

```bash
# Run the script
bun run script/db-proto.ts

# Or with environment variables
dotenvx run -f .env.development -- bun run script/db-proto.ts
```

This script shows how to:

- Connect to the database using Drizzle ORM
- Query data from tables
- Format and display results

## Creating Your Own Scripts

You can add more development scripts here. Common use cases:

### Database Operations

```typescript
// script/seed-db.ts
import { db } from "@/web/lib/db/client";
import { users } from "@/web/lib/db/schema";

const seed = async () => {
  await db.insert(users).values([
    { name: "Alice", email: "alice@example.com" },
    { name: "Bob", email: "bob@example.com" },
  ]);
  console.log("Database seeded!");
};

seed();
```

### Preview Database Management

```typescript
// script/create-preview.ts
import { PreviewDatabase } from "@/src/preview";

const branchName = process.argv[2] || "main";
const preview = new PreviewDatabase(branchName);

await preview.create();
console.log(`Created: ${preview.databaseUrl}`);
```

### Data Migration

```typescript
// script/migrate-data.ts
import { db } from "@/web/lib/db/client";

const migrate = async () => {
  // Your migration logic here
};

migrate();
```

## Running Scripts

```bash
# Direct execution
bun run script/your-script.ts

# With environment variables
dotenvx run -f .env.development -- bun run script/your-script.ts

# With arguments
bun run script/your-script.ts arg1 arg2
```

## Best Practices

1. **Environment Variables**: Use `dotenvx` or load `.env` files for credentials
2. **Error Handling**: Always wrap async operations in try/catch
3. **Logging**: Use the logger from `@/src/logger` for consistent output
4. **Cleanup**: Close database connections when done
5. **Documentation**: Add comments explaining what the script does

## See Also

- [Package Source (`src/`)](../src/) - Main package implementation
- [Tests (`test/`)](../test/) - E2E and unit tests
- [Web App (`web/`)](../web/) - Next.js demo application
