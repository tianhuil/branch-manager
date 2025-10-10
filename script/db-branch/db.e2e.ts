import { getDrizzle } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import { spawnSync } from "bun";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createDatabase, deleteDatabase, getDatabaseUrl } from "./db";
import { getDB, processEnvOrThrow } from "./util";

/**
 * Run drizzle-kit push with the specified database URL.
 *
 * @param databaseUrl - PostgreSQL connection string
 * @returns Spawn result with exitCode, stdout, and stderr
 */
const runDrizzleKitPush = (databaseUrl: string) => {
  return spawnSync({
    cmd: ["bun", "drizzle-kit", "push"],
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
    stdout: "pipe",
    stderr: "pipe",
  });
};

const containsPostgresError = (result: Bun.SyncSubprocess<"pipe", "pipe">) => {
  return result.stderr.toString().includes("PostgresError: ");
};

/**
 * E2E test for database setup functionality.
 * Requires ROOT_DATABASE_URL environment variable.
 */
describe("db-setup e2e", () => {
  const rootDatabaseUrl = processEnvOrThrow("ROOT_DATABASE_URL");
  const dbHost = processEnvOrThrow("DB_HOST");

  // Test database configuration
  const testDb1 = {
    dbName: "test_db_1",
    dbUser: "test_user_1",
    dbPassword: "4esqDd8C2SRX5MdG3t9Xu2HrarV675XO487UcZ",
  };

  const testDb2 = {
    dbName: "test_db_2",
    dbUser: "test_user_2",
    dbPassword: "rZTZWaadBuDdyolvMvZLBs8CGHtZxviS95PvvZ",
  };

  beforeAll(async () => {
    // Clean up any existing test databases before starting
    await deleteDatabase({
      dbName: testDb1.dbName,
      dbUser: testDb1.dbUser,
      rootDatabaseUrl,
    });
    await deleteDatabase({
      dbName: testDb2.dbName,
      dbUser: testDb2.dbUser,
      rootDatabaseUrl,
    });
  });

  afterAll(async () => {
    // Clean up test databases
    await deleteDatabase({
      dbName: testDb1.dbName,
      dbUser: testDb1.dbUser,
      rootDatabaseUrl,
    });
    await deleteDatabase({
      dbName: testDb2.dbName,
      dbUser: testDb2.dbUser,
      rootDatabaseUrl,
    });
  });

  test("should create database for test-user-1 and allow db:push with drizzle", async () => {
    // Create database for test-user-1
    await createDatabase({
      dbName: testDb1.dbName,
      dbUser: testDb1.dbUser,
      dbPassword: testDb1.dbPassword,
      rootDatabaseUrl,
    });

    // Get database URL for test-user-1
    const testDb1Url = getDatabaseUrl({
      dbName: testDb1.dbName,
      dbUser: testDb1.dbUser,
      dbPassword: testDb1.dbPassword,
      dbHost,
    });

    // Push schema using drizzle-kit CLI (equivalent to drizzle-kit push)
    const pushResult = runDrizzleKitPush(testDb1Url);
    expect(containsPostgresError(pushResult)).toBe(false);

    // Verify schema was created by checking if blog table exists
    const sql = getDB(testDb1Url);
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'blog'
    `;

    expect(result).toHaveLength(1);
    expect(result[0].table_name).toBe("blog");

    // Verify we can insert data
    const db = getDrizzle(testDb1Url);
    const [insertedBlog] = await db
      .insert(schema.blog)
      .values({
        title: "Test Blog",
        slug: "test-blog",
        content: "Test content",
        published: false,
      })
      .returning();

    expect(insertedBlog).toBeDefined();
    expect(insertedBlog.title).toBe("Test Blog");
  });

  test("should create database for test-user-2 and verify cannot push to test-db-1", async () => {
    // Create database for test-user-2
    await createDatabase({
      dbName: testDb2.dbName,
      dbUser: testDb2.dbUser,
      dbPassword: testDb2.dbPassword,
      rootDatabaseUrl,
    });

    // Get database URL for test-user-2 but pointing to test-db-1 (should fail)
    const invalidUrl = getDatabaseUrl({
      dbName: testDb1.dbName, // Trying to access test-user-1's database
      dbUser: testDb2.dbUser, // With test-user-2's credentials
      dbPassword: testDb2.dbPassword,
      dbHost,
    });

    // Verify test-user-2 cannot push schema to test-db-1 using drizzle-kit
    const pushResult = runDrizzleKitPush(invalidUrl);
    expect(containsPostgresError(pushResult)).toBe(true);
  });
});
