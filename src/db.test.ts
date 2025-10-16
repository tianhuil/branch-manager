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
    // cspell:disable-next-line
    dbPassword: "4esqDd8C2SRX5MdG3t9Xu2HrarV675XO487UcZ",
  };

  const testDb2 = {
    dbName: "test_db_2",
    dbUser: "test_user_2",
    // cspell:disable-next-line
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

  test("should create database with correct permissions", async () => {
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

    // Verify we can connect and run queries
    const sql = getDB(testDb1Url);
    const result = await sql`SELECT 1 as test`;
    expect(result).toHaveLength(1);
    expect(result[0].test).toBe(1);
  });

  test("should create database for test-user-2 and verify cannot access test-db-1", async () => {
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

  test("should delete test-user-2 and verify user and database are removed", async () => {
    // Verify user and database exist before deletion (as root)
    const rootSql = getDB(rootDatabaseUrl);

    // Check if user exists
    const userBeforeDelete = await rootSql`
      SELECT usename
      FROM pg_catalog.pg_user
      WHERE usename = ${testDb2.dbUser}
    `;
    expect(userBeforeDelete).toHaveLength(1);
    expect(userBeforeDelete[0].usename).toBe(testDb2.dbUser);

    // Check if database exists
    const dbBeforeDelete = await rootSql`
      SELECT datname
      FROM pg_catalog.pg_database
      WHERE datname = ${testDb2.dbName}
    `;
    expect(dbBeforeDelete).toHaveLength(1);
    expect(dbBeforeDelete[0].datname).toBe(testDb2.dbName);

    // Delete the database and user
    await deleteDatabase({
      dbName: testDb2.dbName,
      dbUser: testDb2.dbUser,
      rootDatabaseUrl,
    });

    // Verify user no longer exists (as root)
    const userAfterDelete = await rootSql`
      SELECT usename
      FROM pg_catalog.pg_user
      WHERE usename = ${testDb2.dbUser}
    `;
    expect(userAfterDelete).toHaveLength(0);

    // Verify database no longer exists (as root)
    const dbAfterDelete = await rootSql`
      SELECT datname
      FROM pg_catalog.pg_database
      WHERE datname = ${testDb2.dbName}
    `;
    expect(dbAfterDelete).toHaveLength(0);
  });
});
