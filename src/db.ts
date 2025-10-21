import { createLogger } from "./logger";
import { getDB } from "./util";

const logger = createLogger("db-setup");

/**
 * Parameters for database setup
 */
interface CreateDatabaseParams {
  dbName: string;
  dbUser: string;
  dbPassword: string;
  rootDatabaseUrl: string;
}

/**
 * Set up a PostgreSQL database by creating a user and database with appropriate privileges.
 * Operation is idempotent and will only create the user or database if they do not already exist.
 *
 * @param params - Database setup parameters
 */
export const createDatabase = async ({
  dbName,
  dbUser,
  dbPassword,
  rootDatabaseUrl,
}: CreateDatabaseParams) => {
  // Connect to the root database with logging disabled
  const sql = getDB(rootDatabaseUrl);

  logger.info({ dbName, dbUser }, "Setting up database");

  // Check if user exists
  logger.info("Checking if user exists...");
  const userExists = await sql`
    SELECT EXISTS(SELECT 1 FROM pg_roles WHERE rolname = ${dbUser}) as exists
  `;

  if (!(userExists[0]?.exists as boolean)) {
    logger.info("Creating user...");
    // Doubles single quotes to prevent SQL injection
    await sql.query(
      `CREATE USER ${dbUser} WITH PASSWORD '${dbPassword.replace(/'/g, "''")}'`
    );
  } else {
    logger.info("User already exists, updating password...");
    // Update password in case it changed (e.g., different DB_PASSWORD_SEED)
    await sql.query(
      `ALTER USER ${dbUser} WITH PASSWORD '${dbPassword.replace(/'/g, "''")}'`
    );
  }

  // Check if database exists
  logger.info("Checking if database exists...");
  const dbExists = await sql`
    SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = ${dbName}) as exists
  `;

  if (!(dbExists[0]?.exists as boolean)) {
    logger.info("Creating database...");
    await sql.query(`CREATE DATABASE ${dbName}`);
  } else {
    logger.info("Database already exists, skipping database creation");
  }

  logger.info("Granting database privileges...");
  await sql.query(`GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser}`);

  logger.info("Granting schema privileges...");
  // Schema permissions must be granted while connected to the target database, not from the admin database.
  const dbSql = getDB(rootDatabaseUrl.replace(/\/[^/]*$/, `/${dbName}`));

  await dbSql.query(`GRANT USAGE ON SCHEMA public TO ${dbUser}`);
  await dbSql.query(`GRANT CREATE ON SCHEMA public TO ${dbUser}`);

  logger.info({ dbName, dbUser }, "Database setup completed successfully!");
};

/**
 * Parameters for database deletion
 */
interface DeleteDatabaseParams {
  dbName: string;
  dbUser?: string;
  rootDatabaseUrl: string;
}

/**
 * Delete a PostgreSQL database and optionally its associated user.
 *
 * @param params - Database deletion parameters
 */
export const deleteDatabase = async ({
  dbName,
  dbUser,
  rootDatabaseUrl,
}: DeleteDatabaseParams) => {
  // Connect to the root database with logging disabled
  const sql = getDB(rootDatabaseUrl);

  logger.info({ dbName, dbUser }, "Deleting database");

  // PostgreSQL refuses to drop a database with active connections.
  logger.info("Terminating existing connections...");
  await sql`
    SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = ${dbName}
      AND pid <> pg_backend_pid()
  `;

  logger.info("Dropping database...");
  await sql.query(`DROP DATABASE IF EXISTS ${dbName}`);

  if (dbUser) {
    logger.info({ dbUser }, "Dropping user");
    await sql.query(`DROP USER IF EXISTS ${dbUser}`);
  }

  logger.info({ dbName, dbUser }, "Database deletion completed successfully!");
};

/**
 * Parameters for database setup
 */
interface GetDatabaseUrlParams {
  dbName: string;
  dbUser: string;
  dbPassword: string;
  dbHost: string;
}

export const getDatabaseUrl = ({
  dbName,
  dbUser,
  dbPassword,
  dbHost,
}: GetDatabaseUrlParams) => {
  // URL-encode user and password to handle special characters
  const encodedUser = encodeURIComponent(dbUser);
  const encodedPassword = encodeURIComponent(dbPassword);
  return `postgresql://${encodedUser}:${encodedPassword}@${dbHost}/${dbName}?sslmode=require`;
};
